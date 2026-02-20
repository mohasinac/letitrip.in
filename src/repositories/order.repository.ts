/**
 * Order Repository
 *
 * Data access layer for order documents in Firestore
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import type {
  OrderDocument,
  OrderCreateInput,
  OrderStatus,
  PaymentStatus,
} from "@/db/schema";
import { createOrderId, ORDER_COLLECTION, ORDER_FIELDS } from "@/db/schema";
import { DatabaseError } from "@/lib/errors";

class OrderRepository extends BaseRepository<OrderDocument> {
  constructor() {
    super(ORDER_COLLECTION);
  }

  /**
   * Create new order with SEO-friendly ID
   */
  async create(input: OrderCreateInput): Promise<OrderDocument> {
    // Generate order ID based on product count and current date
    const orderDate = new Date();
    const id = createOrderId(input.quantity, orderDate);

    const orderData: Omit<OrderDocument, "id"> = {
      ...input,
      orderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(orderData));

    return { id, ...orderData };
  }

  /**
   * Find orders by user ID
   */
  async findByUser(userId: string): Promise<OrderDocument[]> {
    return this.findBy(ORDER_FIELDS.USER_ID, userId);
  }

  /**
   * Find orders by product ID
   */
  async findByProduct(productId: string): Promise<OrderDocument[]> {
    return this.findBy(ORDER_FIELDS.PRODUCT_ID, productId);
  }

  /**
   * Find orders by status
   */
  async findByStatus(status: OrderStatus): Promise<OrderDocument[]> {
    return this.findBy(ORDER_FIELDS.STATUS, status);
  }

  /**
   * Find confirmed orders
   */
  async findConfirmed(): Promise<OrderDocument[]> {
    return this.findBy(ORDER_FIELDS.STATUS, "confirmed");
  }

  /**
   * Find pending orders
   */
  async findPending(): Promise<OrderDocument[]> {
    return this.findBy(ORDER_FIELDS.STATUS, "pending");
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    status: OrderStatus,
    additionalData?: Partial<OrderDocument>,
  ): Promise<OrderDocument> {
    return this.update(orderId, {
      status,
      ...additionalData,
      updatedAt: new Date(),
    });
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentId?: string,
  ): Promise<OrderDocument> {
    return this.update(orderId, {
      paymentStatus,
      ...(paymentId && { paymentId }),
      updatedAt: new Date(),
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(
    orderId: string,
    reason: string,
    refundAmount?: number,
  ): Promise<OrderDocument> {
    return this.update(orderId, {
      status: "cancelled",
      cancellationDate: new Date(),
      cancellationReason: reason,
      ...(refundAmount && { refundAmount, refundStatus: "pending" }),
      updatedAt: new Date(),
    });
  }

  /**
   * Get recent orders for a user
   */
  async findRecentByUser(userId: string): Promise<OrderDocument[]> {
    const now = new Date();
    const snapshot = await this.db
      .collection(this.collection)
      .where("userId", "==", userId)
      .where(
        "orderDate",
        ">=",
        new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      ) // Last 90 days
      .orderBy("orderDate", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as OrderDocument[];
  }

  /**
   * Check whether a user has a confirmed, shipped, or delivered order
   * for a given product. Used as the purchase verification gate for reviews.
   *
   * @param userId    - Firebase Auth UID of the reviewer
   * @param productId - ID of the product being reviewed
   * @returns true if the user has at least one qualifying order for this product
   */
  async hasUserPurchased(userId: string, productId: string): Promise<boolean> {
    const purchasedStatuses = new Set<string>([
      ORDER_FIELDS.STATUS_VALUES.CONFIRMED,
      ORDER_FIELDS.STATUS_VALUES.SHIPPED,
      ORDER_FIELDS.STATUS_VALUES.DELIVERED,
    ]);

    // Compound equality query — no composite index needed (two == conditions)
    const snapshot = await this.db
      .collection(this.collection)
      .where(ORDER_FIELDS.USER_ID, "==", userId)
      .where(ORDER_FIELDS.PRODUCT_ID, "==", productId)
      .get();

    return snapshot.docs.some((doc) =>
      purchasedStatuses.has(doc.data()[ORDER_FIELDS.STATUS] as string),
    );
  }

  /**
   * Delete all orders by user using batch writes
   */
  async deleteByUser(userId: string): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where("userId", "==", userId)
        .get();

      if (snapshot.empty) return 0;

      const batch = this.db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return snapshot.size;
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete orders for user: ${userId}`,
        error,
      );
    }
  }
}

// Export singleton instance
export const orderRepository = new OrderRepository();
