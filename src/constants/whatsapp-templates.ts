/**
 * WhatsApp Message Templates
 * Task 1.4.2 - WhatsApp Templates
 *
 * Predefined message templates for WhatsApp notifications
 * Used by WhatsApp service for consistent messaging
 *
 * @see src/services/whatsapp.service.ts
 */

// ============================================================================
// TYPES
// ============================================================================

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: "ORDER" | "AUCTION" | "ACCOUNT" | "MARKETING" | "SUPPORT";
  language: string;
  body: string;
  variables: string[];
  footer?: string;
  buttons?: WhatsAppButton[];
}

export interface WhatsAppButton {
  type: "CALL" | "URL" | "QUICK_REPLY";
  text: string;
  data?: string; // Phone number for CALL, URL for URL
}

// ============================================================================
// ORDER TEMPLATES
// ============================================================================

export const ORDER_PLACED_TEMPLATE: WhatsAppTemplate = {
  id: "order_placed",
  name: "Order Placed",
  category: "ORDER",
  language: "en",
  body: `Hi {{1}},

Your order #{{2}} has been successfully placed! 🎉

Order Details:
• Amount: ₹{{3}}
• Items: {{4}}
• Delivery to: {{5}}

Track your order: {{6}}

Thank you for shopping with us!`,
  variables: ["name", "orderId", "amount", "items", "address", "trackingUrl"],
  footer: "Letitrip.in - Your trusted marketplace",
  buttons: [
    { type: "URL", text: "Track Order", data: "{{trackingUrl}}" },
    { type: "CALL", text: "Contact Support", data: "+91XXXXXXXXXX" },
  ],
};

export const ORDER_CONFIRMED_TEMPLATE: WhatsAppTemplate = {
  id: "order_confirmed",
  name: "Order Confirmed",
  category: "ORDER",
  language: "en",
  body: `Hi {{1}},

Great news! Your order #{{2}} has been confirmed by the seller.

Expected Delivery: {{3}}
Shipping Method: {{4}}

We'll notify you once it's shipped.`,
  variables: ["name", "orderId", "deliveryDate", "shippingMethod"],
};

export const ORDER_SHIPPED_TEMPLATE: WhatsAppTemplate = {
  id: "order_shipped",
  name: "Order Shipped",
  category: "ORDER",
  language: "en",
  body: `Hi {{1}},

Your order #{{2}} has been shipped! 📦

Tracking Details:
• Courier: {{3}}
• AWB: {{4}}
• Expected Delivery: {{5}}

Track here: {{6}}`,
  variables: [
    "name",
    "orderId",
    "courier",
    "awb",
    "deliveryDate",
    "trackingUrl",
  ],
  buttons: [{ type: "URL", text: "Track Shipment", data: "{{trackingUrl}}" }],
};

export const ORDER_DELIVERED_TEMPLATE: WhatsAppTemplate = {
  id: "order_delivered",
  name: "Order Delivered",
  category: "ORDER",
  language: "en",
  body: `Hi {{1}},

Your order #{{2}} has been delivered successfully! ✅

We hope you love your purchase. Please share your feedback by leaving a review.`,
  variables: ["name", "orderId"],
  buttons: [{ type: "URL", text: "Write Review", data: "{{reviewUrl}}" }],
};

export const ORDER_CANCELLED_TEMPLATE: WhatsAppTemplate = {
  id: "order_cancelled",
  name: "Order Cancelled",
  category: "ORDER",
  language: "en",
  body: `Hi {{1}},

Your order #{{2}} has been cancelled.

Reason: {{3}}
Refund Amount: ₹{{4}}
Refund Status: {{5}}

If you have any questions, please contact support.`,
  variables: ["name", "orderId", "reason", "refundAmount", "refundStatus"],
};

// ============================================================================
// AUCTION TEMPLATES
// ============================================================================

export const AUCTION_BID_PLACED_TEMPLATE: WhatsAppTemplate = {
  id: "auction_bid_placed",
  name: "Bid Placed",
  category: "AUCTION",
  language: "en",
  body: `Hi {{1}},

Your bid of ₹{{2}} on "{{3}}" has been placed successfully! 🎯

Current Status: {{4}}
Auction Ends: {{5}}

View auction: {{6}}`,
  variables: ["name", "bidAmount", "productName", "status", "endTime", "url"],
  buttons: [{ type: "URL", text: "View Auction", data: "{{url}}" }],
};

export const AUCTION_OUTBID_TEMPLATE: WhatsAppTemplate = {
  id: "auction_outbid",
  name: "Outbid Notification",
  category: "AUCTION",
  language: "en",
  body: `Hi {{1}},

You've been outbid on "{{2}}"! 😢

Your Bid: ₹{{3}}
Current Highest: ₹{{4}}
Time Remaining: {{5}}

Place a higher bid to stay in the game!`,
  variables: ["name", "productName", "yourBid", "currentBid", "timeLeft"],
  buttons: [{ type: "URL", text: "Bid Now", data: "{{url}}" }],
};

export const AUCTION_WINNING_TEMPLATE: WhatsAppTemplate = {
  id: "auction_winning",
  name: "Winning Bid",
  category: "AUCTION",
  language: "en",
  body: `Hi {{1}},

You're currently winning "{{2}}"! 🏆

Your Bid: ₹{{3}}
Time Remaining: {{4}}

Keep an eye on it - others might bid higher!`,
  variables: ["name", "productName", "bidAmount", "timeLeft"],
};

export const AUCTION_WON_TEMPLATE: WhatsAppTemplate = {
  id: "auction_won",
  name: "Auction Won",
  category: "AUCTION",
  language: "en",
  body: `Congratulations {{1}}! 🎉

You won the auction for "{{2}}"!

Winning Bid: ₹{{3}}
Order #{{4}}

Please complete the payment within 24 hours to confirm your order.`,
  variables: ["name", "productName", "bidAmount", "orderId"],
  buttons: [{ type: "URL", text: "Complete Payment", data: "{{paymentUrl}}" }],
};

export const AUCTION_LOST_TEMPLATE: WhatsAppTemplate = {
  id: "auction_lost",
  name: "Auction Lost",
  category: "AUCTION",
  language: "en",
  body: `Hi {{1}},

The auction for "{{2}}" has ended.

Your Bid: ₹{{3}}
Winning Bid: ₹{{4}}

Better luck next time! Browse more auctions: {{5}}`,
  variables: ["name", "productName", "yourBid", "winningBid", "browseUrl"],
};

export const AUCTION_ENDING_SOON_TEMPLATE: WhatsAppTemplate = {
  id: "auction_ending_soon",
  name: "Auction Ending Soon",
  category: "AUCTION",
  language: "en",
  body: `Hi {{1}},

The auction for "{{2}}" is ending soon! ⏰

Current Bid: ₹{{3}}
Ending In: {{4}}
Your Status: {{5}}

Last chance to bid!`,
  variables: ["name", "productName", "currentBid", "timeLeft", "status"],
  buttons: [{ type: "URL", text: "View Auction", data: "{{url}}" }],
};

// ============================================================================
// ACCOUNT TEMPLATES
// ============================================================================

export const WELCOME_TEMPLATE: WhatsAppTemplate = {
  id: "welcome",
  name: "Welcome Message",
  category: "ACCOUNT",
  language: "en",
  body: `Welcome to Letitrip {{1}}! 🎉

Thank you for joining India's most trusted auction & e-commerce platform.

Start exploring:
• Browse products
• Join live auctions
• Open your own shop

Need help? Our support team is here for you 24/7.`,
  variables: ["name"],
  buttons: [
    { type: "URL", text: "Start Shopping", data: "{{shopUrl}}" },
    { type: "URL", text: "Browse Auctions", data: "{{auctionUrl}}" },
  ],
};

export const OTP_VERIFICATION_TEMPLATE: WhatsAppTemplate = {
  id: "otp_verification",
  name: "OTP Verification",
  category: "ACCOUNT",
  language: "en",
  body: `Hi {{1}},

Your OTP for Letitrip verification is: *{{2}}*

Valid for 10 minutes. Do not share this OTP with anyone.`,
  variables: ["name", "otp"],
  footer: "This is an auto-generated message. Please do not reply.",
};

export const PASSWORD_RESET_TEMPLATE: WhatsAppTemplate = {
  id: "password_reset",
  name: "Password Reset",
  category: "ACCOUNT",
  language: "en",
  body: `Hi {{1}},

We received a request to reset your password.

Click here to reset: {{2}}

If you didn't request this, please ignore this message.

Link expires in 1 hour.`,
  variables: ["name", "resetUrl"],
  buttons: [{ type: "URL", text: "Reset Password", data: "{{resetUrl}}" }],
};

// ============================================================================
// MARKETING TEMPLATES
// ============================================================================

export const NEW_ARRIVAL_TEMPLATE: WhatsAppTemplate = {
  id: "new_arrival",
  name: "New Arrivals",
  category: "MARKETING",
  language: "en",
  body: `Hi {{1}}! 🆕

Check out our latest arrivals in {{2}}:

{{3}}

Limited stock available. Shop now before they're gone!`,
  variables: ["name", "category", "products"],
  buttons: [{ type: "URL", text: "Shop Now", data: "{{shopUrl}}" }],
};

export const FLASH_SALE_TEMPLATE: WhatsAppTemplate = {
  id: "flash_sale",
  name: "Flash Sale",
  category: "MARKETING",
  language: "en",
  body: `⚡ FLASH SALE ALERT ⚡

Hi {{1}},

Get {{2}}% OFF on {{3}}!

Sale ends: {{4}}

Hurry! Limited time only.`,
  variables: ["name", "discount", "category", "endTime"],
  buttons: [{ type: "URL", text: "Shop Sale", data: "{{saleUrl}}" }],
};

export const ABANDONED_CART_TEMPLATE: WhatsAppTemplate = {
  id: "abandoned_cart",
  name: "Abandoned Cart",
  category: "MARKETING",
  language: "en",
  body: `Hi {{1}},

You left {{2}} items in your cart 🛒

Total: ₹{{3}}

Complete your purchase now and get FREE shipping on orders above ₹500!`,
  variables: ["name", "itemCount", "amount"],
  buttons: [{ type: "URL", text: "Complete Order", data: "{{cartUrl}}" }],
};

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

export const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplate> = {
  // Orders
  ORDER_PLACED: ORDER_PLACED_TEMPLATE,
  ORDER_CONFIRMED: ORDER_CONFIRMED_TEMPLATE,
  ORDER_SHIPPED: ORDER_SHIPPED_TEMPLATE,
  ORDER_DELIVERED: ORDER_DELIVERED_TEMPLATE,
  ORDER_CANCELLED: ORDER_CANCELLED_TEMPLATE,

  // Auctions
  AUCTION_BID_PLACED: AUCTION_BID_PLACED_TEMPLATE,
  AUCTION_OUTBID: AUCTION_OUTBID_TEMPLATE,
  AUCTION_WINNING: AUCTION_WINNING_TEMPLATE,
  AUCTION_WON: AUCTION_WON_TEMPLATE,
  AUCTION_LOST: AUCTION_LOST_TEMPLATE,
  AUCTION_ENDING_SOON: AUCTION_ENDING_SOON_TEMPLATE,

  // Account
  WELCOME: WELCOME_TEMPLATE,
  OTP_VERIFICATION: OTP_VERIFICATION_TEMPLATE,
  PASSWORD_RESET: PASSWORD_RESET_TEMPLATE,

  // Marketing
  NEW_ARRIVAL: NEW_ARRIVAL_TEMPLATE,
  FLASH_SALE: FLASH_SALE_TEMPLATE,
  ABANDONED_CART: ABANDONED_CART_TEMPLATE,
};

/**
 * Get template by ID
 */
export function getWhatsAppTemplate(id: string): WhatsAppTemplate | undefined {
  return WHATSAPP_TEMPLATES[id];
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: WhatsAppTemplate["category"]
): WhatsAppTemplate[] {
  return Object.values(WHATSAPP_TEMPLATES).filter(
    (t) => t.category === category
  );
}

/**
 * Format template with variables
 */
export function formatTemplate(
  template: WhatsAppTemplate,
  variables: Record<string, string>
): string {
  let message = template.body;

  // Replace variables ({{1}}, {{2}}, etc.)
  template.variables.forEach((varName, index) => {
    const placeholder = `{{${index + 1}}}`;
    // Escape special regex characters in placeholder
    const escapedPlaceholder = placeholder.replace(/[{}]/g, "\\$&");
    message = message.replace(
      new RegExp(escapedPlaceholder, "g"),
      variables[varName] || ""
    );
  });

  return message;
}
