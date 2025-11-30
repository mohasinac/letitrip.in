import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { withCache } from "@/app/api/middleware/cache";
import { ValidationError } from "@/lib/api-errors";
import {
  parseSieveQuery,
  categoriesSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";

// Extended Sieve config with field mappings for categories
const categoriesConfig = {
  ...categoriesSieveConfig,
  fieldMappings: {
    parentId: "parent_id",
    parentIds: "parent_ids",
    sortOrder: "sort_order",
    order: "sort_order", // Map 'order' from config to 'sort_order' in DB
    createdAt: "created_at",
    updatedAt: "updated_at",
    productCount: "product_count",
    featured: "is_featured",
    showOnHomepage: "show_on_homepage",
    isActive: "is_active",
  } as Record<string, string>,
};

/**
 * Transform category document to API response format
 */
function transformCategory(id: string, data: any) {
  return {
    id,
    ...data,
    // Add camelCase aliases for frontend compatibility
    parentIds: data.parent_ids || (data.parent_id ? [data.parent_id] : []),
    childrenIds: data.children_ids || [],
    parentId: data.parent_id,
    featured: data.is_featured,
    showOnHomepage: data.show_on_homepage,
    isActive: data.is_active,
    productCount: data.product_count || 0,
    inStockCount: data.in_stock_count || 0,
    outOfStockCount: data.out_of_stock_count || 0,
    liveAuctionCount: data.live_auction_count || 0,
    endedAuctionCount: data.ended_auction_count || 0,
    childCount: data.child_count || 0,
    hasChildren: data.has_children || false,
    sortOrder: data.sort_order || 0,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    commissionRate: data.commission_rate || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/categories
 * List categories with Sieve pagination
 * Query Format: ?page=1&pageSize=50&sorts=sortOrder&filters=featured==true
 *
 * Role-based filtering:
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

        // Parse Sieve query
        const { query: sieveQuery, errors, warnings } = parseSieveQuery(
          searchParams,
          categoriesConfig
        );

        if (errors.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid query parameters",
              details: errors,
            },
            { status: 400 }
          );
        }

        // Legacy filter params (backward compatibility)
        const featured = searchParams.get("featured");
        const showOnHomepage = searchParams.get("showOnHomepage");
        const parentId = searchParams.get("parentId");

        let query: FirebaseFirestore.Query = Collections.categories();

        // Public users only see active categories
        if (!user || user.role !== "admin") {
          query = query.where("is_active", "==", true);
        }

        // Apply legacy filters (backward compatibility)
        if (featured !== null) {
          query = query.where("is_featured", "==", featured === "true");
        }
        if (showOnHomepage !== null) {
          query = query.where("show_on_homepage", "==", showOnHomepage === "true");
        }
        if (parentId !== null) {
          query = query.where("parent_id", "==", parentId === "null" ? null : parentId);
        }

        // Apply Sieve filters
        for (const filter of sieveQuery.filters) {
          const dbField = categoriesConfig.fieldMappings[filter.field] || filter.field;
          if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
            query = query.where(dbField, filter.operator as FirebaseFirestore.WhereFilterOp, filter.value);
          }
        }

        // Apply sorting
        if (sieveQuery.sorts.length > 0) {
          for (const sort of sieveQuery.sorts) {
            const dbField = categoriesConfig.fieldMappings[sort.field] || sort.field;
            query = query.orderBy(dbField, sort.direction);
          }
        } else {
          // Default sort by sort_order
          query = query.orderBy("sort_order", "asc");
        }

        // Get total count
        const countSnapshot = await query.count().get();
        const totalCount = countSnapshot.data().count;

        // Apply pagination
        const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
        if (offset > 0) {
          const skipSnapshot = await query.limit(offset).get();
          if (skipSnapshot.docs.length > 0) {
            const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
            query = query.startAfter(lastDoc);
          }
        }
        query = query.limit(sieveQuery.pageSize);

        // Execute query
        const snapshot = await query.get();
        const categories = snapshot.docs.map((doc) => transformCategory(doc.id, doc.data()));

        // Build Sieve pagination meta
        const pagination = createPaginationMeta(totalCount, sieveQuery);

        return NextResponse.json({
          success: true,
          data: categories,
          count: categories.length,
          pagination,
          meta: {
            appliedFilters: sieveQuery.filters,
            appliedSorts: sieveQuery.sorts,
            warnings: warnings.length > 0 ? warnings : undefined,
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
    { ttl: 300 }
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
        { status: 400 },
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
      { status: 201 },
    );
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, errors: error.errors },
        { status: 400 },
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 },
    );
  }
}
