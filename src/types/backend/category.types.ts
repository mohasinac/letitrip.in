/**
 * @fileoverview Type Definitions
 * @module src/types/backend/category.types
 * @description This file contains TypeScript type definitions for category
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * BACKEND CATEGORY TYPES
 */

import { Timestamp } from "firebase/firestore";
import { Status } from "../shared/common.types";

/**
 * CategoryBE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryBE
 */
export interface CategoryBE {
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
  /** Banner */
  banner: string | null; // Banner/cover image for category pages
  /** Icon */
  icon: string | null;
  /** ParentIds */
  parentIds: string[]; // Multi-parent support
  /** Level */
  level: number;
  /** Order */
  order: number;
  /** Status */
  status: Status;
  /** Product Count */
  productCount: number;
  /** InStockCount */
  inStockCount: number; // Products with stock > 0
  /** OutOfStockCount */
  outOfStockCount: number; // Products with stock = 0
  /** LiveAuctionCount */
  liveAuctionCount: number; // Active auctions
  /** EndedAuctionCount */
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
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
}

/**
 * CategoryListItemBE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryListItemBE
 */
export interface CategoryListItemBE {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Image */
  image: string | null;
  /** Parent Ids */
  parentIds: string[];
  /** Level */
  level: number;
  /** Product Count */
  productCount: number;
  /** In Stock Count */
  inStockCount: number;
  /** Out Of Stock Count */
  outOfStockCount: number;
  /** Live Auction Count */
  liveAuctionCount: number;
  /** Ended Auction Count */
  endedAuctionCount: number;
  /** Is Leaf */
  isLeaf: boolean;
  /** Status */
  status: Status;
}

/**
 * CreateCategoryRequestBE interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateCategoryRequestBE
 */
export interface CreateCategoryRequestBE {
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description?: string;
  /** Image */
  image?: string;
  /** Banner */
  banner?: string;
  /** Icon */
  icon?: string;
  /** Parent Ids */
  parentIds?: string[];
  /** Order */
  order?: number;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * UpdateCategoryRequestBE interface
 * 
 * @interface
 * @description Defines the structure and contract for UpdateCategoryRequestBE
 */
export interface UpdateCategoryRequestBE {
  /** Name */
  name?: string;
  /** Slug */
  slug?: string;
  /** Description */
  description?: string;
  /** Image */
  image?: string;
  /** Banner */
  banner?: string;
  /** Icon */
  icon?: string;
  /** Parent Ids */
  parentIds?: string[];
  /** Order */
  order?: number;
  /** Status */
  status?: Status;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * CategoryTreeResponseBE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryTreeResponseBE
 */
export interface CategoryTreeResponseBE {
  /** Categories */
  categories: CategoryBE[];
  /** Tree */
  tree: CategoryTreeNodeBE[];
}

/**
 * CategoryTreeNodeBE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryTreeNodeBE
 */
export interface CategoryTreeNodeBE {
  /** Category */
  category: CategoryBE;
  /** Children */
  children: CategoryTreeNodeBE[];
  /** Depth */
  depth: number;
}

/**
 * CategoryBreadcrumbBE interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryBreadcrumbBE
 */
export interface CategoryBreadcrumbBE {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Level */
  level: number;
}
