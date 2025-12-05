/**
 * @fileoverview Configuration
 * @module src/config/payment-gateways.config
 * @description This file contains functionality related to payment-gateways.config
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

/**
 * PaymentGatewayType type
 * 
 * @typedef {Object} PaymentGatewayType
 * @description Type definition for PaymentGatewayType
 */
export type PaymentGatewayType = "domestic" | "international" | "alternative";
/**
 * PaymentMode type
 * 
 * @typedef {Object} PaymentMode
 * @description Type definition for PaymentMode
 */
export type PaymentMode = "live" | "test";
/**
 * CurrencyCode type
 * 
 * @typedef {Object} CurrencyCode
 * @description Type definition for CurrencyCode
 */
export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "CAD"
  | "SGD";
/**
 * CountryCode type
 * 
 * @typedef {Object} CountryCode
 * @description Type definition for CountryCode
 */
export type CountryCode = "IN" | "US" | "GB" | "AU" | "CA" | "SG" | string;

/**
 * PaymentGatewayConfigField interface
 * 
 * @interface
 * @description Defines the structure and contract for PaymentGatewayConfigField
 */
export interface PaymentGatewayConfigField {
  /** Key */
  key: string;
  /** Label */
  label: string;
  /** Type */
  type: "text" | "password" | "select" | "url" | "email";
  /** Required */
  required: boolean;
  /** Placeholder */
  placeholder?: string;
  /** Help Text */
  helpText?: string;
  /** Validation */
  validation?: {
    /** Pattern */
    pattern?: RegExp;
    /** Min Length */
    minLength?: number;
    /** Max Length */
    maxLength?: number;
  };
}

/**
 * PaymentGatewayConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for PaymentGatewayConfig
 */
export interface PaymentGatewayConfig {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Type */
  type: PaymentGatewayType;
  /** Description */
  description: string;
  /** Logo */
  logo: string;
  /** Enabled */
  enabled: boolean;
  /** Priority */
  priority: number; // Lower number = higher priority

  // Supported regions
  /** Supported Currencies */
  supportedCurrencies: CurrencyCode[];
  /** Supported Countries */
  supportedCountries: CountryCode[];

  // Fee structure
  /** Fees */
  fees: {
    /** Domestic */
    domestic: {
      /** Percentage */
      percentage: number;
      /** Fixed */
      fixed: number;
      /** Currency */
      currency: CurrencyCode;
    };
    /** International */
    international: {
      /** Percentage */
      percentage: number;
      /** Fixed */
      fixed: number;
      /** Currency */
      currency: CurrencyCode;
    };
  };

  // Capabilities
  /** Capabilities */
  capabilities: {
    /** Refunds */
    refunds: boolean;
    /** Partial Refunds */
    partialRefunds: boolean;
    /** Recurring Payments */
    recurringPayments: boolean;
    /** Card Payments */
    cardPayments: boolean;
    /** Net Banking */
    netBanking: boolean;
    /** Upi */
    upi: boolean;
    /** Wallets */
    wallets: boolean;
    /** Emi */
    emi: boolean;
    /** International Cards */
    internationalCards: boolean;
  };

  // Configuration fields
  /** Config */
  config: {
    /** Test */
    test: PaymentGatewayConfigField[];
    /** Live */
    live: PaymentGatewayConfigField[];
  };

  // API endpoints
  /** Endpoints */
  endpoints: {
    /** Test */
    test: string;
    /** Live */
    live: string;
    /** Webhook Path */
    webhookPath: string;
  };

  // Documentation
  /** Docs */
  docs: {
    /** Setup */
    setup: string;
    /** Api */
    api: string;
    /** Webhook */
    webhook: string;
  };
}

// ============================================================================
// GATEWAY CONFIGURATIONS
// ============================================================================

/**
 * Payment Gateways
 * @constant
 */
export const PAYMENT_GATEWAYS: PaymentGatewayConfig[] = [
  // RAZORPAY - Primary Indian gateway
  {
    /** Id */
    id: "razorpay",
    /** Name */
    name: "Razorpay",
    /** Type */
    type: "domestic",
    /** Description */
    description:
      "Leading payment gateway for India with UPI, cards, net banking, and wallets",
    /** Logo */
    logo: "/images/payment-gateways/razorpay.svg",
    /** Enabled */
    enabled: true,
    /** Priority */
    priority: 1,
    /** Supported Currencies */
    supportedCurrencies: ["INR"],
    /** Supported Countries */
    supportedCountries: ["IN"],
    /** Fees */
    fees: {
      /** Domestic */
      domestic: {
        /** Percentage */
        percentage: 2,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
      /** International */
      international: {
        /** Percentage */
        percentage: 3,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
    },
    /** Capabilities */
    capabilities: {
      /** Refunds */
      refunds: true,
      /** Partial Refunds */
      partialRefunds: true,
      /** Recurring Payments */
      recurringPayments: true,
      /** Card Payments */
      cardPayments: true,
      /** Net Banking */
      netBanking: true,
      /** Upi */
      upi: true,
      /** Wallets */
      wallets: true,
      /** Emi */
      emi: true,
      /** International Cards */
      internationalCards: true,
    },
    /** Config */
    config: {
      /** Test */
      test: [
        {
          /** Key */
          key: "keyId",
          /** Label */
          label: "Test Key ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "rzp_test_xxxxx",
          /** Help Text */
          helpText: "Get from Razorpay Dashboard > Settings > API Keys",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^rzp_test_[a-zA-Z0-9]{14}$/,
            /** Min Length */
            minLength: 19,
            /** Max Length */
            maxLength: 19,
          },
        },
        {
          /** Key */
          key: "keySecret",
          /** Label */
          label: "Test Key Secret",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 50,
          },
        },
        {
          /** Key */
          key: "webhookSecret",
          /** Label */
          label: "Test Webhook Secret",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "whsec_xxxxx",
          /** Help Text */
          helpText: "Used to verify webhook signatures",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^whsec_[a-zA-Z0-9]{32}$/,
          },
        },
      ],
      /** Live */
      live: [
        {
          /** Key */
          key: "keyId",
          /** Label */
          label: "Live Key ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "rzp_live_xxxxx",
          /** Help Text */
          helpText: "Get from Razorpay Dashboard > Settings > API Keys",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^rzp_live_[a-zA-Z0-9]{14}$/,
            /** Min Length */
            minLength: 19,
            /** Max Length */
            maxLength: 19,
          },
        },
        {
          /** Key */
          key: "keySecret",
          /** Label */
          label: "Live Key Secret",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 50,
          },
        },
        {
          /** Key */
          key: "webhookSecret",
          /** Label */
          label: "Live Webhook Secret",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "whsec_xxxxx",
          /** Help Text */
          helpText: "Used to verify webhook signatures",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^whsec_[a-zA-Z0-9]{32}$/,
          },
        },
      ],
    },
    /** Endpoints */
    endpoints: {
      test: "https://api.razorpay.com/v1",
      live: "https://api.razorpay.com/v1",
      /** Webhook Path */
      webhookPath: "/api/payments/razorpay/webhook",
    },
    /** Docs */
    docs: {
      /** Setup */
      setup:
        "https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/",
      api: "https://razorpay.com/docs/api/",
      webhook: "https://razorpay.com/docs/webhooks/",
    },
  },

  // PAYU - Alternative Indian gateway
  {
    /** Id */
    id: "payu",
    /** Name */
    name: "PayU",
    /** Type */
    type: "domestic",
    /** Description */
    description:
      "Popular Indian payment gateway supporting multiple payment methods",
    /** Logo */
    logo: "/images/payment-gateways/payu.svg",
    /** Enabled */
    enabled: false,
    /** Priority */
    priority: 2,
    /** Supported Currencies */
    supportedCurrencies: ["INR"],
    /** Supported Countries */
    supportedCountries: ["IN"],
    /** Fees */
    fees: {
      /** Domestic */
      domestic: {
        /** Percentage */
        percentage: 2.5,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
      /** International */
      international: {
        /** Percentage */
        percentage: 3.5,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
    },
    /** Capabilities */
    capabilities: {
      /** Refunds */
      refunds: true,
      /** Partial Refunds */
      partialRefunds: true,
      /** Recurring Payments */
      recurringPayments: true,
      /** Card Payments */
      cardPayments: true,
      /** Net Banking */
      netBanking: true,
      /** Upi */
      upi: true,
      /** Wallets */
      wallets: true,
      /** Emi */
      emi: true,
      /** International Cards */
      internationalCards: false,
    },
    /** Config */
    config: {
      /** Test */
      test: [
        {
          /** Key */
          key: "merchantKey",
          /** Label */
          label: "Test Merchant Key",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxx",
          /** Help Text */
          helpText: "Get from PayU Dashboard > Settings > Merchant Key",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 6,
            /** Max Length */
            maxLength: 20,
          },
        },
        {
          /** Key */
          key: "merchantSalt",
          /** Label */
          label: "Test Merchant Salt",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used to generate payment hash",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
      ],
      /** Live */
      live: [
        {
          /** Key */
          key: "merchantKey",
          /** Label */
          label: "Live Merchant Key",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxx",
          /** Help Text */
          helpText: "Get from PayU Dashboard > Settings > Merchant Key",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 6,
            /** Max Length */
            maxLength: 20,
          },
        },
        {
          /** Key */
          key: "merchantSalt",
          /** Label */
          label: "Live Merchant Salt",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used to generate payment hash",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
      ],
    },
    /** Endpoints */
    endpoints: {
      test: "https://test.payu.in/_payment",
      live: "https://secure.payu.in/_payment",
      /** Webhook Path */
      webhookPath: "/api/payments/payu/webhook",
    },
    /** Docs */
    docs: {
      setup: "https://devguide.payu.in/get-started/",
      api: "https://devguide.payu.in/integration-capabilities/",
      webhook: "https://devguide.payu.in/webhooks/",
    },
  },

  // PAYPAL - International payments
  {
    /** Id */
    id: "paypal",
    /** Name */
    name: "PayPal",
    /** Type */
    type: "international",
    /** Description */
    description:
      "Global payment solution for international customers with automatic currency conversion",
    /** Logo */
    logo: "/images/payment-gateways/paypal.svg",
    /** Enabled */
    enabled: false,
    /** Priority */
    priority: 3,
    /** Supported Currencies */
    supportedCurrencies: ["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "INR"],
    /** Supported Countries */
    supportedCountries: ["US", "GB", "AU", "CA", "SG", "IN"],
    /** Fees */
    fees: {
      /** Domestic */
      domestic: {
        /** Percentage */
        percentage: 2.9,
        /** Fixed */
        fixed: 0.3,
        /** Currency */
        currency: "USD",
      },
      /** International */
      international: {
        /** Percentage */
        percentage: 4.4,
        /** Fixed */
        fixed: 0.3,
        /** Currency */
        currency: "USD",
      },
    },
    /** Capabilities */
    capabilities: {
      /** Refunds */
      refunds: true,
      /** Partial Refunds */
      partialRefunds: true,
      /** Recurring Payments */
      recurringPayments: true,
      /** Card Payments */
      cardPayments: true,
      /** Net Banking */
      netBanking: false,
      /** Upi */
      upi: false,
      /** Wallets */
      wallets: true,
      /** Emi */
      emi: false,
      /** International Cards */
      internationalCards: true,
    },
    /** Config */
    config: {
      /** Test */
      test: [
        {
          /** Key */
          key: "clientId",
          /** Label */
          label: "Sandbox Client ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Get from PayPal Developer Dashboard > Apps & Credentials",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "clientSecret",
          /** Label */
          label: "Sandbox Client Secret",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "webhookId",
          /** Label */
          label: "Sandbox Webhook ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used to verify webhook events",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
      ],
      /** Live */
      live: [
        {
          /** Key */
          key: "clientId",
          /** Label */
          label: "Live Client ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Get from PayPal Developer Dashboard > Apps & Credentials",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "clientSecret",
          /** Label */
          label: "Live Client Secret",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "webhookId",
          /** Label */
          label: "Live Webhook ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used to verify webhook events",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
      ],
    },
    /** Endpoints */
    endpoints: {
      test: "https://api.sandbox.paypal.com",
      live: "https://api.paypal.com",
      /** Webhook Path */
      webhookPath: "/api/payments/paypal/webhook",
    },
    /** Docs */
    docs: {
      setup: "https://developer.paypal.com/api/rest/",
      api: "https://developer.paypal.com/docs/api/overview/",
      /** Webhook */
      webhook:
        "https://developer.paypal.com/docs/api-basics/notifications/webhooks/",
    },
  },

  // STRIPE - International alternative
  {
    /** Id */
    id: "stripe",
    /** Name */
    name: "Stripe",
    /** Type */
    type: "international",
    /** Description */
    description:
      "Advanced international payment platform with extensive features",
    /** Logo */
    logo: "/images/payment-gateways/stripe.svg",
    /** Enabled */
    enabled: false,
    /** Priority */
    priority: 4,
    /** Supported Currencies */
    supportedCurrencies: ["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "INR"],
    /** Supported Countries */
    supportedCountries: ["US", "GB", "AU", "CA", "SG", "IN"],
    /** Fees */
    fees: {
      /** Domestic */
      domestic: {
        /** Percentage */
        percentage: 2.9,
        /** Fixed */
        fixed: 0.3,
        /** Currency */
        currency: "USD",
      },
      /** International */
      international: {
        /** Percentage */
        percentage: 3.9,
        /** Fixed */
        fixed: 0.3,
        /** Currency */
        currency: "USD",
      },
    },
    /** Capabilities */
    capabilities: {
      /** Refunds */
      refunds: true,
      /** Partial Refunds */
      partialRefunds: true,
      /** Recurring Payments */
      recurringPayments: true,
      /** Card Payments */
      cardPayments: true,
      /** Net Banking */
      netBanking: false,
      /** Upi */
      upi: true,
      /** Wallets */
      wallets: true,
      /** Emi */
      emi: false,
      /** International Cards */
      internationalCards: true,
    },
    /** Config */
    config: {
      /** Test */
      test: [
        {
          /** Key */
          key: "publishableKey",
          /** Label */
          label: "Test Publishable Key",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "pk_test_xxxxx",
          /** Help Text */
          helpText: "Get from Stripe Dashboard > Developers > API Keys",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^pk_test_[a-zA-Z0-9]{24}$/,
          },
        },
        {
          /** Key */
          key: "secretKey",
          /** Label */
          label: "Test Secret Key",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "sk_test_xxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^sk_test_[a-zA-Z0-9]{24}$/,
          },
        },
        {
          /** Key */
          key: "webhookSecret",
          /** Label */
          label: "Test Webhook Secret",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "whsec_xxxxx",
          /** Help Text */
          helpText: "Used to verify webhook signatures",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^whsec_[a-zA-Z0-9]{32}$/,
          },
        },
      ],
      /** Live */
      live: [
        {
          /** Key */
          key: "publishableKey",
          /** Label */
          label: "Live Publishable Key",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "pk_live_xxxxx",
          /** Help Text */
          helpText: "Get from Stripe Dashboard > Developers > API Keys",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^pk_live_[a-zA-Z0-9]{24}$/,
          },
        },
        {
          /** Key */
          key: "secretKey",
          /** Label */
          label: "Live Secret Key",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "sk_live_xxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^sk_live_[a-zA-Z0-9]{24}$/,
          },
        },
        {
          /** Key */
          key: "webhookSecret",
          /** Label */
          label: "Live Webhook Secret",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "whsec_xxxxx",
          /** Help Text */
          helpText: "Used to verify webhook signatures",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^whsec_[a-zA-Z0-9]{32}$/,
          },
        },
      ],
    },
    /** Endpoints */
    endpoints: {
      test: "https://api.stripe.com/v1",
      live: "https://api.stripe.com/v1",
      /** Webhook Path */
      webhookPath: "/api/payments/stripe/webhook",
    },
    /** Docs */
    docs: {
      setup: "https://stripe.com/docs/keys",
      api: "https://stripe.com/docs/api",
      webhook: "https://stripe.com/docs/webhooks",
    },
  },

  // PHONEPE - UPI focused gateway
  {
    /** Id */
    id: "phonepe",
    /** Name */
    name: "PhonePe",
    /** Type */
    type: "alternative",
    /** Description */
    description: "UPI-focused payment gateway with high success rates",
    /** Logo */
    logo: "/images/payment-gateways/phonepe.svg",
    /** Enabled */
    enabled: false,
    /** Priority */
    priority: 5,
    /** Supported Currencies */
    supportedCurrencies: ["INR"],
    /** Supported Countries */
    supportedCountries: ["IN"],
    /** Fees */
    fees: {
      /** Domestic */
      domestic: {
        /** Percentage */
        percentage: 1.5,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
      /** International */
      international: {
        /** Percentage */
        percentage: 0,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
    },
    /** Capabilities */
    capabilities: {
      /** Refunds */
      refunds: true,
      /** Partial Refunds */
      partialRefunds: false,
      /** Recurring Payments */
      recurringPayments: false,
      /** Card Payments */
      cardPayments: true,
      /** Net Banking */
      netBanking: false,
      /** Upi */
      upi: true,
      /** Wallets */
      wallets: true,
      /** Emi */
      emi: false,
      /** International Cards */
      internationalCards: false,
    },
    /** Config */
    config: {
      /** Test */
      test: [
        {
          /** Key */
          key: "merchantId",
          /** Label */
          label: "Test Merchant ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "PGTESTPAYUAT",
          /** Help Text */
          helpText: "Get from PhonePe Dashboard",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
        {
          /** Key */
          key: "saltKey",
          /** Label */
          label: "Test Salt Key",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used to generate checksums",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "saltIndex",
          /** Label */
          label: "Test Salt Index",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "1",
          /** Help Text */
          helpText: "Salt key version number",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^\d+$/,
          },
        },
      ],
      /** Live */
      live: [
        {
          /** Key */
          key: "merchantId",
          /** Label */
          label: "Live Merchant ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "MXXXXXXX",
          /** Help Text */
          helpText: "Get from PhonePe Dashboard",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
        {
          /** Key */
          key: "saltKey",
          /** Label */
          label: "Live Salt Key",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used to generate checksums",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "saltIndex",
          /** Label */
          label: "Live Salt Index",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "1",
          /** Help Text */
          helpText: "Salt key version number",
          /** Validation */
          validation: {
            /** Pattern */
            pattern: /^\d+$/,
          },
        },
      ],
    },
    /** Endpoints */
    endpoints: {
      test: "https://api-preprod.phonepe.com/apis/pg-sandbox",
      live: "https://api.phonepe.com/apis/hermes",
      /** Webhook Path */
      webhookPath: "/api/payments/phonepe/webhook",
    },
    /** Docs */
    docs: {
      setup: "https://developer.phonepe.com/v1/docs/getting-started",
      api: "https://developer.phonepe.com/v1/reference/pay-api",
      webhook: "https://developer.phonepe.com/v1/docs/webhooks",
    },
  },

  // CASHFREE - Alternative Indian gateway
  {
    /** Id */
    id: "cashfree",
    /** Name */
    name: "Cashfree",
    /** Type */
    type: "alternative",
    /** Description */
    description: "Comprehensive payment solution with instant settlements",
    /** Logo */
    logo: "/images/payment-gateways/cashfree.svg",
    /** Enabled */
    enabled: false,
    /** Priority */
    priority: 6,
    /** Supported Currencies */
    supportedCurrencies: ["INR"],
    /** Supported Countries */
    supportedCountries: ["IN"],
    /** Fees */
    fees: {
      /** Domestic */
      domestic: {
        /** Percentage */
        percentage: 2,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
      /** International */
      international: {
        /** Percentage */
        percentage: 3,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
    },
    /** Capabilities */
    capabilities: {
      /** Refunds */
      refunds: true,
      /** Partial Refunds */
      partialRefunds: true,
      /** Recurring Payments */
      recurringPayments: true,
      /** Card Payments */
      cardPayments: true,
      /** Net Banking */
      netBanking: true,
      /** Upi */
      upi: true,
      /** Wallets */
      wallets: true,
      /** Emi */
      emi: true,
      /** International Cards */
      internationalCards: true,
    },
    /** Config */
    config: {
      /** Test */
      test: [
        {
          /** Key */
          key: "appId",
          /** Label */
          label: "Test App ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Get from Cashfree Dashboard > Credentials",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
        {
          /** Key */
          key: "secretKey",
          /** Label */
          label: "Test Secret Key",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
      ],
      /** Live */
      live: [
        {
          /** Key */
          key: "appId",
          /** Label */
          label: "Live App ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Get from Cashfree Dashboard > Credentials",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
        {
          /** Key */
          key: "secretKey",
          /** Label */
          label: "Live Secret Key",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
      ],
    },
    /** Endpoints */
    endpoints: {
      test: "https://sandbox.cashfree.com/pg",
      live: "https://api.cashfree.com/pg",
      /** Webhook Path */
      webhookPath: "/api/payments/cashfree/webhook",
    },
    /** Docs */
    docs: {
      setup: "https://docs.cashfree.com/docs/getting-started",
      api: "https://docs.cashfree.com/reference",
      webhook: "https://docs.cashfree.com/docs/webhooks",
    },
  },

  // INSTAMOJO - Small business focused
  {
    /** Id */
    id: "instamojo",
    /** Name */
    name: "Instamojo",
    /** Type */
    type: "alternative",
    /** Description */
    description: "Simple payment gateway for small businesses and startups",
    /** Logo */
    logo: "/images/payment-gateways/instamojo.svg",
    /** Enabled */
    enabled: false,
    /** Priority */
    priority: 7,
    /** Supported Currencies */
    supportedCurrencies: ["INR"],
    /** Supported Countries */
    supportedCountries: ["IN"],
    /** Fees */
    fees: {
      /** Domestic */
      domestic: {
        /** Percentage */
        percentage: 2,
        /** Fixed */
        fixed: 3,
        /** Currency */
        currency: "INR",
      },
      /** International */
      international: {
        /** Percentage */
        percentage: 0,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
    },
    /** Capabilities */
    capabilities: {
      /** Refunds */
      refunds: true,
      /** Partial Refunds */
      partialRefunds: false,
      /** Recurring Payments */
      recurringPayments: false,
      /** Card Payments */
      cardPayments: true,
      /** Net Banking */
      netBanking: true,
      /** Upi */
      upi: true,
      /** Wallets */
      wallets: true,
      /** Emi */
      emi: false,
      /** International Cards */
      internationalCards: false,
    },
    /** Config */
    config: {
      /** Test */
      test: [
        {
          /** Key */
          key: "apiKey",
          /** Label */
          label: "Test API Key",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "test_xxxxx",
          /** Help Text */
          helpText: "Get from Instamojo Dashboard > Settings > API Keys",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "authToken",
          /** Label */
          label: "Test Auth Token",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "test_xxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
      ],
      /** Live */
      live: [
        {
          /** Key */
          key: "apiKey",
          /** Label */
          label: "Live API Key",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "live_xxxxx",
          /** Help Text */
          helpText: "Get from Instamojo Dashboard > Settings > API Keys",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "authToken",
          /** Label */
          label: "Live Auth Token",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "live_xxxxx",
          /** Help Text */
          helpText: "Keep this secret and never commit to version control",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
      ],
    },
    /** Endpoints */
    endpoints: {
      test: "https://test.instamojo.com/api/1.1",
      live: "https://www.instamojo.com/api/1.1",
      /** Webhook Path */
      webhookPath: "/api/payments/instamojo/webhook",
    },
    /** Docs */
    docs: {
      setup: "https://docs.instamojo.com/docs/getting-started",
      api: "https://docs.instamojo.com/reference",
      webhook: "https://docs.instamojo.com/docs/webhooks",
    },
  },

  // CCAVENUE - Enterprise gateway
  {
    /** Id */
    id: "ccavenue",
    /** Name */
    name: "CCAvenue",
    /** Type */
    type: "alternative",
    /** Description */
    description: "Trusted enterprise payment gateway with 200+ payment options",
    /** Logo */
    logo: "/images/payment-gateways/ccavenue.svg",
    /** Enabled */
    enabled: false,
    /** Priority */
    priority: 8,
    /** Supported Currencies */
    supportedCurrencies: ["INR"],
    /** Supported Countries */
    supportedCountries: ["IN"],
    /** Fees */
    fees: {
      /** Domestic */
      domestic: {
        /** Percentage */
        percentage: 2.5,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
      /** International */
      international: {
        /** Percentage */
        percentage: 3.5,
        /** Fixed */
        fixed: 0,
        /** Currency */
        currency: "INR",
      },
    },
    /** Capabilities */
    capabilities: {
      /** Refunds */
      refunds: true,
      /** Partial Refunds */
      partialRefunds: true,
      /** Recurring Payments */
      recurringPayments: true,
      /** Card Payments */
      cardPayments: true,
      /** Net Banking */
      netBanking: true,
      /** Upi */
      upi: true,
      /** Wallets */
      wallets: true,
      /** Emi */
      emi: true,
      /** International Cards */
      internationalCards: true,
    },
    /** Config */
    config: {
      /** Test */
      test: [
        {
          /** Key */
          key: "merchantId",
          /** Label */
          label: "Test Merchant ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Get from CCAvenue Dashboard",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
        {
          /** Key */
          key: "workingKey",
          /** Label */
          label: "Test Working Key",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used for encryption",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "accessCode",
          /** Label */
          label: "Test Access Code",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used for API authentication",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
      ],
      /** Live */
      live: [
        {
          /** Key */
          key: "merchantId",
          /** Label */
          label: "Live Merchant ID",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Get from CCAvenue Dashboard",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
        {
          /** Key */
          key: "workingKey",
          /** Label */
          label: "Live Working Key",
          /** Type */
          type: "password",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used for encryption",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 20,
            /** Max Length */
            maxLength: 100,
          },
        },
        {
          /** Key */
          key: "accessCode",
          /** Label */
          label: "Live Access Code",
          /** Type */
          type: "text",
          /** Required */
          required: true,
          /** Placeholder */
          placeholder: "xxxxxxxxxx",
          /** Help Text */
          helpText: "Used for API authentication",
          /** Validation */
          validation: {
            /** Min Length */
            minLength: 10,
            /** Max Length */
            maxLength: 50,
          },
        },
      ],
    },
    /** Endpoints */
    endpoints: {
      test: "https://test.ccavenue.com/transaction",
      live: "https://secure.ccavenue.com/transaction",
      /** Webhook Path */
      webhookPath: "/api/payments/ccavenue/webhook",
    },
    /** Docs */
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
/**
 * Retrieves gateway by id
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The gatewaybyid result
 *
 * @example
 * getGatewayById("example");
 */

/**
 * Retrieves gateway by id
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The gatewaybyid result
 *
 * @example
 * getGatewayById("example");
 */

export function getGatewayById(id: string): PaymentGatewayConfig | undefined {
  return PAYMENT_GATEWAYS.find((gateway) => gateway.id === id);
}

/**
 * Get all enabled gateways sorted by priority
 */
/**
 * Retrieves enabled gateways
 *
 * @returns {any} The enabledgateways result
 *
 * @example
 * getEnabledGateways();
 */

/**
 * Retrieves enabled gateways
 *
 * @returns {any} The enabledgateways result
 *
 * @example
 * getEnabledGateways();
 */

export function getEnabledGateways(): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter((gateway) => gateway.enabled).sort(
    (a, b) => a.priority - b.priority
  );
}

/**
 * Get gateways by type
 */
/**
 * Retrieves gateways by type
 *
 * @param {PaymentGatewayType} type - The type
 *
 * @returns {any} The gatewaysbytype result
 *
 * @example
 * getGatewaysByType(type);
 */

/**
 * Retrieves gateways by type
 *
 * @param {PaymentGatewayType} /** Type */
  type - The /**  type */
  type
 *
 * @returns {any} The gatewaysbytype result
 *
 * @example
 * getGatewaysByType(/** Type */
  type);
 */

/**
 * Retrieves gateways by type
 *
 * @param {PaymentGatewayType} type - The type
 *
 * @returns {PaymentGatewayConfig[]} The getgatewaysbytype result
 *
 * @example
 * getGatewaysByType(type);
 */
export function getGatewaysByType(
  /** Type */
  type: PaymentGatewayType
): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter((gateway) => gateway.type === type).sort(
    (a, b) => a.priority - b.priority
  );
}

/**
 * Get gateways supporting a specific currency
 */
/**
 * Retrieves gateways by currency
 *
 * @param {CurrencyCode} currency - The currency
 *
 * @returns {any} The gatewaysbycurrency result
 *
 * @example
 * getGatewaysByCurrency(currency);
 */

/**
 * Retrieves gateways by currency
 *
 * @param {/**
 * Retrieves gateways by currency
 *
 * @param {CurrencyCode} currency - The currency
 *
 * @returns {PaymentGatewayConfig[]} The getgatewaysbycurrency result
 *
 * @example
 * getGatewaysByCurrency(currency);
 */
CurrencyCode} /** Currency */
  currency - The /**  currency */
  currency
 *
 * @returns {any} The gatewaysbycurrency result
 *
 * @example
 * getGatewaysByCurrency(/** Currency */
  currency);
 */

export function getGatewaysByCurrency(
  /** Currency */
  currency: CurrencyCode
): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter((gateway) =>
    gateway.supportedCurrencies.includes(currency)
  ).sort((a, b) => a.priority - b.priority);
}

/**
 * Get gateways supporting a specific country
 */
/**
 * Retriev/**
 * Retrieves gateways by country
 *
 * @param {CountryCode} country - The country
 *
 * @returns {PaymentGatewayConfig[]} The getgatewaysbycountry result
 *
 * @example
 * getGatewaysByCountry(country);
 */
es gateways by country
 *
 * @param {CountryCode} country - The country
 *
 * @returns {any} The gatewaysbycountry result
 *
 * @example
 * getGatewaysByCountry(country);
 */

/**
 * Retrieves gateways by country
 *
 * @param {CountryCode} /** Country */
  country - The /**  country */
  country
 *
 * @returns {any} The gatewaysbycountry result
 *
 * @example
 * getGatewaysByCountry(/** Country */
  country);
 */

export function getGatewaysByCountry(
  /** Country */
  country: CountryCode
): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter((gateway) =>
    gateway.supportedCountries.includes(country)
  ).sort((a, /**
 * Retrieves gateways by capability
 *
 * @param {keyof PaymentGatewayConfig["capabilities"]} capability - The capability
 *
 * @returns {PaymentGatewayConfig[]} The getgatewaysbycapability result
 *
 * @example
 * getGatewaysByCapability(capability);
 */
b) => a.priority - b.priority);
}

/**
 * Get gateways with specific capability
 */
/**
 * Retrieves gateways by capability
 *
 * @param {keyof PaymentGatewayConfig["capabilities"]} capability - The capability
 *
 * @returns {any} The gatewaysbycapability result
 *
 * @example
 * getGatewaysByCapability(capability);
 */

/**
 * Retrieves gateways by capability
 *
 * @param {keyof PaymentGatewayConfig["capabilities"]} /** Capability */
  capability - The /**  capability */
  capability
 *
 * @returns {any} The gatewaysbycapability result
 *
 * @example
 * getGatewaysByCapability(/** Capability */
  capability);
 */

export function getGatewaysByCapability(
  /** Capability */
  capability: keyof PaymentGatewayConfig["capabilities"]
): PaymentGatewayConfig[] {
  return PAYMENT_GATEWAYS.filter(
    (gateway) => gateway.capabilities[capability]
  ).sort((a, b) => a.priority - b.priority);
}

/**
 * Calculate gateway fee for amount
 */
/**
 * Calculates gateway fee
 *
 * @param {string} gatewayId - gateway identifier
 * @param {number} amount - The amount
 * @param {boolean} [isInternational] - Whether is international
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * calculateGatewayFee("example", 123, true);
 */

/**
 * Calculates gateway fee
 *
 * @returns {string} The calculategatewayfee result
 *
 * @example
 * calculateGatewayFee();
 */

export function calculateGatewayFee(
  /** Gateway Id */
  gatewayId: string,
  /** Amount */
  amount: number,
  /** Is International */
  isInternational: boolean = false
): number {
  const gateway = getGatewayById(gatewayId);
  if (!gateway) return 0;

  const feeConfig = isInternational
    ? gateway.fees.international
    : gateway.fees.domestic;
  /**
   * Performs percentage fee operation
   *
   * @returns {any} The percentagefee result
   */

  /**
   * Performs percentage fee operation
   *
   * @returns {any} The percentagefee result
   */

  const percentageFee = (amount * feeConfig.percentage) / 100;
  const totalFee = percentageFee + feeConfig.fixed;

  return Math.round(totalFee * 100) / 100; // Round to 2 decimal places
}

/**
 * Validate gateway configuration field
 */
/**
 * Validates gateway field
 *
 * @returns {string} The validategatewayfield result
 *
 * @example
 * validateGatewayField();
 */

/**
 * Validates gateway field
 *
 * @returns {string} The validategatewayfield result
 *
 * @example
 * validateGatewayField();
 */

export function validateGatewayField(
  /** Gateway Id */
  gatewayId: string,
  /** Mode */
  mode: PaymentMode,
  /** Field Key */
  fieldKey: string,
  /** Value */
  value: string
): { isValid: boolean; error?: string } {
  const gateway = getGatewayById(gatewayId);
  if (!gateway) {
    return { isValid: false, error: "Gateway not found" };
  }

  /**
 * Performs field operation
 *
 * @param {any} (f - The (f
 *
 * @returns {any} The field result
 *
 */
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
        /** Is Valid */
        isValid: false,
        /** Error */
        error: `${field.label} must be at least ${minLength} characters`,
      };
    }

    if (maxLength && value.length > maxLength) {
      return {
        /** Is Valid */
        isValid: false,
        /** Error */
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
/**
 * Retrieves best gateway
 *
 * @returns {number} The bestgateway result
 *
 * @example
 * getBestGateway();
 */

/**
 * Retrieves best gateway
 *
 * @returns {any} The bestgateway result
 *
 * @example
 * getBestGateway();
 */

export function getBestGateway(params: {
  /** Currency */
  currency: CurrencyCode;
  /** Country */
  country: CountryCode;
  /** Amount */
  amount: number;
  /** Required Capabilities */
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
