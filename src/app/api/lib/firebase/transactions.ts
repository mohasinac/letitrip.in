/**
 * Firestore Transaction Helpers
 * Provides utilities for complex atomic operations
 * Location: /src/app/api/lib/firebase/transactions.ts
 */

import { getFirestoreAdmin } from "./admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Run a transaction
 */
export async function runTransaction<T>(
  callback: (transaction: FirebaseFirestore.Transaction) => Promise<T>,
): Promise<T> {
  const db = getFirestoreAdmin();
  return db.runTransaction(callback);
}

/**
 * Batch write operations
 */
export function createBatch() {
  const db = getFirestoreAdmin();
  return db.batch();
}

/**
 * Increment a field value
 */
export function increment(value: number) {
  return FieldValue.increment(value);
}

/**
 * Decrement a field value
 */
export function decrement(value: number) {
  return FieldValue.increment(-value);
}

/**
 * Add to array (if not already present)
 */
export function arrayUnion(...elements: any[]) {
  return FieldValue.arrayUnion(...elements);
}

/**
 * Remove from array
 */
export function arrayRemove(...elements: any[]) {
  return FieldValue.arrayRemove(...elements);
}

/**
 * Set server timestamp
 */
export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

/**
 * Delete a field
 */
export function deleteField() {
  return FieldValue.delete();
}

/**
 * Helper to create an order with order items atomically
 */
export async function createOrderWithItems(
  orderData: any,
  orderItems: any[],
): Promise<string> {
  const db = getFirestoreAdmin();

  return db.runTransaction(async (transaction) => {
    // Create order document
    const orderRef = db.collection("orders").doc();
    transaction.set(orderRef, {
      ...orderData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Create order item documents
    for (const item of orderItems) {
      const itemRef = db.collection("order_items").doc();
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
export async function updateProductStock(
  productId: string,
  quantityChange: number,
): Promise<void> {
  const db = getFirestoreAdmin();
  const productRef = db.collection("products").doc(productId);

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
      stock: newStock,
      updated_at: serverTimestamp(),
    });
  });
}

/**
 * Helper to place a bid atomically (update auction + create bid)
 */
export async function placeBid(
  auctionId: string,
  userId: string,
  bidAmount: number,
): Promise<string> {
  const db = getFirestoreAdmin();
  const auctionRef = db.collection("auctions").doc(auctionId);

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
      .collection("bids")
      .where("auction_id", "==", auctionId)
      .where("is_winning", "==", true);

    const previousBids = await transaction.get(previousBidsQuery);
    previousBids.docs.forEach((doc) => {
      transaction.update(doc.ref, { is_winning: false });
    });

    // Create new bid
    const bidRef = db.collection("bids").doc();
    transaction.set(bidRef, {
      auction_id: auctionId,
      user_id: userId,
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
export async function processRefund(
  returnId: string,
  refundAmount: number,
  refundData: any,
): Promise<string> {
  const db = getFirestoreAdmin();
  const returnRef = db.collection("returns").doc(returnId);

  return db.runTransaction(async (transaction) => {
    const returnDoc = await transaction.get(returnRef);

    if (!returnDoc.exists) {
      throw new Error("Return not found");
    }

    // Create refund record
    const refundRef = db.collection("refunds").doc();
    transaction.set(refundRef, {
      ...refundData,
      return_id: returnId,
      amount: refundAmount,
      status: "processing",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Update return status
    transaction.update(returnRef, {
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
export async function transferCartToOrder(
  userId: string,
  orderId: string,
): Promise<void> {
  const db = getFirestoreAdmin();

  await db.runTransaction(async (transaction) => {
    // Get all cart items for user
    const cartItemsQuery = db
      .collection("cart_items")
      .where("user_id", "==", userId);

    const cartItemsSnap = await transaction.get(cartItemsQuery);

    // Create order items and delete cart items
    for (const cartItemDoc of cartItemsSnap.docs) {
      const cartItem = cartItemDoc.data();

      // Create order item
      const orderItemRef = db.collection("order_items").doc();
      transaction.set(orderItemRef, {
        order_id: orderId,
        product_id: cartItem.product_id,
        shop_id: cartItem.shop_id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Delete cart item
      transaction.delete(cartItemDoc.ref);
    }
  });
}
