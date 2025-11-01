import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: "Category slug is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Fetch category by slug
    const categoriesSnapshot = await db
      .collection("categories")
      .where("slug", "==", slug)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const categoryDoc = categoriesSnapshot.docs[0];
    const category = {
      id: categoryDoc.id,
      ...categoryDoc.data(),
    };

    // Fetch subcategories (direct children)
    const subcategoriesSnapshot = await db
      .collection("categories")
      .where("parentIds", "array-contains", categoryDoc.id)
      .where("isActive", "==", true)
      .orderBy("sortOrder", "asc")
      .get();

    const subcategories = subcategoriesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      category,
      subcategories,
    });
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
