import { apiService } from './api.service';
import type { Category } from '@/types';

interface CategoryFilters {
  parentId?: string | null;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  isActive?: boolean;
  search?: string;
}

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  icon?: string;
  image?: string;
  color?: string;
  sortOrder: number;
  isFeatured: boolean;
  showOnHomepage: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  commissionRate: number;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {}

interface CategoryTree extends Category {
  children?: CategoryTree[];
}

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
    const endpoint = queryString ? `/categories?${queryString}` : '/categories';
    
    const response = await apiService.get<{ success: boolean; data: Category[] }>(endpoint);
    return response.data || [];
  }

  // Get category by ID
  async getById(id: string): Promise<Category> {
    const response = await apiService.get<{ success: boolean; data: Category }>(`/categories/${id}`);
    return response.data;
  }

  // Get category by slug
  async getBySlug(slug: string): Promise<Category> {
    const response = await apiService.get<{ success: boolean; data: Category }>(`/categories/${slug}`);
    return response.data;
  }

  // Get category tree
  async getTree(parentId?: string): Promise<CategoryTree[]> {
    const params = new URLSearchParams();
    if (parentId) params.append('parentId', parentId);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/categories/tree?${queryString}` : '/categories/tree';
    
    const response = await apiService.get<{ success: boolean; data: CategoryTree[] }>(endpoint);
    return response.data || [];
  }

  // Get leaf categories (for product creation)
  async getLeaves(): Promise<Category[]> {
    const response = await apiService.get<{ success: boolean; data: Category[] }>('/categories/leaves');
    return response.data || [];
  }

  // Create category (admin only)
  async create(data: CreateCategoryData): Promise<Category> {
    const response = await apiService.post<{ success: boolean; data: Category }>('/categories', data);
    return response.data;
  }

  // Update category (admin only)
  async update(slug: string, data: UpdateCategoryData): Promise<Category> {
    return apiService.patch<Category>(`/categories/${slug}`, data);
  }

  // Delete category (admin only)
  async delete(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/categories/${slug}`);
  }

  // Get category breadcrumb
  async getBreadcrumb(id: string): Promise<Category[]> {
    return apiService.get<Category[]>(`/categories/${id}/breadcrumb`);
  }

  // Get featured categories
  async getFeatured(): Promise<Category[]> {
    const response = await apiService.get<{ success: boolean; data: Category[] }>('/categories/featured');
    return response.data || [];
  }

  // Get homepage categories
  async getHomepage(): Promise<Category[]> {
    const response = await apiService.get<{ success: boolean; data: Category[] }>('/categories/homepage');
    return response.data || [];
  }

  // Search categories
  async search(query: string): Promise<Category[]> {
    return apiService.get<Category[]>(`/categories/search?q=${encodeURIComponent(query)}`);
  }

  // Reorder categories (admin only)
  async reorder(orders: { id: string; sortOrder: number }[]): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/categories/reorder', { orders });
  }
}

export const categoriesService = new CategoriesService();
export type { CategoryFilters, CreateCategoryData, UpdateCategoryData, CategoryTree };
