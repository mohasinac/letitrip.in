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
      
      // Use actual API call
      const result = await categoriesService.getCategories({
        subcategories: options?.subcategories,
        featured: options?.featured
      });
      
      setCategories(result.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      // Fallback to empty array on error
      setCategories([]);
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
      
      // Use actual API call
      const newCategory = await categoriesService.createCategory(data);
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
      
      // Use actual API call
      const updatedCategory = await categoriesService.updateCategory(id, data);
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
      
      // Use actual API call
      await categoriesService.deleteCategory(id);
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
      
      // Use actual API call to update category status
      const updatedCategory = await categoriesService.updateCategory(id, { 
        isActive: !currentStatus 
      });
      
      return updatedCategory.isActive || false;
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
