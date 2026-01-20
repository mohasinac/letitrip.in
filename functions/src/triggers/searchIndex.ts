/**
 * Search Index Update Function
 * Phase 8.1 - Task 4/4
 *
 * Firestore triggers that update search indexes when documents change.
 * Maintains denormalized search collection for fast full-text search.
 *
 * Triggers:
 * - onCreate, onUpdate, onDelete for products
 * - onCreate, onUpdate, onDelete for auctions
 * - onCreate, onUpdate, onDelete for shops
 * - onCreate, onUpdate, onDelete for categories
 *
 * Features:
 * - Full-text search keywords
 * - Category hierarchy flattening
 * - Price range indexing
 * - Status filtering
 * - Popularity scoring
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

interface SearchDocument {
  id: string;
  type: "product" | "auction" | "shop" | "category" | "blog" | "review";
  title: string;
  description?: string;
  keywords: string[]; // For full-text search
  categoryId?: string;
  categorySlug?: string;
  categoryPath?: string[]; // Flattened hierarchy
  price?: number;
  priceRange?:
    | "under-500"
    | "500-1000"
    | "1000-5000"
    | "5000-10000"
    | "above-10000";
  status?: string;
  imageUrl?: string;
  url: string;
  popularity?: number; // View count, likes, etc.
  shopId?: string;
  shopName?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

/**
 * Update search index when a product is created or updated
 */
export const updateSearchIndex = {
  // Products
  onProductCreate: functions.firestore
    .document("products/{productId}")
    .onCreate(async (snapshot, context) => {
      return updateProductSearchIndex(
        snapshot,
        context.params.productId,
        "create",
      );
    }),

  onProductUpdate: functions.firestore
    .document("products/{productId}")
    .onUpdate(async (change, context) => {
      return updateProductSearchIndex(
        change.after,
        context.params.productId,
        "update",
      );
    }),

  onProductDelete: functions.firestore
    .document("products/{productId}")
    .onDelete(async (snapshot, context) => {
      return deleteFromSearchIndex(context.params.productId);
    }),

  // Auctions
  onAuctionCreate: functions.firestore
    .document("auctions/{auctionId}")
    .onCreate(async (snapshot, context) => {
      return updateAuctionSearchIndex(
        snapshot,
        context.params.auctionId,
        "create",
      );
    }),

  onAuctionUpdate: functions.firestore
    .document("auctions/{auctionId}")
    .onUpdate(async (change, context) => {
      return updateAuctionSearchIndex(
        change.after,
        context.params.auctionId,
        "update",
      );
    }),

  onAuctionDelete: functions.firestore
    .document("auctions/{auctionId}")
    .onDelete(async (snapshot, context) => {
      return deleteFromSearchIndex(context.params.auctionId);
    }),

  // Shops
  onShopCreate: functions.firestore
    .document("shops/{shopId}")
    .onCreate(async (snapshot, context) => {
      return updateShopSearchIndex(snapshot, context.params.shopId, "create");
    }),

  onShopUpdate: functions.firestore
    .document("shops/{shopId}")
    .onUpdate(async (change, context) => {
      return updateShopSearchIndex(
        change.after,
        context.params.shopId,
        "update",
      );
    }),

  onShopDelete: functions.firestore
    .document("shops/{shopId}")
    .onDelete(async (snapshot, context) => {
      return deleteFromSearchIndex(context.params.shopId);
    }),

  // Categories
  onCategoryCreate: functions.firestore
    .document("categories/{categoryId}")
    .onCreate(async (snapshot, context) => {
      return updateCategorySearchIndex(
        snapshot,
        context.params.categoryId,
        "create",
      );
    }),

  onCategoryUpdate: functions.firestore
    .document("categories/{categoryId}")
    .onUpdate(async (change, context) => {
      return updateCategorySearchIndex(
        change.after,
        context.params.categoryId,
        "update",
      );
    }),

  onCategoryDelete: functions.firestore
    .document("categories/{categoryId}")
    .onDelete(async (snapshot, context) => {
      return deleteFromSearchIndex(context.params.categoryId);
    }),
};

/**
 * Update product in search index
 */
async function updateProductSearchIndex(
  snapshot: admin.firestore.DocumentSnapshot,
  productId: string,
  operation: "create" | "update",
): Promise<void> {
  const data = snapshot.data();
  if (!data) return;

  try {
    console.log(`${operation}ing product in search index: ${productId}`);

    const keywords = generateKeywords([
      data.name,
      data.description,
      data.brand,
      ...(data.tags || []),
    ]);

    const searchDoc: SearchDocument = {
      id: productId,
      type: "product",
      title: data.name,
      description: data.description,
      keywords,
      categoryId: data.categoryId,
      categorySlug: data.categorySlug,
      categoryPath: data.categoryPath || [],
      price: data.price,
      priceRange: getPriceRange(data.price),
      status: data.status,
      imageUrl: data.images?.[0],
      url: `/buy-product-${data.slug}`,
      popularity: data.viewCount || 0,
      shopId: data.shopId,
      shopName: data.shopName,
      createdAt: data.createdAt,
      updatedAt:
        admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    await admin.firestore().collection("search").doc(productId).set(searchDoc);
    console.log(`Successfully ${operation}d product in search index`);
  } catch (error) {
    console.error(`Error ${operation}ing product in search index:`, error);
    throw error;
  }
}

/**
 * Update auction in search index
 */
async function updateAuctionSearchIndex(
  snapshot: admin.firestore.DocumentSnapshot,
  auctionId: string,
  operation: "create" | "update",
): Promise<void> {
  const data = snapshot.data();
  if (!data) return;

  try {
    console.log(`${operation}ing auction in search index: ${auctionId}`);

    const keywords = generateKeywords([
      data.title,
      data.description,
      ...(data.tags || []),
    ]);

    const searchDoc: SearchDocument = {
      id: auctionId,
      type: "auction",
      title: data.title,
      description: data.description,
      keywords,
      categoryId: data.categoryId,
      categorySlug: data.categorySlug,
      categoryPath: data.categoryPath || [],
      price: data.currentBid || data.startingBid,
      priceRange: getPriceRange(data.currentBid || data.startingBid),
      status: data.status,
      imageUrl: data.images?.[0],
      url: `/buy-auction-${data.slug}`,
      popularity: data.bidCount || 0,
      shopId: data.shopId,
      shopName: data.shopName,
      createdAt: data.createdAt,
      updatedAt:
        admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    await admin.firestore().collection("search").doc(auctionId).set(searchDoc);
    console.log(`Successfully ${operation}d auction in search index`);
  } catch (error) {
    console.error(`Error ${operation}ing auction in search index:`, error);
    throw error;
  }
}

/**
 * Update shop in search index
 */
async function updateShopSearchIndex(
  snapshot: admin.firestore.DocumentSnapshot,
  shopId: string,
  operation: "create" | "update",
): Promise<void> {
  const data = snapshot.data();
  if (!data) return;

  try {
    console.log(`${operation}ing shop in search index: ${shopId}`);

    const keywords = generateKeywords([
      data.name,
      data.description,
      data.tagline,
      ...(data.tags || []),
    ]);

    const searchDoc: SearchDocument = {
      id: shopId,
      type: "shop",
      title: data.name,
      description: data.description,
      keywords,
      status: data.status,
      imageUrl: data.logo,
      url: `/buy-shop-${data.slug}`,
      popularity: data.followersCount || 0,
      createdAt: data.createdAt,
      updatedAt:
        admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    await admin.firestore().collection("search").doc(shopId).set(searchDoc);
    console.log(`Successfully ${operation}d shop in search index`);
  } catch (error) {
    console.error(`Error ${operation}ing shop in search index:`, error);
    throw error;
  }
}

/**
 * Update category in search index
 */
async function updateCategorySearchIndex(
  snapshot: admin.firestore.DocumentSnapshot,
  categoryId: string,
  operation: "create" | "update",
): Promise<void> {
  const data = snapshot.data();
  if (!data) return;

  try {
    console.log(`${operation}ing category in search index: ${categoryId}`);

    const keywords = generateKeywords([
      data.name,
      data.description,
      ...(data.aliases || []),
    ]);

    const searchDoc: SearchDocument = {
      id: categoryId,
      type: "category",
      title: data.name,
      description: data.description,
      keywords,
      categoryPath: data.path || [],
      imageUrl: data.icon,
      url: `/buy-category-${data.slug}`,
      popularity: data.productCount || 0,
      createdAt: data.createdAt,
      updatedAt:
        admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    await admin.firestore().collection("search").doc(categoryId).set(searchDoc);
    console.log(`Successfully ${operation}d category in search index`);
  } catch (error) {
    console.error(`Error ${operation}ing category in search index:`, error);
    throw error;
  }
}

/**
 * Delete document from search index
 */
async function deleteFromSearchIndex(docId: string): Promise<void> {
  try {
    console.log(`Deleting document from search index: ${docId}`);
    await admin.firestore().collection("search").doc(docId).delete();
    console.log(\"Successfully deleted document from search index\");
  } catch (error) {
    console.error(\"Error deleting from search index:\", error);
    throw error;
  }
}

/**
 * Generate search keywords from text
 */
function generateKeywords(texts: (string | undefined)[]): string[] {
  const keywords = new Set<string>();

  texts.forEach((text) => {
    if (!text) return;

    // Normalize text
    const normalized = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ") // Remove special characters
      .split(/\s+/)
      .filter((word) => word.length > 2); // Min 3 characters

    // Add full words
    normalized.forEach((word) => keywords.add(word));

    // Add n-grams for partial matching (3-grams)
    normalized.forEach((word) => {
      if (word.length >= 3) {
        for (let i = 0; i <= word.length - 3; i++) {
          keywords.add(word.substring(i, i + 3));
        }
      }
    });
  });

  return Array.from(keywords).slice(0, 50); // Limit to 50 keywords
}

/**
 * Get price range bucket
 */
function getPriceRange(
  price: number,
): "under-500" | "500-1000" | "1000-5000" | "5000-10000" | "above-10000" {
  if (price < 500) return "under-500";
  if (price < 1000) return "500-1000";
  if (price < 5000) return "1000-5000";
  if (price < 10000) return "5000-10000";
  return "above-10000";
}
