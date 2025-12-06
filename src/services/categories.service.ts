/**
 * @fileoverview Categories Service - Extends BaseService
 * @module src/services/categories.service
 * @description Category management service with CRUD and tree operations
 *
 * @pattern BaseService - Inherits common CRUD operations
 * @created 2025-12-05
 * @refactored 2026-01-08 - Migrated to BaseService pattern
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { logError } from "@/lib/firebase-error-logger";
import { CategoryBE, CategoryTreeNodeBE } from "@/types/backend/category.types";
import type { ProductListItemBE } from "@/types/backend/product.types";
import {
  CategoryFE,
  CategoryFormFE,
  CategoryTreeNodeFE,
} from "@/types/frontend/category.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
import {
  toBECreateCategoryRequest,
  toFECategories,
  toFECategory,
  toFECategoryTreeNode,
} from "@/types/transforms/category.transforms";
import { toFEProductCard } from "@/types/transforms/product.transforms";
import { apiService } from "./api.service";
import { BaseService } from "./base.service";

class CategoriesService extends BaseService<
  CategoryBE,
  CategoryFE,
  CategoryFormFE,
  Record<string, any>
> {
  protected endpoint = "/categories";
  protected entityName = "Category";

  protected toBE(form: CategoryFormFE): Partial<CategoryBE> {
    return toBECreateCategoryRequest(form) as Partial<CategoryBE>;
  }

  protected toFE(be: CategoryBE): CategoryFE {
    return toFECategory(be);
  }

  // Note: list(), getById(), create(), update(), delete() inherited from BaseService

  async getBySlug(slug: string): Promise<CategoryFE> {
    const response = await apiService.get<{
      success: boolean;
      data: CategoryBE;
    }>(`/categories/${slug}`);
    return toFECategory(response.data);
  }

  // Get category tree
  async getTree(parentId?: string): Promise<CategoryTreeNodeFE[]> {
    const params = new URLSearchParams();
    if (parentId) params.append("parentId", parentId);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/categories/tree?${queryString}`
      : "/categories/tree";

    const response = await apiService.get<{
      /** Success */
      success: boolean;
      /** Data */
      data: CategoryTreeNodeBE[];
    }>(endpoint);
    return (response.data || []).map(toFECategoryTreeNode);
  }

  async getLeaves(): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      success: boolean;
      data: CategoryBE[];
    }>("/categories/leaves");
    return toFECategories(response.data || []);
  }

  // Add parent to category (admin only)
  async addParent(
    /** Slug */
    slug: string,
    /** Parent Id */
    parentId: string
  ): Promise<{ message: string }> {
    const response = await apiService.post<{
      /** Success */
      success: boolean;
      /** Message */
      message: string;
    }>(`/categories/${slug}/add-parent`, { parentId });
    return { message: response.message };
  }

  // Remove parent from category (admin only)
  async removeParent(
    /** Slug */
    slug: string,
    /** Parent Id */
    parentId: string
  ): Promise<{ message: string }> {
    const response = await apiService.post<{
      /** Success */
      success: boolean;
      /** Message */
      message: string;
    }>(`/categories/${slug}/remove-parent`, { parentId });
    return { message: response.message };
  }

  // Get all parents of a category
  async getParents(slug: string): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      /** Success */
      success: boolean;
      /** Data */
      data: CategoryBE[];
    }>(`/categories/${slug}/parents`);
    return toFECategories(response.data || []);
  }

  // Get all direct children of a category
  async getChildren(slug: string): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      /** Success */
      success: boolean;
      /** Data */
      data: CategoryBE[];
    }>(`/categories/${slug}/children`);
    return toFECategories(response.data || []);
  }

  // Get featured categories
  async getFeatured(): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      /** Success */
      success: boolean;
      /** Data */
      data: CategoryBE[];
    }>("/categories/featured");
    return toFECategories(response.data || []);
  }

  // Get homepage categories
  async getHomepage(): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      /** Success */
      success: boolean;
      /** Data */
      data: CategoryBE[];
    }>("/categories/homepage");
    return toFECategories(response.data || []);
  }

  // Search categories
  async search(query: string): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      /** Success */
      success: boolean;
      /** Data */
      data: CategoryBE[];
    }>(`/categories/search?q=${encodeURIComponent(query)}`);
    return toFECategories(response.data || []);
  }

  // Reorder categories (admin only)
  async reorder(
    /** Orders */
    orders: { id: string; sortOrder: number }[]
  ): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/categories/reorder", {
      orders,
    });
  }

  // Get products in a category (includes subcategories' products)
  async getCategoryProducts(
    /** Slug */
    slug: string,
    /** Filters */
    filters?: {
      /** Page */
      page?: number;
      /** Limit */
      limit?: number;
      /** Include Subcategories */
      includeSubcategories?: boolean;
      [
        key: /**
         * Performs params operation
         *
         * @returns {any} The params result
         *
         */
        string
      ]: any;
    }
  ): Promise<PaginatedResponseFE<ProductCardFE>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const qs = params.toString();
    const endpoint = qs
      ? `/categories/${slug}/products?${qs}`
      : `/categories/${slug}/products`;

    const res = await apiService.get<PaginatedResponseBE<ProductListItemBE>>(
      endpoint
    );
    return {
      /** Data */
      data: res.data.map(toFEProductCard),
      /** Count */
      count: res.count,
      /** Pagination */
      pagination: res.pagination,
    };
  }

  // Get immediate subcategories of a category
  async getSubcategories(slug: string): Promise<CategoryFE[]> {
    const res = await apiService.get<{ data: CategoryBE[] }>(
      `/categories/${slug}/subcategories`
    );
    return toFECategories(res.data || []);
  }

  // Get similar categories (siblings or related)
  async getSimilarCategories(
    /** Slug */
    slug: string,
    /** Limit */
    limit?: number
  ): Promise<CategoryFE[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", String(limit));

    const qs = params.toString();
    const endpoint = qs
      ? `/categories/${slug}/similar?${qs}`
      : `/categories/${slug}/similar`;

    const res = await apiService.get<{ data: CategoryBE[] }>(endpoint);
    return toFECategories(res.data || []);
  }

  // Get full category hierarchy path (breadcrumb)
  async getCategoryHierarchy(slug: string): Promise<CategoryFE[]> {
    const res = await apiService.get<{ data: CategoryBE[] }>(
      `/categories/${slug}/hierarchy`
    );
    return toFECategories(res.data || []);
  }

  // Get breadcrumb hierarchy for a category
  async getBreadcrumb(categoryId: string): Promise<CategoryFE[]> {
    const breadcrumb: CategoryFE[] = [];
    let currentId: string | null = categoryId;

    // Recursively fetch parent categories
    while (currentId) {
      try {
        const category = await this.getById(currentId);
        breadcrumb.unshift(category); // Add to front of array

        // Get parent ID from the category
        // Assuming category has parent_id or parentId field
        currentId =
          (category as any).parentId || (category as any).parent_id || null;
      } catch (error) {
        logError(error as Error, {
          /** Component */
          component: "CategoriesService.getBreadcrumb",
          /** Metadata */
          metadata: { currentId },
        });
        break;
      }
    }

    return breadcrumb;
  }

  // Bulk operations (admin only)
  async bulkActivate(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      /** Action */
      action: "activate",
      ids,
    });
  }

  async bulkDeactivate(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      /** Action */
      action: "deactivate",
      ids,
    });
  }

  async bulkFeature(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      /** Action */
      action: "feature",
      ids,
    });
  }

  async bulkUnfeature(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      /** Action */
      action: "unfeature",
      ids,
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      /** Action */
      action: "delete",
      ids,
    });
  }

  async bulkUpdate(
    /** Ids */
    ids: string[],
    /** Updates */
    updates: Partial<CategoryFormFE>
  ): Promise<void> {
    await apiService.post("/categories/bulk", {
      /** Action */
      action: "update",
      ids,
      updates,
    });
  }

  /**
   * Batch fetch categories by IDs
   * Used for admin-curated featured sections
   */
  async getByIds(ids: string[]): Promise<CategoryFE[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const response: any = await apiService.post("/categories/batch", { ids });
      return toFECategories(response.data || []);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "CategoriesService.getByIds",
        /** Metadata */
        metadata: { ids },
      });
      return [];
    }
  }
}

export const categoriesService = new CategoriesService();
