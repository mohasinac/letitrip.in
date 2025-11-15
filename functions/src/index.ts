/**
 * Firebase Functions for JustForView.in
 *
 * Scheduled Functions:
 * - processAuctions: Runs every minute to process ended auctions
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Scheduled function to process ended auctions
 * Runs every minute
 * Optimized with batch processing and resource limits
 */
export const processAuctions = functions
  .region("asia-south1") // Mumbai region
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: "1GB",
    minInstances: 0, // Cold start OK for FREE tier
    maxInstances: 3, // Limit concurrent executions to control costs
  })
  .pubsub.schedule("every 1 minutes")
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    const startTime = Date.now();
    console.log("[Auction Cron] Starting auction processing...");

    try {
      const results = await processEndedAuctions();

      const duration = Date.now() - startTime;
      console.log(`[Auction Cron] Completed in ${duration}ms`);

      // Log performance metrics
      if (duration > 8000) {
        console.warn(
          `[Auction Cron] SLOW EXECUTION: ${duration}ms (threshold: 8000ms)`
        );
      }

      return {
        success: true,
        duration,
        processed: results.processed,
        successful: results.successful,
        failed: results.failed,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("[Auction Cron] Error processing auctions:", error);

      // Log error but don't throw to avoid function retries
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  });

/**
 * HTTP function to manually trigger auction processing
 * Requires authentication
 */
export const triggerAuctionProcessing = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 540,
    memory: "1GB",
  })
  .https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    // Check if user is admin
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const user = userDoc.data();

    if (!user || user.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Admin access required"
      );
    }

    console.log("[Auction Cron] Manual trigger by admin:", context.auth.uid);

    try {
      await processEndedAuctions();

      return {
        success: true,
        message: "Auction processing completed",
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("[Auction Cron] Error in manual trigger:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

/**
 * Process all ended auctions with batch processing
 */
async function processEndedAuctions(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  const now = admin.firestore.Timestamp.now();

  // Get all live auctions that have ended (limit to 50 per run)
  const snapshot = await db
    .collection("auctions")
    .where("status", "==", "live")
    .where("end_time", "<=", now)
    .limit(50)
    .get();

  console.log(`[Auction Cron] Found ${snapshot.size} auctions to process`);

  if (snapshot.empty) {
    return { processed: 0, successful: 0, failed: 0 };
  }

  // Process each ended auction in batches
  const promises = snapshot.docs.map((doc) => closeAuction(doc.id));
  const results = await Promise.allSettled(promises);

  // Log results
  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(
    `[Auction Cron] Processed ${snapshot.size}: ${successful} successful, ${failed} failed`
  );

  // Log failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `[Auction Cron] Failed to process auction ${snapshot.docs[index].id}:`,
        result.reason
      );
    }
  });

  return {
    processed: snapshot.size,
    successful,
    failed,
  };
}

/**
 * Close an auction and determine winner
 */
async function closeAuction(auctionId: string): Promise<void> {
  console.log(`[Auction Cron] Closing auction ${auctionId}`);

  const auctionRef = db.collection("auctions").doc(auctionId);
  const auctionDoc = await auctionRef.get();

  if (!auctionDoc.exists) {
    console.error(`[Auction Cron] Auction ${auctionId} not found`);
    return;
  }

  const auction = auctionDoc.data() as any;

  // Find highest bid
  const bidsSnapshot = await db
    .collection("bids")
    .where("auction_id", "==", auctionId)
    .orderBy("amount", "desc")
    .limit(1)
    .get();

  if (bidsSnapshot.empty) {
    // No bids - mark as ended with no winner
    await auctionRef.update({
      status: "ended",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Auction Cron] Auction ${auctionId} ended with no bids`);

    // TODO: Notify seller (no winner)
    return;
  }

  const winningBid = bidsSnapshot.docs[0].data() as any;
  const winnerId = winningBid.user_id;
  const finalBid = winningBid.amount;

  // Check if reserve price was met
  if (auction.reserve_price && finalBid < auction.reserve_price) {
    // Reserve not met
    await auctionRef.update({
      status: "ended",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(
      `[Auction Cron] Auction ${auctionId} ended - reserve price not met`
    );

    // TODO: Notify seller and highest bidder
    return;
  }

  // Winner! Update auction
  await auctionRef.update({
    status: "ended",
    winner_id: winnerId,
    final_bid: finalBid,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(
    `[Auction Cron] Auction ${auctionId} won by user ${winnerId} for ₹${finalBid}`
  );

  // Create order for winner
  await createWinnerOrder(auction, auctionId, winnerId, finalBid);

  // Add to won_auctions collection
  await db.collection("won_auctions").add({
    auction_id: auctionId,
    user_id: winnerId,
    shop_id: auction.shop_id,
    final_bid: finalBid,
    name: auction.name,
    slug: auction.slug,
    images: auction.images || [],
    won_at: admin.firestore.FieldValue.serverTimestamp(),
    order_created: true,
  });

  // TODO: Notify winner and seller

  // Update product inventory if linked
  if (auction.product_id) {
    await updateInventory(auction.product_id);
  }
}

/**
 * Create order for auction winner
 */
async function createWinnerOrder(
  auction: any,
  auctionId: string,
  winnerId: string,
  finalBid: number
): Promise<void> {
  try {
    // Get winner details
    const winnerDoc = await db.collection("users").doc(winnerId).get();
    const winner = winnerDoc.data() as any;

    if (!winner) {
      console.error(`[Auction Cron] Winner ${winnerId} not found`);
      return;
    }

    // Get default shipping address
    const addressesSnapshot = await db
      .collection("addresses")
      .where("user_id", "==", winnerId)
      .where("is_default", "==", true)
      .limit(1)
      .get();

    let shippingAddress = null;
    if (!addressesSnapshot.empty) {
      shippingAddress = {
        id: addressesSnapshot.docs[0].id,
        ...addressesSnapshot.docs[0].data(),
      };
    }

    // Create order
    const orderId = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const orderData = {
      order_id: orderId,
      user_id: winnerId,
      user_email: winner.email,
      user_name: winner.name || winner.email,
      shop_id: auction.shop_id,

      // Order items (single auction item)
      items: [
        {
          type: "auction",
          auction_id: auctionId,
          name: auction.name,
          slug: auction.slug,
          price: finalBid,
          quantity: 1,
          images: auction.images || [],
          subtotal: finalBid,
        },
      ],

      // Pricing
      subtotal: finalBid,
      discount: 0,
      shipping_fee: 0, // Free shipping for auctions
      tax: Math.round(finalBid * 0.18), // 18% GST
      total: Math.round(finalBid * 1.18),

      // Addresses
      shipping_address: shippingAddress,
      billing_address: shippingAddress,

      // Payment
      payment_method: "pending", // Winner needs to complete payment
      payment_status: "pending",

      // Status
      order_status: "pending",
      fulfillment_status: "unfulfilled",

      // Metadata
      source: "auction",
      notes: `Order created automatically for auction win: ${auction.name}`,

      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("orders").add(orderData);

    console.log(
      `[Auction Cron] Created order ${orderId} for winner ${winnerId}`
    );
  } catch (error) {
    console.error("[Auction Cron] Error creating winner order:", error);
  }
}

/**
 * Update product inventory after auction ends
 */
async function updateInventory(productId: string): Promise<void> {
  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      const product = productDoc.data() as any;
      const newStock = Math.max(0, (product.stock || 0) - 1);

      await productRef.update({
        stock: newStock,
        status: newStock === 0 ? "out_of_stock" : product.status,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `[Auction Cron] Updated inventory for product ${productId}: ${newStock} remaining`
      );
    }
  } catch (error) {
    console.error("[Auction Cron] Error updating inventory:", error);
  }
}
