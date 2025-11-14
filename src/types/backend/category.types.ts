/**
 * BACKEND CATEGORY TYPES
 */

import { Timestamp } from "firebase/firestore";
import { Status } from "../shared/common.types";

export interface CategoryBE {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  banner: string | null; // Banner/cover image for category pages
  icon: string | null;
  parentIds: string[]; // Multi-parent support
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CategoryListItemBE {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentIds: string[];
  level: number;
  productCount: number;
  isLeaf: boolean;
  status: Status;
}

export interface CreateCategoryRequestBE {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  icon?: string;
  parentIds?: string[];
  order?: number;
  metadata?: Record<string, any>;
}

export interface UpdateCategoryRequestBE {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  banner?: string;
  icon?: string;
  parentIds?: string[];
  order?: number;
  status?: Status;
  metadata?: Record<string, any>;
}

export interface CategoryTreeResponseBE {
  categories: CategoryBE[];
  tree: CategoryTreeNodeBE[];
}

export interface CategoryTreeNodeBE {
  category: CategoryBE;
  children: CategoryTreeNodeBE[];
  depth: number;
}

export interface CategoryBreadcrumbBE {
  id: string;
  name: string;
  slug: string;
  level: number;
}
