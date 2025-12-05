/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/category.types
 * @description This file contains TypeScript type definitions for category
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * FRONTEND CATEGORY TYPES
 */

import { Status } from "../shared/common.types";

/**
 * CategoryFE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryFE
 */
export interface CategoryFE {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description: string | null;
  /** Image */
  image: string | null;
  banner: string | null; // Banner/cover image for category pages
  /** Icon */
  icon: string | null;
  /** Parent Ids */
  parentIds: string[];
  /** Level */
  level: number;
  /** Order */
  order: number;
  /** Status */
  status: Status;
  /** Product Count */
  productCount: number;
  inStockCount: number; // Products with stock > 0
  outOfStockCount: number; // Products with stock = 0
  liveAuctionCount: number; // Active auctions
  endedAuctionCount: number; // Ended/completed auctions
  /** Is Leaf */
  isLeaf: boolean;
  /** Metadata */
  metadata: {
    /** Seo Title */
    seoTitle?: string;
    /** Seo Description */
    seoDescription?: string;
    /** Seo Keywords */
    seoKeywords?: string[];
  };
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // Computed
  /** Has Products */
  hasProducts: boolean;
  /** Has Parents */
  hasParents: boolean;
  /** Is Root */
  isRoot: boolean;
  /** Display Name */
  displayName: string;
  /** Url Path */
  urlPath: string;

  // Backwards compatibility aliases
  parentId?: string | null; // First parent or null (for single-parent legacy code)
  featured?: boolean; // Derived from metadata or default false
  isActive?: boolean; // status === 'published'
  sortOrder?: number; // Alias for order
}

/**
 * CategoryTreeNodeFE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryTreeNodeFE
 */
export interface CategoryTreeNodeFE {
  /** Category */
  category: CategoryFE;
  /** Children */
  children: CategoryTreeNodeFE[];
  /** Depth */
  depth: number;
  /** Has Children */
  hasChildren: boolean;
  /** Is Expanded */
  isExpanded: boolean;
}

/**
 * CategoryBreadcrumbFE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryBreadcrumbFE
 */
export interface CategoryBreadcrumbFE {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Level */
  level: number;
  /** Url Path */
  urlPath: string;
}

/**
 * CategoryCardFE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryCardFE
 */
export interface CategoryCardFE {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Image */
  image: string | null;
  /** Product Count */
  productCount: number;
  /** Url Path */
  urlPath: string;
}

/**
 * CategoryFormFE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryFormFE
 */
export interface CategoryFormFE {
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description: string;
  /** Image */
  image: string | null;
  /** Banner */
  banner?: string | null;
  /** Icon */
  icon: string | null;
  /** Parent Ids */
  parentIds: string[];
  /** Order */
  order: number;
  /** Metadata */
  metadata?: Record<string, any>;

  // Backwards compatibility (optional for legacy forms)
  parentId?: string | null; // Can be used instead of parentIds
  /** Featured */
  featured?: boolean;
  /** Is Active */
  isActive?: boolean;
  sortOrder?: number; // Alias for order
}
