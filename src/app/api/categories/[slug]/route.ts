/**
 * Category Details API Routes
 *
 * Handles fetching and updating individual category details by slug.
 * Includes recursive children fetching for hierarchical categories.
 *
 * @route GET /api/categories/[slug] - Get category with recursive children
 * @route PUT /api/categories/[slug] - Update category (Admin only)
 *
 * @example
 * ```tsx
 * // Get category with children
 * const response = await fetch('/api/categories/electronics');
 *
 * // Update category
 * const response = await fetch('/api/categories/electronics', {
 *   method: 'PUT',
 *   body: JSON.stringify({
 *     description: 'Updated description',
 *     featured: true,
 *     ...
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentSlug: string | null;
  level: number;
  children?: CategoryNode[];
  [key: string]: any;
}

/**
 * Get all descendant categories recursively
 */
async function getDescendants(slug: string): Promise<CategoryNode[]> {
  // Find direct children
  const childrenQuery = query(
    collection(db, "categories"),
    where("parentSlug", "==", slug),
  );
  const childrenSnapshot = await getDocs(childrenQuery);

  if (childrenSnapshot.empty) {
    return [];
  }

  const children: CategoryNode[] = childrenSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as CategoryNode),
  );

  // Recursively get descendants for each child
  const descendantsPromises = children.map(async (child) => {
    const childDescendants = await getDescendants(child.slug);
    return {
      ...child,
      children: childDescendants.length > 0 ? childDescendants : undefined,
    };
  });

  return Promise.all(descendantsPromises);
}

/**
 * GET /api/categories/[slug]
 *
 * Get category details by slug with recursive children.
 * Returns full hierarchy tree starting from this category.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    // Query category by slug
    const categoryQuery = query(
      collection(db, "categories"),
      where("slug", "==", slug),
    );

    const querySnapshot = await getDocs(categoryQuery);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const categoryDoc = querySnapshot.docs[0];
    const categoryData: CategoryNode = {
      id: categoryDoc.id,
      ...categoryDoc.data(),
    } as CategoryNode;

    // Get all descendant categories recursively
    const descendants = await getDescendants(slug);

    if (descendants.length > 0) {
      categoryData.children = descendants;
    }

    return NextResponse.json(
      {
        success: true,
        data: categoryData,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category", details: error.message },
      { status: 500 },
    );
  }
}

interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  image?: string;
  order?: number;
  featured?: boolean;
  status?: "active" | "inactive";
  parentSlug?: string | null;
}

/**
 * PUT /api/categories/[slug]
 *
 * Update category details (Admin only).
 * Cannot update slug or level (level is auto-calculated from parent).
 *
 * Request Body:
 * - name: Category name
 * - description: Category description
 * - icon: Icon identifier
 * - image: Category image URL
 * - order: Display order
 * - featured: Featured flag
 * - status: Category status
 * - parentSlug: Parent category slug (changing parent recalculates level)
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body: UpdateCategoryRequest = await request.json();

    // Query category by slug
    const categoryQuery = query(
      collection(db, "categories"),
      where("slug", "==", slug),
    );

    const querySnapshot = await getDocs(categoryQuery);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const categoryDoc = querySnapshot.docs[0];

    // Build update object
    const updates: any = {
      updatedAt: serverTimestamp(),
    };

    // Update allowed fields
    if (body.name) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.image !== undefined) updates.image = body.image;
    if (body.order !== undefined) updates.order = body.order;
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.status) updates.status = body.status;

    // Handle parent change (recalculates level)
    if (body.parentSlug !== undefined) {
      updates.parentSlug = body.parentSlug || null;

      // Calculate new level
      if (body.parentSlug) {
        const parentQuery = query(
          collection(db, "categories"),
          where("slug", "==", body.parentSlug),
        );
        const parentSnapshot = await getDocs(parentQuery);

        if (parentSnapshot.empty) {
          return NextResponse.json(
            { error: "Parent category not found" },
            { status: 404 },
          );
        }

        const parentData = parentSnapshot.docs[0].data();
        updates.level = (parentData.level || 0) + 1;
      } else {
        updates.level = 0;
      }
    }

    // Update category
    await updateDoc(categoryDoc.ref, updates);

    // Get updated data
    const updatedSnapshot = await getDocs(categoryQuery);
    const updatedData = {
      id: updatedSnapshot.docs[0].id,
      ...updatedSnapshot.docs[0].data(),
    };

    return NextResponse.json(
      {
        success: true,
        data: updatedData,
        message: "Category updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating category:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to update category" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update category", details: error.message },
      { status: 500 },
    );
  }
}
