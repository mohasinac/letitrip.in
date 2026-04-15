/**
 * Shared Category types for admin category management.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display?: {
    coverImage?: string;
    icon?: string;
    color?: string;
    showInMenu?: boolean;
    showInFooter?: boolean;
  };
  parentId: string | null;
  tier: number;
  order: number;
  isActive: boolean;
  showOnHomepage: boolean;
  isBrand?: boolean;
  metrics: {
    productCount: number;
    totalProductCount: number;
    auctionCount: number;
    totalAuctionCount: number;
  };
  children: Category[];
}

export type CategoryDrawerMode = "create" | "edit" | "delete" | null;

/** Flatten a nested category tree into a single array. */
export function flattenCategories(cats: Category[]): Category[] {
  const result: Category[] = [];
  const flatten = (items: Category[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        flatten(item.children);
      }
    });
  };
  flatten(cats);
  return result;
}

