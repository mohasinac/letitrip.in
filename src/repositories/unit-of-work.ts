/**
 * Unit of Work
 *
 * Coordinates multiple repository operations inside a single atomic Firestore
 * transaction or batch write.  Using UnitOfWork prevents partial updates when
 * several collections must be kept in sync.
 *
 * --- When to use what ---
 * runTransaction  → You need to read data and then write based on that read
 *                   (e.g. decrement stock, transfer balance).
 *                   All reads must come before writes inside the callback.
 *
 * runBatch        → You only need to write (no conditional reads required).
 *                   Up to 500 operations per batch.
 *                   Faster than a transaction when reads are not needed.
 *
 * @example Transaction
 * ```ts
 * import { unitOfWork } from '@/repositories';
 *
 * await unitOfWork.runTransaction(async (tx) => {
 *   // 1. Read first
 *   const product = await unitOfWork.products.findByIdOrFailInTx(tx, productId);
 *   const order   = await unitOfWork.orders.findByIdOrFailInTx(tx, orderId);
 *
 *   // 2. Then write
 *   unitOfWork.products.updateInTx(tx, productId, { stock: product.stock - 1 });
 *   unitOfWork.orders.updateInTx(tx, orderId, { status: 'confirmed' });
 * });
 * ```
 *
 * @example Batch
 * ```ts
 * import { unitOfWork } from '@/repositories';
 *
 * await unitOfWork.runBatch((batch) => {
 *   unitOfWork.products.updateInBatch(batch, productId, { featured: true });
 *   unitOfWork.categories.updateInBatch(batch, categoryId, { productCount: 10 });
 * });
 * ```
 */

import { Firestore, Transaction, WriteBatch } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { DatabaseError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

// Repository singletons
import { userRepository } from "./user.repository";
import { addressRepository } from "./address.repository";
import { tokenRepository } from "./token.repository";
import { productRepository } from "./product.repository";
import { orderRepository } from "./order.repository";
import { reviewRepository } from "./review.repository";
import { sessionRepository } from "./session.repository";
import { bidRepository } from "./bid.repository";
import { cartRepository } from "./cart.repository";
import { siteSettingsRepository } from "./site-settings.repository";
import { carouselRepository } from "./carousel.repository";
import { homepageSectionsRepository } from "./homepage-sections.repository";
import { categoriesRepository } from "./categories.repository";
import { couponsRepository } from "./coupons.repository";
import { faqsRepository } from "./faqs.repository";
import { wishlistRepository } from "./wishlist.repository";
import { blogRepository } from "./blog.repository";
import { payoutRepository } from "./payout.repository";
import { newsletterRepository } from "./newsletter.repository";
import { notificationRepository } from "./notification.repository";

class UnitOfWork {
  // -------------------------------------------------------------------------
  // Firestore instance
  // -------------------------------------------------------------------------

  private get db(): Firestore {
    return getAdminDb();
  }

  // -------------------------------------------------------------------------
  // Repository accessors
  // -------------------------------------------------------------------------

  get users() {
    return userRepository;
  }
  get addresses() {
    return addressRepository;
  }
  get tokens() {
    return tokenRepository;
  }
  get products() {
    return productRepository;
  }
  get orders() {
    return orderRepository;
  }
  get reviews() {
    return reviewRepository;
  }
  get sessions() {
    return sessionRepository;
  }
  get bids() {
    return bidRepository;
  }
  get carts() {
    return cartRepository;
  }
  get siteSettings() {
    return siteSettingsRepository;
  }
  get carousel() {
    return carouselRepository;
  }
  get homepageSections() {
    return homepageSectionsRepository;
  }
  get categories() {
    return categoriesRepository;
  }
  get coupons() {
    return couponsRepository;
  }
  get faqs() {
    return faqsRepository;
  }
  get wishlists() {
    return wishlistRepository;
  }
  get blogs() {
    return blogRepository;
  }
  get payouts() {
    return payoutRepository;
  }
  get newsletters() {
    return newsletterRepository;
  }
  get notifications() {
    return notificationRepository;
  }

  // -------------------------------------------------------------------------
  // Transaction
  // -------------------------------------------------------------------------

  /**
   * Execute a callback inside a single Firestore transaction.
   *
   * - Automatically retries on contention (up to 5 times by default).
   * - Rolls back every staged write if the callback throws.
   * - All `findByIdInTx` / `findByIdOrFailInTx` calls MUST precede any
   *   `createInTx` / `updateInTx` / `deleteInTx` calls.
   *
   * @param fn  Callback receiving the active Transaction object.
   * @returns   Whatever value the callback resolves with.
   */
  async runTransaction<TResult>(
    fn: (tx: Transaction) => Promise<TResult>,
  ): Promise<TResult> {
    serverLogger.debug("[UnitOfWork] Starting transaction");
    try {
      const result = await this.db.runTransaction(fn);
      serverLogger.debug("[UnitOfWork] Transaction committed successfully");
      return result;
    } catch (error) {
      serverLogger.error("[UnitOfWork] Transaction failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new DatabaseError("Transaction failed", error);
    }
  }

  // -------------------------------------------------------------------------
  // Batch write
  // -------------------------------------------------------------------------

  /**
   * Execute a callback that stages writes into a single atomic WriteBatch.
   *
   * - Supports up to 500 write operations per batch.
   * - Does NOT support reads — use `runTransaction` when you need to read.
   * - Rolls back (i.e. commits nothing) if `batch.commit()` fails.
   *
   * @param fn  Callback receiving the active WriteBatch object.
   */
  async runBatch(
    fn: (batch: WriteBatch) => void | Promise<void>,
  ): Promise<void> {
    serverLogger.debug("[UnitOfWork] Starting batch write");
    try {
      const batch = this.db.batch();
      await fn(batch);
      await batch.commit();
      serverLogger.debug("[UnitOfWork] Batch write committed successfully");
    } catch (error) {
      serverLogger.error("[UnitOfWork] Batch write failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new DatabaseError("Batch write failed", error);
    }
  }
}

/**
 * Singleton UnitOfWork instance.
 * Import this wherever you need atomic multi-collection operations.
 */
export const unitOfWork = new UnitOfWork();
export type { UnitOfWork };
