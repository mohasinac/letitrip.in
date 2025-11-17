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

function parseDate(date: Timestamp | string): Date {
  return date instanceof Timestamp ? date.toDate() : new Date(date);
}

export function toFECategory(categoryBE: CategoryBE): CategoryFE {
  const metadata = categoryBE.metadata as any; // Cast for backwards compat access
  const parentIds = categoryBE.parentIds || [];
  return {
    ...categoryBE,
    createdAt: parseDate(categoryBE.createdAt),
    updatedAt: parseDate(categoryBE.updatedAt),
    hasProducts: categoryBE.productCount > 0,
    hasParents: parentIds.length > 0,
    isRoot: categoryBE.level === 0,
    displayName: categoryBE.name,
    urlPath: `/categories/${categoryBE.slug}`,
    banner: categoryBE.banner || null,
    // Backwards compatibility
    parentId: parentIds[0] || null,
    featured: metadata?.featured || false,
    isActive: categoryBE.status === Status.PUBLISHED,
    sortOrder: categoryBE.order,
  };
}

export function toFECategoryTreeNode(
  nodeBE: CategoryTreeNodeBE
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
  breadcrumbBE: CategoryBreadcrumbBE
): CategoryBreadcrumbFE {
  return {
    ...breadcrumbBE,
    urlPath: `/categories/${breadcrumbBE.slug}`,
  };
}

export function toBECreateCategoryRequest(
  formData: CategoryFormFE
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
