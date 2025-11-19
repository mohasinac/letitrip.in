import { apiService } from "./api.service";
import { CategoryBE, CategoryTreeNodeBE } from "@/types/backend/category.types";
import {
  CategoryFE,
  CategoryTreeNodeFE,
  CategoryFormFE,
} from "@/types/frontend/category.types";
import {
  toFECategory,
  toFECategories,
  toFECategoryTreeNode,
  toBECreateCategoryRequest,
} from "@/types/transforms/category.transforms";
import type { ProductListItemBE } from "@/types/backend/product.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { toFEProductCard } from "@/types/transforms/product.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";

class CategoriesService {
  // List categories
  async list(
    filters?: Record<string, any>
  ): Promise<PaginatedResponseFE<CategoryFE>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/categories?${queryString}` : "/categories";

    const response = await apiService.get<PaginatedResponseBE<CategoryBE>>(
      endpoint
    );

    return {
      data: toFECategories(response.data || []),
      count: response.count,
      pagination: response.pagination,
    };
  }

  // Get category by ID
  async getById(id: string): Promise<CategoryFE> {
    const response: any = await apiService.get(`/categories/${id}`);
    return toFECategory(response.data);
  }

  // Get category by slug
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
      success: boolean;
      data: CategoryTreeNodeBE[];
    }>(endpoint);
    return (response.data || []).map(toFECategoryTreeNode);
  }

  // Get leaf categories (for product creation)
  async getLeaves(): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      success: boolean;
      data: CategoryBE[];
    }>("/categories/leaves");
    return toFECategories(response.data || []);
  }

  // Create category (admin only)
  async create(formData: CategoryFormFE): Promise<CategoryFE> {
    const request = toBECreateCategoryRequest(formData);
    const response = await apiService.post<{
      success: boolean;
      data: CategoryBE;
    }>("/categories", request);
    return toFECategory(response.data);
  }

  // Update category (admin only)
  async update(
    slug: string,
    formData: Partial<CategoryFormFE>
  ): Promise<CategoryFE> {
    const request = toBECreateCategoryRequest(formData as CategoryFormFE);
    const response = await apiService.patch<{
      success: boolean;
      data: CategoryBE;
    }>(`/categories/${slug}`, request);
    return toFECategory(response.data);
  }

  // Delete category (admin only)
  async delete(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/categories/${slug}`);
  }

  // Add parent to category (admin only)
  async addParent(
    slug: string,
    parentId: string
  ): Promise<{ message: string }> {
    const response = await apiService.post<{
      success: boolean;
      message: string;
    }>(`/categories/${slug}/add-parent`, { parentId });
    return { message: response.message };
  }

  // Remove parent from category (admin only)
  async removeParent(
    slug: string,
    parentId: string
  ): Promise<{ message: string }> {
    const response = await apiService.post<{
      success: boolean;
      message: string;
    }>(`/categories/${slug}/remove-parent`, { parentId });
    return { message: response.message };
  }

  // Get all parents of a category
  async getParents(slug: string): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      success: boolean;
      data: CategoryBE[];
    }>(`/categories/${slug}/parents`);
    return toFECategories(response.data || []);
  }

  // Get all direct children of a category
  async getChildren(slug: string): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      success: boolean;
      data: CategoryBE[];
    }>(`/categories/${slug}/children`);
    return toFECategories(response.data || []);
  }

  // Get featured categories
  async getFeatured(): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      success: boolean;
      data: CategoryBE[];
    }>("/categories/featured");
    return toFECategories(response.data || []);
  }

  // Get homepage categories
  async getHomepage(): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      success: boolean;
      data: CategoryBE[];
    }>("/categories/homepage");
    return toFECategories(response.data || []);
  }

  // Search categories
  async search(query: string): Promise<CategoryFE[]> {
    const response = await apiService.get<{
      success: boolean;
      data: CategoryBE[];
    }>(`/categories/search?q=${encodeURIComponent(query)}`);
    return toFECategories(response.data || []);
  }

  // Reorder categories (admin only)
  async reorder(
    orders: { id: string; sortOrder: number }[]
  ): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/categories/reorder", {
      orders,
    });
  }

  // Get products in a category (includes subcategories' products)
  async getCategoryProducts(
    slug: string,
    filters?: {
      page?: number;
      limit?: number;
      includeSubcategories?: boolean;
      [key: string]: any;
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
      data: res.data.map(toFEProductCard),
      count: res.count,
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
    slug: string,
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
        console.error(`Failed to load category ${currentId}:`, error);
        break;
      }
    }

    return breadcrumb;
  }

  // Bulk operations (admin only)
  async bulkActivate(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      action: "activate",
      ids,
    });
  }

  async bulkDeactivate(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      action: "deactivate",
      ids,
    });
  }

  async bulkFeature(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      action: "feature",
      ids,
    });
  }

  async bulkUnfeature(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      action: "unfeature",
      ids,
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiService.post("/categories/bulk", {
      action: "delete",
      ids,
    });
  }

  async bulkUpdate(
    ids: string[],
    updates: Partial<CategoryFormFE>
  ): Promise<void> {
    await apiService.post("/categories/bulk", {
      action: "update",
      ids,
      updates,
    });
  }
}

export const categoriesService = new CategoriesService();
