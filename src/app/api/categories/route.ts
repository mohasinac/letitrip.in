import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

/**
 * Public endpoint to fetch categories from database
 * No authentication required - for public category browsing
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = request.nextUrl;
    const format = searchParams.get("format"); // 'tree' or 'list'
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "1000");

    // Fetch all categories from Firestore
    const snapshot = await db.collection("categories")
      .orderBy("sortOrder", "asc")
      .limit(limit)
      .get();

    let allCategories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      allCategories = allCategories.filter((cat: any) =>
        cat.name?.toLowerCase().includes(searchLower) ||
        cat.slug?.toLowerCase().includes(searchLower)
      );
    }

    // Filter to only active categories
    allCategories = allCategories.filter((cat: any) => cat.isActive !== false);

    // Build tree structure if requested
    let result: any = allCategories;
    if (format === "tree") {
      result = buildCategoryTree(allCategories);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// Helper function to build tree structure from flat category array
function buildCategoryTree(categories: any[]): any[] {
  const categoryMap = new Map(categories.map(cat => [cat.id, { ...cat, children: [] }]));
  const roots: any[] = [];

  for (const category of categories) {
    const node = categoryMap.get(category.id)!;
    if (!category.parentId) {
      roots.push(node);
    } else {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  return roots;
}
