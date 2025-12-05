/**
 * @fileoverview Configuration
 * @module src/config/whatsapp.config
 * @description This file contains functionality related to whatsapp.config
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * WhatsApp Configuration
 *
 * @status IMPLEMENTED
 * @task 1.4.1
 *
 * Configuration for WhatsApp Business API integration:
 * - Twilio API (primary)
 * - Gupshup API (fallback)
 * - Message templates
 * - Rate limits
 */

// ============================================================================
// PROVIDER CONFIGURATION
// ============================================================================

/**
 * Whatsapp Providers
 * @constant
 */
export const WHATSAPP_PROVIDERS = {
  /** T W I L I O */
  TWILIO: {
    /** Id */
    id: "twilio",
    /** Name */
    name: "Twilio",
    /** Priority */
    priority: 1,
    /** Rate Limit */
    rateLimit: {
      /** Messages Per Second */
      messagesPerSecond: 10,
      /** Messages Per Minute */
      messagesPerMinute: 80,
      /** Messages Per Day */
      messagesPerDay: 100000,
    },
    /** Pricing */
    pricing: {
      marketing: 0.0042, // USD per message
      /** Utility */
      utility: 0.0035,
      /** Authentication */
      authentication: 0.0028,
      /** Service */
      service: 0.0049,
    },
    /** Features */
    features: {
      /** Rich Media */
      richMedia: true,
      /** Buttons */
      buttons: true,
      /** Lists */
      lists: true,
      /** Templates */
      templates: true,
      /** Catalog */
      catalog: true,
    },
  },
  /** G U P S H U P */
  GUPSHUP: {
    /** Id */
    id: "gupshup",
    /** Name */
    name: "Gupshup",
    /** Priority */
    priority: 2,
    /** Rate Limit */
    rateLimit: {
      /** Messages Per Second */
      messagesPerSecond: 15,
      /** Messages Per Minute */
      messagesPerMinute: 100,
      /** Messages Per Day */
      messagesPerDay: 200000,
    },
    /** Pricing */
    pricing: {
      marketing: 0.003, // USD per message
      /** Utility */
      utility: 0.0025,
      /** Authentication */
      authentication: 0.002,
      /** Service */
      service: 0.004,
    },
    /** Features */
    features: {
      /** Rich Media */
      richMedia: true,
      /** Buttons */
      buttons: true,
      /** Lists */
      lists: true,
      /** Templates */
      templates: true,
      /** Catalog */
      catalog: false,
    },
  },
} as const;

/**
 * WhatsAppProviderId type
 * 
 * @typedef {Object} WhatsAppProviderId
 * @description Type definition for WhatsAppProviderId
 */
export type WhatsAppProviderId = keyof typeof WHATSAPP_PROVIDERS;

// ============================================================================
// MESSAGE CATEGORIES
// ============================================================================

/**
 * Message Categories
 * @constant
 */
export const MESSAGE_CATEGORIES = {
  /** M A R K E T I N G */
  MARKETING: {
    /** Id */
    id: "marketing",
    /** Name */
    name: "Marketing",
    /** Description */
    description: "Promotional messages, offers, campaigns",
    /** Requires Opt In */
    requiresOptIn: true,
    /** Window */
    window: null, // Can be sent anytime
  },
  /** U T I L I T Y */
  UTILITY: {
    /** Id */
    id: "utility",
    /** Name */
    name: "Utility",
    /** Description */
    description: "Order updates, shipping, account changes",
    /** Requires Opt In */
    requiresOptIn: false,
    /** Window */
    window: 24, // 24-hour window after user message
  },
  /** A U T H E N T I C A T I O N */
  AUTHENTICATION: {
    /** Id */
    id: "authentication",
    /** Name */
    name: "Authentication",
    /** Description */
    description: "OTP, verification codes",
    /** Requires Opt In */
    requiresOptIn: false,
    /** Window */
    window: null, // Can be sent anytime
  },
  /** S E R V I C E */
  SERVICE: {
    /** Id */
    id: "service",
    /** Name */
    name: "Service",
    /** Description */
    description: "Customer service, support",
    /** Requires Opt In */
    requiresOptIn: false,
    /** Window */
    window: 24, // 24-hour window after user message
  },
} as const;

/**
 * MessageCategory type
 * 
 * @typedef {Object} MessageCategory
 * @description Type definition for MessageCategory
 */
export type MessageCategory = keyof typeof MESSAGE_CATEGORIES;

// ============================================================================
// MESSAGE TEMPLATES
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
  category: MessageCategory;
  /** Language */
  language: string;
  /** Status */
  status: "approved" | "pending" | "rejected";
  /** Components */
  components: TemplateComponent[];
}

/**
 * TemplateComponent interface
 * 
 * @interface
 * @description Defines the structure and contract for TemplateComponent
 */
export interface TemplateComponent {
  /** Type */
  type: "header" | "body" | "footer" | "buttons";
  /** Text */
  text?: string;
  /** Format */
  format?: "text" | "image" | "video" | "document";
  /** Variables */
  variables?: string[];
  /** Buttons */
  buttons?: TemplateButton[];
}

/**
 * TemplateButton interface
 * 
 * @interface
 * @description Defines the structure and contract for TemplateButton
 */
export interface TemplateButton {
  /** Type */
  type: "quick_reply" | "call_to_action";
  /** Text */
  text: string;
  /** Action */
  action?: {
    /** Type */
    type: "url" | "phone";
    /** Value */
    value: string;
  };
}

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

/**
 * Order Confirmation Template
 */
export const ORDER_CONFIRMATION_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "order_confirmation_v1",
  /** Name */
  name: "order_confirmation",
  /** Category */
  category: "UTILITY",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "header",
      /** Text */
      text: "🎉 Order Confirmed!",
      /** Format */
      format: "text",
    },
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Hi {{1}},\n\nYour order #{{2}} has been confirmed!\n\n" +
        "Items: {{3}}\n" +
        "Total: ₹{{4}}\n" +
        "Delivery by: {{5}}\n\n" +
        "Track your order: {{6}}",
      /** Variables */
      variables: [
        "name",
        "orderId",
        "items",
        "total",
        "deliveryDate",
        "trackingUrl",
      ],
    },
    {
      /** Type */
      type: "footer",
      /** Text */
      text: "Thank you for shopping with us!",
    },
    {
      /** Type */
      type: "buttons",
      /** Buttons */
      buttons: [
        {
          /** Type */
          type: "quick_reply",
          /** Text */
          text: "Track Order",
        },
        {
          /** Type */
          type: "quick_reply",
          /** Text */
          text: "View Invoice",
        },
      ],
    },
  ],
};

/**
 * Shipping Update Template
 */
export const SHIPPING_UPDATE_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "shipping_update_v1",
  /** Name */
  name: "shipping_update",
  /** Category */
  category: "UTILITY",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "header",
      /** Text */
      text: "📦 Shipping Update",
      /** Format */
      format: "text",
    },
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Hi {{1}},\n\n" +
        "Your order #{{2}} is {{3}}.\n\n" +
        "Courier: {{4}}\n" +
        "Tracking ID: {{5}}\n" +
        "Location: {{6}}\n\n" +
        "Estimated delivery: {{7}}",
      /** Variables */
      variables: [
        "name",
        "orderId",
        "status",
        "courier",
        "trackingId",
        "location",
        "estimatedDate",
      ],
    },
    {
      /** Type */
      type: "buttons",
      /** Buttons */
      buttons: [
        {
          /** Type */
          type: "call_to_action",
          /** Text */
          text: "Track Live",
          /** Action */
          action: {
            /** Type */
            type: "url",
            /** Value */
            value: "{{trackingUrl}}",
          },
        },
      ],
    },
  ],
};

/**
 * Out for Delivery Template
 */
export const OUT_FOR_DELIVERY_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "out_for_delivery_v1",
  /** Name */
  name: "out_for_delivery",
  /** Category */
  category: "UTILITY",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "header",
      /** Text */
      text: "🚚 Out for Delivery!",
      /** Format */
      format: "text",
    },
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Hi {{1}},\n\n" +
        "Great news! Your order #{{2}} is out for delivery.\n\n" +
        "Expected delivery: Today by {{3}}\n" +
        "Delivery partner: {{4}}\n\n" +
        "Please keep your phone handy!",
      /** Variables */
      variables: ["name", "orderId", "time", "partner"],
    },
    {
      /** Type */
      type: "buttons",
      /** Buttons */
      buttons: [
        {
          /** Type */
          type: "quick_reply",
          /** Text */
          text: "Call Delivery Partner",
        },
      ],
    },
  ],
};

/**
 * Delivery Confirmation Template
 */
export const DELIVERY_CONFIRMATION_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "delivery_confirmation_v1",
  /** Name */
  name: "delivery_confirmation",
  /** Category */
  category: "UTILITY",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "header",
      /** Text */
      text: "✅ Delivered Successfully!",
      /** Format */
      format: "text",
    },
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Hi {{1}},\n\n" +
        "Your order #{{2}} has been delivered.\n\n" +
        "Delivered at: {{3}}\n" +
        "Received by: {{4}}\n\n" +
        "Hope you love your purchase!",
      /** Variables */
      variables: ["name", "orderId", "time", "receiver"],
    },
    {
      /** Type */
      type: "buttons",
      /** Buttons */
      buttons: [
        {
          /** Type */
          type: "quick_reply",
          /** Text */
          text: "Rate Order",
        },
        {
          /** Type */
          type: "quick_reply",
          /** Text */
          text: "Need Help?",
        },
      ],
    },
  ],
};

/**
 * Payment Reminder Template
 */
export const PAYMENT_REMINDER_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "payment_reminder_v1",
  /** Name */
  name: "payment_reminder",
  /** Category */
  category: "UTILITY",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "header",
      /** Text */
      text: "⏰ Payment Reminder",
      /** Format */
      format: "text",
    },
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Hi {{1}},\n\n" +
        "Your order #{{2}} is awaiting payment.\n\n" +
        "Amount: ₹{{3}}\n" +
        "Items in cart: {{4}}\n\n" +
        "Complete payment within {{5}} to confirm your order.",
      /** Variables */
      variables: ["name", "orderId", "amount", "items", "time"],
    },
    {
      /** Type */
      type: "buttons",
      /** Buttons */
      buttons: [
        {
          /** Type */
          type: "call_to_action",
          /** Text */
          text: "Pay Now",
          /** Action */
          action: {
            /** Type */
            type: "url",
            /** Value */
            value: "{{paymentUrl}}",
          },
        },
      ],
    },
  ],
};

/**
 * Abandoned Cart Template
 */
export const ABANDONED_CART_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "abandoned_cart_v1",
  /** Name */
  name: "abandoned_cart",
  /** Category */
  category: "MARKETING",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "header",
      /** Text */
      text: "🛒 Items Waiting in Your Cart",
      /** Format */
      format: "text",
    },
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Hi {{1}},\n\n" +
        "You left {{2}} items in your cart.\n\n" +
        "Total value: ₹{{3}}\n" +
        "Special offer: Get {{4}}% off if you checkout now!\n\n" +
        "Offer valid for: {{5}}",
      /** Variables */
      variables: ["name", "itemCount", "value", "discount", "validity"],
    },
    {
      /** Type */
      type: "buttons",
      /** Buttons */
      buttons: [
        {
          /** Type */
          type: "call_to_action",
          /** Text */
          text: "Complete Purchase",
          /** Action */
          action: {
            /** Type */
            type: "url",
            /** Value */
            value: "{{cartUrl}}",
          },
        },
      ],
    },
  ],
};

/**
 * Return Request Confirmation Template
 */
export const RETURN_REQUEST_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "return_request_v1",
  /** Name */
  name: "return_request",
  /** Category */
  category: "SERVICE",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "header",
      /** Text */
      text: "↩️ Return Request Received",
      /** Format */
      format: "text",
    },
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Hi {{1}},\n\n" +
        "Your return request for order #{{2}} has been received.\n\n" +
        "Return ID: {{3}}\n" +
        "Reason: {{4}}\n" +
        "Pickup scheduled: {{5}}\n\n" +
        "Please keep the items packed and ready.",
      /** Variables */
      variables: ["name", "orderId", "returnId", "reason", "pickupDate"],
    },
    {
      /** Type */
      type: "buttons",
      /** Buttons */
      buttons: [
        {
          /** Type */
          type: "quick_reply",
          /** Text */
          text: "Track Return",
        },
      ],
    },
  ],
};

/**
 * Refund Processed Template
 */
export const REFUND_PROCESSED_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "refund_processed_v1",
  /** Name */
  name: "refund_processed",
  /** Category */
  category: "UTILITY",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "header",
      /** Text */
      text: "💰 Refund Processed",
      /** Format */
      format: "text",
    },
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Hi {{1}},\n\n" +
        "Your refund for order #{{2}} has been processed.\n\n" +
        "Refund amount: ₹{{3}}\n" +
        "Method: {{4}}\n" +
        "Credited to: {{5}}\n\n" +
        "It may take 5-7 business days to reflect in your account.",
      /** Variables */
      variables: ["name", "orderId", "amount", "method", "account"],
    },
  ],
};

/**
 * OTP Template
 */
export const OTP_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "otp_v1",
  /** Name */
  name: "otp_verification",
  /** Category */
  category: "AUTHENTICATION",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Your verification code for JustForView is: *{{1}}*\n\n" +
        "Valid for {{2}} minutes.\n" +
        "Do not share this code with anyone.",
      /** Variables */
      variables: ["otp", "validity"],
    },
  ],
};

/**
 * Price Drop Alert Template
 */
export const PRICE_DROP_TEMPLATE: WhatsAppTemplate = {
  /** Id */
  id: "price_drop_v1",
  /** Name */
  name: "price_drop_alert",
  /** Category */
  category: "MARKETING",
  /** Language */
  language: "en",
  /** Status */
  status: "approved",
  /** Components */
  components: [
    {
      /** Type */
      type: "header",
      /** Text */
      text: "🔥 Price Drop Alert!",
      /** Format */
      format: "text",
    },
    {
      /** Type */
      type: "body",
      /** Text */
      text:
        "Hi {{1}},\n\n" +
        "Great news! The price of {{2}} has dropped.\n\n" +
        "Original price: ₹{{3}}\n" +
        "New price: ₹{{4}}\n" +
        "You save: ₹{{5}} ({{6}}% off)\n\n" +
        "Stock is limited!",
      /** Variables */
      variables: [
        "name",
        "productName",
        "oldPrice",
        "newPrice",
        "savings",
        "percentage",
      ],
    },
    {
      /** Type */
      type: "buttons",
      /** Buttons */
      buttons: [
        {
          /** Type */
          type: "call_to_action",
          /** Text */
          text: "Buy Now",
          /** Action */
          action: {
            /** Type */
            type: "url",
            /** Value */
            value: "{{productUrl}}",
          },
        },
      ],
    },
  ],
};

// ============================================================================
// TEMPLATE HELPERS
// ============================================================================

/**
 * Templates
 * @constant
 */
export const TEMPLATES = {
  ORDER_CONFIRMATION: ORDER_CONFIRMATION_TEMPLATE,
  SHIPPING_UPDATE: SHIPPING_UPDATE_TEMPLATE,
  OUT_FOR_DELIVERY: OUT_FOR_DELIVERY_TEMPLATE,
  DELIVERY_CONFIRMATION: DELIVERY_CONFIRMATION_TEMPLATE,
  PAYMENT_REMINDER: PAYMENT_REMINDER_TEMPLATE,
  ABANDONED_CART: ABANDONED_CART_TEMPLATE,
  RETURN_REQUEST: RETURN_REQUEST_TEMPLATE,
  REFUND_PROCESSED: REFUND_PROCESSED_TEMPLATE,
  /** O T P */
  OTP: OTP_TEMPLATE,
  PRICE_DROP: PRICE_DROP_TEMPLATE,
} as const;

/**
 * TemplateId type
 * 
 * @typedef {Object} TemplateId
 * @description Type definition for TemplateId
 */
export type TemplateId = keyof typeof TEMPLATES;

/**
 * Get template by ID
 */
/**
 * Retrieves template by id
 *
 * @param {TemplateId} id - Unique identifier
 *
 * @returns {any} The templatebyid result
 *
 * @example
 * getTemplateById(id);
 */

/**
 * Retrieves template by id
 *
 * @param {TemplateId} id - Unique identifier
 *
 * @returns {any} The templatebyid result
 *
 * @example
 * getTemplateById(id);
 */

export function getTemplateById(id: TemplateId): WhatsAppTemplate {
  return TEMPLATES[id];
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
  /**
 * Performs body component operation
 *
 * @param {any} (c - The (c
 *
 * @returns {any} The bodycomponent result
 *
 */
const bodyComponent = template.components.find((c) => c.type === "body");
  if (!bodyComponent?.text) return "";

  let formatted = bodyComponent.text;

  // Replace {{1}}, {{2}}, etc. with actual values
  bodyComponent.variables?.forEach((varName, index) => {
    const placeholder = `{{${index + 1}}}`;
    const value = variables[varName] || "";
    formatted = formatted.replace(new RegExp(placeholder, "g"), value);
  });

  return formatted;
}

/**
 * Validate phone number format for WhatsApp
 */
/**
 * Validates whats app phone
 *
 * @param {string} phone - The phone
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validateWhatsAppPhone("example");
 */

/**
 * Validates whats app phone
 *
 * @param {string} phone - The phone
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validateWhatsAppPhone("example");
 */

export function validateWhatsAppPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // India: 10 digits (with country code: +91)
  if (cleaned.length === 10) return true;
  if (cleaned.length === 12 && cleaned.startsWith("91")) return true;

  // International: 10-15 digits
  if (cleaned.length >= 10 && cleaned.length <= 15) return true;

  return false;
}

/**
 * Format phone number for WhatsApp API
 */
/**
 * Formats whats app phone
 *
 * @param {string} phone - The phone
 *
 * @returns {string} The formatwhatsappphone result
 *
 * @example
 * formatWhatsAppPhone("example");
 */

/**
 * Formats whats app phone
 *
 * @param {string} phone - The phone
 *
 * @returns {string} The formatwhatsappphone result
 *
 * @example
 * formatWhatsAppPhone("example");
 */

export function formatWhatsAppPhone(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Add India country code if not present
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }

  return "+" + cleaned;
}

/**
 * Check if user is within messaging window
 */
/**
 * Checks if within messaging window
 *
 * @param {Date} [lastUserMessageAt] - The last user message at
 * @param {number} [windowHours] - The window hours
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isWithinMessagingWindow(lastUserMessageAt, 123);
 */

/**
 * Checks if within messaging window
 *
 * @param {Date} [/** Last User Message At */
  lastUserMessageAt] - The /**  last  user  message  at */
  last user message at
 * @param {number} [windowHours] - The window hours
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isWithinMessagingWindow(/** Last User Message At */
  lastUserMessageAt, 123);
 */

/**
 * Checks if within messaging window
 *
 * @param {Date} [lastUserMessageAt] - The lastusermessageat
 * @param {any} [windowHours=24] - The windowhours=24
 *
 * @returns {boolean} The iswithinmessagingwindow result
 *
 * @example
 * isWithinMessagingWindow(lastUserMessageAt, windowHours=24);
 */
export function isWithinMessagingWindow(
  /** Last User Message At */
  lastUserMessageAt?: Date,
  windowHours = 24
): boolean {
  if (!lastUserMessageAt) return false;

  const now = new Date();
  const diff = now.getTime() - lastUserMessageAt.getTime();
  const hours = diff / (1000 * 60 * 60);

  return hours <= windowHours;
}

/**
 * Get provider by ID
 */
/**
 * Retrieves provider by id
 *
 * @param {WhatsAppProviderId} id - Unique identifier
 *
 * @returns {any} The providerbyid result
 *
 * @example
 * getProviderById(id);
 */

/**
 * Retrieves provider by id
 *
 * @param {WhatsAppProviderId} id - Unique identifier
 *
 * @returns {any} The providerbyid result
 *
 * @example
 * getProviderById(id);
 */

export function getProviderById(id: WhatsAppProviderId) {
  return WHATSAPP_PROVIDERS[id];
}

/**
 * Get available providers sorted by priority
 */
/**
 * Retrieves available providers
 *
 * @returns {any} The availableproviders result
 *
 * @example
 * getAvailableProviders();
 */

/**
 * Retrieves available providers
 *
 * @returns {any} The availableproviders result
 *
 * @example
 * getAvailableProviders();
 */

export function getAvailableProviders() {
  return Object.values(WHATSAPP_PROVIDERS).sort(
    (a, b) => a.priority - b.priority
  );
}
