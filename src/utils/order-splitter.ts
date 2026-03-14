/**
 * Order Splitter
 *
 * Splits a validated cart into distinct order groups based on item type and seller.
 *
 * Rules:
 *   1. Auction items     → each item is its OWN separate order (independent fulfilment)
 *   2. Pre-order items   → all items from the SAME seller are grouped into one order
 *   3. Standard products → all items from the SAME seller are grouped into one order
 *
 * Pre-orders and standard products from the same seller are kept SEPARATE because
 * they have different fulfilment timelines — mixing them risks inconsistent shipping,
 * returns, and refund processing.
 */

import type { OrderType } from "@/db/schema";

export interface OrderGroup<T> {
  /** All validated cart items belonging to this order */
  items: T[];
  /** Discriminates downstream processing rules */
  orderType: OrderType;
}

/**
 * Splits product-check entries into order groups.
 *
 * @param checks - Array of `{ item: CartItemDocument, product: ProductDocument | null }`
 *   as produced by the pre-validation step in checkout routes.
 *
 * @returns Ordered array of groups. Each group should become exactly one
 *   `OrderDocument` in Firestore.
 *
 * Grouping key matrix:
 * | isAuction | isPreOrder | isOffer | key                        | orderType  |
 * |-----------|------------|---------|----------------------------|------------|
 * | true      | any        | any     | `auction:{itemId}`         | "auction"  |
 * | false     | any        | true    | `offer:{itemId}`           | "offer"    |
 * | false     | true       | false   | `preorder:{sellerId}`      | "preorder" |
 * | false     | false      | false   | `standard:{sellerId}`      | "standard" |
 */
export function splitCartIntoOrderGroups<
  T extends {
    item: {
      itemId: string;
      sellerId?: string;
      isAuction?: boolean;
      isPreOrder?: boolean;
      isOffer?: boolean;
    };
  },
>(checks: T[]): OrderGroup<T>[] {
  const groups = new Map<string, OrderGroup<T>>();

  for (const check of checks) {
    const { item } = check;
    let key: string;
    let orderType: OrderType;

    if (item.isAuction) {
      // Each auction win is an independent transaction — never merge with other items.
      key = `auction:${item.itemId}`;
      orderType = "auction";
    } else if (item.isOffer) {
      // Accepted offer — always a single, isolated order for this one item.
      // Never merged with regular cart items, even if from the same seller.
      key = `offer:${item.itemId}`;
      orderType = "offer";
    } else if (item.isPreOrder) {
      // Pre-orders from the same seller share one order for consolidated deposit billing.
      key = `preorder:${item.sellerId ?? "unknown"}`;
      orderType = "preorder";
    } else {
      // Standard in-stock products from the same seller ship together.
      key = `standard:${item.sellerId ?? "unknown"}`;
      orderType = "standard";
    }

    if (!groups.has(key)) {
      groups.set(key, { items: [], orderType });
    }
    groups.get(key)!.items.push(check);
  }

  return Array.from(groups.values());
}
