/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/utils/shop-slug-resolver
 * @description This file contains functionality related to shop-slug-resolver
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Shop Slug Resolution Utilities
 *
 * Helper functions for resolving shop slugs to IDs in API routes.
 * Use these utilities to maintain consistency across all validation APIs.
 */

import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * Resolve shop slug to shop ID
 *
 * @param shopSlug - The shop slug to resolve
 * @returns Shop ID if found, null otherwise
 *
 * @example
 * ```ts
 * const shopId = await resolveShopSlug('awesome-shop');
 * if (!shopId) {
 *   return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
 * }
 * ```
 */
/**
 * Performs resolve shop slug operation
 *
 * @param {string} shopSlug - The shop slug
 *
 * @returns {Promise<any>} Promise resolving to resolveshopslug result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * resolveShopSlug("example");
 */

/**
 * Performs resolve shop slug operation
 *
 * @param {string} /** Shop Slug */
  shopSlug - The /**  shop  slug */
  shop slug
 *
 * @returns {Promise<any>} Promise resolving to resolveshopslug result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * resolveShopSlug("example");
 */

export async function resolveShopSlug(
  /** Shop Slug */
  shopSlug: string,
): Promise<string | null> {
  try {
    const snapshot = await Collections.shops()
      .where("slug", "==", shopSlug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].id;
  } catch (error) {
    console.error("Error resolving shop slug:", error);
    return null;
  }
}

/**
 * Resolve shop slug to shop data
 *
 * @param shopSlug - The shop slug to resolve
 * @returns Shop data if found, null otherwise
 *
 * @example
 * ```ts
 * const shop = await resolveShopSlugToData('awesome-shop');
 * if (!shop) {
 *   return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
 * }
 * console.log(shop.id, shop.name, shop.owner_id);
 * ```
 */
/**
 * Performs resolve shop slug to data operation
 *
 * @param {string} shopSlug - The shop slug
 *
 * @returns {Promise<any>} Promise resolving to resolveshopslugtodata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * resolveShopSlugToData("example");
 */

/**
 * Performs resolve shop slug to data operation
 *
 * @param {string} /** Shop Slug */
  shopSlug - The /**  shop  slug */
  shop slug
 *
 * @returns {Promise<any>} Promise resolving to resolveshopslugtodata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * resolveShopSlugToData("example");
 */

export async function resolveShopSlugToData(
  /** Shop Slug */
  shopSlug: string,
): Promise<{ id: string; [key: string]: any } | null> {
  try {
    const snapshot = await Collections.shops()
      .where("slug", "==", shopSlug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      /** Id */
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error resolving shop slug:", error);
    return null;
  }
}

/**
 * Batch resolve multiple shop slugs to IDs
 *
 * @param shopSlugs - Array of shop slugs to resolve
 * @returns Map of slug → ID
 *
 * @example
 * ```ts
 * const slugToIdMap = await batchResolveShopSlugs(['shop-1', 'shop-2']);
 * console.log(slugToIdMap.get('shop-1')); // 'shop_123abc'
 * ```
 */
/**
 * Performs batch resolve shop slugs operation
 *
 * @param {string[]} shopSlugs - The shop slugs
 *
 * @returns {Promise<any>} Promise resolving to batchresolveshopslugs result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchResolveShopSlugs(shopSlugs);
 */

/**
 * Performs batch resolve shop slugs operation
 *
 * @param {string[]} /** Shop Slugs */
  shopSlugs - The /**  shop  slugs */
  shop slugs
 *
 * @returns {Promise<any>} Promise resolving to batchresolveshopslugs result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * batchResolveShopSlugs(/** Shop Slugs */
  shopSlugs);
 */

export async function batchResolveShopSlugs(
  /** Shop Slugs */
  shopSlugs: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  if (shopSlugs.length === 0) {
    return map;
  }

  try {
    // Firestore 'in' queries support up to 10 items
    const chunks = chunkArray(shopSlugs, 10);

    for (const chunk of chunks) {
      const snapshot = await Collections.shops()
        .where("slug", "in", chunk)
        .get();

      snapshot.docs.forEach((doc) => {
        const slug = doc.data().slug;
        if (slug) {
          map.set(slug, doc.id);
        }
      });
    }

    return map;
  } catch (error) {
    console.error("Error batch resolving shop slugs:", error);
    return map;
  }
}

/**
 * Validate shop ownership by slug
 *
 * @param shopSlug - The shop slug
 * @param userId - The user ID to validate against
 * @returns true if user owns the shop, false otherwise
 *
 * @example
 * ```ts
 * const isOwner = await validateShopOwnership('awesome-shop', session.user.id);
 * if (!isOwner && !isAdmin) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
 * }
 * ```
 */
/**
 * Validates shop ownership
 *
 * @param {string} shopSlug - The shop slug
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to validateshopownership result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateShopOwnership("example", "example");
 */

/**
 * Validates shop ownership
 *
 * @returns {Promise<any>} Promise resolving to validateshopownership result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateShopOwnership();
 */

export async function validateShopOwnership(
  /** Shop Slug */
  shopSlug: string,
  /** User Id */
  userId: string,
): Promise<boolean> {
  try {
    const snapshot = await Collections.shops()
      .where("slug", "==", shopSlug)
      .where("owner_id", "==", userId)
      .limit(1)
      .get();

    return !snapshot.empty;
  } catch (error) {
    console.error("Error validating shop ownership:", error);
    return false;
  }
}

/**
 * Get shop ID and validate ownership
 *
 * @param shopSlug - The shop slug
 * @param userId - The user ID to validate against
 * @returns Object with shopId and isOwner flags, or null if shop not found
 *
 * @example
 * ```ts
 * const result = await getShopIdAndValidateOwnership('awesome-shop', session.user.id);
 * if (!result) {
 *   return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
 * }
 * if (!result.isOwner && !isAdmin) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
 * }
 * // Use result.shopId for queries
 * ```
 */
/**
 * Retrieves shop id and validate ownership
 *
 * @param {string} shopSlug - The shop slug
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to shopidandvalidateownership result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getShopIdAndValidateOwnership("example", "example");
 */

/**
 * Retrieves shop id and validate ownership
 *
 * @returns {Promise<any>} Promise resolving to shopidandvalidateownership result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getShopIdAndValidateOwnership();
 */

export async function getShopIdAndValidateOwnership(
  /** Shop Slug */
  shopSlug: string,
  /** User Id */
  userId: string,
): Promise<{ shopId: string; isOwner: boolean } | null> {
  try {
    const snapshot = await Collections.shops()
      .where("slug", "==", shopSlug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      /** Shop Id */
      shopId: doc.id,
      /** Is Owner */
      isOwner: data.owner_id === userId,
    };
  } catch (error) {
    console.error("Error getting shop ID and validating ownership:", error);
    return null;
  }
}

/**
 * Helper function to chunk array into smaller arrays
 */
/**
 * Performs chunk array operation
 *
 * @param {T[]} array - The array
 * @param {number} size - The size
 *
 * @returns {number} The chunkarray result
 */

/**
 * Performs chunk array operation
 *
 * @param {T[]} array - The array
 * @param {number} size - The size
 *
 * @returns {number} The chunkarray result
 */

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
