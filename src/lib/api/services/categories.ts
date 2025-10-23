import { Category, CategoryFormData, ApiResponse } from '@/types';

class CategoriesService {
  private readonly baseUrl = '/api/categories';

  async getCategories(params?: {
    subcategories?: boolean;
    featured?: boolean;
  }): Promise<{
    categories: Category[];
    totalCategories: number;
    featuredCount: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.subcategories) searchParams.set('subcategories', 'true');
    if (params?.featured) searchParams.set('featured', 'true');

    const url = searchParams.toString() 
      ? `${this.baseUrl}?${searchParams.toString()}` 
      : this.baseUrl;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result: ApiResponse = await response.json();
    return result.data;
  }

  async createCategory(data: CategoryFormData): Promise<Category> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }

    const result: ApiResponse<{ category: Category }> = await response.json();
    return result.data!.category;
  }

  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category');
    }

    const result: ApiResponse<{ category: Category }> = await response.json();
    return result.data!.category;
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }
  }


}

export const categoriesService = new CategoriesService();
