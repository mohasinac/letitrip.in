/**
 * Product Repository
 *
 * Data access layer for product documents in Firestore
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import type {
  ProductDocument,
  ProductCreateInput,
  ProductUpdateInput,
  ProductStatus,
} from "@/db/schema";
import {
  createProductId,
  createAuctionId,
  PRODUCT_COLLECTION,
  PRODUCT_FIELDS,
} from "@/db/schema";
import { generateUniqueId } from "@/utils";
import { DatabaseError } from "@/lib/errors";

class ProductRepository extends BaseRepository<ProductDocument> {
  constructor() {
    super(PRODUCT_COLLECTION);
  }

  /**
   * Create new product with SEO-friendly ID
   * Auto-increments count if duplicate name exists
   */
  async create(input: ProductCreateInput): Promise<ProductDocument> {
    // Generate unique ID with auto-increment
    const id = await generateUniqueId(
      (count) => {
        if (input.isAuction) {
          return createAuctionId({
            name: input.title,
            category: input.category,
            condition: "new", // Default, should come from input
            sellerName: input.sellerName,
            count,
          });
        } else {
          return createProductId({
            name: input.title,
            category: input.category,
            condition: "new", // Default, should come from input
            sellerName: input.sellerName,
            count,
          });
        }
      },
      async (id) => {
        try {
          const doc = await this.findById(id);
          return !!doc;
        } catch {
          return false;
        }
      },
    );

    const productData: Omit<ProductDocument, "id"> = {
      ...input,
      availableQuantity: input.stockQuantity, // Use stockQuantity for initial availableQuantity
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(productData));

    return { id, ...productData };
  }

  /**
   * Find products by seller ID
   */
  async findBySeller(sellerId: string): Promise<ProductDocument[]> {
    return this.findBy(PRODUCT_FIELDS.SELLER_ID, sellerId);
  }

  /**
   * Find products by status
   */
  async findByStatus(status: ProductStatus): Promise<ProductDocument[]> {
    return this.findBy(PRODUCT_FIELDS.STATUS, status);
  }

  /**
   * Find published products
   */
  async findPublished(): Promise<ProductDocument[]> {
    return this.findBy(PRODUCT_FIELDS.STATUS, "published");
  }

  /**
   * Find featured products
   */
  async findFeatured(): Promise<ProductDocument[]> {
    return this.findBy(PRODUCT_FIELDS.FEATURED, true);
  }

  /**
   * Find products by category
   */
  async findByCategory(category: string): Promise<ProductDocument[]> {
    return this.findBy(PRODUCT_FIELDS.CATEGORY, category);
  }

  /**
   * Find auction products
   */
  async findAuctions(): Promise<ProductDocument[]> {
    return this.findBy(PRODUCT_FIELDS.IS_AUCTION, true);
  }

  /**
   * Find promoted/advertisement products
   */
  async findPromoted(): Promise<ProductDocument[]> {
    return this.findBy(PRODUCT_FIELDS.IS_PROMOTED, true);
  }

  /**
   * Update product with validation
   */
  async updateProduct(
    productId: string,
    data: ProductUpdateInput,
  ): Promise<ProductDocument> {
    // Calculate available quantity if stockQuantity changed
    const updateData: Partial<ProductDocument> = {
      ...data,
      updatedAt: new Date(),
    };

    return this.update(productId, updateData);
  }

  /**
   * Update available quantity (after order)
   */
  async updateAvailableQuantity(
    productId: string,
    quantity: number,
  ): Promise<void> {
    await this.update(productId, { availableQuantity: quantity });
  }

  /**
   * Update auction bid
   */
  async updateBid(
    productId: string,
    bidAmount: number,
    bidCount: number,
  ): Promise<void> {
    await this.update(productId, {
      currentBid: bidAmount,
      bidCount: bidCount,
      updatedAt: new Date(),
    });
  }

  /**
   * Get products with available quantity
   */
  async findAvailable(): Promise<ProductDocument[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where(
        PRODUCT_FIELDS.STATUS,
        "==",
        PRODUCT_FIELDS.STATUS_VALUES.PUBLISHED,
      )
      .where(PRODUCT_FIELDS.AVAILABLE_QUANTITY, ">", 0)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProductDocument[];
  }

  /**
   * Get active auctions
   */
  async findActiveAuctions(): Promise<ProductDocument[]> {
    const now = new Date();
    const snapshot = await this.db
      .collection(this.collection)
      .where(PRODUCT_FIELDS.IS_AUCTION, "==", true)
      .where(PRODUCT_FIELDS.AUCTION_END_DATE, ">=", now)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProductDocument[];
  }

  /**
   * Delete all products by seller using batch writes
   */
  async deleteBySeller(sellerId: string): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where(PRODUCT_FIELDS.SELLER_ID, "==", sellerId)
        .get();

      if (snapshot.empty) return 0;

      const batch = this.db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return snapshot.size;
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete products for seller: ${sellerId}`,
        error,
      );
    }
  }
}

// Export singleton instance
export const productRepository = new ProductRepository();
