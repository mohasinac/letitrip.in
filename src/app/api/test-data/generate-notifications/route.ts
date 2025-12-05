/**
 * @fileoverview TypeScript Module
 * @module src/app/api/test-data/generate-notifications/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { faker } from "@faker-js/faker";
import { NextRequest, NextResponse } from "next/server";

const PREFIX = "TEST_";

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  try {
    const { notificationsPerUser = 5 } = await req.json();
    const db = getFirestoreAdmin();

    // Get all test users
    const usersSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where("email", ">=", PREFIX)
      .where("email", "<=", PREFIX + "\uf8ff")
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({
        /** Success */
        success: false,
        /** Error */
        error: "No test users found. Please generate users first.",
      });
    }

    const notificationTemplates: Array<{
      /** Type */
      type: string;
      /** Title */
      title: string;
      /** Get Message */
      getMessage: (param: any) => string;
      /** Category */
      category: string;
    }> = [
      {
        /** Type */
        type: "order_placed",
        /** Title */
        title: "Order Placed Successfully",
        /** Get Message */
        getMessage: (orderId: any) =>
          `Your order #${orderId} has been placed successfully and is being processed.`,
        /** Category */
        category: "order",
      },
      {
        /** Type */
        type: "order_shipped",
        /** Title */
        title: "Order Shipped",
        /** Get Message */
        getMessage: (orderId: any) =>
          `Great news! Your order #${orderId} has been shipped and is on its way.`,
        /** Category */
        category: "order",
      },
      {
        /** Type */
        type: "order_delivered",
        /** Title */
        title: "Order Delivered",
        /** Get Message */
        getMessage: (orderId: any) =>
          `Your order #${orderId} has been delivered successfully. Enjoy your purchase!`,
        /** Category */
        category: "order",
      },
      {
        /** Type */
        type: "bid_placed",
        /** Title */
        title: "Bid Placed",
        /** Get Message */
        getMessage: (auctionName: any) =>
          `Your bid on "${auctionName}" has been placed successfully.`,
        /** Category */
        category: "auction",
      },
      {
        /** Type */
        type: "bid_outbid",
        /** Title */
        title: "You've Been Outbid",
        /** Get Message */
        getMessage: (auctionName: any) =>
          `Someone has placed a higher bid on "${auctionName}". Place a new bid to stay in the game!`,
        /** Category */
        category: "auction",
      },
      {
        /** Type */
        type: "auction_won",
        /** Title */
        title: "Congratulations! You Won",
        /** Get Message */
        getMessage: (auctionName: any) =>
          `You've won the auction for "${auctionName}". Complete your payment to claim your item.`,
        /** Category */
        category: "auction",
      },
      {
        /** Type */
        type: "auction_ending",
        /** Title */
        title: "Auction Ending Soon",
        /** Get Message */
        getMessage: (auctionName: any) =>
          `The auction for "${auctionName}" is ending in 1 hour. Don't miss out!`,
        /** Category */
        category: "auction",
      },
      {
        /** Type */
        type: "product_back_in_stock",
        /** Title */
        title: "Product Back in Stock",
        /** Get Message */
        getMessage: (productName: any) =>
          `Good news! "${productName}" from your wishlist is back in stock.`,
        /** Category */
        category: "product",
      },
      {
        /** Type */
        type: "price_drop",
        /** Title */
        title: "Price Drop Alert",
        /** Get Message */
        getMessage: (productName: any) =>
          `The price of "${productName}" has dropped. Get it now!`,
        /** Category */
        category: "product",
      },
      {
        /** Type */
        type: "return_approved",
        /** Title */
        title: "Return Request Approved",
        /** Get Message */
        getMessage: (orderId: any) =>
          `Your return request for order #${orderId} has been approved.`,
        /** Category */
        category: "return",
      },
      {
        /** Type */
        type: "refund_processed",
        /** Title */
        title: "Refund Processed",
        /** Get Message */
        getMessage: (amount: any) =>
          `A refund of ₹${amount} has been processed to your account.`,
        /** Category */
        category: "payment",
      },
      {
        /** Type */
        type: "coupon_expiring",
        /** Title */
        title: "Coupon Expiring Soon",
        /** Get Message */
        getMessage: (couponCode: any) =>
          `Your coupon "${couponCode}" is expiring in 3 days. Use it now!`,
        /** Category */
        category: "promotion",
      },
      {
        /** Type */
        type: "new_message",
        /** Title */
        title: "New Message",
        /** Get Message */
        getMessage: (shopName: any) =>
          `You have a new message from ${shopName}.`,
        /** Category */
        category: "message",
      },
      {
        /** Type */
        type: "review_reminder",
        /** Title */
        title: "Review Your Purchase",
        /** Get Message */
        getMessage: (productName: any) =>
          `How was your experience with "${productName}"? Leave a review!`,
        /** Category */
        category: "review",
      },
      {
        /** Type */
        type: "payment_reminder",
        /** Title */
        title: "Payment Reminder",
        /** Get Message */
        getMessage: (orderId: any) =>
          `Payment for order #${orderId} is pending. Complete it to confirm your order.`,
        /** Category */
        category: "payment",
      },
    ];

    const notifications = [];
    let notificationCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userRole = userDoc.data().role || "user";

      // Generate random notifications per user
      const numNotifications = Math.min(
        notificationsPerUser,
        faker.number.int({ min: 3, max: 10 }),
      );

      for (let i = 0; i < numNotifications; i++) {
        const template = faker.helpers.arrayElement(notificationTemplates);

        // Generate contextual data
        const orderId = `ORD${faker.number.int({ min: 1000, max: 9999 })}`;
        const auctionName = faker.commerce.productName();
        const productName = faker.commerce.productName();
        const shopName = faker.company.name();
        const couponCode = faker.string
          .alphanumeric({ length: 8 })
          .toUpperCase();
        const amount = faker.number.int({ min: 500, max: 5000 });

        // Generate message based on template
        let message = template.getMessage(orderId);
        if (template.type.includes("auction")) {
          message = template.getMessage(auctionName);
        } else if (
          template.type.includes("product") ||
          template.type.includes("review")
        ) {
          message = template.getMessage(productName);
        } else if (template.type.includes("message")) {
          message = template.getMessage(shopName);
        } else if (template.type.includes("coupon")) {
          message = template.getMessage(couponCode);
        } else if (template.type.includes("refund")) {
          message = template.getMessage(amount);
        }

        // Random timestamp within last 30 days
        const daysAgo = faker.number.int({ min: 0, max: 30 });
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        const notificationData = {
          /** Id */
          id: `${PREFIX}notification_${Date.now()}_${notificationCount + 1}`,
          /** User Id */
          userId: userId,
          /** Type */
          type: template.type,
          /** Category */
          category: template.category,
          /** Title */
          title: template.title,
          /** Message */
          message: message,

          // Metadata
          /** Data */
          data: {
            /** Order Id */
            orderId:
              template.category === "order" || template.category === "return"
                ? orderId
                : undefined,
            /** Auction Id */
            auctionId:
              template.category === "auction"
                ? `${PREFIX}auction_${faker.string.alphanumeric(8)}`
                : undefined,
            /** Product Id */
            productId: template.type.includes("product")
              ? `${PREFIX}product_${faker.string.alphanumeric(8)}`
              : undefined,
          },

          // Status
          isRead: Math.random() < 0.4, // 40% read
          isArchived: Math.random() < 0.1, // 10% archived

          // Priority
          /** Priority */
          priority: faker.helpers.arrayElement(["low", "medium", "high"]),

          // Delivery channels
          /** Channels */
          channels: {
            /** Push */
            push: true,
            /** Email */
            email: Math.random() < 0.5,
            /** Sms */
            sms: Math.random() < 0.2,
          },

          // Timestamps
          /** Created At */
          createdAt: createdAt.toISOString(),
          /** Read At */
          readAt: Math.random() < 0.4 ? new Date().toISOString() : null,
        };

        await db.collection(COLLECTIONS.NOTIFICATIONS).add(notificationData);
        notifications.push({
          /** Id */
          id: notificationData.id,
          /** Type */
          type: notificationData.type,
          /** Title */
          title: notificationData.title,
          /** Is Read */
          isRead: notificationData.isRead,
        });
        notificationCount++;
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Count */
      count: notificationCount,
      /** Users Processed */
      usersProcessed: usersSnapshot.docs.length,
      notifications: notifications.slice(0, 20), // Return first 20 for preview
    });
  } catch (error: any) {
    console.error("Error generating notifications:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to generate notifications",
      },
      { status: 500 },
    );
  }
}
