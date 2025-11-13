import { apiService } from "./api.service";
import {
  CategoryBE,
  CategoryFiltersBE,
  CreateCategoryRequestBE,
  UpdateCategoryRequestBE,
} from "@/types/backend/category.types";
import {
  CategoryFE,
  CategoryTreeNodeFE,
  CategoryFormFE,
  CategoryCardFE,
} from "@/types/frontend/category.types";
import {
  toFECategory,
  toFECategories,
  toFECategoryTreeNode,
  toBECreateCategoryRequest,
} from "@/types/transforms/category.transforms";
import type { ProductBE } from "@/types/backend/product.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type { toFEProductCard } from "@/types/transforms/product.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";

class CategoriesService {
  // List categories
  async list(filters?: CategoryFilters): Promise<Category[]> {
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

    const response = await apiService.get<{
      success: boolean;
      data: Category[];
    }>(endpoint);
    return response.data || [];
  }

  // Get category by ID
  async getById(id: string): Promise<Category> {
    const response = await apiService.get<{ success: boolean; data: Category }>(
      `/categories/${id}`
    );
    return response.data;
  }

  // Get category by slug
  async getBySlug(slug: string): Promise<Category> {
    const response = await apiService.get<{ success: boolean; data: Category }>(
      `/categories/${slug}`
    );
    return response.data;
  }

  // Get category tree
  async getTree(parentId?: string): Promise<CategoryTree[]> {
    const params = new URLSearchParams();
    if (parentId) params.append("parentId", parentId);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/categories/tree?${queryString}`
      : "/categories/tree";

    const response = await apiService.get<{
      success: boolean;
      data: CategoryTree[];
    }>(endpoint);
    return response.data || [];
  }

  // Get leaf categories (for product creation)
  async getLeaves(): Promise<Category[]> {
    const response = await apiService.get<{
      success: boolean;
      data: Category[];
    }>("/categories/leaves");
    return response.data || [];
  }

  // Create category (admin only)
  async create(data: CreateCategoryData): Promise<Category> {
    const response = await apiService.post<{
      success: boolean;
      data: Category;
    }>("/categories", data);
    return response.data;
  }

  // Update category (admin only)
  async update(slug: string, data: UpdateCategoryData): Promise<Category> {
    const response = await apiService.patch<{
      success: boolean;
      data: Category;
    }>(`/categories/${slug}`, data);
    return response.data;
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
  async getParents(slug: string): Promise<Category[]> {
    const response = await apiService.get<{
      success: boolean;
      data: Category[];
    }>(`/categories/${slug}/parents`);
    return response.data || [];
  }

  // Get all direct children of a category
  async getChildren(slug: string): Promise<Category[]> {
    const response = await apiService.get<{
      success: boolean;
      data: Category[];
    }>(`/categories/${slug}/children`);
    return response.data || [];
  }

  // Get featured categories
  async getFeatured(): Promise<Category[]> {
    const response = await apiService.get<{
      success: boolean;
      data: Category[];
    }>("/categories/featured");
    return response.data || [];
  }

  // Get homepage categories
  async getHomepage(): Promise<Category[]> {
    const response = await apiService.get<{
      success: boolean;
      data: Category[];
    }>("/categories/homepage");
    return response.data || [];
  }

  // Search categories
  async search(query: string): Promise<Category[]> {
    const response = await apiService.get<{
      success: boolean;
      data: Category[];
    }>(`/categories/search?q=${encodeURIComponent(query)}`);
    return response.data || [];
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
  ): Promise<PaginatedResponse<Product>> {
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

    const res = await apiService.get<any>(endpoint);
    return {
      data: res.products || res.data || res,
      pagination: res.pagination || {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        total: (res.products || res.data || res).length || 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  // Get immediate subcategories of a category
  async getSubcategories(slug: string): Promise<Category[]> {
    const res = await apiService.get<any>(`/categories/${slug}/subcategories`);
    return res.data || res.subcategories || res || [];
  }

  // Get similar categories (siblings or related)
  async getSimilarCategories(
    slug: string,
    limit?: number
  ): Promise<Category[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", String(limit));

    const qs = params.toString();
    const endpoint = qs
      ? `/categories/${slug}/similar?${qs}`
      : `/categories/${slug}/similar`;

    const res = await apiService.get<any>(endpoint);
    return res.data || res.categories || res || [];
  }

  // Get full category hierarchy path (breadcrumb)
  async getCategoryHierarchy(slug: string): Promise<Category[]> {
    const res = await apiService.get<any>(`/categories/${slug}/hierarchy`);
    return res.data || res.hierarchy || res || [];
  }
}

export const categoriesService = new CategoriesService();
export type {
  CategoryFilters,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryTree,
};
