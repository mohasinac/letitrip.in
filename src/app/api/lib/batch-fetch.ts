/**
 * Batch Fetch Utilities
 * 
 * Prevents N+1 query problems by batching document fetches.
 * Uses Firestore's __name__ "in" query (max 10 items per query).
 * 
 * Location: /src/lib/batch-fetch.ts
 */

import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';
import { Collections } from '@/app/api/lib/firebase/collections';

/**
 * Generic batch fetch function
 * Fetches multiple documents by IDs in batches
 */
export async function batchFetchDocuments<T = any>(
  collectionName: string,
  ids: string[]
): Promise<Map<string, T>> {
  const resultMap = new Map<string, T>();

  if (ids.length === 0) {
    return resultMap;
  }

  const db = getFirestoreAdmin();
  const batchSize = 10; // Firestore 'in' query limit

  // Remove duplicates
  const uniqueIds = [...new Set(ids)];

  // Fetch in batches
  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize);

    const snapshot = await db
      .collection(collectionName)
      .where('__name__', 'in', batch)
      .get();

    snapshot.docs.forEach((doc) => {
      resultMap.set(doc.id, {
        id: doc.id,
        ...doc.data(),
      } as T);
    });
  }

  return resultMap;
}

/**
 * Batch fetch products by IDs
 * 
 * @example
 * ```ts
 * const productIds = ['prod1', 'prod2', 'prod3'];
 * const productsMap = await batchGetProducts(productIds);
 * const product1 = productsMap.get('prod1');
 * ```
 */
export async function batchGetProducts(productIds: string[]): Promise<Map<string, any>> {
  return batchFetchDocuments('products', productIds);
}

/**
 * Batch fetch shops by IDs
 * 
 * @example
 * ```ts
 * const shopIds = ['shop1', 'shop2'];
 * const shopsMap = await batchGetShops(shopIds);
 * ```
 */
export async function batchGetShops(shopIds: string[]): Promise<Map<string, any>> {
  return batchFetchDocuments('shops', shopIds);
}

/**
 * Batch fetch categories by IDs
 * 
 * @example
 * ```ts
 * const categoryIds = ['cat1', 'cat2', 'cat3'];
 * const categoriesMap = await batchGetCategories(categoryIds);
 * ```
 */
export async function batchGetCategories(categoryIds: string[]): Promise<Map<string, any>> {
  return batchFetchDocuments('categories', categoryIds);
}

/**
 * Batch fetch users by IDs
 * 
 * @example
 * ```ts
 * const userIds = ['user1', 'user2'];
 * const usersMap = await batchGetUsers(userIds);
 * ```
 */
export async function batchGetUsers(userIds: string[]): Promise<Map<string, any>> {
  return batchFetchDocuments('users', userIds);
}

/**
 * Batch fetch orders by IDs
 * 
 * @example
 * ```ts
 * const orderIds = ['order1', 'order2'];
 * const ordersMap = await batchGetOrders(orderIds);
 * ```
 */
export async function batchGetOrders(orderIds: string[]): Promise<Map<string, any>> {
  return batchFetchDocuments('orders', orderIds);
}

/**
 * Batch fetch auctions by IDs
 * 
 * @example
 * ```ts
 * const auctionIds = ['auction1', 'auction2'];
 * const auctionsMap = await batchGetAuctions(auctionIds);
 * ```
 */
export async function batchGetAuctions(auctionIds: string[]): Promise<Map<string, any>> {
  return batchFetchDocuments('auctions', auctionIds);
}

/**
 * Batch fetch coupons by IDs
 * 
 * @example
 * ```ts
 * const couponIds = ['coupon1', 'coupon2'];
 * const couponsMap = await batchGetCoupons(couponIds);
 * ```
 */
export async function batchGetCoupons(couponIds: string[]): Promise<Map<string, any>> {
  return batchFetchDocuments('coupons', couponIds);
}

/**
 * Batch fetch by custom collection
 * For collections not covered by specific functions
 * 
 * @example
 * ```ts
 * const ids = ['id1', 'id2'];
 * const docsMap = await batchGetByCollection('reviews', ids);
 * ```
 */
export async function batchGetByCollection(
  collectionName: string,
  ids: string[]
): Promise<Map<string, any>> {
  return batchFetchDocuments(collectionName, ids);
}

/**
 * Helper: Convert batch result map to array preserving order
 * 
 * @example
 * ```ts
 * const productIds = ['prod1', 'prod2', 'prod3'];
 * const productsMap = await batchGetProducts(productIds);
 * const productsArray = mapToOrderedArray(productsMap, productIds);
 * // productsArray[0] corresponds to 'prod1', etc.
 * ```
 */
export function mapToOrderedArray<T>(
  map: Map<string, T>,
  orderedIds: string[]
): (T | null)[] {
  return orderedIds.map((id) => map.get(id) || null);
}

/**
 * Helper: Chunk array for batch processing
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
