/**
 * Bid Repository
 *
 * Data access layer for bid documents in Firestore
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { DatabaseError } from "@/lib/errors";
import type {
  BidDocument,
  BidCreateInput,
  BidUpdateInput,
  BidAdminUpdateInput,
  BidStatus,
} from "@/db/schema/bids";
import { BID_COLLECTION } from "@/db/schema/bids";
import { generateBidId, type GenerateBidIdInput } from "@/utils";

class BidRepository extends BaseRepository<BidDocument> {
  constructor() {
    super(BID_COLLECTION);
  }

  /**
   * Create new bid with auto-generated ID
   */
  async create(input: BidCreateInput): Promise<BidDocument> {
    const bidIdInput: GenerateBidIdInput = {
      productName: input.productTitle,
      userFirstName: input.userName.split(" ")[0] || input.userName,
      date: new Date(),
    };

    const id = generateBidId(bidIdInput);

    const bidData: Omit<BidDocument, "id"> = {
      ...input,
      status: "active",
      isWinning: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(bidData));

    return { id, ...bidData };
  }

  /**
   * Find bids by product ID
   */
  async findByProduct(productId: string): Promise<BidDocument[]> {
    return this.findBy("productId", productId);
  }

  /**
   * Find bids by user ID
   */
  async findByUser(userId: string): Promise<BidDocument[]> {
    return this.findBy("userId", userId);
  }

  /**
   * Find bids by status
   */
  async findByStatus(status: BidStatus): Promise<BidDocument[]> {
    return this.findBy("status", status);
  }

  /**
   * Find current winning bid for a product
   */
  async findWinningBid(productId: string): Promise<BidDocument | null> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("productId", "==", productId)
        .where("isWinning", "==", true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as unknown as BidDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to find winning bid for product: ${productId}`,
        error,
      );
    }
  }

  /**
   * Find highest bid amount for a product
   */
  async findHighestBid(productId: string): Promise<number> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("productId", "==", productId)
        .where("status", "==", "active")
        .orderBy("bidAmount", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return 0;
      }

      const doc = snapshot.docs[0];
      const bid = doc.data() as BidDocument;
      return bid.bidAmount;
    } catch (error) {
      throw new DatabaseError(
        `Failed to find highest bid for product: ${productId}`,
        error,
      );
    }
  }

  /**
   * Find all bids for a product sorted by amount (descending)
   */
  async findByProductSorted(productId: string): Promise<BidDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("productId", "==", productId)
        .orderBy("bidAmount", "desc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as unknown as BidDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to find bids for product: ${productId}`,
        error,
      );
    }
  }

  /**
   * Update bid (user can only update autoMaxBid)
   */
  async updateBid(bidId: string, data: BidUpdateInput): Promise<BidDocument> {
    const updateData: Partial<BidDocument> = {
      ...data,
      updatedAt: new Date(),
    };

    return this.update(bidId, updateData);
  }

  /**
   * Admin update bid (can update any field except id and createdAt)
   */
  async adminUpdateBid(
    bidId: string,
    data: BidAdminUpdateInput,
  ): Promise<BidDocument> {
    const updateData: Partial<BidDocument> = {
      ...data,
      updatedAt: new Date(),
    };

    return this.update(bidId, updateData);
  }

  /**
   * Mark bid as winning and set all other bids for the product as outbid
   */
  async setWinningBid(bidId: string, productId: string): Promise<void> {
    try {
      const batch = this.db.batch();

      // Set all bids for this product to not winning
      const allBidsSnapshot = await this.db
        .collection(this.collection)
        .where("productId", "==", productId)
        .get();

      allBidsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isWinning: false,
          status: doc.id === bidId ? "active" : "outbid",
          updatedAt: new Date(),
        });
      });

      // Set the new winning bid
      const winningBidRef = this.db.collection(this.collection).doc(bidId);
      batch.update(winningBidRef, {
        isWinning: true,
        status: "active",
        updatedAt: new Date(),
      });

      await batch.commit();
    } catch (error) {
      throw new DatabaseError(`Failed to set winning bid: ${bidId}`, error);
    }
  }

  /**
   * End auction - mark winning bid as won and others as lost
   */
  async endAuction(productId: string): Promise<void> {
    try {
      const batch = this.db.batch();

      const bidsSnapshot = await this.db
        .collection(this.collection)
        .where("productId", "==", productId)
        .get();

      bidsSnapshot.docs.forEach((doc) => {
        const bid = doc.data() as BidDocument;
        batch.update(doc.ref, {
          status: bid.isWinning ? "won" : "lost",
          updatedAt: new Date(),
        });
      });

      await batch.commit();
    } catch (error) {
      throw new DatabaseError(
        `Failed to end auction for product: ${productId}`,
        error,
      );
    }
  }

  /**
   * Cancel all bids for a product (when product is deleted)
   */
  async cancelProductBids(productId: string): Promise<void> {
    try {
      const batch = this.db.batch();

      const bidsSnapshot = await this.db
        .collection(this.collection)
        .where("productId", "==", productId)
        .get();

      bidsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: "cancelled",
          isWinning: false,
          updatedAt: new Date(),
        });
      });

      await batch.commit();
    } catch (error) {
      throw new DatabaseError(
        `Failed to cancel bids for product: ${productId}`,
        error,
      );
    }
  }

  /**
   * Get bid count for a product
   */
  async countByProduct(productId: string): Promise<number> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("productId", "==", productId)
        .count()
        .get();

      return snapshot.data().count;
    } catch (error) {
      throw new DatabaseError(
        `Failed to count bids for product: ${productId}`,
        error,
      );
    }
  }

  /**
   * Get user's bid count
   */
  async countByUser(userId: string): Promise<number> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("userId", "==", userId)
        .count()
        .get();

      return snapshot.data().count;
    } catch (error) {
      throw new DatabaseError(
        `Failed to count bids for user: ${userId}`,
        error,
      );
    }
  }
}

export const bidRepository = new BidRepository();
