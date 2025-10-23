import { Category } from '@/types';

/**
 * Generate a URL-friendly slug from a category name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get category hierarchy path (breadcrumbs)
 */
export function getCategoryPath(category: Category, allCategories: Category[]): Category[] {
  const path: Category[] = [category];
  let currentCategory = category;

  while (currentCategory.parentId) {
    const parent = allCategories.find(cat => cat.id === currentCategory.parentId);
    if (parent) {
      path.unshift(parent);
      currentCategory = parent;
    } else {
      break;
    }
  }

  return path;
}

/**
 * Get all subcategories of a category (including nested ones)
 */
export function getAllSubcategories(categoryId: string, allCategories: Category[]): Category[] {
  const subcategories: Category[] = [];
  const directSubs = allCategories.filter(cat => cat.parentId === categoryId);
  
  for (const sub of directSubs) {
    subcategories.push(sub);
    subcategories.push(...getAllSubcategories(sub.id, allCategories));
  }
  
  return subcategories;
}

/**
 * Build category tree structure
 */
export function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // Create a map for quick lookup
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, subcategories: [] });
  });

  // Build the tree
  categories.forEach(cat => {
    const categoryWithSubs = categoryMap.get(cat.id)!;
    
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.subcategories = parent.subcategories || [];
        parent.subcategories.push(categoryWithSubs);
      }
    } else {
      rootCategories.push(categoryWithSubs);
    }
  });

  return rootCategories;
}

/**
 * Sort categories by their sort order and name
 */
export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    // First sort by sortOrder if available
    const aOrder = a.sortOrder || a.order || 999;
    const bOrder = b.sortOrder || b.order || 999;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Then sort by name alphabetically
    return a.name.localeCompare(b.name);
  });
}

/**
 * Filter categories by search query
 */
export function filterCategories(categories: Category[], query: string): Category[] {
  if (!query.trim()) return categories;
  
  const searchTerm = query.toLowerCase();
  
  return categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm) ||
    category.description.toLowerCase().includes(searchTerm) ||
    category.slug.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get category statistics
 */
export function getCategoryStats(categories: Category[]) {
  const stats = {
    total: categories.length,
    active: categories.filter(cat => cat.isActive !== false).length,
    inactive: categories.filter(cat => cat.isActive === false).length,
    featured: categories.filter(cat => cat.featured).length,
    withSubcategories: categories.filter(cat => cat.subcategories && cat.subcategories.length > 0).length,
    totalProducts: categories.reduce((sum, cat) => sum + cat.productCount, 0),
    rootCategories: categories.filter(cat => !cat.parentId).length,
    subcategories: categories.filter(cat => cat.parentId).length,
  };

  return stats;
}

/**
 * Validate category data
 */
export function validateCategory(data: Partial<Category>): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Category name is required');
  }

  if (!data.slug?.trim()) {
    errors.push('Category slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Category slug can only contain lowercase letters, numbers, and hyphens');
  }

  if (!data.description?.trim()) {
    errors.push('Category description is required');
  }

  if (data.sortOrder !== undefined && data.sortOrder < 0) {
    errors.push('Sort order must be a positive number');
  }

  return errors;
}

/**
 * Check if category can be deleted
 */
export function canDeleteCategory(category: Category, allCategories: Category[]): { canDelete: boolean; reason?: string } {
  // Check if category has products
  if (category.productCount > 0) {
    return {
      canDelete: false,
      reason: `Category has ${category.productCount} products. Please reassign or remove products first.`
    };
  }

  // Check if category has subcategories
  const subcategories = allCategories.filter(cat => cat.parentId === category.id);
  if (subcategories.length > 0) {
    return {
      canDelete: false,
      reason: `Category has ${subcategories.length} subcategories. Please reassign or remove subcategories first.`
    };
  }

  return { canDelete: true };
}
