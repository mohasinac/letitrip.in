/**
 * Payment Gateway Configuration
 *
 * This file defines all supported payment gateways with their configuration
 * fields, supported currencies, countries, and capabilities.
 *
 * Usage:
 * ```ts
 * import { PAYMENT_GATEWAYS, getGatewayById, getGatewaysByType } from '@/config/payment-gateways.config';
 *
 * const razorpay = getGatewayById('razorpay');
 * const domesticGateways = getGatewaysByType('domestic');
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export type PaymentGatewayType = "domestic" | "international" | "alternative";
export type PaymentMode = "live" | "test";
export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "CAD"
  | "SGD";
export type CountryCode = "IN" | "US" | "GB" | "AU" | "CA" | "SG" | string;

export interface PaymentGatewayConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "select" | "url" | "email";
  required: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
  };
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  type: PaymentGatewayType;
  description: string;
  logo: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority

  // Supported regions
  supportedCurrencies: CurrencyCode[];
  supportedCountries: CountryCode[];

  // Fee structure
  fees: {
    domestic: {
      percentage: number;
      fixed: number;
      currency: CurrencyCode;
    };
    international: {
      percentage: number;
      fixed: number;
      currency: CurrencyCode;
    };
  };

  // Capabilities
  capabilities: {
    refunds: boolean;
    partialRefunds: boolean;
    recurringPayments: boolean;
    cardPayments: boolean;
    netBanking: boolean;
    upi: boolean;
    wallets: boolean;
    emi: boolean;
    internationalCards: boolean;
  };

  // Configuration fields
  config: {
    test: PaymentGatewayConfigField[];
    live: PaymentGatewayConfigField[];
  };

  // API endpoints
  endpoints: {
    test: string;
    live: string;
    webhookPath: string;
  };

  // Documentation
  docs: {
    setup: string;
    api: string;
    webhook: string;
  };
}

// ============================================================================
// GATEWAY CONFIGURATIONS
// ============================================================================

export const PAYMENT_GATEWAYS: PaymentGatewayConfig[] = [
  // RAZORPAY - Primary Indian gateway
  {
    id: "razorpay",
    name: "Razorpay",
    type: "domestic",
    description:
      "Leading payment gateway for India with UPI, cards, net banking, and wallets",
    logo: "/images/payment-gateways/razorpay.svg",
    enabled: true,
    priority: 1,
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    fees: {
      domestic: {
        percentage: 2,
        fixed: 0,
        currency: "INR",
      },
      international: {
        percentage: 3,
        fixed: 0,
        currency: "INR",
      },
    },
    capabilities: {
      refunds: true,
      partialRefunds: true,
      recurringPayments: true,
      cardPayments: true,
      netBanking: true,
      upi: true,
      wallets: true,
      emi: true,
      internationalCards: true,
    },
    config: {
      test: [
        {
          key: "keyId",
          label: "Test Key ID",
          type: "text",
          required: true,
          placeholder: "rzp_test_xxxxx",
          helpText: "Get from Razorpay Dashboard > Settings > API Keys",
          validation: {
            pattern: /^rzp_test_[a-zA-Z0-9]{10}$/,
            minLength: 19,
            maxLength: 19,
          },
        },
        {
          key: "keySecret",
          label: "Test Key Secret",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            minLength: 20,
            maxLength: 50,
          },
        },
        {
          key: "webhookSecret",
          label: "Test Webhook Secret",
          type: "password",
          required: true,
          placeholder: "whsec_xxxxx",
          helpText: "Used to verify webhook signatures",
          validation: {
            pattern: /^whsec_[a-zA-Z0-9]{32}$/,
          },
        },
      ],
      live: [
        {
          key: "keyId",
          label: "Live Key ID",
          type: "text",
          required: true,
          placeholder: "rzp_live_xxxxx",
          helpText: "Get from Razorpay Dashboard > Settings > API Keys",
          validation: {
            pattern: /^rzp_live_[a-zA-Z0-9]{10}$/,
            minLength: 19,
            maxLength: 19,
          },
        },
        {
          key: "keySecret",
          label: "Live Key Secret",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            minLength: 20,
            maxLength: 50,
          },
        },
        {
          key: "webhookSecret",
          label: "Live Webhook Secret",
          type: "password",
          required: true,
          placeholder: "whsec_xxxxx",
          helpText: "Used to verify webhook signatures",
          validation: {
            pattern: /^whsec_[a-zA-Z0-9]{32}$/,
          },
        },
      ],
    },
    endpoints: {
      test: "https://api.razorpay.com/v1",
      live: "https://api.razorpay.com/v1",
      webhookPath: "/api/payments/razorpay/webhook",
    },
    docs: {
      setup:
        "https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/",
      api: "https://razorpay.com/docs/api/",
      webhook: "https://razorpay.com/docs/webhooks/",
    },
  },

  // PAYU - Alternative Indian gateway
  {
    id: "payu",
    name: "PayU",
    type: "domestic",
    description:
      "Popular Indian payment gateway supporting multiple payment methods",
    logo: "/images/payment-gateways/payu.svg",
    enabled: false,
    priority: 2,
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    fees: {
      domestic: {
        percentage: 2.5,
        fixed: 0,
        currency: "INR",
      },
      international: {
        percentage: 3.5,
        fixed: 0,
        currency: "INR",
      },
    },
    capabilities: {
      refunds: true,
      partialRefunds: true,
      recurringPayments: true,
      cardPayments: true,
      netBanking: true,
      upi: true,
      wallets: true,
      emi: true,
      internationalCards: false,
    },
    config: {
      test: [
        {
          key: "merchantKey",
          label: "Test Merchant Key",
          type: "text",
          required: true,
          placeholder: "xxxxxx",
          helpText: "Get from PayU Dashboard > Settings > Merchant Key",
          validation: {
            minLength: 6,
            maxLength: 20,
          },
        },
        {
          key: "merchantSalt",
          label: "Test Merchant Salt",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used to generate payment hash",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
      ],
      live: [
        {
          key: "merchantKey",
          label: "Live Merchant Key",
          type: "text",
          required: true,
          placeholder: "xxxxxx",
          helpText: "Get from PayU Dashboard > Settings > Merchant Key",
          validation: {
            minLength: 6,
            maxLength: 20,
          },
        },
        {
          key: "merchantSalt",
          label: "Live Merchant Salt",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used to generate payment hash",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
      ],
    },
    endpoints: {
      test: "https://test.payu.in/_payment",
      live: "https://secure.payu.in/_payment",
      webhookPath: "/api/payments/payu/webhook",
    },
    docs: {
      setup: "https://devguide.payu.in/get-started/",
      api: "https://devguide.payu.in/integration-capabilities/",
      webhook: "https://devguide.payu.in/webhooks/",
    },
  },

  // PAYPAL - International payments
  {
    id: "paypal",
    name: "PayPal",
    type: "international",
    description:
      "Global payment solution for international customers with automatic currency conversion",
    logo: "/images/payment-gateways/paypal.svg",
    enabled: false,
    priority: 3,
    supportedCurrencies: ["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "INR"],
    supportedCountries: ["US", "GB", "AU", "CA", "SG", "IN"],
    fees: {
      domestic: {
        percentage: 2.9,
        fixed: 0.3,
        currency: "USD",
      },
      international: {
        percentage: 4.4,
        fixed: 0.3,
        currency: "USD",
      },
    },
    capabilities: {
      refunds: true,
      partialRefunds: true,
      recurringPayments: true,
      cardPayments: true,
      netBanking: false,
      upi: false,
      wallets: true,
      emi: false,
      internationalCards: true,
    },
    config: {
      test: [
        {
          key: "clientId",
          label: "Sandbox Client ID",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Get from PayPal Developer Dashboard > Apps & Credentials",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "clientSecret",
          label: "Sandbox Client Secret",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "webhookId",
          label: "Sandbox Webhook ID",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used to verify webhook events",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
      ],
      live: [
        {
          key: "clientId",
          label: "Live Client ID",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Get from PayPal Developer Dashboard > Apps & Credentials",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "clientSecret",
          label: "Live Client Secret",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "webhookId",
          label: "Live Webhook ID",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used to verify webhook events",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
      ],
    },
    endpoints: {
      test: "https://api.sandbox.paypal.com",
      live: "https://api.paypal.com",
      webhookPath: "/api/payments/paypal/webhook",
    },
    docs: {
      setup: "https://developer.paypal.com/api/rest/",
      api: "https://developer.paypal.com/docs/api/overview/",
      webhook:
        "https://developer.paypal.com/docs/api-basics/notifications/webhooks/",
    },
  },

  // STRIPE - International alternative
  {
    id: "stripe",
    name: "Stripe",
    type: "international",
    description:
      "Advanced international payment platform with extensive features",
    logo: "/images/payment-gateways/stripe.svg",
    enabled: false,
    priority: 4,
    supportedCurrencies: ["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "INR"],
    supportedCountries: ["US", "GB", "AU", "CA", "SG", "IN"],
    fees: {
      domestic: {
        percentage: 2.9,
        fixed: 0.3,
        currency: "USD",
      },
      international: {
        percentage: 3.9,
        fixed: 0.3,
        currency: "USD",
      },
    },
    capabilities: {
      refunds: true,
      partialRefunds: true,
      recurringPayments: true,
      cardPayments: true,
      netBanking: false,
      upi: true,
      wallets: true,
      emi: false,
      internationalCards: true,
    },
    config: {
      test: [
        {
          key: "publishableKey",
          label: "Test Publishable Key",
          type: "text",
          required: true,
          placeholder: "pk_test_xxxxx",
          helpText: "Get from Stripe Dashboard > Developers > API Keys",
          validation: {
            pattern: /^pk_test_[a-zA-Z0-9]{24}$/,
          },
        },
        {
          key: "secretKey",
          label: "Test Secret Key",
          type: "password",
          required: true,
          placeholder: "sk_test_xxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            pattern: /^sk_test_[a-zA-Z0-9]{24}$/,
          },
        },
        {
          key: "webhookSecret",
          label: "Test Webhook Secret",
          type: "password",
          required: true,
          placeholder: "whsec_xxxxx",
          helpText: "Used to verify webhook signatures",
          validation: {
            pattern: /^whsec_[a-zA-Z0-9]{32}$/,
          },
        },
      ],
      live: [
        {
          key: "publishableKey",
          label: "Live Publishable Key",
          type: "text",
          required: true,
          placeholder: "pk_live_xxxxx",
          helpText: "Get from Stripe Dashboard > Developers > API Keys",
          validation: {
            pattern: /^pk_live_[a-zA-Z0-9]{24}$/,
          },
        },
        {
          key: "secretKey",
          label: "Live Secret Key",
          type: "password",
          required: true,
          placeholder: "sk_live_xxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            pattern: /^sk_live_[a-zA-Z0-9]{24}$/,
          },
        },
        {
          key: "webhookSecret",
          label: "Live Webhook Secret",
          type: "password",
          required: true,
          placeholder: "whsec_xxxxx",
          helpText: "Used to verify webhook signatures",
          validation: {
            pattern: /^whsec_[a-zA-Z0-9]{32}$/,
          },
        },
      ],
    },
    endpoints: {
      test: "https://api.stripe.com/v1",
      live: "https://api.stripe.com/v1",
      webhookPath: "/api/payments/stripe/webhook",
    },
    docs: {
      setup: "https://stripe.com/docs/keys",
      api: "https://stripe.com/docs/api",
      webhook: "https://stripe.com/docs/webhooks",
    },
  },

  // PHONEPE - UPI focused gateway
  {
    id: "phonepe",
    name: "PhonePe",
    type: "alternative",
    description: "UPI-focused payment gateway with high success rates",
    logo: "/images/payment-gateways/phonepe.svg",
    enabled: false,
    priority: 5,
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    fees: {
      domestic: {
        percentage: 1.5,
        fixed: 0,
        currency: "INR",
      },
      international: {
        percentage: 0,
        fixed: 0,
        currency: "INR",
      },
    },
    capabilities: {
      refunds: true,
      partialRefunds: false,
      recurringPayments: false,
      cardPayments: true,
      netBanking: false,
      upi: true,
      wallets: true,
      emi: false,
      internationalCards: false,
    },
    config: {
      test: [
        {
          key: "merchantId",
          label: "Test Merchant ID",
          type: "text",
          required: true,
          placeholder: "PGTESTPAYUAT",
          helpText: "Get from PhonePe Dashboard",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
        {
          key: "saltKey",
          label: "Test Salt Key",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used to generate checksums",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "saltIndex",
          label: "Test Salt Index",
          type: "text",
          required: true,
          placeholder: "1",
          helpText: "Salt key version number",
          validation: {
            pattern: /^\d+$/,
          },
        },
      ],
      live: [
        {
          key: "merchantId",
          label: "Live Merchant ID",
          type: "text",
          required: true,
          placeholder: "MXXXXXXX",
          helpText: "Get from PhonePe Dashboard",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
        {
          key: "saltKey",
          label: "Live Salt Key",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used to generate checksums",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "saltIndex",
          label: "Live Salt Index",
          type: "text",
          required: true,
          placeholder: "1",
          helpText: "Salt key version number",
          validation: {
            pattern: /^\d+$/,
          },
        },
      ],
    },
    endpoints: {
      test: "https://api-preprod.phonepe.com/apis/pg-sandbox",
      live: "https://api.phonepe.com/apis/hermes",
      webhookPath: "/api/payments/phonepe/webhook",
    },
    docs: {
      setup: "https://developer.phonepe.com/v1/docs/getting-started",
      api: "https://developer.phonepe.com/v1/reference/pay-api",
      webhook: "https://developer.phonepe.com/v1/docs/webhooks",
    },
  },

  // CASHFREE - Alternative Indian gateway
  {
    id: "cashfree",
    name: "Cashfree",
    type: "alternative",
    description: "Comprehensive payment solution with instant settlements",
    logo: "/images/payment-gateways/cashfree.svg",
    enabled: false,
    priority: 6,
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    fees: {
      domestic: {
        percentage: 2,
        fixed: 0,
        currency: "INR",
      },
      international: {
        percentage: 3,
        fixed: 0,
        currency: "INR",
      },
    },
    capabilities: {
      refunds: true,
      partialRefunds: true,
      recurringPayments: true,
      cardPayments: true,
      netBanking: true,
      upi: true,
      wallets: true,
      emi: true,
      internationalCards: true,
    },
    config: {
      test: [
        {
          key: "appId",
          label: "Test App ID",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Get from Cashfree Dashboard > Credentials",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
        {
          key: "secretKey",
          label: "Test Secret Key",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
      ],
      live: [
        {
          key: "appId",
          label: "Live App ID",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Get from Cashfree Dashboard > Credentials",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
        {
          key: "secretKey",
          label: "Live Secret Key",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
      ],
    },
    endpoints: {
      test: "https://sandbox.cashfree.com/pg",
      live: "https://api.cashfree.com/pg",
      webhookPath: "/api/payments/cashfree/webhook",
    },
    docs: {
      setup: "https://docs.cashfree.com/docs/getting-started",
      api: "https://docs.cashfree.com/reference",
      webhook: "https://docs.cashfree.com/docs/webhooks",
    },
  },

  // INSTAMOJO - Small business focused
  {
    id: "instamojo",
    name: "Instamojo",
    type: "alternative",
    description: "Simple payment gateway for small businesses and startups",
    logo: "/images/payment-gateways/instamojo.svg",
    enabled: false,
    priority: 7,
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    fees: {
      domestic: {
        percentage: 2,
        fixed: 3,
        currency: "INR",
      },
      international: {
        percentage: 0,
        fixed: 0,
        currency: "INR",
      },
    },
    capabilities: {
      refunds: true,
      partialRefunds: false,
      recurringPayments: false,
      cardPayments: true,
      netBanking: true,
      upi: true,
      wallets: true,
      emi: false,
      internationalCards: false,
    },
    config: {
      test: [
        {
          key: "apiKey",
          label: "Test API Key",
          type: "text",
          required: true,
          placeholder: "test_xxxxx",
          helpText: "Get from Instamojo Dashboard > Settings > API Keys",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "authToken",
          label: "Test Auth Token",
          type: "password",
          required: true,
          placeholder: "test_xxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
      ],
      live: [
        {
          key: "apiKey",
          label: "Live API Key",
          type: "text",
          required: true,
          placeholder: "live_xxxxx",
          helpText: "Get from Instamojo Dashboard > Settings > API Keys",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "authToken",
          label: "Live Auth Token",
          type: "password",
          required: true,
          placeholder: "live_xxxxx",
          helpText: "Keep this secret and never commit to version control",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
      ],
    },
    endpoints: {
      test: "https://test.instamojo.com/api/1.1",
      live: "https://www.instamojo.com/api/1.1",
      webhookPath: "/api/payments/instamojo/webhook",
    },
    docs: {
      setup: "https://docs.instamojo.com/docs/getting-started",
      api: "https://docs.instamojo.com/reference",
      webhook: "https://docs.instamojo.com/docs/webhooks",
    },
  },

  // CCAVENUE - Enterprise gateway
  {
    id: "ccavenue",
    name: "CCAvenue",
    type: "alternative",
    description: "Trusted enterprise payment gateway with 200+ payment options",
    logo: "/images/payment-gateways/ccavenue.svg",
    enabled: false,
    priority: 8,
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    fees: {
      domestic: {
        percentage: 2.5,
        fixed: 0,
        currency: "INR",
      },
      international: {
        percentage: 3.5,
        fixed: 0,
        currency: "INR",
      },
    },
    capabilities: {
      refunds: true,
      partialRefunds: true,
      recurringPayments: true,
      cardPayments: true,
      netBanking: true,
      upi: true,
      wallets: true,
      emi: true,
      internationalCards: true,
    },
    config: {
      test: [
        {
          key: "merchantId",
          label: "Test Merchant ID",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Get from CCAvenue Dashboard",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
        {
          key: "workingKey",
          label: "Test Working Key",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used for encryption",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "accessCode",
          label: "Test Access Code",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used for API authentication",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
      ],
      live: [
        {
          key: "merchantId",
          label: "Live Merchant ID",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Get from CCAvenue Dashboard",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
        {
          key: "workingKey",
          label: "Live Working Key",
          type: "password",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used for encryption",
          validation: {
            minLength: 20,
            maxLength: 100,
          },
        },
        {
          key: "accessCode",
          label: "Live Access Code",
          type: "text",
          required: true,
          placeholder: "xxxxxxxxxx",
          helpText: "Used for API authentication",
          validation: {
            minLength: 10,
            maxLength: 50,
          },
        },
      ],
    },
    endpoints: {
      test: "https://test.ccavenue.com/transaction",
      live: "https://secure.ccavenue.com/transaction",
      webhookPath: "/api/payments/ccavenue/webhook",
    },
    docs: {
      setup: "https://www.ccavenue.com/merchants_faq.jsp",
      api: "https://www.ccavenue.com/ccavenue_integration_document.pdf",
      webhook: "https://www.ccavenue.com/webhooks.jsp",
    },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get gateway configuration by ID
 */
export function getGatewayById(id: string): PaymentGatewayConfig | undefined {
  return PAYMENT_GATEWAYS.find((gateway) => gateway.id === id);
}

/**
 * Get all enabled gateways sorted by priority
 */
export function getEnabledGateways(): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter((gateway) => gateway.enabled).sort(
    (a, b) => a.priority - b.priority
  );
}

/**
 * Get gateways by type
 */
export function getGatewaysByType(
  type: PaymentGatewayType
): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter((gateway) => gateway.type === type).sort(
    (a, b) => a.priority - b.priority
  );
}

/**
 * Get gateways supporting a specific currency
 */
export function getGatewaysByCurrency(
  currency: CurrencyCode
): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter((gateway) =>
    gateway.supportedCurrencies.includes(currency)
  ).sort((a, b) => a.priority - b.priority);
}

/**
 * Get gateways supporting a specific country
 */
export function getGatewaysByCountry(
  country: CountryCode
): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter((gateway) =>
    gateway.supportedCountries.includes(country)
  ).sort((a, b) => a.priority - b.priority);
}

/**
 * Get gateways with specific capability
 */
export function getGatewaysByCapability(
  capability: keyof PaymentGatewayConfig["capabilities"]
): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter(
    (gateway) => gateway.capabilities[capability]
  ).sort((a, b) => a.priority - b.priority);
}

/**
 * Calculate gateway fee for amount
 */
export function calculateGatewayFee(
  gatewayId: string,
  amount: number,
  isInternational: boolean = false
): number {
  // Validate input amount
  if (amount < 0) return 0;

  const gateway = getGatewayById(gatewayId);
  if (!gateway) return 0;

  const feeConfig = isInternational
    ? gateway.fees.international
    : gateway.fees.domestic;
  const percentageFee = (amount * feeConfig.percentage) / 100;
  const totalFee = percentageFee + feeConfig.fixed;

  return Math.round(totalFee * 100) / 100; // Round to 2 decimal places
}

/**
 * Validate gateway configuration field
 */
export function validateGatewayField(
  gatewayId: string,
  mode: PaymentMode,
  fieldKey: string,
  value: string
): { isValid: boolean; error?: string } {
  const gateway = getGatewayById(gatewayId);
  if (!gateway) {
    return { isValid: false, error: "Gateway not found" };
  }

  const field = gateway.config[mode].find((f) => f.key === fieldKey);
  if (!field) {
    return { isValid: false, error: "Field not found" };
  }

  if (field.required && !value) {
    return { isValid: false, error: `${field.label} is required` };
  }

  if (field.validation) {
    const { pattern, minLength, maxLength } = field.validation;

    if (minLength && value.length < minLength) {
      return {
        isValid: false,
        error: `${field.label} must be at least ${minLength} characters`,
      };
    }

    if (maxLength && value.length > maxLength) {
      return {
        isValid: false,
        error: `${field.label} must be no more than ${maxLength} characters`,
      };
    }

    if (pattern && !pattern.test(value)) {
      return { isValid: false, error: `${field.label} format is invalid` };
    }
  }

  return { isValid: true };
}

/**
 * Get best gateway for transaction
 * Based on currency, country, amount, and capabilities
 */
export function getBestGateway(params: {
  currency: CurrencyCode;
  country: CountryCode;
  amount: number;
  requiredCapabilities?: Array<keyof PaymentGatewayConfig["capabilities"]>;
}): PaymentGatewayConfig | undefined {
  const { currency, country, amount, requiredCapabilities = [] } = params;

  let candidates = getEnabledGateways();

  // Filter by currency support
  candidates = candidates.filter((gateway) =>
    gateway.supportedCurrencies.includes(currency)
  );

  // Filter by country support
  candidates = candidates.filter((gateway) =>
    gateway.supportedCountries.includes(country)
  );

  // Filter by required capabilities
  if (requiredCapabilities.length > 0) {
    candidates = candidates.filter((gateway) =>
      requiredCapabilities.every((cap) => gateway.capabilities[cap])
    );
  }

  // Sort by total cost (fee + fixed)
  const isInternational = country !== "IN";
  candidates.sort((a, b) => {
    const feeA = calculateGatewayFee(a.id, amount, isInternational);
    const feeB = calculateGatewayFee(b.id, amount, isInternational);
    return feeA - feeB;
  });

  return candidates[0];
}

/**
 * Get all supported currencies across all gateways
 */
export function getSupportedCurrencies(): CurrencyCode[] {
  const currencies = new Set<CurrencyCode>();
  PAYMENT_GATEWAYS.forEach((gateway) => {
    gateway.supportedCurrencies.forEach((currency) => currencies.add(currency));
  });
  return Array.from(currencies);
}

/**
 * Get all supported countries across all gateways
 */
export function getSupportedCountries(): CountryCode[] {
  const countries = new Set<CountryCode>();
  PAYMENT_GATEWAYS.forEach((gateway) => {
    gateway.supportedCountries.forEach((country) => countries.add(country));
  });
  return Array.from(countries);
}

/**
 * Validate complete gateway configuration
 */
export function validateGatewayConfig(
  gatewayId: string,
  config: Record<string, string>,
  mode: PaymentMode
): { isValid: boolean; errors: string[] } {
  const gateway = getGatewayById(gatewayId);
  if (!gateway) {
    return { isValid: false, errors: ["Gateway not found"] };
  }

  const errors: string[] = [];
  const fields = gateway.config[mode];

  fields.forEach((field) => {
    const value = config[field.key];
    // Don't validate if value exists (truthy check is wrong for empty strings)
    if (value !== undefined && value !== null) {
      const validation = validateGatewayField(
        gatewayId,
        mode,
        field.key,
        value
      );
      if (!validation.isValid && validation.error) {
        errors.push(validation.error);
      }
    } else if (field.required) {
      // Field is required but missing
      errors.push(`${field.label} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Compare fees between two gateways
 */
export function compareGatewayFees(
  gateway1Id: string,
  gateway2Id: string,
  amount: number,
  isInternational: boolean = false
): {
  gateway1: { id: string; fee: number };
  gateway2: { id: string; fee: number };
  cheaper: string;
  savings?: number;
} {
  const fee1 = calculateGatewayFee(gateway1Id, amount, isInternational);
  const fee2 = calculateGatewayFee(gateway2Id, amount, isInternational);

  const result = {
    gateway1: { id: gateway1Id, fee: fee1 },
    gateway2: { id: gateway2Id, fee: fee2 },
    cheaper: "equal" as string,
    savings: undefined as number | undefined,
  };

  if (fee1 < fee2) {
    result.cheaper = gateway1Id;
    result.savings = fee2 - fee1;
  } else if (fee2 < fee1) {
    result.cheaper = gateway2Id;
    result.savings = fee1 - fee2;
  }

  return result;
}
