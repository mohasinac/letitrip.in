import * as admin from "firebase-admin";
import type { EventContext } from "firebase-functions/v1";
import * as functions from "firebase-functions/v1";
import type { DocumentSnapshot } from "firebase-functions/v1/firestore";

const db = admin.firestore();

/**
 * Firestore trigger: Handle new bid notifications
 * - Notify auction owner of new bid
 * - Notify previous highest bidder they've been outbid
 * - Update auction currentBid and bidCount
 */
export const onBidCreated = functions.firestore
  .document("bids/{bidId}")
  .onCreate(async (snapshot: DocumentSnapshot, context: EventContext) => {
    const { bidId } = context.params;
    const bidData = snapshot.data();

    if (!bidData) {
      console.error(`No data found for bid ${bidId}`);
      return null;
    }

    const { auctionId, userId, amount } = bidData as {
      auctionId: string;
      userId: string;
      amount: number;
    };

    const batch = db.batch();

    try {
      // 1. Get auction details
      const auctionRef = db.collection("auctions").doc(auctionId);
      const auctionDoc = await auctionRef.get();

      if (!auctionDoc.exists) {
        console.error(`Auction ${auctionId} not found`);
        return null;
      }

      const auctionData = auctionDoc.data()!;
      const previousHighestBid =
        auctionData.currentBid || auctionData.startingBid;
      const previousHighestBidder = auctionData.currentBidderId;

      // 2. Update auction with new bid
      batch.update(auctionRef, {
        currentBid: amount,
        currentBidderId: userId,
        bidCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Get bidder details
      const bidderDoc = await db.collection("users").doc(userId).get();
      const bidderName = bidderDoc.exists
        ? bidderDoc.data()?.displayName || "A bidder"
        : "A bidder";

      // 4. Notify auction owner of new bid
      const ownerNotificationRef = db.collection("notifications").doc();
      batch.set(ownerNotificationRef, {
        userId: auctionData.sellerId,
        type: "auction",
        title: "🔔 New Bid on Your Auction",
        message: `${bidderName} placed a bid of ₹${amount.toLocaleString(
          "en-IN"
        )} on "${auctionData.title}".`,
        data: {
          auctionId,
          bidId,
          bidderId: userId,
          bidderName,
          amount,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 5. Notify previous highest bidder they've been outbid
      if (previousHighestBidder && previousHighestBidder !== userId) {
        const outbidNotificationRef = db.collection("notifications").doc();
        batch.set(outbidNotificationRef, {
          userId: previousHighestBidder,
          type: "auction",
          title: "⚠️ You've Been Outbid!",
          message: `Your bid of ₹${previousHighestBid.toLocaleString(
            "en-IN"
          )} on "${
            auctionData.title
          }" has been outbid. New highest bid: ₹${amount.toLocaleString(
            "en-IN"
          )}.`,
          data: {
            auctionId,
            previousBid: previousHighestBid,
            newBid: amount,
            newBidderId: userId,
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 6. Update bidder statistics
      const bidderRef = db.collection("users").doc(userId);
      batch.update(bidderRef, {
        "metrics.totalBids": admin.firestore.FieldValue.increment(1),
        "metrics.lastBidAt": admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 7. Commit all changes atomically
      await batch.commit();

      console.log(`Bid ${bidId} processed: ₹${amount} on auction ${auctionId}`);
      return null;
    } catch (error) {
      console.error("Error in onBidCreated trigger:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to process bid notification",
        error
      );
    }
  });
