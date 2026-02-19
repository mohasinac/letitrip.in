/**
 * Wishlist Repository
 *
 * Manages wish list items stored as a subcollection under each user:
 *   users/{uid}/wishlist/{productId}
 *
 * Document shape: { productId: string; addedAt: Timestamp }
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { serverLogger } from "@/lib/server-logger";

export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

class WishlistRepository {
  private subcollection = "wishlist";

  private getUserWishlistRef(uid: string) {
    return getAdminDb()
      .collection("users")
      .doc(uid)
      .collection(this.subcollection);
  }

  /**
   * Get all wishlist items for a user (product IDs + timestamps)
   */
  async getWishlistItems(uid: string): Promise<WishlistItem[]> {
    try {
      const snapshot = await this.getUserWishlistRef(uid)
        .orderBy("addedAt", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        productId: doc.id,
        addedAt: doc.data().addedAt?.toDate?.() ?? new Date(),
      }));
    } catch (error) {
      serverLogger.error("WishlistRepository.getWishlistItems error", {
        uid,
        error,
      });
      throw error;
    }
  }

  /**
   * Add a product to the user's wishlist.
   * Silently overwrites if already present (idempotent).
   */
  async addItem(uid: string, productId: string): Promise<void> {
    try {
      await this.getUserWishlistRef(uid).doc(productId).set({
        productId,
        addedAt: new Date(),
      });
    } catch (error) {
      serverLogger.error("WishlistRepository.addItem error", {
        uid,
        productId,
        error,
      });
      throw error;
    }
  }

  /**
   * Remove a product from the user's wishlist.
   */
  async removeItem(uid: string, productId: string): Promise<void> {
    try {
      await this.getUserWishlistRef(uid).doc(productId).delete();
    } catch (error) {
      serverLogger.error("WishlistRepository.removeItem error", {
        uid,
        productId,
        error,
      });
      throw error;
    }
  }

  /**
   * Check whether a product is in the user's wishlist.
   */
  async isInWishlist(uid: string, productId: string): Promise<boolean> {
    try {
      const doc = await this.getUserWishlistRef(uid).doc(productId).get();
      return doc.exists;
    } catch (error) {
      serverLogger.error("WishlistRepository.isInWishlist error", {
        uid,
        productId,
        error,
      });
      return false;
    }
  }

  /**
   * Delete all wishlist items for a user.
   */
  async clearWishlist(uid: string): Promise<void> {
    try {
      const snapshot = await this.getUserWishlistRef(uid).get();
      const batch = getAdminDb().batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      serverLogger.error("WishlistRepository.clearWishlist error", {
        uid,
        error,
      });
      throw error;
    }
  }
}

export const wishlistRepository = new WishlistRepository();
