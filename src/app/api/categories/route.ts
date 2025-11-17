import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { withCache } from "@/app/api/middleware/cache";
import { ValidationError } from "@/lib/api-errors";

/**
 * GET /api/categories
 * List categories with role-based filtering
 * - Public: Active categories only
 * - Admin: All categories including inactive
 */
export async function GET(request: NextRequest) {
  return withCache(
    request,
    async (req: NextRequest) => {
      try {
        const user = await getUserFromRequest(req);
        const { searchParams } = new URL(req.url);

        // Pagination params
        const startAfter = searchParams.get("startAfter");
        const limit = parseInt(searchParams.get("limit") || "200");

        // Filter params
        const featured = searchParams.get("featured");
        const showOnHomepage = searchParams.get("showOnHomepage");
        const parentId = searchParams.get("parentId");

        // Sort params
        const sortBy = searchParams.get("sortBy") || "sort_order";
        const sortOrder = (searchParams.get("sortOrder") || "asc") as
          | "asc"
          | "desc";

        let query: FirebaseFirestore.Query = Collections.categories();

        // Public users only see active categories
        if (!user || user.role !== "admin") {
          query = query.where("is_active", "==", true);
        }

        if (featured !== null) {
          query = query.where("is_featured", "==", featured === "true");
        }
        if (showOnHomepage !== null) {
          query = query.where(
            "show_on_homepage",
            "==",
            showOnHomepage === "true"
          );
        }
        if (parentId !== null) {
          query = query.where(
            "parent_id",
            "==",
            parentId === "null" ? null : parentId
          );
        }

        // Add sorting
        const validSortFields = [
          "sort_order",
          "name",
          "product_count",
          "created_at",
        ];
        const sortField = validSortFields.includes(sortBy)
          ? sortBy
          : "sort_order";
        query = query.orderBy(sortField, sortOrder);

        // Apply cursor pagination
        if (startAfter) {
          const startDoc = await Collections.categories().doc(startAfter).get();
          if (startDoc.exists) {
            query = query.startAfter(startDoc);
          }
        }

        // Fetch limit + 1 to check if there's a next page
        query = query.limit(limit + 1);
        const snapshot = await query.get();
        const docs = snapshot.docs;

        // Check if there's a next page
        const hasNextPage = docs.length > limit;
        const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

        const categories = resultDocs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            ...data,
            // Add camelCase aliases for frontend compatibility with multi-parent support
            parentIds:
              data.parent_ids || (data.parent_id ? [data.parent_id] : []),
            childrenIds: data.children_ids || [],
            parentId: data.parent_id, // Backward compatibility
            featured: data.is_featured,
            showOnHomepage: data.show_on_homepage,
            isActive: data.is_active,
            productCount: data.product_count || 0,
            childCount: data.child_count || 0,
            hasChildren: data.has_children || false,
            sortOrder: data.sort_order || 0,
            metaTitle: data.meta_title,
            metaDescription: data.meta_description,
            commissionRate: data.commission_rate || 0,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        });

        // Get next cursor
        const nextCursor =
          hasNextPage && resultDocs.length > 0
            ? resultDocs[resultDocs.length - 1].id
            : null;

        return NextResponse.json({
          success: true,
          data: categories,
          count: categories.length,
          pagination: {
            limit,
            hasNextPage,
            nextCursor,
          },
        });
      } catch (error) {
        console.error("Error listing categories:", error);
        return NextResponse.json(
          { success: false, error: "Failed to list categories" },
          { status: 500 }
        );
      }
    },
    {
      ttl: 300,
    }
  );
}

/**
 * POST /api/categories
 * Create a new category (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const body = await request.json();
    const { name, slug } = body;

    // Validation
    const errors: Record<string, string> = {};
    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    if (!slug || slug.trim().length < 2) {
      errors.slug = "Slug must be at least 2 characters";
    }
    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    // Slug uniqueness (global)
    const existing = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: "Category slug already exists" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Handle multi-parent support
    let parentIds: string[] = [];
    if (body.parent_ids && Array.isArray(body.parent_ids)) {
      parentIds = body.parent_ids.filter((id: string) => id);
    } else if (body.parent_id) {
      // Backward compatibility
      parentIds = [body.parent_id];
    }

    const docRef = await Collections.categories().add({
      name,
      slug,
      description: body.description || "",
      parent_ids: parentIds,
      parent_id: parentIds[0] || null, // Backward compatibility
      children_ids: [],
      has_children: false,
      child_count: 0,
      is_featured: !!body.is_featured,
      show_on_homepage: !!body.show_on_homepage,
      is_active: body.is_active !== false,
      meta_title: body.meta_title || "",
      meta_description: body.meta_description || "",
      sort_order: body.sort_order || 0,
      commission_rate: body.commission_rate || 0,
      created_at: now,
      updated_at: now,
    });

    // Update parent categories to include this as a child
    if (parentIds.length > 0) {
      const batch = Collections.categories().firestore.batch();
      for (const parentId of parentIds) {
        const parentRef = Collections.categories().doc(parentId);
        const parentDoc = await parentRef.get();
        if (parentDoc.exists) {
          const parentData: any = parentDoc.data();
          const childrenIds = parentData.children_ids || [];
          if (!childrenIds.includes(docRef.id)) {
            childrenIds.push(docRef.id);
            batch.update(parentRef, {
              children_ids: childrenIds,
              has_children: true,
              child_count: childrenIds.length,
              updated_at: now,
            });
          }
        }
      }
      await batch.commit();
    }

    const created = await docRef.get();
    const createdData: any = created.data();
    return NextResponse.json(
      {
        success: true,
        data: {
          id: created.id,
          ...createdData,
          // Add camelCase aliases for multi-parent support
          parentIds: createdData.parent_ids || [],
          childrenIds: createdData.children_ids || [],
          parentId: createdData.parent_id, // Backward compatibility
          featured: createdData.is_featured,
          showOnHomepage: createdData.show_on_homepage,
          isActive: createdData.is_active,
          productCount: createdData.product_count || 0,
          childCount: createdData.child_count || 0,
          hasChildren: createdData.has_children || false,
          sortOrder: createdData.sort_order || 0,
          metaTitle: createdData.meta_title,
          metaDescription: createdData.meta_description,
          commissionRate: createdData.commission_rate || 0,
          createdAt: createdData.created_at,
          updatedAt: createdData.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
