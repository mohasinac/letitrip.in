/**
 * Product Repository
 *
 * Data access layer for product documents in Firestore
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { FieldValue } from "firebase-admin/firestore";
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
import { generateUniqueId, slugify } from "@/utils";
import { DatabaseError } from "@/lib/errors";
import type { SieveModel, FirebaseSieveResult } from "@/lib/query";

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
      // Auto-generate slug from title if not provided
      slug: input.slug || `${slugify(input.title)}-${Date.now()}`,
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
   * Find a product by its SEO slug
   * Returns undefined if not found
   */
  async findBySlug(slug: string): Promise<ProductDocument | undefined> {
    const docs = await this.findBy(PRODUCT_FIELDS.SLUG, slug);
    return docs[0] as ProductDocument | undefined;
  }

  /**
   * Find a product by its ID or slug — tries slug first, then falls back to ID lookup
   */
  async findByIdOrSlug(idOrSlug: string): Promise<ProductDocument | undefined> {
    // Try slug first (slug format is always lowercase-hyphenated)
    const bySlug = await this.findBySlug(idOrSlug);
    if (bySlug) return bySlug;
    // Fall back to ID
    const byId = await this.findById(idOrSlug);
    return byId ?? undefined;
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

  // ---------------------------------------------------------------------------
  // Sieve-powered list query
  // Filtering, sorting, and pagination run at the Firestore layer.
  // ---------------------------------------------------------------------------

  /**
   * Fields that consumers may filter or sort on.
   * Used by `list()` and available for reference in tests.
   */
  static readonly SIEVE_FIELDS = {
    id: { canFilter: true, canSort: false },
    title: { canFilter: true, canSort: true },
    slug: { canFilter: true, canSort: false },
    category: { canFilter: true, canSort: true },
    subcategory: { canFilter: true, canSort: true },
    status: { canFilter: true, canSort: true },
    sellerId: { canFilter: true, canSort: false },
    sellerName: { canFilter: true, canSort: true },
    featured: { canFilter: true, canSort: false },
    isAuction: { canFilter: true, canSort: false },
    isPromoted: { canFilter: true, canSort: false },
    price: { canFilter: true, canSort: true },
    stockQuantity: { canFilter: true, canSort: true },
    createdAt: { canFilter: true, canSort: true },
    updatedAt: { canFilter: true, canSort: true },
  };

  /**
   * Paginated product list using Sieve DSL.
   * All filtering, sorting, and pagination happen at the Firestore layer.
   *
   * @example
   * ```ts
   * const result = await productRepository.list({
   *   filters: 'status==published,price>=100',
   *   sorts:   '-createdAt',
   *   page:    1,
   *   pageSize: 20,
   * });
   * ```
   */
  async list(
    model: SieveModel,
    opts?: { sellerId?: string; status?: string },
  ): Promise<FirebaseSieveResult<ProductDocument>> {
    let baseQuery = this.getCollection();
    if (opts?.status) {
      baseQuery = baseQuery.where(
        PRODUCT_FIELDS.STATUS,
        "==",
        opts.status,
      ) as any;
    }
    if (opts?.sellerId) {
      baseQuery = baseQuery.where(
        PRODUCT_FIELDS.SELLER_ID,
        "==",
        opts.sellerId,
      ) as any;
    }
    return this.sieveQuery<ProductDocument>(
      model,
      ProductRepository.SIEVE_FIELDS,
      {
        baseQuery,
        defaultPageSize: 20,
        maxPageSize: 100,
      },
    );
  }

  /**
   * Increment product view count (fire-and-forget analytics).
   * Called asynchronously from GET /api/products/[id].
   * Updates viewCount (+1).
   *
   * @param productId - Product ID or slug to record a view for
   */
  async incrementViewCount(productId: string): Promise<void> {
    try {
      await this.db
        .collection(this.collection)
        .doc(productId)
        .update({
          [PRODUCT_FIELDS.VIEW_COUNT]: FieldValue.increment(1),
        });
    } catch (error) {
      // Swallow errors — analytics failures must not break the product response
    }
  }
}

// Export singleton instance
export const productRepository = new ProductRepository();
