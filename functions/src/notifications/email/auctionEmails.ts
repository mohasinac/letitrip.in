/**
 * Email Notifications - Auction Emails
 *
 * Firebase Functions for sending auction-related emails
 *
 * @status IMPLEMENTED
 * @task 1.5.6
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v2";

/**
 * Send auction won email when auction ends and user wins
 */
export const sendAuctionWon = functions.firestore.onDocumentUpdated(
  "auctions/{auctionId}",
  async (event) => {
    try {
      const before = event.data?.before.data();
      const after = event.data?.after.data();

      if (!before || !after) return;

      // Check if auction ended
      if (
        before.status !== "ended" &&
        after.status === "ended" &&
        after.winnerId
      ) {
        const db = admin.firestore();

        // Get winner data
        const winnerDoc = await db
          .collection("users")
          .doc(after.winnerId)
          .get();
        const winnerData = winnerDoc.data();

        if (!winnerData?.email) return;

        // Get product data
        let productData;
        if (after.productId) {
          const productDoc = await db
            .collection("products")
            .doc(after.productId)
            .get();
          productData = productDoc.data();
        }

        // Add to email queue
        await db.collection("emailQueue").add({
          to: winnerData.email,
          template: "auction_won",
          category: "NOTIFICATIONS",
          data: {
            userName: winnerData.displayName || winnerData.name || "Bidder",
            auctionId: event.params.auctionId,
            productName: productData?.title || after.title || "Item",
            winningBid: after.currentBid || after.startingPrice,
            endedAt:
              after.endTime?.toDate?.()?.toLocaleDateString() ||
              new Date().toLocaleDateString(),
            productImage: productData?.images?.[0] || "",
          },
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(
          `Auction won email queued for auction ${event.params.auctionId}`
        );
      }
    } catch (error) {
      functions.logger.error("Error sending auction won email:", error);
    }
  }
);

/**
 * Send outbid notification when user is outbid
 */
export const sendAuctionOutbid = functions.firestore.onDocumentCreated(
  "bids/{bidId}",
  async (event) => {
    try {
      const bidData = event.data?.data();
      if (!bidData) return;

      const db = admin.firestore();

      // Get auction data
      const auctionDoc = await db
        .collection("auctions")
        .doc(bidData.auctionId)
        .get();
      const auctionData = auctionDoc.data();

      if (!auctionData) return;

      // Get previous highest bidder
      const bidsSnapshot = await db
        .collection("bids")
        .where("auctionId", "==", bidData.auctionId)
        .where("amount", "<", bidData.amount)
        .orderBy("amount", "desc")
        .limit(1)
        .get();

      if (bidsSnapshot.empty) return;

      const previousBidData = bidsSnapshot.docs[0].data();

      // Get previous bidder data
      const bidderDoc = await db
        .collection("users")
        .doc(previousBidData.bidderId)
        .get();
      const bidderData = bidderDoc.data();

      if (!bidderData?.email) return;

      // Get product data
      let productData;
      if (auctionData.productId) {
        const productDoc = await db
          .collection("products")
          .doc(auctionData.productId)
          .get();
        productData = productDoc.data();
      }

      // Add to email queue
      await db.collection("emailQueue").add({
        to: bidderData.email,
        template: "bid_outbid",
        category: "NOTIFICATIONS",
        data: {
          userName: bidderData.displayName || bidderData.name || "Bidder",
          auctionId: bidData.auctionId,
          productName: productData?.title || auctionData.title || "Item",
          yourBid: previousBidData.amount,
          newBid: bidData.amount,
          auctionEndTime:
            auctionData.endTime?.toDate?.()?.toLocaleDateString() || "Soon",
          productImage: productData?.images?.[0] || "",
        },
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Outbid email queued for auction ${bidData.auctionId}`
      );
    } catch (error) {
      functions.logger.error("Error sending outbid email:", error);
    }
  }
);

/**
 * Send auction ending soon reminder (scheduled function)
 */
export const sendAuctionEndingSoon = functions.scheduler.onSchedule(
  "every 1 hours",
  async () => {
    try {
      const db = admin.firestore();

      // Find auctions ending in next 2 hours
      const now = admin.firestore.Timestamp.now();
      const twoHoursFromNow = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + 2 * 60 * 60 * 1000
      );

      const auctionsSnapshot = await db
        .collection("auctions")
        .where("status", "==", "active")
        .where("endTime", ">", now)
        .where("endTime", "<=", twoHoursFromNow)
        .where("reminderSent", "==", false)
        .get();

      if (auctionsSnapshot.empty) {
        functions.logger.info("No auctions ending soon");
        return;
      }

      for (const auctionDoc of auctionsSnapshot.docs) {
        const auctionData = auctionDoc.data();

        // Get current highest bidder
        const bidsSnapshot = await db
          .collection("bids")
          .where("auctionId", "==", auctionDoc.id)
          .orderBy("amount", "desc")
          .limit(1)
          .get();

        if (bidsSnapshot.empty) continue;

        const highestBidData = bidsSnapshot.docs[0].data();

        // Get bidder data
        const bidderDoc = await db
          .collection("users")
          .doc(highestBidData.bidderId)
          .get();
        const bidderData = bidderDoc.data();

        if (!bidderData?.email) continue;

        // Get product data
        let productData;
        if (auctionData.productId) {
          const productDoc = await db
            .collection("products")
            .doc(auctionData.productId)
            .get();
          productData = productDoc.data();
        }

        // Add to email queue
        await db.collection("emailQueue").add({
          to: bidderData.email,
          template: "auction_ending_soon",
          category: "NOTIFICATIONS",
          data: {
            userName: bidderData.displayName || bidderData.name || "Bidder",
            auctionId: auctionDoc.id,
            productName: productData?.title || auctionData.title || "Item",
            currentBid: auctionData.currentBid,
            endTime:
              auctionData.endTime?.toDate?.()?.toLocaleTimeString() || "Soon",
            productImage: productData?.images?.[0] || "",
          },
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Mark reminder as sent
        await auctionDoc.ref.update({ reminderSent: true });

        functions.logger.info(
          `Ending soon email queued for auction ${auctionDoc.id}`
        );
      }
    } catch (error) {
      functions.logger.error(
        "Error sending auction ending soon emails:",
        error
      );
    }
  }
);
