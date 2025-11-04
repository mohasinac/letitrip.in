/**
 * Category Types
 * Shared between UI and Backend
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  level: number;
  children?: Category[];
  productCount?: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategorySEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured?: boolean;
  seo?: CategorySEO;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CategoryFilters {
  parentId?: string;
  level?: number;
  featured?: boolean;
  active?: boolean;
}
