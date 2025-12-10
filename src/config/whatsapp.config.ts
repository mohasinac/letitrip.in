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

export const WHATSAPP_PROVIDERS = {
  TWILIO: {
    id: "twilio",
    name: "Twilio",
    priority: 1,
    rateLimit: {
      messagesPerSecond: 10,
      messagesPerMinute: 80,
      messagesPerDay: 100000,
    },
    pricing: {
      marketing: 0.0042, // USD per message
      utility: 0.0035,
      authentication: 0.0028,
      service: 0.0049,
    },
    features: {
      richMedia: true,
      buttons: true,
      lists: true,
      templates: true,
      catalog: true,
    },
  },
  GUPSHUP: {
    id: "gupshup",
    name: "Gupshup",
    priority: 2,
    rateLimit: {
      messagesPerSecond: 15,
      messagesPerMinute: 100,
      messagesPerDay: 200000,
    },
    pricing: {
      marketing: 0.003, // USD per message
      utility: 0.0025,
      authentication: 0.002,
      service: 0.004,
    },
    features: {
      richMedia: true,
      buttons: true,
      lists: true,
      templates: true,
      catalog: false,
    },
  },
} as const;

export type WhatsAppProviderId = keyof typeof WHATSAPP_PROVIDERS;

// ============================================================================
// MESSAGE CATEGORIES
// ============================================================================

export const MESSAGE_CATEGORIES = {
  MARKETING: {
    id: "marketing",
    name: "Marketing",
    description: "Promotional messages, offers, campaigns",
    requiresOptIn: true,
    window: null, // Can be sent anytime
  },
  UTILITY: {
    id: "utility",
    name: "Utility",
    description: "Order updates, shipping, account changes",
    requiresOptIn: false,
    window: 24, // 24-hour window after user message
  },
  AUTHENTICATION: {
    id: "authentication",
    name: "Authentication",
    description: "OTP, verification codes",
    requiresOptIn: false,
    window: null, // Can be sent anytime
  },
  SERVICE: {
    id: "service",
    name: "Service",
    description: "Customer service, support",
    requiresOptIn: false,
    window: 24, // 24-hour window after user message
  },
} as const;

export type MessageCategory = keyof typeof MESSAGE_CATEGORIES;

// ============================================================================
// MESSAGE TEMPLATES
// ============================================================================

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: MessageCategory;
  language: string;
  status: "approved" | "pending" | "rejected";
  components: TemplateComponent[];
}

export interface TemplateComponent {
  type: "header" | "body" | "footer" | "buttons";
  text?: string;
  format?: "text" | "image" | "video" | "document";
  variables?: string[];
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: "quick_reply" | "call_to_action";
  text: string;
  action?: {
    type: "url" | "phone";
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
  id: "order_confirmation_v1",
  name: "order_confirmation",
  category: "utility",
  language: "en",
  status: "approved",
  components: [
    {
      type: "header",
      text: "🎉 Order Confirmed!",
      format: "text",
    },
    {
      type: "body",
      text:
        "Hi {{1}},\n\nYour order #{{2}} has been confirmed!\n\n" +
        "Items: {{3}}\n" +
        "Total: ₹{{4}}\n" +
        "Delivery by: {{5}}\n\n" +
        "Track your order: {{6}}",
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
      type: "footer",
      text: "Thank you for shopping with us!",
    },
    {
      type: "buttons",
      buttons: [
        {
          type: "quick_reply",
          text: "Track Order",
        },
        {
          type: "quick_reply",
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
  id: "shipping_update_v1",
  name: "shipping_update",
  category: "utility",
  language: "en",
  status: "approved",
  components: [
    {
      type: "header",
      text: "📦 Shipping Update",
      format: "text",
    },
    {
      type: "body",
      text:
        "Hi {{1}},\n\n" +
        "Your order #{{2}} is {{3}}.\n\n" +
        "Courier: {{4}}\n" +
        "Tracking ID: {{5}}\n" +
        "Location: {{6}}\n\n" +
        "Estimated delivery: {{7}}",
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
      type: "buttons",
      buttons: [
        {
          type: "call_to_action",
          text: "Track Live",
          action: {
            type: "url",
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
  id: "out_for_delivery_v1",
  name: "out_for_delivery",
  category: "utility",
  language: "en",
  status: "approved",
  components: [
    {
      type: "header",
      text: "🚚 Out for Delivery!",
      format: "text",
    },
    {
      type: "body",
      text:
        "Hi {{1}},\n\n" +
        "Great news! Your order #{{2}} is out for delivery.\n\n" +
        "Expected delivery: Today by {{3}}\n" +
        "Delivery partner: {{4}}\n\n" +
        "Please keep your phone handy!",
      variables: ["name", "orderId", "time", "partner"],
    },
    {
      type: "buttons",
      buttons: [
        {
          type: "quick_reply",
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
  id: "delivery_confirmation_v1",
  name: "delivery_confirmation",
  category: "utility",
  language: "en",
  status: "approved",
  components: [
    {
      type: "header",
      text: "✅ Delivered Successfully!",
      format: "text",
    },
    {
      type: "body",
      text:
        "Hi {{1}},\n\n" +
        "Your order #{{2}} has been delivered.\n\n" +
        "Delivered at: {{3}}\n" +
        "Received by: {{4}}\n\n" +
        "Hope you love your purchase!",
      variables: ["name", "orderId", "time", "receiver"],
    },
    {
      type: "buttons",
      buttons: [
        {
          type: "quick_reply",
          text: "Rate Order",
        },
        {
          type: "quick_reply",
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
  id: "payment_reminder_v1",
  name: "payment_reminder",
  category: "utility",
  language: "en",
  status: "approved",
  components: [
    {
      type: "header",
      text: "⏰ Payment Reminder",
      format: "text",
    },
    {
      type: "body",
      text:
        "Hi {{1}},\n\n" +
        "Your order #{{2}} is awaiting payment.\n\n" +
        "Amount: ₹{{3}}\n" +
        "Items in cart: {{4}}\n\n" +
        "Complete payment within {{5}} to confirm your order.",
      variables: ["name", "orderId", "amount", "items", "time"],
    },
    {
      type: "buttons",
      buttons: [
        {
          type: "call_to_action",
          text: "Pay Now",
          action: {
            type: "url",
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
  id: "abandoned_cart_v1",
  name: "abandoned_cart",
  category: "marketing",
  language: "en",
  status: "approved",
  components: [
    {
      type: "header",
      text: "🛒 Items Waiting in Your Cart",
      format: "text",
    },
    {
      type: "body",
      text:
        "Hi {{1}},\n\n" +
        "You left {{2}} items in your cart.\n\n" +
        "Total value: ₹{{3}}\n" +
        "Special offer: Get {{4}}% off if you checkout now!\n\n" +
        "Offer valid for: {{5}}",
      variables: ["name", "itemCount", "value", "discount", "validity"],
    },
    {
      type: "buttons",
      buttons: [
        {
          type: "call_to_action",
          text: "Complete Purchase",
          action: {
            type: "url",
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
  id: "return_request_v1",
  name: "return_request",
  category: "service",
  language: "en",
  status: "approved",
  components: [
    {
      type: "header",
      text: "↩️ Return Request Received",
      format: "text",
    },
    {
      type: "body",
      text:
        "Hi {{1}},\n\n" +
        "Your return request for order #{{2}} has been received.\n\n" +
        "Return ID: {{3}}\n" +
        "Reason: {{4}}\n" +
        "Pickup scheduled: {{5}}\n\n" +
        "Please keep the items packed and ready.",
      variables: ["name", "orderId", "returnId", "reason", "pickupDate"],
    },
    {
      type: "buttons",
      buttons: [
        {
          type: "quick_reply",
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
  id: "refund_processed_v1",
  name: "refund_processed",
  category: "utility",
  language: "en",
  status: "approved",
  components: [
    {
      type: "header",
      text: "💰 Refund Processed",
      format: "text",
    },
    {
      type: "body",
      text:
        "Hi {{1}},\n\n" +
        "Your refund for order #{{2}} has been processed.\n\n" +
        "Refund amount: ₹{{3}}\n" +
        "Method: {{4}}\n" +
        "Credited to: {{5}}\n\n" +
        "It may take 5-7 business days to reflect in your account.",
      variables: ["name", "orderId", "amount", "method", "account"],
    },
  ],
};

/**
 * OTP Template
 */
export const OTP_TEMPLATE: WhatsAppTemplate = {
  id: "otp_v1",
  name: "otp_verification",
  category: "authentication",
  language: "en",
  status: "approved",
  components: [
    {
      type: "body",
      text:
        "Your verification code for JustForView is: *{{1}}*\n\n" +
        "Valid for {{2}} minutes.\n" +
        "Do not share this code with anyone.",
      variables: ["otp", "validity"],
    },
  ],
};

/**
 * Price Drop Alert Template
 */
export const PRICE_DROP_TEMPLATE: WhatsAppTemplate = {
  id: "price_drop_v1",
  name: "price_drop_alert",
  category: "marketing",
  language: "en",
  status: "approved",
  components: [
    {
      type: "header",
      text: "🔥 Price Drop Alert!",
      format: "text",
    },
    {
      type: "body",
      text:
        "Hi {{1}},\n\n" +
        "Great news! The price of {{2}} has dropped.\n\n" +
        "Original price: ₹{{3}}\n" +
        "New price: ₹{{4}}\n" +
        "You save: ₹{{5}} ({{6}}% off)\n\n" +
        "Stock is limited!",
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
      type: "buttons",
      buttons: [
        {
          type: "call_to_action",
          text: "Buy Now",
          action: {
            type: "url",
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

export const TEMPLATES = {
  ORDER_CONFIRMATION: ORDER_CONFIRMATION_TEMPLATE,
  SHIPPING_UPDATE: SHIPPING_UPDATE_TEMPLATE,
  OUT_FOR_DELIVERY: OUT_FOR_DELIVERY_TEMPLATE,
  DELIVERY_CONFIRMATION: DELIVERY_CONFIRMATION_TEMPLATE,
  PAYMENT_REMINDER: PAYMENT_REMINDER_TEMPLATE,
  ABANDONED_CART: ABANDONED_CART_TEMPLATE,
  RETURN_REQUEST: RETURN_REQUEST_TEMPLATE,
  REFUND_PROCESSED: REFUND_PROCESSED_TEMPLATE,
  OTP: OTP_TEMPLATE,
  PRICE_DROP: PRICE_DROP_TEMPLATE,
} as const;

export type TemplateId = keyof typeof TEMPLATES;

/**
 * Get template by ID
 */
export function getTemplateById(id: string): any {
  // Find by template ID (not TemplateId key)
  const template = MESSAGE_TEMPLATES.find((t) => t.id === id);
  return template;
}

/**
 * Format template with variables
 */
export function formatTemplate(
  template: WhatsAppTemplate,
  variables: Record<string, string>
): string {
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
export function formatWhatsAppPhone(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, "");

  // Add India country code if not present
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }

  return "+" + cleaned;
}

/**
 * Check if user is within messaging window
 */
export function isWithinMessagingWindow(
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
export function getProviderById(id: WhatsAppProviderId) {
  return WHATSAPP_PROVIDERS[id];
}

/**
 * Get available providers sorted by priority
 */
export function getAvailableProviders() {
  return Object.values(WHATSAPP_PROVIDERS).sort(
    (a, b) => a.priority - b.priority
  );
}

/**
 * Helper to get body text from template
 */
function getTemplateBody(template: WhatsAppTemplate): string {
  const bodyComponent = template.components.find((c) => c.type === "body");
  return bodyComponent?.text || "";
}

/**
 * Helper to get variables from template
 */
function getTemplateVariables(template: WhatsAppTemplate): string[] {
  const bodyComponent = template.components.find((c) => c.type === "body");
  return bodyComponent?.variables || [];
}

/**
 * Enrich template with convenience properties
 */
function enrichTemplate(template: WhatsAppTemplate) {
  return {
    ...template,
    body: getTemplateBody(template),
    variables: getTemplateVariables(template),
  };
}

/**
 * Get all message templates as array with convenience properties
 */
export const MESSAGE_TEMPLATES = Object.values(TEMPLATES).map(enrichTemplate);

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): any[] {
  // Normalize category to lowercase
  const normalizedCategory = category.toLowerCase();
  return MESSAGE_TEMPLATES.filter(
    (template) => template.category.toLowerCase() === normalizedCategory
  );
}

/**
 * Get rate limit for provider
 */
export function getRateLimitForProvider(providerId: WhatsAppProviderId) {
  const provider = getProviderById(providerId);
  return provider?.rateLimit;
}

/**
 * Check if message can be sent
 */
export function canSendMessage(params: {
  category: string;
  hasOptIn: boolean;
  lastUserMessageAt?: Date;
}): { canSend: boolean; reason?: string } {
  const { category, hasOptIn, lastUserMessageAt } = params;

  // Get category config
  const categoryKey = Object.keys(MESSAGE_CATEGORIES).find(
    (key) =>
      MESSAGE_CATEGORIES[key as keyof typeof MESSAGE_CATEGORIES].id === category
  );

  if (!categoryKey) {
    return { canSend: false, reason: "Invalid category" };
  }

  const categoryConfig =
    MESSAGE_CATEGORIES[categoryKey as keyof typeof MESSAGE_CATEGORIES];

  // Check opt-in requirement
  if (categoryConfig.requiresOptIn && !hasOptIn) {
    return { canSend: false, reason: "User opt-in required" };
  }

  // Check messaging window
  if (categoryConfig.window !== null) {
    if (!isWithinMessagingWindow(lastUserMessageAt, categoryConfig.window)) {
      return { canSend: false, reason: "Outside messaging window" };
    }
  }

  return { canSend: true };
}

/**
 * Rate limits configuration
 */
export const RATE_LIMITS = {
  TWILIO: WHATSAPP_PROVIDERS.TWILIO.rateLimit,
  GUPSHUP: WHATSAPP_PROVIDERS.GUPSHUP.rateLimit,
};

/**
 * Phone number format constants
 */
export const PHONE_NUMBER_FORMAT = {
  INDIA_LENGTH: 10,
  INDIA_WITH_CODE_LENGTH: 12,
  INDIA_CODE: "91",
  MIN_LENGTH: 10,
  MAX_LENGTH: 15,
};
