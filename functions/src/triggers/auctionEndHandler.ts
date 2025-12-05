import * as admin from "firebase-admin";
import type { EventContext } from "firebase-functions/v1";
import * as functions from "firebase-functions/v1";

const db = admin.firestore();

/**
 * Scheduled function: Check for ended auctions every hour
 * Runs at minute 0 of every hour
 */
export const checkEndedAuctions = functions.pubsub
  .schedule("0 * * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async (context: EventContext) => {
    const now = admin.firestore.Timestamp.now();

    try {
      // Query auctions that have ended but status is still "active"
      const endedAuctionsSnapshot = await db
        .collection("auctions")
        .where("status", "==", "active")
        .where("endDate", "<=", now)
        .limit(100)
        .get();

      if (endedAuctionsSnapshot.empty) {
        console.log("No ended auctions found");
        return null;
      }

      console.log(`Processing ${endedAuctionsSnapshot.size} ended auctions`);

      // Process each ended auction
      const promises = endedAuctionsSnapshot.docs.map((doc) =>
        processEndedAuction(doc.id, doc.data())
      );

      await Promise.all(promises);

      console.log("Finished processing ended auctions");
      return null;
    } catch (error) {
      console.error("Error in checkEndedAuctions:", error);
      throw error;
    }
  });

/**
 * Process a single ended auction
 */
async function processEndedAuction(auctionId: string, auctionData: any) {
  const batch = db.batch();

  try {
    // 1. Get all bids for this auction
    const bidsSnapshot = await db
      .collection("bids")
      .where("auctionId", "==", auctionId)
      .orderBy("amount", "desc")
      .limit(1)
      .get();

    const hasWinner = !bidsSnapshot.empty;
    const winningBid = hasWinner ? bidsSnapshot.docs[0].data() : null;

    // 2. Update auction status
    const auctionRef = db.collection("auctions").doc(auctionId);
    batch.update(auctionRef, {
      status: "ended",
      endedAt: admin.firestore.FieldValue.serverTimestamp(),
      winnerId: winningBid?.userId || null,
      winningBid: winningBid?.amount || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. If there's a winner, create order automatically
    if (hasWinner && winningBid) {
      const orderRef = db.collection("orders").doc();
      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      batch.set(orderRef, {
        orderNumber,
        buyerId: winningBid.userId,
        sellerId: auctionData.sellerId,
        shopId: auctionData.shopId,
        type: "auction",
        auctionId,
        items: [
          {
            productId: auctionData.productId,
            productName: auctionData.title,
            productImage: auctionData.images?.[0] || "",
            quantity: 1,
            price: winningBid.amount,
          },
        ],
        subtotal: winningBid.amount,
        shipping: 0, // To be calculated
        tax: 0, // To be calculated
        totalAmount: winningBid.amount,
        status: "pending_payment",
        paymentStatus: "pending",
        shippingAddress: null, // Buyer will add during checkout
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 4. Notify winner
      const winnerNotificationRef = db.collection("notifications").doc();
      batch.set(winnerNotificationRef, {
        userId: winningBid?.userId,
        type: "auction",
        title: "🎉 Congratulations! You Won!",
        message: `You won the auction for "${
          auctionData.title
        }" with a bid of ₹${winningBid?.amount.toLocaleString(
          "en-IN"
        )}. Please complete payment to receive your item.`,
        data: {
          auctionId,
          orderId: orderRef.id,
          amount: winningBid?.amount,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // 5. Get all bidders to notify them
    const allBidsSnapshot = await db
      .collection("bids")
      .where("auctionId", "==", auctionId)
      .get();

    const uniqueBidders = new Set<string>();
    allBidsSnapshot.docs.forEach((doc) => {
      uniqueBidders.add(doc.data().userId);
    });

    // 6. Notify all bidders about auction result
    uniqueBidders.forEach((userId) => {
      const notificationRef = db.collection("notifications").doc();
      const isWinner = userId === winningBid?.userId;

      batch.set(notificationRef, {
        userId,
        type: "auction",
        title: isWinner ? "🎉 You Won!" : "Auction Ended",
        message: isWinner
          ? `Congratulations! You won "${
              auctionData.title
            }" with a bid of ₹${winningBid?.amount?.toLocaleString("en-IN")}.`
          : hasWinner && winningBid
          ? `The auction for "${
              auctionData.title
            }" has ended. The winning bid was ₹${winningBid.amount.toLocaleString(
              "en-IN"
            )}.`
          : `The auction for "${auctionData.title}" has ended with no bids.`,
        data: {
          auctionId,
          winnerId: winningBid?.userId || null,
          winningBid: winningBid?.amount || null,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // 7. Notify seller
    const sellerNotificationRef = db.collection("notifications").doc();
    batch.set(sellerNotificationRef, {
      userId: auctionData.sellerId,
      type: "auction",
      title: hasWinner ? "Auction Won!" : "Auction Ended",
      message:
        hasWinner && winningBid
          ? `Your auction for "${
              auctionData.title
            }" ended with a winning bid of ₹${winningBid.amount.toLocaleString(
              "en-IN"
            )}.`
          : `Your auction for "${auctionData.title}" ended with no bids.`,
      data: {
        auctionId,
        winnerId: winningBid?.userId || null,
        winningBid: winningBid?.amount || null,
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 8. Commit all changes
    await batch.commit();

    console.log(
      `Processed auction ${auctionId}: ${
        hasWinner ? "Winner found" : "No bids"
      }`
    );
  } catch (error) {
    console.error(`Error processing auction ${auctionId}:`, error);
    throw error;
  }
}
