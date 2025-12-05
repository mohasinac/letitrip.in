/**
 * Firebase Function: WhatsApp Bid Notifications
 *
 * Triggered when new bid is placed
 * Sends WhatsApp notifications to auction owner and outbid users
 * Logs notification status to Firestore
 */

import * as functions from "firebase-functions/v1";
import { adminDb } from "../../config/firebase-admin";
import { getUserData, logNotification, sendWhatsAppMessage } from "./shared";

interface BidData {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  createdAt: string;
}

interface AuctionData {
  id: string;
  title: string;
  currentBid: number;
  sellerId: string;
  endTime: string;
}

/**
 * Get auction data from Firestore
 */
async function getAuctionData(auctionId: string): Promise<AuctionData | null> {
  try {
    const auctionDoc = await adminDb
      .collection("auctions")
      .doc(auctionId)
      .get();

    if (!auctionDoc.exists) {
      return null;
    }

    return {
      id: auctionDoc.id,
      ...(auctionDoc.data() as Omit<AuctionData, "id">),
    };
  } catch (error) {
    console.error(`Failed to fetch auction ${auctionId}:`, error);
    return null;
  }
}

/**
 * Get previous highest bidder
 */
async function getPreviousHighestBidder(
  auctionId: string,
  currentBidId: string
): Promise<string | null> {
  try {
    const bidsSnapshot = await adminDb
      .collection("bids")
      .where("auctionId", "==", auctionId)
      .orderBy("amount", "desc")
      .limit(2)
      .get();

    if (bidsSnapshot.size < 2) {
      return null; // No previous bidder
    }

    // Get second highest bid (first is current bid)
    const previousBid = bidsSnapshot.docs[1];
    return previousBid.data().userId;
  } catch (error) {
    console.error("Failed to fetch previous bidder:", error);
    return null;
  }
}

/**
 * Generate new bid notification for seller
 */
function getNewBidMessage(
  sellerName: string,
  bidderName: string,
  auction: AuctionData,
  bidAmount: number
): string {
  return (
    `Hi ${sellerName},\n\n` +
    `New bid on your auction! 🎉\n\n` +
    `Item: ${auction.title}\n` +
    `Bid Amount: ₹${bidAmount.toLocaleString("en-IN")}\n` +
    `Bidder: ${bidderName}\n\n` +
    `View auction: https://letitrip.in/auctions/${auction.id}`
  );
}

/**
 * Generate outbid notification
 */
function getOutbidMessage(
  userName: string,
  auction: AuctionData,
  newBidAmount: number
): string {
  return (
    `Hi ${userName},\n\n` +
    `You've been outbid! 😔\n\n` +
    `Item: ${auction.title}\n` +
    `New Bid: ₹${newBidAmount.toLocaleString("en-IN")}\n\n` +
    `Place a higher bid to stay in the race!\n\n` +
    `View auction: https://letitrip.in/auctions/${auction.id}`
  );
}

/**
 * Firebase Firestore Trigger: Send WhatsApp notification when bid is placed
 */
export const sendBidNotification = functions.firestore
  .document("bids/{bidId}")
  .onCreate(async (snapshot, context) => {
    const bidId = context.params.bidId;
    const bidData = {
      id: bidId,
      ...(snapshot.data() as Omit<BidData, "id">),
    };

    console.log(`New bid placed: ${bidId} for auction ${bidData.auctionId}`);

    // Get auction data
    const auction = await getAuctionData(bidData.auctionId);
    if (!auction) {
      console.log(`Auction ${bidData.auctionId} not found`);
      return;
    }

    // Get bidder data
    const bidder = await getUserData(bidData.userId);
    if (!bidder) {
      console.log(`Bidder ${bidData.userId} not found`);
      return;
    }

    // Notify seller
    const seller = await getUserData(auction.sellerId);
    if (seller && seller.phone) {
      const sellerMessage = getNewBidMessage(
        seller.name,
        bidder.name,
        auction,
        bidData.amount
      );

      const sellerResult = await sendWhatsAppMessage(
        seller.phone,
        sellerMessage
      );

      await logNotification({
        userId: auction.sellerId,
        auctionId: bidData.auctionId,
        bidId,
        type: "new_bid_seller",
        status: sellerResult.success ? "sent" : "failed",
        messageId: sellerResult.messageId,
        error: sellerResult.error,
      });

      if (sellerResult.success) {
        console.log(`Seller notification sent: ${sellerResult.messageId}`);
      } else {
        console.error(`Failed to notify seller: ${sellerResult.error}`);
      }
    }

    // Notify previous highest bidder (if any)
    const previousBidderId = await getPreviousHighestBidder(
      bidData.auctionId,
      bidId
    );

    if (previousBidderId && previousBidderId !== bidData.userId) {
      const previousBidder = await getUserData(previousBidderId);

      if (previousBidder && previousBidder.phone) {
        const outbidMessage = getOutbidMessage(
          previousBidder.name,
          auction,
          bidData.amount
        );

        const bidderResult = await sendWhatsAppMessage(
          previousBidder.phone,
          outbidMessage
        );

        await logNotification({
          userId: previousBidderId,
          auctionId: bidData.auctionId,
          bidId,
          type: "outbid",
          status: bidderResult.success ? "sent" : "failed",
          messageId: bidderResult.messageId,
          error: bidderResult.error,
        });

        if (bidderResult.success) {
          console.log(`Outbid notification sent: ${bidderResult.messageId}`);
        } else {
          console.error(`Failed to notify outbid user: ${bidderResult.error}`);
        }
      }
    }
  });
