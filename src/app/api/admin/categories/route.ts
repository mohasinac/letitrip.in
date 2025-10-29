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
 * Helper function to calculate all paths from root to a category
 */
function calculateCategoryPaths(
  parentIds: string[],
  categoryMap: Map<string, Category>
): { paths: string[][]; minLevel: number; maxLevel: number } {
  if (parentIds.length === 0) {
    return { paths: [[]], minLevel: 0, maxLevel: 0 };
  }

  const allPaths: string[][] = [];

  function traversePaths(currentId: string, currentPath: string[]): string[][] {
    const paths: string[][] = [];
    const category = categoryMap.get(currentId);
    
    if (!category) {
      return [[...currentPath, currentId]];
    }

    const newPath = [...currentPath, currentId];

    if (!category.parentIds || category.parentIds.length === 0) {
      // Reached root
      return [newPath];
    }

    // Traverse all parents
    for (const parentId of category.parentIds) {
      const parentPaths = traversePaths(parentId, newPath);
      paths.push(...parentPaths);
    }

    return paths;
  }

  // Get all paths from each direct parent
  for (const parentId of parentIds) {
    const paths = traversePaths(parentId, []);
    allPaths.push(...paths.map(p => p.reverse()));
  }

  const levels = allPaths.map(p => p.length);
  const minLevel = Math.min(...levels);
  const maxLevel = Math.max(...levels);

  return { paths: allPaths, minLevel, maxLevel };
}

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

    const categoryMap = new Map<string, Category>();
    allCats.forEach((cat) => {
      categoryMap.set(cat.id, cat);
    });

    // Validate hierarchy
    const hierarchyValid = validateCategoryHierarchy(
      "",
      formData.parentIds,
      categoryMap
    );
    if (!hierarchyValid.valid) {
      return NextResponse.json(
        { success: false, error: hierarchyValid.error },
        { status: 400 }
      );
    }

    // Validate depth
    const depthValid = validateCategoryDepth(
      formData.parentIds,
      categoryMap
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
    
    const parentIds = formData.parentIds || [];
    
    // Get parent slugs if parents exist
    const parentSlugs = parentIds
      .map(pid => categoryMap.get(pid)?.slug)
      .filter(Boolean) as string[];

    // Calculate all paths and levels
    const { paths, minLevel, maxLevel } = calculateCategoryPaths(parentIds, categoryMap);

    const newCategory: Category = {
      id: categoryId,
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      image: formData.image,
      icon: formData.icon,
      ...(parentIds.length > 0 && { parentIds }),
      ...(parentSlugs.length > 0 && { parentSlugs }),
      paths,
      minLevel,
      maxLevel,
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

    // Update all parents' childIds
    for (const parentId of parentIds) {
      const parent = categoryMap.get(parentId);
      if (parent) {
        const updatedChildIds = [...(parent.childIds || []), categoryId];
        await db.collection(CATEGORIES_COLLECTION).doc(parentId).update({
          childIds: updatedChildIds,
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

    const categoryMap = new Map<string, Category>();
    allCats.forEach((cat) => {
      categoryMap.set(cat.id, cat);
    });

    // Validate hierarchy if parents are being changed
    if (formData.parentIds !== undefined) {
      const hierarchyValid = validateCategoryHierarchy(
        categoryId,
        formData.parentIds,
        categoryMap
      );
      if (!hierarchyValid.valid) {
        return NextResponse.json(
          { success: false, error: hierarchyValid.error },
          { status: 400 }
        );
      }

      const depthValid = validateCategoryDepth(
        formData.parentIds,
        categoryMap
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

    // Handle parent changes
    if (formData.parentIds !== undefined) {
      const newParentIds = formData.parentIds || [];
      const oldParentIds = category.parentIds || [];
      
      // Get parent slugs
      const parentSlugs = newParentIds
        .map(pid => categoryMap.get(pid)?.slug)
        .filter(Boolean) as string[];
      
      // Calculate paths and levels
      const { paths, minLevel, maxLevel } = calculateCategoryPaths(newParentIds, categoryMap);
      
      if (newParentIds.length > 0) {
        updatedCategory.parentIds = newParentIds;
        updatedCategory.parentSlugs = parentSlugs;
      } else {
        delete updatedCategory.parentIds;
        delete updatedCategory.parentSlugs;
      }
      
      updatedCategory.paths = paths;
      updatedCategory.minLevel = minLevel;
      updatedCategory.maxLevel = maxLevel;
      
      // Update old parents - remove this category from their childIds
      for (const oldParentId of oldParentIds) {
        if (!newParentIds.includes(oldParentId)) {
          const oldParent = categoryMap.get(oldParentId);
          if (oldParent) {
            const updatedChildIds = (oldParent.childIds || []).filter(id => id !== categoryId);
            await db.collection(CATEGORIES_COLLECTION).doc(oldParentId).update({
              childIds: updatedChildIds,
              isLeaf: updatedChildIds.length === 0,
              updatedAt: new Date().toISOString(),
              updatedBy: user.uid,
            });
          }
        }
      }
      
      // Update new parents - add this category to their childIds
      for (const newParentId of newParentIds) {
        if (!oldParentIds.includes(newParentId)) {
          const newParent = categoryMap.get(newParentId);
          if (newParent) {
            const updatedChildIds = [...(newParent.childIds || []), categoryId];
            await db.collection(CATEGORIES_COLLECTION).doc(newParentId).update({
              childIds: updatedChildIds,
              isLeaf: false,
              updatedAt: new Date().toISOString(),
              updatedBy: user.uid,
            });
          }
        }
      }
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
    const hasChildren = allCats.some((cat) => cat.parentIds?.includes(categoryId));
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

    // Update all parents' childIds
    if (category.parentIds && category.parentIds.length > 0) {
      for (const parentId of category.parentIds) {
        const parentDoc = await db.collection(CATEGORIES_COLLECTION).doc(parentId).get();
        if (parentDoc.exists) {
          const parent = parentDoc.data() as Category;
          const updatedChildIds = (parent.childIds || []).filter(id => id !== categoryId);
          await db.collection(CATEGORIES_COLLECTION).doc(parentId).update({
            childIds: updatedChildIds,
            isLeaf: updatedChildIds.length === 0,
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
 * With many-to-many relationships, a category may appear in multiple places
 */
function buildCategoryTree(categories: Category[]): (Category & { children?: any[] })[] {
  const categoryMap = new Map<string, Category & { children: (Category & { children?: any[] })[] }>();
  
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  const roots: (Category & { children?: any[] })[] = [];

  for (const category of categoryMap.values()) {
    if (category.parentIds && category.parentIds.length > 0) {
      // Add to all parents
      for (const parentId of category.parentIds) {
        const parent = categoryMap.get(parentId);
        if (parent) {
          parent.children.push(category);
        }
      }
    } else {
      // Root category
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
