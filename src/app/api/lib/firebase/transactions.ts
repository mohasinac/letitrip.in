/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/firebase/transactions
 * @description This file contains functionality related to transactions
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Firestore Transaction Helpers
 * Provides utilities for complex atomic operations
 * Location: /src/app/api/lib/firebase/transactions.ts
 */

import { getFirestoreAdmin } from "./admin";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/constants/database";

/**
 * Run a transaction
 */
/**
 * Performs run transaction operation
 *
 * @param {(transaction} callback - Callback function to execute
 *
 * @returns {Promise<any>} Promise resolving to runtransaction result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * runTransaction(callback);
 */

/**
 * Performs run transaction operation
 *
 * @param {(transaction} /** Callback */
  callback - The /**  callback */
  callback
 *
 * @returns {Promise<any>} Promise resolving to runtransaction result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * runTransaction(/** Callback */
  callback);
 */

export async function runTransaction<T>(
  /** Callback */
  callback: (transaction: FirebaseFirestore.Transaction) => Promise<T>,
): Promise<T> {
  const db = getFirestoreAdmin();
  return db.runTransaction(callback);
}

/**
 * Batch write operations
 */
/**
 * Creates a new batch
 *
 * @returns {any} The batch result
 *
 * @example
 * createBatch();
 */

/**
 * Creates a new batch
 *
 * @returns {any} The batch result
 *
 * @example
 * createBatch();
 */

export function createBatch() {
  const db = getFirestoreAdmin();
  return db.batch();
}

/**
 * Increment a field value
 */
/**
 * Performs increment operation
 *
 * @param {number} value - The value
 *
 * @returns {number} The increment result
 *
 * @example
 * increment(123);
 */

/**
 * Performs increment operation
 *
 * @param {number} value - The value
 *
 * @returns {number} The increment result
 *
 * @example
 * increment(123);
 */

export function increment(value: number) {
  return FieldValue.increment(value);
}

/**
 * Decrement a field value
 */
/**
 * Performs decrement operation
 *
 * @param {number} value - The value
 *
 * @returns {number} The decrement result
 *
 * @example
 * decrement(123);
 */

/**
 * Performs decrement operation
 *
 * @param {number} value - The value
 *
 * @returns {number} The decrement result
 *
 * @example
 * decrement(123);
 */

export function decrement(value: number) {
  return FieldValue.increment(-value);
}

/**
 * Add to array (if not already present)
 */
/**
 * Performs array union operation
 *
 * @param {any[]} ...elements - The ...elements
 *
 * @returns {any} The arrayunion result
 *
 * @example
 * arrayUnion(...elements);
 */

/**
 * Performs array union operation
 *
 * @param {any[]} ...elements - The ...elements
 *
 * @returns {any} The arrayunion result
 *
 * @example
 * arrayUnion(...elements);
 */

export function arrayUnion(...elements: any[]) {
  return FieldValue.arrayUnion(...elements);
}

/**
 * Remove from array
 */
/**
 * Performs array remove operation
 *
 * @param {any[]} ...elements - The ...elements
 *
 * @returns {any} The arrayremove result
 *
 * @example
 * arrayRemove(...elements);
 */

/**
 * Performs array remove operation
 *
 * @param {any[]} ...elements - The ...elements
 *
 * @returns {any} The arrayremove result
 *
 * @example
 * arrayRemove(...elements);
 */

export function arrayRemove(...elements: any[]) {
  return FieldValue.arrayRemove(...elements);
}

/**
 * Set server timestamp
 */
/**
 * Performs server timestamp operation
 *
 * @returns {any} The servertimestamp result
 *
 * @example
 * serverTimestamp();
 */

/**
 * Performs server timestamp operation
 *
 * @returns {any} The servertimestamp result
 *
 * @example
 * serverTimestamp();
 */

export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

/**
 * Delete a field
 */
/**
 * Deletes field
 *
 * @returns {any} The deletefield result
 *
 * @example
 * deleteField();
 */

/**
 * Deletes field
 *
 * @returns {any} The deletefield result
 *
 * @example
 * deleteField();
 */

export function deleteField() {
  return FieldValue.delete();
}

/**
 * Helper to create an order with order items atomically
 */
/**
 * Creates a new order with items
 *
 * @param {any} orderData - The order data
 * @param {any[]} orderItems - The order items
 *
 * @returns {Promise<any>} Promise resolving to orderwithitems result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createOrderWithItems(orderData, orderItems);
 */

/**
 * Creates a new order with items
 *
 * @returns {Promise<any>} Promise resolving to orderwithitems result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createOrderWithItems();
 */

export async function createOrderWithItems(
  /** Order Data */
  orderData: any,
  /** Order Items */
  orderItems: any[],
): Promise<string> {
  const db = getFirestoreAdmin();

  return db.runTransaction(async (transaction) => {
    // Create order document
    const orderRef = db.collection(COLLECTIONS.ORDERS).doc();
    transaction.set(orderRef, {
      ...orderData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Create order item documents
    for (const item of orderItems) {
      const itemRef = db.collection(COLLECTIONS.ORDER_ITEMS).doc();
      transaction.set(itemRef, {
        ...item,
        order_id: orderRef.id,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }

    return orderRef.id;
  });
}

/**
 * Helper to update product stock atomically
 */
/**
 * Updates existing product stock
 *
 * @param {string} productId - product identifier
 * @param {number} quantityChange - The quantity change
 *
 * @returns {Promise<any>} Promise resolving to updateproductstock result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateProductStock("example", 123);
 */

/**
 * Updates existing product stock
 *
 * @returns {Promise<any>} Promise resolving to updateproductstock result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateProductStock();
 */

export async function updateProductStock(
  /** Product Id */
  productId: string,
  /** Quantity Change */
  quantityChange: number,
): Promise<void> {
  const db = getFirestoreAdmin();
  const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(productId);

  return db.runTransaction(async (transaction) => {
    const productDoc = await transaction.get(productRef);

    if (!productDoc.exists) {
      throw new Error("Product not found");
    }

    const currentStock = productDoc.data()?.stock || 0;
    const newStock = currentStock + quantityChange;

    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    transaction.update(productRef, {
      /** Stock */
      stock: newStock,
      updated_at: serverTimestamp(),
    });
  });
}

/**
 * Helper to place a bid atomically (update auction + create bid)
 */
/**
 * Performs place bid operation
 *
 * @param {string} auctionId - auction identifier
 * @param {string} userId - user identifier
 * @param {number} bidAmount - The bid amount
 *
 * @returns {Promise<any>} Promise resolving to placebid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * placeBid("example", "example", 123);
 */

/**
 * Performs place bid operation
 *
 * @returns {Promise<any>} Promise resolving to placebid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * placeBid();
 */

export async function placeBid(
  /** Auction Id */
  auctionId: string,
  /** User Id */
  userId: string,
  /** Bid Amount */
  bidAmount: number,
): Promise<string> {
  const db = getFirestoreAdmin();
  const auctionRef = db.collection(COLLECTIONS.AUCTIONS).doc(auctionId);

  return db.runTransaction(async (transaction) => {
    const auctionDoc = await transaction.get(auctionRef);

    if (!auctionDoc.exists) {
      throw new Error("Auction not found");
    }

    const auctionData = auctionDoc.data();
    const currentBid =
      auctionData?.current_bid || auctionData?.starting_bid || 0;

    // Validate bid amount
    if (bidAmount <= currentBid) {
      throw new Error("Bid amount must be higher than current bid");
    }

    // Update all previous winning bids to non-winning
    const previousBidsQuery = db
      .collection(COLLECTIONS.BIDS)
      .where("auction_id", "==", auctionId)
      .where("is_winning", "==", true);

    const previousBids = await transaction.get(previousBidsQuery);
    previousBids.docs.forEach((doc) => {
      transaction.update(doc.ref, { is_winning: false });
    });

    // Create new bid
    const bidRef = db.collection(COLLECTIONS.BIDS).doc();
    transaction.set(bidRef, {
      auction_id: auctionId,
      user_id: userId,
      /** Amount */
      amount: bidAmount,
      is_winning: true,
      created_at: serverTimestamp(),
    });

    // Update auction with new current bid
    transaction.update(auctionRef, {
      current_bid: bidAmount,
      bid_count: increment(1),
      updated_at: serverTimestamp(),
    });

    return bidRef.id;
  });
}

/**
 * Helper to process a refund atomically
 */
/**
 * Performs process refund operation
 *
 * @param {string} returnId - return identifier
 * @param {number} refundAmount - The refund amount
 * @param {any} refundData - The refund data
 *
 * @returns {Promise<any>} Promise resolving to processrefund result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * processRefund("example", 123, refundData);
 */

/**
 * Performs process refund operation
 *
 * @returns {Promise<any>} Promise resolving to processrefund result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * processRefund();
 */

export async function processRefund(
  /** Return Id */
  returnId: string,
  /** Refund Amount */
  refundAmount: number,
  /** Refund Data */
  refundData: any,
): Promise<string> {
  const db = getFirestoreAdmin();
  const returnRef = db.collection(COLLECTIONS.RETURNS).doc(returnId);

  return db.runTransaction(async (transaction) => {
    const returnDoc = await transaction.get(returnRef);

    if (!returnDoc.exists) {
      throw new Error("Return not found");
    }

    // Create refund record
    const refundRef = db.collection(COLLECTIONS.REFUNDS).doc();
    transaction.set(refundRef, {
      ...refundData,
      return_id: returnId,
      /** Amount */
      amount: refundAmount,
      /** Status */
      status: "processing",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Update return status
    transaction.update(returnRef, {
      /** Status */
      status: "refund_processing",
      refund_id: refundRef.id,
      refund_amount: refundAmount,
      updated_at: serverTimestamp(),
    });

    return refundRef.id;
  });
}

/**
 * Helper to transfer cart items to order items
 */
/**
 * Performs transfer cart to order operation
 *
 * @param {string} userId - user identifier
 * @param {string} orderId - order identifier
 *
 * @returns {Promise<any>} Promise resolving to transfercarttoorder result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * transferCartToOrder("example", "example");
 */

/**
 * Performs transfer cart to order operation
 *
 * @returns {Promise<any>} Promise resolving to transfercarttoorder result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * transferCartToOrder();
 */

export async function transferCartToOrder(
  /** User Id */
  userId: string,
  /** Order Id */
  orderId: string,
): Promise<void> {
  const db = getFirestoreAdmin();

  await db.runTransaction(async (transaction) => {
    // Get all cart items for user
    const cartItemsQuery = db
      .collection(COLLECTIONS.CART_ITEMS)
      .where("user_id", "==", userId);

    const cartItemsSnap = await transaction.get(cartItemsQuery);

    // Create order items and delete cart items
    for (const cartItemDoc of cartItemsSnap.docs) {
      const cartItem = cartItemDoc.data();

      // Create order item
      const orderItemRef = db.collection(COLLECTIONS.ORDER_ITEMS).doc();
      transaction.set(orderItemRef, {
        order_id: orderId,
        product_id: cartItem.product_id,
        shop_id: cartItem.shop_id,
        /** Quantity */
        quantity: cartItem.quantity,
        /** Price */
        price: cartItem.price,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Delete cart item
      transaction.delete(cartItemDoc.ref);
    }
  });
}
