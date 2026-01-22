/**
 * Categories API Routes
 *
 * Handles listing and creating categories with hierarchical tree structure.
 * Supports parent-child relationships for nested categories.
 *
 * @route GET /api/categories - List categories in tree structure
 * @route POST /api/categories - Create category (Admin only)
 *
 * @example
 * ```tsx
 * // List all categories
 * const response = await fetch('/api/categories');
 *
 * // List with parent filter
 * const response = await fetch('/api/categories?parent=electronics');
 *
 * // Create category
 * const response = await fetch('/api/categories', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     name: 'Smartphones',
 *     slug: 'smartphones',
 *     parentSlug: 'electronics',
 *     ...
 *   })
 * });
 * ```
 */

import { FALLBACK_CATEGORIES } from "@/lib/fallback-data";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentSlug: string | null;
  description?: string;
  icon?: string;
  image?: string;
  order: number;
  level: number;
  itemCount: number;
  featured: boolean;
  status: string;
  children?: CategoryNode[];
  [key: string]: any;
}

/**
 * Build hierarchical tree structure from flat category list
 */
function buildCategoryTree(
  categories: CategoryNode[],
  parentSlug: string | null = null,
): CategoryNode[] {
  return categories
    .filter((cat) => cat.parentSlug === parentSlug)
    .map((cat) => ({
      ...cat,
      children: buildCategoryTree(categories, cat.slug),
    }))
    .sort((a, b) => a.order - b.order);
}

/**
 * GET /api/categories
 *
 * List categories in hierarchical tree structure.
 * Can filter by parent to get only children of specific category.
 *
 * Query Parameters:
 * - parent: Filter by parent slug (null for root categories)
 * - flat: Return flat list instead of tree (true/false)
 * - featured: Filter featured categories only
 * - status: Filter by status (active/inactive)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentSlug = searchParams.get("parent");
    const flat = searchParams.get("flat") === "true";
    const featuredOnly = searchParams.get("featured") === "true";
    const statusFilter = searchParams.get("status");

    // Build query constraints
    const constraints: any[] = [];

    if (parentSlug !== null && parentSlug !== undefined) {
      constraints.push(where("parentSlug", "==", parentSlug || null));
    }

    if (featuredOnly) {
      constraints.push(where("featured", "==", true));
    }

    if (statusFilter) {
      constraints.push(where("status", "==", statusFilter));
    }

    constraints.push(orderBy("order", "asc"));
    constraints.push(orderBy("name", "asc"));

    // Execute query
    const categoriesQuery = query(collection(db, "categories"), ...constraints);

    const querySnapshot = await getDocs(categoriesQuery);

    const categories: CategoryNode[] = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as CategoryNode),
    );

    // Return flat list or tree structure
    if (flat || parentSlug !== null) {
      return NextResponse.json(
        {
          success: true,
          data: categories,
        },
        { status: 200 },
      );
    }

    // Build tree structure (all categories needed for tree)
    const allCategoriesQuery = query(
      collection(db, "categories"),
      orderBy("order", "asc"),
    );
    const allSnapshot = await getDocs(allCategoriesQuery);
    const allCategories: CategoryNode[] = allSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as CategoryNode),
    );

    const tree = buildCategoryTree(allCategories);

    return NextResponse.json(
      {
        success: true,
        data: tree,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    // Return fallback data only in development
    if (process.env.NODE_ENV !== "production") {
      console.warn("Returning fallback data (development only)");
      const tree = buildCategoryTree(FALLBACK_CATEGORIES as any[]);

      return NextResponse.json(
        {
          success: true,
          fallback: true,
          data: tree,
        },
        { status: 200 },
      );
    }

    // In production, return error
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500 },
    );
  }
}

interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentSlug?: string | null;
  description?: string;
  icon?: string;
  image?: string;
  order?: number;
  featured?: boolean;
  status?: "active" | "inactive";
}

/**
 * POST /api/categories
 *
 * Create a new category (Admin only).
 * Automatically calculates level based on parent hierarchy.
 *
 * Request Body:
 * - name: Category name (required)
 * - slug: URL-friendly slug (required, unique)
 * - parentSlug: Parent category slug (null for root)
 * - description: Category description
 * - icon: Icon identifier or SVG
 * - image: Category image URL
 * - order: Display order (default 0)
 * - featured: Featured flag (default false)
 * - status: Category status (default 'active')
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryRequest = await request.json();
    const {
      name,
      slug,
      parentSlug = null,
      description,
      icon,
      image,
      order = 0,
      featured = false,
      status = "active",
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingCategoryQuery = query(
      collection(db, "categories"),
      where("slug", "==", slug),
    );
    const existingCategories = await getDocs(existingCategoryQuery);

    if (!existingCategories.empty) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 409 },
      );
    }

    // Calculate level based on parent
    let level = 0;
    if (parentSlug) {
      const parentQuery = query(
        collection(db, "categories"),
        where("slug", "==", parentSlug),
      );
      const parentSnapshot = await getDocs(parentQuery);

      if (parentSnapshot.empty) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 404 },
        );
      }

      const parentData = parentSnapshot.docs[0].data();
      level = (parentData.level || 0) + 1;
    }

    // Create category document
    const categoryData = {
      name,
      slug,
      parentSlug: parentSlug || null,
      description: description || "",
      icon: icon || null,
      image: image || null,
      order,
      level,
      featured,
      status,

      // Counters (updated when items added)
      itemCount: 0,
      productCount: 0,
      auctionCount: 0,

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "categories"), categoryData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...categoryData,
        },
        message: "Category created successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating category:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to create category" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create category", details: error.message },
      { status: 500 },
    );
  }
}
