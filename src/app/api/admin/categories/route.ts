"use server";

import { NextRequest, NextResponse } from "next/server";
import { createFirebaseHandler } from "@/lib/auth/firebase-api-auth";
import {
  categoryFormSchema,
  validateCategoryHierarchy,
  validateCategoryDepth,
} from "@/lib/validations/category";
import type { Category, CategoryFormData, ApiResponse } from "@/types";

// Mock database - replace with actual Firebase operations
const categories: Map<string, Category> = new Map();
const categoryHierarchy: Map<string, string[]> = new Map(); // categoryId -> ancestors

/**
 * GET /api/admin/categories
 * Fetch all categories with optional tree structure
 */
export const GET = createFirebaseHandler(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = request.nextUrl;
      const format = searchParams.get("format"); // 'tree' or 'list'
      const search = searchParams.get("search");

      let allCategories = Array.from(categories.values());

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
  },
  { allowedRoles: ["admin"] }
);

/**
 * POST /api/admin/categories
 * Create a new category
 */
export const POST = createFirebaseHandler(
  async (request: NextRequest, user) => {
    try {
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
      const slugExists = Array.from(categories.values()).some(
        (cat) => cat.slug === formData.slug
      );
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

      categories.set(categoryId, newCategory);
      categoryHierarchy.set(categoryId, ancestors);

      // Update parent's isLeaf status
      if (formData.parentId) {
        const parent = categories.get(formData.parentId);
        if (parent) {
          parent.isLeaf = false;
          parent.updatedAt = new Date().toISOString();
          parent.updatedBy = user.uid;
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
  },
  { requireAdmin: true }
);

/**
 * PATCH /api/admin/categories/[id]
 * Update a category
 */
export async function PATCH(request: NextRequest) {
  return createFirebaseHandler(
    async (request: NextRequest, user) => {
      try {
        const { searchParams } = request.nextUrl;
        const categoryId = searchParams.get("id");

        if (!categoryId) {
          return NextResponse.json(
            { success: false, error: "Category ID is required" },
            { status: 400 }
          );
        }

        const category = categories.get(categoryId);
        if (!category) {
          return NextResponse.json(
            { success: false, error: "Category not found" },
            { status: 404 }
          );
        }

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
          const slugExists = Array.from(categories.values()).some(
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

        categories.set(categoryId, updatedCategory);

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
    },
    { requireAdmin: true }
  )(request);
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category
 */
export async function DELETE(request: NextRequest) {
  return createFirebaseHandler(
    async (request: NextRequest, user) => {
      try {
        const { searchParams } = request.nextUrl;
        const categoryId = searchParams.get("id");

        if (!categoryId) {
          return NextResponse.json(
            { success: false, error: "Category ID is required" },
            { status: 400 }
          );
        }

        const category = categories.get(categoryId);
        if (!category) {
          return NextResponse.json(
            { success: false, error: "Category not found" },
            { status: 404 }
          );
        }

        // Check if category has children
        const hasChildren = Array.from(categories.values()).some(
          (cat) => cat.parentId === categoryId
        );
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

        categories.delete(categoryId);
        categoryHierarchy.delete(categoryId);

        // Update parent's isLeaf status if it now has no children
        if (category.parentId) {
          const siblings = Array.from(categories.values()).filter(
            (cat) => cat.parentId === category.parentId && cat.id !== categoryId
          );
          if (siblings.length === 0) {
            const parent = categories.get(category.parentId);
            if (parent) {
              parent.isLeaf = true;
              parent.updatedAt = new Date().toISOString();
              parent.updatedBy = user.uid;
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
    },
    { requireAdmin: true }
  )(request);
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
