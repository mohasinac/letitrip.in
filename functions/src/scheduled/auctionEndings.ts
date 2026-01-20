/**
 * Auction End Notifications Function
 * Phase 8.1 - Task 2/4
 *
 * Scheduled function that runs every minute to check for ending auctions.
 * Sends notifications to winners and participants.
 *
 * Schedule: Every 1 minute
 * Cron: * * * * *
 *
 * Features:
 * - Check auctions ending in next minute
 * - Notify auction winners
 * - Notify losing bidders
 * - Update auction status to 'ended'
 * - Create order for winner
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

interface Auction {
  id: string;
  title: string;
  currentBid: number;
  highestBidderId: string;
  highestBidderEmail: string;
  highestBidderName: string;
  bidEndTime: admin.firestore.Timestamp;
  status: "active" | "ending" | "ended";
  sellerId: string;
  sellerEmail: string;
  productId: string;
  imageUrl?: string;
  participants: string[]; // Array of user IDs who placed bids
}

interface Bid {
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  timestamp: admin.firestore.Timestamp;
}

/**
 * Scheduled function to process ending auctions
 * Runs every minute
 */
export const processAuctionEndings = functions.pubsub
  .schedule("* * * * *") // Every minute
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const db = admin.firestore();

    try {
      console.log("Processing auction endings...");

      // Find auctions that have ended but not yet processed
      const endedAuctions = await db
        .collection("auctions")
        .where("status", "in", ["active", "ending"])
        .where("bidEndTime", "<=", now)
        .limit(50) // Process max 50 per run
        .get();

      if (endedAuctions.empty) {
        console.log("No auctions to process");
        return { processed: 0 };
      }

      console.log(`Found ${endedAuctions.size} auctions to process`);

      // Process each auction
      const promises = endedAuctions.docs.map(async (doc) => {
        const auction = { id: doc.id, ...doc.data() } as Auction;
        return processAuctionEnd(auction, db);
      });

      await Promise.all(promises);

      console.log(`Successfully processed ${endedAuctions.size} auctions`);
      return { processed: endedAuctions.size };
    } catch (error) {
      console.error("Error processing auction endings:", error);

      // Log error
      await db.collection("errorLogs").add({
        type: "auctionEndingsScheduled",
        error: error instanceof Error ? error.message : String(error),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: false, error: String(error) };
    }
  });

/**
 * Process a single auction end
 */
async function processAuctionEnd(
  auction: Auction,
  db: admin.firestore.Firestore,
): Promise<void> {
  try {
    console.log(`Processing auction: ${auction.id} - ${auction.title}`);

    // Update auction status
    await db.collection("auctions").doc(auction.id).update({
      status: "ended",
      endedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Get all bids for this auction
    const bidsSnapshot = await db
      .collection("auctions")
      .doc(auction.id)
      .collection("bids")
      .orderBy("amount", "desc")
      .get();

    const bids = bidsSnapshot.docs.map((doc) => doc.data() as Bid);
    const losers = bids.slice(1); // Everyone except the winner

    // If there's a winner, send winner notification and create order
    if (auction.highestBidderId && auction.currentBid > 0) {
      // Send winner notification
      await sendWinnerNotification(auction);

      // Create order for winner
      await createWinnerOrder(auction, db);

      // Notify seller
      await notifySeller(auction);
    }

    // Notify losing bidders
    if (losers.length > 0) {
      await notifyLosingBidders(auction, losers);
    }

    console.log(`Successfully processed auction: ${auction.id}`);
  } catch (error) {
    console.error(`Error processing auction ${auction.id}:`, error);

    // Log error
    await db.collection("errorLogs").add({
      type: "auctionEndProcessing",
      auctionId: auction.id,
      error: error instanceof Error ? error.message : String(error),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Send winner notification
 */
async function sendWinnerNotification(auction: Auction): Promise<void> {
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Congratulations! You Won the Auction</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎉 Congratulations!</h1>
      <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 16px;">You won the auction</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 20px;">
      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px;">${
        auction.title
      }</h2>
      ${
        auction.imageUrl
          ? `<img src="${auction.imageUrl}" alt="${auction.title}" style="width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin-bottom: 16px;" />`
          : ""
      }
      
      <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 16px;">
        Your winning bid of <strong style="color: #10b981;">₹${auction.currentBid.toFixed(
          2,
        )}</strong> has been accepted!
      </p>

      <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
        An order has been created for you. Please complete the payment within 24 hours to confirm your purchase.
      </p>

      <div style="text-align: center; margin-top: 32px;">
        <a href="https://letitrip.in/profile/orders" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">View Order</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 32px 20px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} LetItRip. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await admin
    .firestore()
    .collection("emails")
    .add({
      to: auction.highestBidderEmail,
      from: "auctions@letitrip.in",
      subject: `🎉 Congratulations! You won "${auction.title}"`,
      html: emailHtml,
      auctionId: auction.id,
      type: "auction_winner",
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Create order for auction winner
 */
async function createWinnerOrder(
  auction: Auction,
  db: admin.firestore.Firestore,
): Promise<void> {
  await db.collection("orders").add({
    userId: auction.highestBidderId,
    userEmail: auction.highestBidderEmail,
    userName: auction.highestBidderName,
    type: "auction_win",
    auctionId: auction.id,
    items: [
      {
        productId: auction.productId,
        name: auction.title,
        quantity: 1,
        price: auction.currentBid,
        imageUrl: auction.imageUrl,
      },
    ],
    subtotal: auction.currentBid,
    shipping: 0, // Can be calculated
    tax: auction.currentBid * 0.18, // 18% GST
    total: auction.currentBid * 1.18,
    status: "pending_payment",
    paymentMethod: "pending",
    paymentStatus: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Notify seller about auction end
 */
async function notifySeller(auction: Auction): Promise<void> {
  await admin
    .firestore()
    .collection("emails")
    .add({
      to: auction.sellerEmail,
      from: "auctions@letitrip.in",
      subject: `Auction Ended: "${auction.title}"`,
      html: `
      <h1>Your Auction Has Ended</h1>
      <p><strong>${auction.title}</strong></p>
      <p>Final bid: ₹${auction.currentBid.toFixed(2)}</p>
      <p>Winner: ${auction.highestBidderName}</p>
    `,
      auctionId: auction.id,
      type: "auction_ended_seller",
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Notify losing bidders
 */
async function notifyLosingBidders(
  auction: Auction,
  losers: Bid[],
): Promise<void> {
  const promises = losers.map(async (bid) => {
    await admin
      .firestore()
      .collection("emails")
      .add({
        to: bid.userEmail,
        from: "auctions@letitrip.in",
        subject: `Auction Ended: "${auction.title}"`,
        html: `
        <h1>Auction Has Ended</h1>
        <p><strong>${auction.title}</strong></p>
        <p>Your bid: ₹${bid.amount.toFixed(2)}</p>
        <p>Winning bid: ₹${auction.currentBid.toFixed(2)}</p>
        <p>Thank you for participating! Check out our other auctions.</p>
      `,
        auctionId: auction.id,
        type: "auction_ended_loser",
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  });

  await Promise.all(promises);
}
