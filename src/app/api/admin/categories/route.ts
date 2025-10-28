"use server";

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/firebase-api-auth";
import { getAdminDb } from "@/lib/database/admin";
import {
  categoryFormSchema,
  validateCategoryHierarchy,
  validateCategoryDepth,
} from "@/lib/validations/category";
import type { Category, CategoryFormData, ApiResponse } from "@/types";

const CATEGORIES_COLLECTION = "categories";

/**
 * GET /api/admin/categories
 * Fetch all categories with optional tree structure
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = request.nextUrl;
    const format = searchParams.get("format"); // 'tree' or 'list'
    const search = searchParams.get("search");

    const snapshot = await db.collection(CATEGORIES_COLLECTION).get();
    let allCategories: Category[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Category));

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      allCategories = allCategories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchLower) ||
          cat.slug.toLowerCase().includes(searchLower)
      );
    }

    // Sort by sortOrder
    allCategories.sort((a, b) => a.sortOrder - b.sortOrder);

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

/**
 * POST /api/admin/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const body = await request.json();

    // Validate form data
    const validation = categoryFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const formData = validation.data;

    // Get all categories to build hierarchy map
    const allCatsSnapshot = await db.collection(CATEGORIES_COLLECTION).get();
    const allCats = allCatsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Category));

    const categoryHierarchy = new Map<string, string[]>();
    allCats.forEach((cat) => {
      categoryHierarchy.set(cat.id, cat.parentIds || []);
    });

    // Validate hierarchy
    const hierarchyValid = validateCategoryHierarchy(
      "",
      formData.parentId,
      categoryHierarchy
    );
    if (!hierarchyValid.valid) {
      return NextResponse.json(
        { success: false, error: hierarchyValid.error },
        { status: 400 }
      );
    }

    // Validate depth
    const depthValid = validateCategoryDepth(
      formData.parentId,
      categoryHierarchy
    );
    if (!depthValid.valid) {
      return NextResponse.json(
        { success: false, error: depthValid.error },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const slugExists = allCats.some((cat) => cat.slug === formData.slug);
    if (slugExists) {
      return NextResponse.json(
        { success: false, error: "Category slug already exists" },
        { status: 400 }
      );
    }

    // Create new category
    const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const ancestors = formData.parentId 
      ? [...(categoryHierarchy.get(formData.parentId) || []), formData.parentId]
      : [];

    const newCategory: Category = {
      id: categoryId,
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      image: formData.image,
      icon: formData.icon,
      parentId: formData.parentId,
      parentIds: ancestors,
      level: ancestors.length,
      isActive: formData.isActive,
      featured: formData.featured,
      sortOrder: formData.sortOrder,
      seo: formData.seo,
      productCount: 0,
      inStockCount: 0,
      outOfStockCount: 0,
      lowStockCount: 0,
      isLeaf: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.uid,
      updatedBy: user.uid,
    };

    // Save to Firestore
    await db.collection(CATEGORIES_COLLECTION).doc(categoryId).set(newCategory);

    // Update parent's isLeaf status if it has a parent
    if (formData.parentId) {
      const parent = allCats.find((c) => c.id === formData.parentId);
      if (parent) {
        await db.collection(CATEGORIES_COLLECTION).doc(formData.parentId).update({
          isLeaf: false,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}


/**
 * PATCH /api/admin/categories/[id]
 * Update a category
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin access
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const { searchParams } = request.nextUrl;
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    const categoryDoc = await db.collection(CATEGORIES_COLLECTION).doc(categoryId).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const category = categoryDoc.data() as Category;
    const body = await request.json();
    const validation = categoryFormSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const formData = validation.data;

    // Get all categories for hierarchy validation
    const allCatsSnapshot = await db.collection(CATEGORIES_COLLECTION).get();
    const allCats = allCatsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Category));

    const categoryHierarchy = new Map<string, string[]>();
    allCats.forEach((cat) => {
      categoryHierarchy.set(cat.id, cat.parentIds || []);
    });

    // Validate hierarchy if parent is being changed
    if (formData.parentId !== undefined) {
      const hierarchyValid = validateCategoryHierarchy(
        categoryId,
        formData.parentId,
        categoryHierarchy
      );
      if (!hierarchyValid.valid) {
        return NextResponse.json(
          { success: false, error: hierarchyValid.error },
          { status: 400 }
        );
      }

      const depthValid = validateCategoryDepth(
        formData.parentId,
        categoryHierarchy
      );
      if (!depthValid.valid) {
        return NextResponse.json(
          { success: false, error: depthValid.error },
          { status: 400 }
        );
      }
    }

    // Check for duplicate slug (excluding current)
    if (formData.slug && formData.slug !== category.slug) {
      const slugExists = allCats.some(
        (cat) => cat.id !== categoryId && cat.slug === formData.slug
      );
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "Category slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update category
    const updatedCategory: Category = {
      ...category,
      ...formData,
      id: categoryId,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    };

    if (formData.parentId !== undefined) {
      const ancestors = formData.parentId
        ? [...(categoryHierarchy.get(formData.parentId) || []), formData.parentId]
        : [];
      updatedCategory.parentIds = ancestors;
      updatedCategory.level = ancestors.length;
    }

    await db.collection(CATEGORIES_COLLECTION).doc(categoryId).set(updatedCategory);

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const { searchParams } = request.nextUrl;
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    const categoryDoc = await db.collection(CATEGORIES_COLLECTION).doc(categoryId).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const category = categoryDoc.data() as Category;

    // Get all categories to check for children
    const allCatsSnapshot = await db.collection(CATEGORIES_COLLECTION).get();
    const allCats = allCatsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Category));

    // Check if category has children
    const hasChildren = allCats.some((cat) => cat.parentId === categoryId);
    if (hasChildren) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with subcategories. Please delete or reassign subcategories first.",
        },
        { status: 400 }
      );
    }

    // Check if category has products
    if (category.productCount && category.productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with products. Please move or delete products first.",
        },
        { status: 400 }
      );
    }

    // Delete the category
    await db.collection(CATEGORIES_COLLECTION).doc(categoryId).delete();

    // Update parent's isLeaf status if it now has no children
    if (category.parentId) {
      const siblings = allCats.filter(
        (cat) => cat.parentId === category.parentId && cat.id !== categoryId
      );
      if (siblings.length === 0) {
        const parent = allCats.find((c) => c.id === category.parentId);
        if (parent) {
          await db.collection(CATEGORIES_COLLECTION).doc(category.parentId).update({
            isLeaf: true,
            updatedAt: new Date().toISOString(),
            updatedBy: user.uid,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: categoryId },
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to build category tree
 */
function buildCategoryTree(categories: Category[]): (Category & { children?: any[] })[] {
  const categoryMap = new Map<string, Category & { children: (Category & { children?: any[] })[] }>();
  
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  const roots: (Category & { children?: any[] })[] = [];

  for (const category of categoryMap.values()) {
    if (category.parentId && categoryMap.has(category.parentId)) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      roots.push(category);
    }
  }

  // Sort children recursively
  function sortChildren(parent: Category & { children?: any[] }) {
    if (parent.children) {
      (parent.children as any[]).sort((a, b) => a.sortOrder - b.sortOrder);
      (parent.children as any[]).forEach(sortChildren);
    }
  }

  roots.sort((a, b) => a.sortOrder - b.sortOrder);
  roots.forEach(sortChildren);

  return roots;
}
