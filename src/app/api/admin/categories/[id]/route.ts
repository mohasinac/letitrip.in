import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { Category, CategoryFormData } from "@/types";
import { createAdminHandler } from "@/lib/auth/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminDb();
    const categoryDoc = await db.collection("categories").doc(params.id).get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const category = {
      id: categoryDoc.id,
      ...categoryDoc.data()
    } as Category;

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export const PUT = createAdminHandler(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
    const db = getAdminDb();
    const data: CategoryFormData = await request.json();

    // Check if category exists
    const categoryDoc = await db.collection("categories").doc(params.id).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is unique (excluding current category)
    const existingSlug = await db
      .collection("categories")
      .where("slug", "==", data.slug)
      .get();

    const duplicateSlug = existingSlug.docs.find(doc => doc.id !== params.id);
    if (duplicateSlug) {
      return NextResponse.json(
        { success: false, error: "Slug already exists" },
        { status: 400 }
      );
    }

    // Prevent setting parent to self or descendant
    if (data.parentId === params.id) {
      return NextResponse.json(
        { success: false, error: "Category cannot be its own parent" },
        { status: 400 }
      );
    }

    // Calculate level and parentIds
    let level = 0;
    let parentIds: string[] = [];
    
    if (data.parentId) {
      const parentDoc = await db
        .collection("categories")
        .doc(data.parentId)
        .get();
      
      if (!parentDoc.exists) {
        return NextResponse.json(
          { success: false, error: "Parent category not found" },
          { status: 400 }
        );
      }

      const parentData = parentDoc.data() as Category;
      
      // Prevent circular hierarchy
      if (parentData.parentIds?.includes(params.id)) {
        return NextResponse.json(
          { success: false, error: "Circular hierarchy not allowed" },
          { status: 400 }
        );
      }

      level = parentData.level + 1;
      parentIds = [...(parentData.parentIds || []), data.parentId];
    }

    const now = new Date().toISOString();
    const updateData: any = {
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      image: data.image,
      icon: data.icon,
      seo: data.seo || {},
      parentIds,
      level,
      isActive: data.isActive,
      featured: data.featured,
      sortOrder: data.sortOrder,
      updatedAt: now,
      updatedBy: user.userId
    };

    // Only add parentId if it exists and is not empty
    if (data.parentId && data.parentId.trim() !== '') {
      updateData.parentId = data.parentId;
    } else {
      // If parentId is empty or undefined, remove it from the document
      updateData.parentId = null;
    }

    await db.collection("categories").doc(params.id).update(updateData);

    // Update all descendant categories' parentIds
    if (level !== categoryDoc.data()?.level || JSON.stringify(parentIds) !== JSON.stringify(categoryDoc.data()?.parentIds)) {
      await updateDescendantHierarchy(db, params.id, level, [...parentIds, params.id]);
    }

    const updatedCategory = {
      id: params.id,
      ...categoryDoc.data(),
      ...updateData
    };

    return NextResponse.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
});

export const DELETE = createAdminHandler(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
    const db = getAdminDb();

    // Check if category exists
    const categoryDoc = await db.collection("categories").doc(params.id).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check for child categories
    const childCategories = await db
      .collection("categories")
      .where("parentId", "==", params.id)
      .get();

    if (!childCategories.empty) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with child categories" },
        { status: 400 }
      );
    }

    // Check for products using this category
    const productsInCategory = await db
      .collection("products")
      .where("category", "==", params.id)
      .limit(1)
      .get();

    if (!productsInCategory.empty) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with products. Move products to another category first." },
        { status: 400 }
      );
    }

    // Delete the category
    await db.collection("categories").doc(params.id).delete();

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
});

// Helper function to update descendant categories when hierarchy changes
async function updateDescendantHierarchy(
  db: any,
  categoryId: string,
  newLevel: number,
  newParentIds: string[]
) {
  const descendants = await db
    .collection("categories")
    .where("parentIds", "array-contains", categoryId)
    .get();

  const batch = db.batch();

  descendants.docs.forEach((doc: any) => {
    const data = doc.data();
    const oldParentIds = data.parentIds || [];
    const categoryIndex = oldParentIds.indexOf(categoryId);
    
    if (categoryIndex !== -1) {
      // Update parentIds by replacing the part before and including this category
      const updatedParentIds = [
        ...newParentIds,
        ...oldParentIds.slice(categoryIndex + 1)
      ];
      
      // Update level
      const updatedLevel = newLevel + (oldParentIds.length - categoryIndex);
      
      batch.update(doc.ref, {
        parentIds: updatedParentIds,
        level: updatedLevel,
        updatedAt: new Date().toISOString()
      });
    }
  });

  if (!batch._delegate._mutations.length) {
    return;
  }

  await batch.commit();
}
