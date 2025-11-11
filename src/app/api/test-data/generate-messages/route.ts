import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { faker } from "@faker-js/faker";

const PREFIX = "TEST_";

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
        success: false,
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
        success: false,
        error: "No test shops found. Please generate shops first.",
      });
    }

    const users = usersSnapshot.docs;
    const shops = shopsSnapshot.docs;

    const messageTemplates = [
      // Product inquiries
      {
        category: "product_inquiry",
        customerMessages: [
          "Hi, is this product still available?",
          "What are the dimensions of this item?",
          "Can you provide more photos of the product?",
          "Is this item brand new or refurbished?",
          "What's the warranty period?",
        ],
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
        category: "shipping",
        customerMessages: [
          "How long will shipping take to Mumbai?",
          "Do you offer express delivery?",
          "Can I track my order?",
          "What courier service do you use?",
          "Is there a delivery charge?",
        ],
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
        category: "price_negotiation",
        customerMessages: [
          "Can you offer any discount on this?",
          "Is this your best price?",
          "I'm buying 2 units, can you give me a better deal?",
          "Do you have any ongoing offers?",
          "Can you match the competitor's price?",
        ],
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
        category: "order_support",
        customerMessages: [
          "I haven't received my order yet. Can you check the status?",
          "The product I received is damaged.",
          "I want to return this item.",
          "Can I cancel my order?",
          "The tracking shows delivered but I didn't receive it.",
        ],
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
        category: "auction",
        customerMessages: [
          "What's the minimum bid increment?",
          "When does this auction end?",
          "Can I inspect the item before bidding?",
          "What happens if I win the auction?",
          "Is there a reserve price?",
        ],
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
        category: "payment",
        customerMessages: [
          "My payment failed but amount was deducted.",
          "What payment methods do you accept?",
          "Can I pay cash on delivery?",
          "Is it safe to pay online on your site?",
          "Can I pay in installments?",
        ],
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
        id: conversationId,
        customerId: customer.id,
        shopId: shop.id,
        sellerId: shop.data().owner_id,
        category: template.category,
        status: faker.helpers.arrayElement(["active", "closed", "resolved"]),
        lastMessageAt: new Date().toISOString(),
        createdAt: faker.date.recent({ days: 30 }).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db
        .collection(COLLECTIONS.SUPPORT_TICKETS)
        .doc(conversationId)
        .set(conversationData);

      // Generate messages in the conversation
      const numMessages = faker.number.int({
        min: messagesPerConversation,
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
          id: `${PREFIX}message_${Date.now()}_${messageCount + 1}`,
          conversationId: conversationId,
          senderId: isCustomerMessage ? customer.id : shop.data().owner_id,
          senderType: isCustomerMessage ? "customer" : "seller",
          recipientId: isCustomerMessage ? shop.data().owner_id : customer.id,
          recipientType: isCustomerMessage ? "seller" : "customer",
          message: messageText,
          isRead: j < numMessages - 2 || Math.random() < 0.7, // Most messages read except last couple
          readAt: j < numMessages - 2 ? new Date().toISOString() : null,
          attachments: [], // No attachments for now
          createdAt: messageDate.toISOString(),
        };

        await db.collection(COLLECTIONS.TICKET_MESSAGES).add(messageData);

        messages.push({
          id: messageData.id,
          sender: isCustomerMessage ? "customer" : "seller",
          preview: messageText.substring(0, 50) + "...",
        });

        messageCount++;
      }

      conversations.push({
        id: conversationId,
        category: template.category,
        messagesCount: numMessages,
        status: conversationData.status,
      });

      conversationCount++;
    }

    return NextResponse.json({
      success: true,
      conversationsCreated: conversationCount,
      messagesCreated: messageCount,
      conversations: conversations.slice(0, 10), // Return first 10 for preview
    });
  } catch (error: any) {
    console.error("Error generating messages:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate messages",
      },
      { status: 500 }
    );
  }
}
