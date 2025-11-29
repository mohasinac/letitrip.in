import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { faker } from "@faker-js/faker";

const PREFIX = "TEST_";

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
        success: false,
        error: "No test users found. Please generate users first.",
      });
    }

    const notificationTemplates: Array<{
      type: string;
      title: string;
      getMessage: (param: any) => string;
      category: string;
    }> = [
      {
        type: "order_placed",
        title: "Order Placed Successfully",
        getMessage: (orderId: any) =>
          `Your order #${orderId} has been placed successfully and is being processed.`,
        category: "order",
      },
      {
        type: "order_shipped",
        title: "Order Shipped",
        getMessage: (orderId: any) =>
          `Great news! Your order #${orderId} has been shipped and is on its way.`,
        category: "order",
      },
      {
        type: "order_delivered",
        title: "Order Delivered",
        getMessage: (orderId: any) =>
          `Your order #${orderId} has been delivered successfully. Enjoy your purchase!`,
        category: "order",
      },
      {
        type: "bid_placed",
        title: "Bid Placed",
        getMessage: (auctionName: any) =>
          `Your bid on "${auctionName}" has been placed successfully.`,
        category: "auction",
      },
      {
        type: "bid_outbid",
        title: "You've Been Outbid",
        getMessage: (auctionName: any) =>
          `Someone has placed a higher bid on "${auctionName}". Place a new bid to stay in the game!`,
        category: "auction",
      },
      {
        type: "auction_won",
        title: "Congratulations! You Won",
        getMessage: (auctionName: any) =>
          `You've won the auction for "${auctionName}". Complete your payment to claim your item.`,
        category: "auction",
      },
      {
        type: "auction_ending",
        title: "Auction Ending Soon",
        getMessage: (auctionName: any) =>
          `The auction for "${auctionName}" is ending in 1 hour. Don't miss out!`,
        category: "auction",
      },
      {
        type: "product_back_in_stock",
        title: "Product Back in Stock",
        getMessage: (productName: any) =>
          `Good news! "${productName}" from your wishlist is back in stock.`,
        category: "product",
      },
      {
        type: "price_drop",
        title: "Price Drop Alert",
        getMessage: (productName: any) =>
          `The price of "${productName}" has dropped. Get it now!`,
        category: "product",
      },
      {
        type: "return_approved",
        title: "Return Request Approved",
        getMessage: (orderId: any) =>
          `Your return request for order #${orderId} has been approved.`,
        category: "return",
      },
      {
        type: "refund_processed",
        title: "Refund Processed",
        getMessage: (amount: any) =>
          `A refund of ₹${amount} has been processed to your account.`,
        category: "payment",
      },
      {
        type: "coupon_expiring",
        title: "Coupon Expiring Soon",
        getMessage: (couponCode: any) =>
          `Your coupon "${couponCode}" is expiring in 3 days. Use it now!`,
        category: "promotion",
      },
      {
        type: "new_message",
        title: "New Message",
        getMessage: (shopName: any) =>
          `You have a new message from ${shopName}.`,
        category: "message",
      },
      {
        type: "review_reminder",
        title: "Review Your Purchase",
        getMessage: (productName: any) =>
          `How was your experience with "${productName}"? Leave a review!`,
        category: "review",
      },
      {
        type: "payment_reminder",
        title: "Payment Reminder",
        getMessage: (orderId: any) =>
          `Payment for order #${orderId} is pending. Complete it to confirm your order.`,
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
          id: `${PREFIX}notification_${Date.now()}_${notificationCount + 1}`,
          userId: userId,
          type: template.type,
          category: template.category,
          title: template.title,
          message: message,

          // Metadata
          data: {
            orderId:
              template.category === "order" || template.category === "return"
                ? orderId
                : undefined,
            auctionId:
              template.category === "auction"
                ? `${PREFIX}auction_${faker.string.alphanumeric(8)}`
                : undefined,
            productId: template.type.includes("product")
              ? `${PREFIX}product_${faker.string.alphanumeric(8)}`
              : undefined,
          },

          // Status
          isRead: Math.random() < 0.4, // 40% read
          isArchived: Math.random() < 0.1, // 10% archived

          // Priority
          priority: faker.helpers.arrayElement(["low", "medium", "high"]),

          // Delivery channels
          channels: {
            push: true,
            email: Math.random() < 0.5,
            sms: Math.random() < 0.2,
          },

          // Timestamps
          createdAt: createdAt.toISOString(),
          readAt: Math.random() < 0.4 ? new Date().toISOString() : null,
        };

        await db.collection(COLLECTIONS.NOTIFICATIONS).add(notificationData);
        notifications.push({
          id: notificationData.id,
          type: notificationData.type,
          title: notificationData.title,
          isRead: notificationData.isRead,
        });
        notificationCount++;
      }
    }

    return NextResponse.json({
      success: true,
      count: notificationCount,
      usersProcessed: usersSnapshot.docs.length,
      notifications: notifications.slice(0, 20), // Return first 20 for preview
    });
  } catch (error: any) {
    console.error("Error generating notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate notifications",
      },
      { status: 500 },
    );
  }
}
