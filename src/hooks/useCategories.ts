import { useState, useEffect } from 'react';
import { Category, CategoryFormData } from '@/types';
import { categoriesService } from '@/lib/api/services/categories';

export function useCategories(options?: { subcategories?: boolean; featured?: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data until API is fully integrated
      const mockCategories = categoriesService.getMockCategories();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredCategories = mockCategories;
      if (options?.featured) {
        filteredCategories = mockCategories.filter(cat => cat.featured);
      }
      
      setCategories(filteredCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [options?.subcategories, options?.featured]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

export function useCategoryManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (data: CategoryFormData): Promise<Category> => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCategory: Category = {
        id: Date.now().toString(),
        ...data,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: data.sortOrder,
      };
      
      return newCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedCategory: Category = {
        id,
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        image: data.image || '',
        icon: data.icon,
        productCount: 0, // This would come from the API
        featured: data.featured || false,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        updatedAt: new Date().toISOString(),
        order: data.sortOrder || 0,
      };
      
      return updatedCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would call categoriesService.deleteCategory(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return !currentStatus;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle category status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  };
}
