/**
 * @fileoverview TypeScript Module
 * @module src/app/api/test-data/generate-messages/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
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
    const { messagesPerConversation = 5 } = await req.json();
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

    // Get all test shops
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("name", ">=", PREFIX)
      .where("name", "<=", PREFIX + "\uf8ff")
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json({
        /** Success */
        success: false,
        /** Error */
        error: "No test shops found. Please generate shops first.",
      });
    }

    const users = usersSnapshot.docs;
    const shops = shopsSnapshot.docs;

    const messageTemplates = [
      // Product inquiries
      {
        /** Category */
        category: "product_inquiry",
        /** Customer Messages */
        customerMessages: [
          "Hi, is this product still available?",
          "What are the dimensions of this item?",
          "Can you provide more photos of the product?",
          "Is this item brand new or refurbished?",
          "What's the warranty period?",
        ],
        /** Seller Messages */
        sellerMessages: [
          "Yes, the product is in stock and ready to ship!",
          "The dimensions are listed in the description. Let me know if you need anything specific.",
          "I can send you additional photos. What angle would you like to see?",
          "This is a brand new item with full manufacturer warranty.",
          "We provide 1 year warranty on all our products.",
        ],
      },
      // Shipping inquiries
      {
        /** Category */
        category: "shipping",
        /** Customer Messages */
        customerMessages: [
          "How long will shipping take to Mumbai?",
          "Do you offer express delivery?",
          "Can I track my order?",
          "What courier service do you use?",
          "Is there a delivery charge?",
        ],
        /** Seller Messages */
        sellerMessages: [
          "Shipping to Mumbai typically takes 3-5 business days.",
          "Yes, we offer express delivery for an additional charge.",
          "You'll receive a tracking number once the order ships.",
          "We use trusted couriers like BlueDart and Delhivery.",
          "Free delivery on orders above ₹999.",
        ],
      },
      // Price negotiation
      {
        /** Category */
        category: "price_negotiation",
        /** Customer Messages */
        customerMessages: [
          "Can you offer any discount on this?",
          "Is this your best price?",
          "I'm buying 2 units, can you give me a better deal?",
          "Do you have any ongoing offers?",
          "Can you match the competitor's price?",
        ],
        /** Seller Messages */
        sellerMessages: [
          "I can offer you 10% off if you order today.",
          "This is already our best price, but I can throw in free shipping.",
          "For bulk orders, I can give you 15% discount.",
          "We have a festive sale running - use code FEST10.",
          "Let me check what I can do for you. What's the competitor's price?",
        ],
      },
      // Order support
      {
        /** Category */
        category: "order_support",
        /** Customer Messages */
        customerMessages: [
          "I haven't received my order yet. Can you check the status?",
          "The product I received is damaged.",
          "I want to return this item.",
          "Can I cancel my order?",
          "The tracking shows delivered but I didn't receive it.",
        ],
        /** Seller Messages */
        sellerMessages: [
          "Let me check the tracking details for you right away.",
          "I'm sorry to hear that. Please share photos and we'll process a replacement.",
          "Sure, you can return within 7 days. I'll initiate the process.",
          "I can cancel the order if it hasn't shipped yet.",
          "Let me contact the courier partner to investigate this.",
        ],
      },
      // Auction inquiries
      {
        /** Category */
        category: "auction",
        /** Customer Messages */
        customerMessages: [
          "What's the minimum bid increment?",
          "When does this auction end?",
          "Can I inspect the item before bidding?",
          "What happens if I win the auction?",
          "Is there a reserve price?",
        ],
        /** Seller Messages */
        sellerMessages: [
          "Minimum bid increment is ₹100.",
          "This auction ends on [date] at 6 PM IST.",
          "Unfortunately, inspection is not possible before the auction.",
          "If you win, you'll need to complete payment within 24 hours.",
          "Yes, there's a reserve price that must be met.",
        ],
      },
      // Payment issues
      {
        /** Category */
        category: "payment",
        /** Customer Messages */
        customerMessages: [
          "My payment failed but amount was deducted.",
          "What payment methods do you accept?",
          "Can I pay cash on delivery?",
          "Is it safe to pay online on your site?",
          "Can I pay in installments?",
        ],
        /** Seller Messages */
        sellerMessages: [
          "Don't worry, the amount will be refunded in 3-5 business days.",
          "We accept UPI, cards, net banking, and wallets.",
          "Yes, COD is available for orders below ₹5000.",
          "Absolutely! We use secure payment gateways.",
          "We offer EMI options on orders above ₹10,000.",
        ],
      },
    ];

    const conversations = [];
    let messageCount = 0;
    let conversationCount = 0;

    // Create conversations between random customers and shops
    const numConversations = Math.min(users.length * 2, shops.length * 3, 50);

    for (let i = 0; i < numConversations; i++) {
      const customer = faker.helpers.arrayElement(users);
      const shop = faker.helpers.arrayElement(shops);
      const template = faker.helpers.arrayElement(messageTemplates);

      const conversationId = `${PREFIX}conversation_${Date.now()}_${
        conversationCount + 1
      }`;

      // Create conversation document
      const conversationData = {
        /** Id */
        id: conversationId,
        /** Customer Id */
        customerId: customer.id,
        /** Shop Id */
        shopId: shop.id,
        /** Seller Id */
        sellerId: shop.data().owner_id,
        /** Category */
        category: template.category,
        /** Status */
        status: faker.helpers.arrayElement(["active", "closed", "resolved"]),
        /** Last Message At */
        lastMessageAt: new Date().toISOString(),
        /** Created At */
        createdAt: faker.date.recent({ days: 30 }).toISOString(),
        /** Updated At */
        updatedAt: new Date().toISOString(),
      };

      await db
        .collection(COLLECTIONS.SUPPORT_TICKETS)
        .doc(conversationId)
        .set(conversationData);

      // Generate messages in the conversation
      const numMessages = faker.number.int({
        /** Min */
        min: messagesPerConversation,
        /** Max */
        max: messagesPerConversation + 3,
      });

      const messages = [];

      for (let j = 0; j < numMessages; j++) {
        const isCustomerMessage = j % 2 === 0;
        const messageText = isCustomerMessage
          ? faker.helpers.arrayElement(template.customerMessages)
          : faker.helpers.arrayElement(template.sellerMessages);

        // Calculate timestamp (spread messages over last 7 days)
        const daysAgo = faker.number.int({ min: 0, max: 7 });
        const hoursAgo = faker.number.int({ min: 0, max: 24 });
        const messageDate = new Date();
        messageDate.setDate(messageDate.getDate() - daysAgo);
        messageDate.setHours(messageDate.getHours() - hoursAgo);

        const messageData = {
          /** Id */
          id: `${PREFIX}message_${Date.now()}_${messageCount + 1}`,
          /** Conversation Id */
          conversationId: conversationId,
          /** Sender Id */
          senderId: isCustomerMessage ? customer.id : shop.data().owner_id,
          /** Sender Type */
          senderType: isCustomerMessage ? "customer" : "seller",
          /** Recipient Id */
          recipientId: isCustomerMessage ? shop.data().owner_id : customer.id,
          /** Recipient Type */
          recipientType: isCustomerMessage ? "seller" : "customer",
          /** Message */
          message: messageText,
          isRead: j < numMessages - 2 || Math.random() < 0.7, // Most messages read except last couple
          /** Read At */
          readAt: j < numMessages - 2 ? new Date().toISOString() : null,
          attachments: [], // No attachments for now
          /** Created At */
          createdAt: messageDate.toISOString(),
        };

        await db.collection(COLLECTIONS.TICKET_MESSAGES).add(messageData);

        messages.push({
          /** Id */
          id: messageData.id,
          /** Sender */
          sender: isCustomerMessage ? "customer" : "seller",
          /** Preview */
          preview: messageText.substring(0, 50) + "...",
        });

        messageCount++;
      }

      conversations.push({
        /** Id */
        id: conversationId,
        /** Category */
        category: template.category,
        /** Messages Count */
        messagesCount: numMessages,
        /** Status */
        status: conversationData.status,
      });

      conversationCount++;
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Conversations Created */
      conversationsCreated: conversationCount,
      /** Messages Created */
      messagesCreated: messageCount,
      conversations: conversations.slice(0, 10), // Return first 10 for preview
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.testData.generateMessages",
    });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to generate messages",
      },
      { status: 500 }
    );
  }
}
