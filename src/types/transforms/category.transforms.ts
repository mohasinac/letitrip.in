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
export function toFECategory(data: CategoryBE | any): CategoryFE {
  // Handle both snake_case and camelCase field names from API
  const parentIds = data.parentIds || data.parent_ids || (data.parent_id ? [data.parent_id] : []);
  const productCount = data.productCount ?? data.product_count ?? 0;
  const inStockCount = data.inStockCount ?? data.in_stock_count ?? 0;
  const outOfStockCount = data.outOfStockCount ?? data.out_of_stock_count ?? 0;
  const liveAuctionCount = data.liveAuctionCount ?? data.live_auction_count ?? 0;
  const endedAuctionCount = data.endedAuctionCount ?? data.ended_auction_count ?? 0;
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
  const featured = data.featured ?? data.is_featured ?? data.metadata?.featured ?? false;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    image: data.image || null,
    banner: data.banner || null,
    icon: data.icon || null,
    parentIds,
    level,
    order,
    status: isActive ? Status.PUBLISHED : Status.DRAFT,
    productCount,
    inStockCount,
    outOfStockCount,
    liveAuctionCount,
    endedAuctionCount,
    isLeaf,
    metadata: data.metadata || {},
    createdAt: parseDate(data.createdAt || data.created_at),
    updatedAt: parseDate(data.updatedAt || data.updated_at),
    // Computed properties
    hasProducts: productCount > 0,
    hasParents: parentIds.length > 0,
    isRoot: level === 0,
    displayName: data.name,
    urlPath: `/categories/${data.slug}`,
    // Backwards compatibility aliases
    parentId: parentIds[0] || null,
    featured,
    isActive,
    sortOrder: order,
  };
}

export function toFECategoryTreeNode(
  nodeBE: CategoryTreeNodeBE,
): CategoryTreeNodeFE {
  return {
    category: toFECategory(nodeBE.category),
    children: nodeBE.children.map(toFECategoryTreeNode),
    depth: nodeBE.depth,
    hasChildren: nodeBE.children.length > 0,
    isExpanded: false,
  };
}

export function toFECategoryBreadcrumb(
  breadcrumbBE: CategoryBreadcrumbBE,
): CategoryBreadcrumbFE {
  return {
    ...breadcrumbBE,
    urlPath: `/categories/${breadcrumbBE.slug}`,
  };
}

export function toBECreateCategoryRequest(
  formData: CategoryFormFE,
): CreateCategoryRequestBE {
  return {
    name: formData.name,
    slug: formData.slug,
    description: formData.description || undefined,
    image: formData.image || undefined,
    icon: formData.icon || undefined,
    parentIds: formData.parentIds,
    order: formData.order,
    metadata: formData.metadata,
  };
}

export function toFECategories(categoriesBE: CategoryBE[]): CategoryFE[] {
  return categoriesBE.map(toFECategory);
}
