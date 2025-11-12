/**
 * Auction Scheduler
 *
 * Handles automated auction lifecycle management:
 * - Close auctions at end time
 * - Determine winners
 * - Create orders for winners
 * - Send notifications
 * - Update inventory
 */

import cron from "node-cron";
import { Collections } from "@/app/api/lib/firebase/collections";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Process ended auctions
 * Runs every minute to check for auctions that have ended
 */
export async function processEndedAuctions() {
  try {
    const now = new Date();
    const nowTimestamp = Timestamp.fromDate(now);

    // Get all live auctions that have ended (using composite index)
    const snapshot = await Collections.auctions()
      .where("status", "==", "live")
      .where("end_time", "<=", nowTimestamp)
      .get();

    console.log(
      `[Auction Scheduler] Found ${snapshot.size} auctions to process`,
    );

    // Process each ended auction
    const promises = snapshot.docs.map((doc) => closeAuction(doc.id));
    await Promise.allSettled(promises);
  } catch (error) {
    console.error(
      "[Auction Scheduler] Error processing ended auctions:",
      error,
    );
  }
}

/**
 * Close an auction and determine winner
 */
async function closeAuction(auctionId: string) {
  try {
    console.log(`[Auction Scheduler] Closing auction ${auctionId}`);

    const auctionRef = Collections.auctions().doc(auctionId);
    const auctionDoc = await auctionRef.get();

    if (!auctionDoc.exists) {
      console.error(`[Auction Scheduler] Auction ${auctionId} not found`);
      return;
    }

    const auction = auctionDoc.data() as any;

    // Find highest bid
    const bidsSnapshot = await Collections.bids()
      .where("auction_id", "==", auctionId)
      .orderBy("amount", "desc")
      .limit(1)
      .get();

    if (bidsSnapshot.empty) {
      // No bids - mark as ended with no winner
      await auctionRef.update({
        status: "ended",
        updated_at: new Date().toISOString(),
      });

      console.log(
        `[Auction Scheduler] Auction ${auctionId} ended with no bids`,
      );

      // Notify seller (no winner)
      await notifySellerNoWinner(auction);
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
        updated_at: new Date().toISOString(),
      });

      console.log(
        `[Auction Scheduler] Auction ${auctionId} ended - reserve price not met`,
      );

      // Notify seller and highest bidder
      await notifyReserveNotMet(auction, winnerId, finalBid);
      return;
    }

    // Winner! Update auction
    await auctionRef.update({
      status: "ended",
      winner_id: winnerId,
      final_bid: finalBid,
      updated_at: new Date().toISOString(),
    });

    console.log(
      `[Auction Scheduler] Auction ${auctionId} won by user ${winnerId} for ₹${finalBid}`,
    );

    // Create order for winner
    await createWinnerOrder(auction, winnerId, finalBid);

    // Add to won_auctions collection
    await Collections.wonAuctions().add({
      auction_id: auctionId,
      user_id: winnerId,
      shop_id: auction.shop_id,
      final_bid: finalBid,
      name: auction.name,
      slug: auction.slug,
      images: auction.images || [],
      won_at: new Date().toISOString(),
      order_created: true,
    });

    // Notify winner and seller
    await notifyWinner(auction, winnerId, finalBid);
    await notifySeller(auction, winnerId, finalBid);

    // Update product inventory if linked
    if (auction.product_id) {
      await updateInventory(auction.product_id);
    }
  } catch (error) {
    console.error(
      `[Auction Scheduler] Error closing auction ${auctionId}:`,
      error,
    );
  }
}

/**
 * Create order for auction winner
 */
async function createWinnerOrder(
  auction: any,
  winnerId: string,
  finalBid: number,
) {
  try {
    // Get winner details
    const winnerDoc = await Collections.users().doc(winnerId).get();
    const winner = winnerDoc.data() as any;

    if (!winner) {
      console.error(`[Auction Scheduler] Winner ${winnerId} not found`);
      return;
    }

    // Get default shipping address
    const addressesSnapshot = await Collections.addresses()
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
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

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
          auction_id: auction.id,
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

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await Collections.orders().add(orderData);

    console.log(
      `[Auction Scheduler] Created order ${orderId} for winner ${winnerId}`,
    );
  } catch (error) {
    console.error("[Auction Scheduler] Error creating winner order:", error);
  }
}

/**
 * Update product inventory after auction ends
 */
async function updateInventory(productId: string) {
  try {
    const productRef = Collections.products().doc(productId);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      const product = productDoc.data() as any;
      const newStock = Math.max(0, (product.stock || 0) - 1);

      await productRef.update({
        stock: newStock,
        status: newStock === 0 ? "out_of_stock" : product.status,
        updated_at: new Date().toISOString(),
      });

      console.log(
        `[Auction Scheduler] Updated inventory for product ${productId}: ${newStock} remaining`,
      );
    }
  } catch (error) {
    console.error("[Auction Scheduler] Error updating inventory:", error);
  }
}

/**
 * Notification functions (placeholder implementations)
 * In production, integrate with email/SMS services (SendGrid, Twilio, etc.)
 */
async function notifyWinner(auction: any, winnerId: string, finalBid: number) {
  console.log(
    `[Notification] Winner ${winnerId}: You won auction "${auction.name}" for ₹${finalBid}`,
  );
  // TODO: Send email/SMS to winner
  // - Congratulations message
  // - Payment instructions
  // - Order link
}

async function notifySeller(auction: any, winnerId: string, finalBid: number) {
  console.log(
    `[Notification] Seller: Auction "${auction.name}" sold to user ${winnerId} for ₹${finalBid}`,
  );
  // TODO: Send email/SMS to seller
  // - Auction ended message
  // - Winner details
  // - Next steps (fulfill order)
}

async function notifySellerNoWinner(auction: any) {
  console.log(
    `[Notification] Seller: Auction "${auction.name}" ended with no bids`,
  );
  // TODO: Send email to seller
  // - No bids received
  // - Option to relist
}

async function notifyReserveNotMet(
  auction: any,
  highestBidderId: string,
  highestBid: number,
) {
  console.log(
    `[Notification] Auction "${auction.name}" ended - reserve price not met (highest: ₹${highestBid})`,
  );
  // TODO: Send emails
  // - To seller: Reserve not met, option to accept highest bid or relist
  // - To highest bidder: Reserve not met, but seller may contact you
}

/**
 * Start auction scheduler (call this once when server starts)
 */
export function startAuctionScheduler() {
  // Run every minute
  cron.schedule("* * * * *", () => {
    console.log("[Auction Scheduler] Running scheduled task...");
    processEndedAuctions();
  });

  console.log("[Auction Scheduler] Started - checking auctions every minute");
}

/**
 * Manual trigger for testing
 */
export async function manualProcessAuctions() {
  console.log("[Auction Scheduler] Manual trigger");
  await processEndedAuctions();
}
