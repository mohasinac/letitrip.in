/**
 * FRONTEND CATEGORY TYPES
 */

import { Status } from "../shared/common.types";

export interface CategoryFE {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  banner: string | null; // Banner/cover image for category pages
  icon: string | null;
  parentIds: string[];
  level: number;
  order: number;
  status: Status;
  productCount: number;
  isLeaf: boolean;
  metadata: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;

  // Computed
  hasProducts: boolean;
  hasParents: boolean;
  isRoot: boolean;
  displayName: string;
  urlPath: string;

  // Backwards compatibility aliases
  parentId?: string | null; // First parent or null (for single-parent legacy code)
  featured?: boolean; // Derived from metadata or default false
  isActive?: boolean; // status === 'published'
  sortOrder?: number; // Alias for order
}

export interface CategoryTreeNodeFE {
  category: CategoryFE;
  children: CategoryTreeNodeFE[];
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

export interface CategoryBreadcrumbFE {
  id: string;
  name: string;
  slug: string;
  level: number;
  urlPath: string;
}

export interface CategoryCardFE {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
  urlPath: string;
}

export interface CategoryFormFE {
  name: string;
  slug: string;
  description: string;
  image: string | null;
  banner?: string | null;
  icon: string | null;
  parentIds: string[];
  order: number;
  metadata?: Record<string, any>;

  // Backwards compatibility (optional for legacy forms)
  parentId?: string | null; // Can be used instead of parentIds
  featured?: boolean;
  isActive?: boolean;
  sortOrder?: number; // Alias for order
}
