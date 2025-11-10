import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    const createdIds: string[] = [];

    // Create 3 test categories with subcategories
    const categories = [
      {
        name: "TEST_CAT_Electronics",
        slug: "test-cat-electronics",
        description: "Test electronics category",
        subcategories: ["Phones", "Laptops", "Accessories"]
      },
      {
        name: "TEST_CAT_Fashion",
        slug: "test-cat-fashion",
        description: "Test fashion category",
        subcategories: ["Clothing", "Shoes", "Bags"]
      },
      {
        name: "TEST_CAT_Home",
        slug: "test-cat-home",
        description: "Test home category",
        subcategories: ["Furniture", "Decor", "Kitchen"]
      }
    ];

    for (const category of categories) {
      const categoryId = `TEST_CAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const categoryData = {
        id: categoryId,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: null,
        level: 1,
        active: true,
        featured: Math.random() > 0.5,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("categories").doc(categoryId).set(categoryData);
      createdIds.push(categoryId);

      // Create subcategories
      for (const subName of category.subcategories) {
        const subCategoryId = `TEST_CAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const subCategoryData = {
          id: subCategoryId,
          name: `TEST_CAT_${subName}`,
          slug: `test-cat-${subName.toLowerCase()}`,
          description: `Test ${subName} subcategory`,
          parentId: categoryId,
          level: 2,
          active: true,
          featured: false,
          productCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.collection("categories").doc(subCategoryId).set(subCategoryData);
        createdIds.push(subCategoryId);
      }
    }

    return NextResponse.json({
      success: true,
      data: { ids: createdIds, count: createdIds.length },
      message: `${createdIds.length} test categories created successfully`
    });
  } catch (error: any) {
    console.error("Error creating test categories:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create test categories" },
      { status: 500 }
    );
  }
}
