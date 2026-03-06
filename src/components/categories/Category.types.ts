/**
 * Shared Category types for admin category management.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId: string | null;
  tier: number;
  order: number;
  enabled: boolean;
  showOnHomepage: boolean;
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
      if (item.children.length > 0) {
        flatten(item.children);
      }
    });
  };
  flatten(cats);
  return result;
}
