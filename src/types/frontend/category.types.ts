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
  icon: string | null;
  parentIds: string[];
  order: number;
  metadata?: Record<string, any>;
}
