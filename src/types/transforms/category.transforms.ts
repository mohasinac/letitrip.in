/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/category.transforms
 * @description This file contains functionality related to category.transforms
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * CATEGORY TYPE TRANSFORMATIONS
 */

import { Timestamp } from "firebase/firestore";
import { Status } from "../shared/common.types";
import {
  CategoryBE,
  CategoryTreeNodeBE,
  CategoryBreadcrumbBE,
  CreateCategoryRequestBE,
} from "../backend/category.types";
import {
  CategoryFE,
  CategoryTreeNodeFE,
  CategoryBreadcrumbFE,
  CategoryFormFE,
} from "../frontend/category.types";

/**
 * Function: Parse Date
 */
/**
 * Parses date
 *
 * @param {Timestamp | string | Date | undefined | null} date - The date
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {Timestamp | string | Date | undefined | null} date - The date
 *
 * @returns {any} The parsedate result
 */

function parseDate(date: Timestamp | string | Date | undefined | null): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  if (date instanceof Timestamp) return date.toDate();
  return new Date(date);
}

/**
 * Transform API response to CategoryFE
 * Handles both snake_case (raw Firestore) and camelCase (API transformed) formats
 */
/**
 * Performs to f e category operation
 *
 * @param {CategoryBE | any} data - Data object containing information
 *
 * @returns {any} The tofecategory result
 *
 * @example
 * toFECategory(data);
 */

/**
 * Performs to f e category operation
 *
 * @param {CategoryBE | any} data - Data object containing information
 *
 * @returns {any} The tofecategory result
 *
 * @example
 * toFECategory(data);
 */

export function toFECategory(data: CategoryBE | any): CategoryFE {
  // Handle both snake_case and camelCase field names from API
  const parentIds =
    data.parentIds ||
    data.parent_ids ||
    (data.parent_id ? [data.parent_id] : []);
  const productCount = data.productCount ?? data.product_count ?? 0;
  const inStockCount = data.inStockCount ?? data.in_stock_count ?? 0;
  const outOfStockCount = data.outOfStockCount ?? data.out_of_stock_count ?? 0;
  const liveAuctionCount =
    data.liveAuctionCount ?? data.live_auction_count ?? 0;
  const endedAuctionCount =
    data.endedAuctionCount ?? data.ended_auction_count ?? 0;
  const level = data.level ?? 0;
  const hasChildrenValue = data.hasChildren ?? data.has_children ?? false;
  const isLeaf = data.isLeaf ?? data.is_leaf ?? !hasChildrenValue;
  const order = data.order ?? data.sortOrder ?? data.sort_order ?? 0;

  // Determine status/isActive
  let isActive = true;
  if (data.status !== undefined) {
    isActive = data.status === Status.PUBLISHED || data.status === "published";
  } else if (data.isActive !== undefined) {
    isActive = data.isActive;
  } else if (data.is_active !== undefined) {
    isActive = data.is_active;
  }

  // Determine featured
  const featured =
    data.featured ?? data.is_featured ?? data.metadata?.featured ?? false;

  return {
    /** Id */
    id: data.id,
    /** Name */
    name: data.name,
    /** Slug */
    slug: data.slug,
    /** Description */
    description: data.description || null,
    /** Image */
    image: data.image || null,
    /** Banner */
    banner: data.banner || null,
    /** Icon */
    icon: data.icon || null,
    parentIds,
    level,
    order,
    /** Status */
    status: isActive ? Status.PUBLISHED : Status.DRAFT,
    productCount,
    inStockCount,
    outOfStockCount,
    liveAuctionCount,
    endedAuctionCount,
    isLeaf,
    /** Metadata */
    metadata: data.metadata || {},
    /** Created At */
    createdAt: parseDate(data.createdAt || data.created_at),
    /** Updated At */
    updatedAt: parseDate(data.updatedAt || data.updated_at),
    // Computed properties
    /** Has Products */
    hasProducts: productCount > 0,
    /** Has Parents */
    hasParents: parentIds.length > 0,
    /** Is Root */
    isRoot: level === 0,
    /** Display Name */
    displayName: data.name,
    /** Url Path */
    urlPath: `/categories/${data.slug}`,
    // Backwards compatibility aliases
    /** Parent Id */
    parentId: parentIds[0] || null,
    featured,
    isActive,
    /** Sort Order */
    sortOrder: order,
  };
}

/**
 * Function: To F E Category Tree Node
 */
/**
 * Performs to f e category tree node operation
 *
 * @param {CategoryTreeNodeBE} nodeBE - The node b e
 *
 * @returns {any} The tofecategorytreenode result
 *
 * @example
 * toFECategoryTreeNode(nodeBE);
 */

/**
 * Performs to f e category tree node operation
 *
 * @param {CategoryTreeNodeBE} /** Node B E */
  nodeBE - The /**  node  b  e */
  node b e
 *
 * @returns {any} The tofecategorytreenode result
 *
 * @example
 * toFECategoryTreeNode(/** Node B E */
  nodeBE);
 */

export function toFECategoryTreeNode(
  /** Node B E */
  nodeBE: CategoryTreeNodeBE,
): CategoryTreeNodeFE {
  return {
    /** Category */
    category: toFECategory(nodeBE.category),
    /** Children */
    children: nodeBE.children.map(toFECategoryTreeNode),
    /** Depth */
    depth: nodeBE.depth,
    /** Has Children */
    hasChildren: nodeBE.children.length > 0,
    /** Is Expanded */
    isExpanded: false,
  };
}

/**
 * Function: To F E Category Breadcrumb
 */
/**
 * Performs to f e category breadcrumb operation
 *
 * @param {CategoryBreadcrumbBE} breadcrumbBE - The breadcrumb b e
 *
 * @returns {any} The tofecategorybreadcrumb result
 *
 * @example
 * toFECategoryBreadcrumb(breadcrumbBE);
 */

/**
 * Performs to f e category breadcrumb operation
 *
 * @param {CategoryBreadcrumbBE} /** Breadcrumb B E */
  breadcrumbBE - The /**  breadcrumb  b  e */
  breadcrumb b e
 *
 * @returns {any} The tofecategorybreadcrumb result
 *
 * @example
 * toFECategoryBreadcrumb(/** Breadcrumb B E */
  breadcrumbBE);
 */

export function toFECategoryBreadcrumb(
  /** Breadcrumb B E */
  breadcrumbBE: CategoryBreadcrumbBE,
): CategoryBreadcrumbFE {
  return {
    ...breadcrumbBE,
    /** Url Path */
    urlPath: `/categories/${breadcrumbBE.slug}`,
  };
}

/**
 * Function: To B E Create Category Request
 */
/**
 * Performs to b e create category request operation
 *
 * @param {CategoryFormFE} formData - The form data
 *
 * @returns {any} The tobecreatecategoryrequest result
 *
 * @example
 * toBECreateCategoryRequest(formData);
 */

/**
 * Performs to b e create category request operation
 *
 * @param {CategoryFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobecreatecategoryrequest result
 *
 * @example
 * toBECreateCategoryRequest(/** Form Data */
  formData);
 */

export function toBECreateCategoryRequest(
  /** Form Data */
  formData: CategoryFormFE,
): CreateCategoryRequestBE {
  return {
    /** Name */
    name: formData.name,
    /** Slug */
    slug: formData.slug,
    /** Description */
    description: formData.description || undefined,
    /** Image */
    image: formData.image || undefined,
    /** Icon */
    icon: formData.icon || undefined,
    /** Parent Ids */
    parentIds: formData.parentIds,
    /** Order */
    order: formData.order,
    /** Metadata */
    metadata: formData.metadata,
  };
}

/**
 * Function: To F E Categories
 */
/**
 * Performs to f e categories operation
 *
 * @param {CategoryBE[]} categoriesBE - The categories b e
 *
 * @returns {any} The tofecategories result
 *
 * @example
 * toFECategories(categoriesBE);
 */

/**
 * Performs to f e categories operation
 *
 * @param {CategoryBE[]} categoriesBE - The categories b e
 *
 * @returns {any} The tofecategories result
 *
 * @example
 * toFECategories(categoriesBE);
 */

export function toFECategories(categoriesBE: CategoryBE[]): CategoryFE[] {
  return categoriesBE.map(toFECategory);
}
