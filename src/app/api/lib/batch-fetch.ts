/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/batch-fetch
 * @description This file contains functionality related to batch-fetch
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Batch Fetch Utilities
 *
 * Prevents N+1 query problems by batching document fetches.
 * Uses Firestore's __name__ "in" query (max 10 items per query).
 *
 * Location: /src/lib/batch-fetch.ts
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Generic batch fetch function
 * Fetches multiple documents by IDs in batches
 */
/**
 * Performs batch fetch documents operation
 *
 * @param {string} collectionName - Name of collection
 * @param {string[]} ids - The ids
 *
 * @returns {Promise<any>} Promise resolving to batchfetchdocuments result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchFetchDocuments("example", ids);
 */

/**
 * Performs batch fetch documents operation
 *
 * @returns {Promise<any>} Promise resolving to batchfetchdocuments result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchFetchDocuments();
 */

export async function batchFetchDocuments<T = any>(
  /** Collection Name */
  collectionName: string,
  /** Ids */
  ids: string[],
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
      .where("__name__", "in", batch)
      .get();

    snapshot.docs.forEach((doc) => {
      resultMap.set(doc.id, {
        /** Id */
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
/**
 * Performs batch get products operation
 *
 * @param {string[]} productIds - The product ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetProducts(productIds);
 */

/**
 * Performs batch get products operation
 *
 * @param {string[]} /** Product Ids */
  productIds - The /**  product  ids */
  product ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetProducts(/** Product Ids */
  productIds);
 */

export async function batchGetProducts(
  /** Product Ids */
  productIds: string[],
): Promise<Map<string, any>> {
  return batchFetchDocuments(COLLECTIONS.PRODUCTS, productIds);
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
/**
 * Performs batch get shops operation
 *
 * @param {string[]} shopIds - The shop ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetshops result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetShops(shopIds);
 */

/**
 * Performs batch get shops operation
 *
 * @param {string[]} /** Shop Ids */
  shopIds - The /**  shop  ids */
  shop ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetshops result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetShops(/** Shop Ids */
  shopIds);
 */

export async function batchGetShops(
  /** Shop Ids */
  shopIds: string[],
): Promise<Map<string, any>> {
  return batchFetchDocuments(COLLECTIONS.SHOPS, shopIds);
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
/**
 * Performs batch get categories operation
 *
 * @param {string[]} categoryIds - The category ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetcategories result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetCategories(categoryIds);
 */

/**
 * Performs batch get categories operation
 *
 * @param {string[]} /** Category Ids */
  categoryIds - The /**  category  ids */
  category ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetcategories result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetCategories(/** Category Ids */
  categoryIds);
 */

export async function batchGetCategories(
  /** Category Ids */
  categoryIds: string[],
): Promise<Map<string, any>> {
  return batchFetchDocuments(COLLECTIONS.CATEGORIES, categoryIds);
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
/**
 * Performs batch get users operation
 *
 * @param {string[]} userIds - The user ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetusers result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetUsers(userIds);
 */

/**
 * Performs batch get users operation
 *
 * @param {string[]} /** User Ids */
  userIds - The /**  user  ids */
  user ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetusers result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetUsers(/** User Ids */
  userIds);
 */

export async function batchGetUsers(
  /** User Ids */
  userIds: string[],
): Promise<Map<string, any>> {
  return batchFetchDocuments(COLLECTIONS.USERS, userIds);
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
/**
 * Performs batch get orders operation
 *
 * @param {string[]} orderIds - The order ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetorders result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetOrders(orderIds);
 */

/**
 * Performs batch get orders operation
 *
 * @param {string[]} /** Order Ids */
  orderIds - The /**  order  ids */
  order ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetorders result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetOrders(/** Order Ids */
  orderIds);
 */

export async function batchGetOrders(
  /** Order Ids */
  orderIds: string[],
): Promise<Map<string, any>> {
  return batchFetchDocuments(COLLECTIONS.ORDERS, orderIds);
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
/**
 * Performs batch get auctions operation
 *
 * @param {string[]} auctionIds - The auction ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetauctions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetAuctions(auctionIds);
 */

/**
 * Performs batch get auctions operation
 *
 * @param {string[]} /** Auction Ids */
  auctionIds - The /**  auction  ids */
  auction ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetauctions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetAuctions(/** Auction Ids */
  auctionIds);
 */

export async function batchGetAuctions(
  /** Auction Ids */
  auctionIds: string[],
): Promise<Map<string, any>> {
  return batchFetchDocuments(COLLECTIONS.AUCTIONS, auctionIds);
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
/**
 * Performs batch get coupons operation
 *
 * @param {string[]} couponIds - The coupon ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetcoupons result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetCoupons(couponIds);
 */

/**
 * Performs batch get coupons operation
 *
 * @param {string[]} /** Coupon Ids */
  couponIds - The /**  coupon  ids */
  coupon ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetcoupons result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetCoupons(/** Coupon Ids */
  couponIds);
 */

export async function batchGetCoupons(
  /** Coupon Ids */
  couponIds: string[],
): Promise<Map<string, any>> {
  return batchFetchDocuments(COLLECTIONS.COUPONS, couponIds);
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
/**
 * Performs batch get by collection operation
 *
 * @param {string} collectionName - Name of collection
 * @param {string[]} ids - The ids
 *
 * @returns {Promise<any>} Promise resolving to batchgetbycollection result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetByCollection("example", ids);
 */

/**
 * Performs batch get by collection operation
 *
 * @returns {Promise<any>} Promise resolving to batchgetbycollection result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchGetByCollection();
 */

export async function batchGetByCollection(
  /** Collection Name */
  collectionName: string,
  /** Ids */
  ids: string[],
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
/**
 * Maps to ordered array
 *
 * @param {Map<string, T>} map - The map
 * @param {string[]} orderedIds - The ordered ids
 *
 * @returns {string} The maptoorderedarray result
 *
 * @example
 * mapToOrderedArray(map, orderedIds);
 */

/**
 * Maps to ordered array
 *
 * @returns {string} The maptoorderedarray result
 *
 * @example
 * mapToOrderedArray();
 */

export function mapToOrderedArray<T>(
  /** Map */
  map: Map<string, T>,
  /** Ordered Ids */
  orderedIds: string[],
): (T | null)[] {
  return orderedIds.map((id) => map.get(id) || null);
}

/**
 * Helper: Chunk array for batch processing
 */
/**
 * Performs chunk array operation
 *
 * @param {T[]} array - The array
 * @param {number} size - The size
 *
 * @returns {number} The chunkarray result
 *
 * @example
 * chunkArray(array, 123);
 */

/**
 * Performs chunk array operation
 *
 * @param {T[]} array - The array
 * @param {number} size - The size
 *
 * @returns {number} The chunkarray result
 *
 * @example
 * chunkArray(array, 123);
 */

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
