/**
 * @fileoverview TypeScript Module
 * @module src/constants/whatsapp-templates
 * @description This file contains functionality related to whatsapp-templates
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * WhatsAppTemplate interface
 * 
 * @interface
 * @description Defines the structure and contract for WhatsAppTemplate
 */
export interface WhatsAppTemplate {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Category */
  category: "ORDER" | "AUCTION" | "ACCOUNT" | "MARKETING" | "SUPPORT";
  /** Language */
  language: string;
  /** Body */
  body: string;
  /** Variables */
  variables: string[];
  /** Footer */
  footer?: string;
  /** Buttons */
  buttons?: WhatsAppButton[];
}

/**
 * WhatsAppButton interface
 * 
 * @interface
 * @description Defines the structure and contract for WhatsAppButton
 */
export interface WhatsAppButton {
  /** Type */
  type: "CALL" | "URL" | "QUICK_REPLY";
  /** Text */
  text: string;
  data?: string; // Phone number for CALL, URL for URL
}

// ============================================================================
// ORDER TEMPLATES
// ============================================================================

/**
 * Order Placed Template
 * @constant
 */
export const ORDER_PLACED_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "order_placed",
  /** Name */
  name: "Order Placed",
  /** Category */
  category: "ORDER",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

Your order #{{2}} has been successfully placed! 🎉

Order Details:
• Amount: ₹{{3}}
• Items: {{4}}
• Delivery to: {{5}}

Track your order: {{6}}

Thank you for shopping with us!`,
  /** Variables */
  variables: ["name", "orderId", "amount", "items", "address", "trackingUrl"],
  /** Footer */
  footer: "Letitrip.in - Your trusted marketplace",
  /** Buttons */
  buttons: [
    { type: "URL", text: "Track Order", data: "{{trackingUrl}}" },
    { type: "CALL", text: "Contact Support", data: "+91XXXXXXXXXX" },
  ],
};

/**
 * Order Confirmed Template
 * @constant
 */
export const ORDER_CONFIRMED_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "order_confirmed",
  /** Name */
  name: "Order Confirmed",
  /** Category */
  category: "ORDER",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

Great news! Your order #{{2}} has been confirmed by the seller.

Expected Delivery: {{3}}
Shipping Method: {{4}}

We'll notify you once it's shipped.`,
  /** Variables */
  variables: ["name", "orderId", "deliveryDate", "shippingMethod"],
};

/**
 * Order Shipped Template
 * @constant
 */
export const ORDER_SHIPPED_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "order_shipped",
  /** Name */
  name: "Order Shipped",
  /** Category */
  category: "ORDER",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

Your order #{{2}} has been shipped! 📦

Tracking Details:
• Courier: {{3}}
• AWB: {{4}}
• Expected Delivery: {{5}}

Track here: {{6}}`,
  /** Variables */
  variables: [
    "name",
    "orderId",
    "courier",
    "awb",
    "deliveryDate",
    "trackingUrl",
  ],
  /** Buttons */
  buttons: [{ type: "URL", text: "Track Shipment", data: "{{trackingUrl}}" }],
};

/**
 * Order Delivered Template
 * @constant
 */
export const ORDER_DELIVERED_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "order_delivered",
  /** Name */
  name: "Order Delivered",
  /** Category */
  category: "ORDER",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

Your order #{{2}} has been delivered successfully! ✅

We hope you love your purchase. Please share your feedback by leaving a review.`,
  /** Variables */
  variables: ["name", "orderId"],
  /** Buttons */
  buttons: [{ type: "URL", text: "Write Review", data: "{{reviewUrl}}" }],
};

/**
 * Order Cancelled Template
 * @constant
 */
export const ORDER_CANCELLED_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "order_cancelled",
  /** Name */
  name: "Order Cancelled",
  /** Category */
  category: "ORDER",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

Your order #{{2}} has been cancelled.

Reason: {{3}}
Refund Amount: ₹{{4}}
Refund Status: {{5}}

If you have any questions, please contact support.`,
  /** Variables */
  variables: ["name", "orderId", "reason", "refundAmount", "refundStatus"],
};

// ============================================================================
// AUCTION TEMPLATES
// ============================================================================

/**
 * Auction Bid Placed Template
 * @constant
 */
export const AUCTION_BID_PLACED_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "auction_bid_placed",
  /** Name */
  name: "Bid Placed",
  /** Category */
  category: "AUCTION",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

Your bid of ₹{{2}} on "{{3}}" has been placed successfully! 🎯

Current Status: {{4}}
Auction Ends: {{5}}

View auction: {{6}}`,
  /** Variables */
  variables: ["name", "bidAmount", "productName", "status", "endTime", "url"],
  /** Buttons */
  buttons: [{ type: "URL", text: "View Auction", data: "{{url}}" }],
};

/**
 * Auction Outbid Template
 * @constant
 */
export const AUCTION_OUTBID_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "auction_outbid",
  /** Name */
  name: "Outbid Notification",
  /** Category */
  category: "AUCTION",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

You've been outbid on "{{2}}"! 😢

Your Bid: ₹{{3}}
Current Highest: ₹{{4}}
Time Remaining: {{5}}

Place a higher bid to stay in the game!`,
  /** Variables */
  variables: ["name", "productName", "yourBid", "currentBid", "timeLeft"],
  /** Buttons */
  buttons: [{ type: "URL", text: "Bid Now", data: "{{url}}" }],
};

/**
 * Auction Winning Template
 * @constant
 */
export const AUCTION_WINNING_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "auction_winning",
  /** Name */
  name: "Winning Bid",
  /** Category */
  category: "AUCTION",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

You're currently winning "{{2}}"! 🏆

Your Bid: ₹{{3}}
Time Remaining: {{4}}

Keep an eye on it - others might bid higher!`,
  /** Variables */
  variables: ["name", "productName", "bidAmount", "timeLeft"],
};

/**
 * Auction Won Template
 * @constant
 */
export const AUCTION_WON_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "auction_won",
  /** Name */
  name: "Auction Won",
  /** Category */
  category: "AUCTION",
  /** Language */
  language: "en",
  /** Body */
  body: `Congratulations {{1}}! 🎉

You won the auction for "{{2}}"!

Winning Bid: ₹{{3}}
Order #{{4}}

Please complete the payment within 24 hours to confirm your order.`,
  /** Variables */
  variables: ["name", "productName", "bidAmount", "orderId"],
  /** Buttons */
  buttons: [{ type: "URL", text: "Complete Payment", data: "{{paymentUrl}}" }],
};

/**
 * Auction Lost Template
 * @constant
 */
export const AUCTION_LOST_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "auction_lost",
  /** Name */
  name: "Auction Lost",
  /** Category */
  category: "AUCTION",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

The auction for "{{2}}" has ended.

Your Bid: ₹{{3}}
Winning Bid: ₹{{4}}

Better luck next time! Browse more auctions: {{5}}`,
  /** Variables */
  variables: ["name", "productName", "yourBid", "winningBid", "browseUrl"],
};

/**
 * Auction Ending Soon Template
 * @constant
 */
export const AUCTION_ENDING_SOON_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "auction_ending_soon",
  /** Name */
  name: "Auction Ending Soon",
  /** Category */
  category: "AUCTION",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

The auction for "{{2}}" is ending soon! ⏰

Current Bid: ₹{{3}}
Ending In: {{4}}
Your Status: {{5}}

Last chance to bid!`,
  /** Variables */
  variables: ["name", "productName", "currentBid", "timeLeft", "status"],
  /** Buttons */
  buttons: [{ type: "URL", text: "View Auction", data: "{{url}}" }],
};

// ============================================================================
// ACCOUNT TEMPLATES
// ============================================================================

/**
 * Welcome Template
 * @constant
 */
export const WELCOME_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "welcome",
  /** Name */
  name: "Welcome Message",
  /** Category */
  category: "ACCOUNT",
  /** Language */
  language: "en",
  /** Body */
  body: `Welcome to Letitrip {{1}}! 🎉

Thank you for joining India's most trusted auction & e-commerce platform.

Start exploring:
• Browse products
• Join live auctions
• Open your own shop

Need help? Our support team is here for you 24/7.`,
  /** Variables */
  variables: ["name"],
  /** Buttons */
  buttons: [
    { type: "URL", text: "Start Shopping", data: "{{shopUrl}}" },
    { type: "URL", text: "Browse Auctions", data: "{{auctionUrl}}" },
  ],
};

/**
 * Otp Verification Template
 * @constant
 */
export const OTP_VERIFICATION_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "otp_verification",
  /** Name */
  name: "OTP Verification",
  /** Category */
  category: "ACCOUNT",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

Your OTP for Letitrip verification is: *{{2}}*

Valid for 10 minutes. Do not share this OTP with anyone.`,
  /** Variables */
  variables: ["name", "otp"],
  /** Footer */
  footer: "This is an auto-generated message. Please do not reply.",
};

/**
 * Password Reset Template
 * @constant
 */
export const PASSWORD_RESET_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "password_reset",
  /** Name */
  name: "Password Reset",
  /** Category */
  category: "ACCOUNT",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

We received a request to reset your password.

Click here to reset: {{2}}

If you didn't request this, please ignore this message.

Link expires in 1 hour.`,
  /** Variables */
  variables: ["name", "resetUrl"],
  /** Buttons */
  buttons: [{ type: "URL", text: "Reset Password", data: "{{resetUrl}}" }],
};

// ============================================================================
// MARKETING TEMPLATES
// ============================================================================

/**
 * New Arrival Template
 * @constant
 */
export const NEW_ARRIVAL_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "new_arrival",
  /** Name */
  name: "New Arrivals",
  /** Category */
  category: "MARKETING",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}}! 🆕

Check out our latest arrivals in {{2}}:

{{3}}

Limited stock available. Shop now before they're gone!`,
  /** Variables */
  variables: ["name", "category", "products"],
  /** Buttons */
  buttons: [{ type: "URL", text: "Shop Now", data: "{{shopUrl}}" }],
};

/**
 * Flash Sale Template
 * @constant
 */
export const FLASH_SALE_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "flash_sale",
  /** Name */
  name: "Flash Sale",
  /** Category */
  category: "MARKETING",
  /** Language */
  language: "en",
  /** Body */
  body: `⚡ FLASH SALE ALERT ⚡

Hi {{1}},

Get {{2}}% OFF on {{3}}!

Sale ends: {{4}}

Hurry! Limited time only.`,
  /** Variables */
  variables: ["name", "discount", "category", "endTime"],
  /** Buttons */
  buttons: [{ type: "URL", text: "Shop Sale", data: "{{saleUrl}}" }],
};

/**
 * Abandoned Cart Template
 * @constant
 */
export const ABANDONED_CART_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "abandoned_cart",
  /** Name */
  name: "Abandoned Cart",
  /** Category */
  category: "MARKETING",
  /** Language */
  language: "en",
  /** Body */
  body: `Hi {{1}},

You left {{2}} items in your cart 🛒

Total: ₹{{3}}

Complete your purchase now and get FREE shipping on orders above ₹500!`,
  /** Variables */
  variables: ["name", "itemCount", "amount"],
  /** Buttons */
  buttons: [{ type: "URL", text: "Complete Order", data: "{{cartUrl}}" }],
};

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

/**
 * Whatsapp Templates
 * @constant
 */
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
  /** W E L C O M E */
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
/**
 * Retrieves whats app template
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The whatsapptemplate result
 *
 * @example
 * getWhatsAppTemplate("example");
 */

/**
 * Retrieves whats app template
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The whatsapptemplate result
 *
 * @example
 * getWhatsAppTemplate("example");
 */

export function getWhatsAppTemplate(id: string): WhatsAppTemplate | undefined {
  return WHATSAPP_TEMPLATES[id];
}

/**
 * Get templates by category
 */
/**
 * Retrieves templates by category
 *
 * @param {WhatsAppTemplate["category"]} category - The category
 *
 * @returns {any} The templatesbycategory result
 *
 * @example
 * getTemplatesByCategory(category);
 */

/**
 * Retrieves templates by category
 *
 * @param {WhatsAppTemplate["category"]} /** Category */
  category - The /**  category */
  category
 *
 * @returns {any} The templatesbycategory result
 *
 * @example
 * getTemplatesByCategory(/** Category */
  category);
 */

export function getTemplatesByCategory(
  /** Category */
  category: WhatsAppTemplate["category"]
): WhatsAppTemplate[] {
  return Object.values(WHATSAPP_TEMPLATES).filter(
    (t) => t.category === category
  );
}

/**
 * Format template with variables
 */
/**
 * Formats template
 *
 * @param {WhatsAppTemplate} template - The template
 * @param {Record<string, string>} variables - The variables
 *
 * @returns {string} The formattemplate result
 *
 * @example
 * formatTemplate(template, variables);
 */

/**
 * Formats template
 *
 * @returns {any} The formattemplate result
 *
 * @example
 * formatTemplate();
 */

export function formatTemplate(
  /** Template */
  template: WhatsAppTemplate,
  /** Variables */
  variables: Record<string, string>
): string {
  let message = template.body;

  // Replace variables ({{1}}, {{2}}, etc.)
  template.variables.forEach((varName, index) => {
    const placeholder = `{{${index + 1}}}`;
    message = message.replace(
      new RegExp(placeholder, "g"),
      variables[varName] || ""
    );
  });

  return message;
}
