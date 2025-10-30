import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/seller/products/categories/leaf
 * Get all leaf (end-level) categories for product assignment
 * Leaf categories are categories that have no children
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const role = decodedToken.role || "user";

    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Seller access required" },
        { status: 403 }
      );
    }

    const db = getAdminDb();

    // Get all active categories
    const categoriesSnapshot = await db
      .collection("categories")
      .where("isActive", "==", true)
      .orderBy("name", "asc")
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No categories found",
      });
    }

    // Build category map
    const categoryMap = new Map();
    const allCategories = categoriesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    allCategories.forEach((cat: any) => {
      categoryMap.set(cat.id, cat);
    });

    // Find leaf categories (no children or empty childIds array)
    const leafCategories = allCategories.filter((cat: any) => {
      const childIds = cat.childIds || [];
      return childIds.length === 0;
    });

    // Build full path for each leaf category
    const leafCategoriesWithPath = leafCategories.map((cat: any) => {
      const path: any[] = [];
      let current: any = cat;

      // Build path from leaf to root
      while (current) {
        path.unshift({
          id: current.id,
          name: current.name,
          slug: current.slug,
        });

        // Get parent
        const parentId = current.parentId;
        if (parentId) {
          current = categoryMap.get(parentId);
        } else {
          current = null;
        }
      }

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        level: cat.level || 0,
        path: path,
        pathString: path.map((p) => p.name).join(" > "),
        icon: cat.icon || null,
        image: cat.image || null,
        sortOrder: cat.sortOrder || 0,
      };
    });

    // Sort by path string for better organization
    leafCategoriesWithPath.sort((a: any, b: any) =>
      a.pathString.localeCompare(b.pathString)
    );

    return NextResponse.json({
      success: true,
      data: leafCategoriesWithPath,
      count: leafCategoriesWithPath.length,
      message: `Found ${leafCategoriesWithPath.length} leaf categories`,
    });
  } catch (error: any) {
    console.error("Error fetching leaf categories:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/id-token-expired") {
      return NextResponse.json(
        { success: false, error: "Token expired - Please login again" },
        { status: 401 }
      );
    }

    if (error.code === "auth/argument-error") {
      return NextResponse.json(
        { success: false, error: "Invalid token format" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaf categories",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
