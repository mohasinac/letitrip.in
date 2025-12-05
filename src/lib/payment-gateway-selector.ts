/**
 * @fileoverview TypeScript Module
 * @module src/lib/payment-gateway-selector
 * @description This file contains functionality related to payment-gateway-selector
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Payment Gateway Selector
 *
 * Smart gateway selection logic that chooses the best payment gateway
 * based on transaction parameters, fees, and gateway capabilities.
 *
 * Usage:
 * ```ts
 * import { selectBestGateway, calculateFee } from '@/lib/payment-gateway-selector';
 *
 * const gateway = selectBestGateway({
 *   amount: 1000,
 *   currency: 'INR',
 *   country: 'IN',
 *   paymentMethod: 'upi'
 * });
 * ```
 */

import {
  calculateGatewayFee,
  getEnabledGateways,
  type CountryCode,
  type CurrencyCode,
  type PaymentGatewayConfig,
} from "@/config/payment-gateways.config";

// ============================================================================
// TYPES
// ============================================================================

/**
 * PaymentMethod type
 * 
 * @typedef {Object} PaymentMethod
 * @description Type definition for PaymentMethod
 */
export type PaymentMethod =
  | "card"
  | "upi"
  | "netbanking"
  | "wallet"
  | "emi"
  | "any";

/**
 * GatewaySelectionParams interface
 * 
 * @interface
 * @description Defines the structure and contract for GatewaySelectionParams
 */
export interface GatewaySelectionParams {
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Country */
  country: CountryCode;
  /** Payment Method */
  paymentMethod?: PaymentMethod;
  /** Required Capabilities */
  requiredCapabilities?: Array<keyof PaymentGatewayConfig["capabilities"]>;
  customerPreference?: string; // Gateway ID preferred by customer
}

/**
 * GatewayWithScore interface
 * 
 * @interface
 * @description Defines the structure and contract for GatewayWithScore
 */
export interface GatewayWithScore {
  /** Gateway */
  gateway: PaymentGatewayConfig;
  /** Score */
  score: number;
  /** Fee */
  fee: number;
  /** Total Amount */
  totalAmount: number;
  /** Reasons */
  reasons: string[];
}

// ============================================================================
// GATEWAY SELECTION LOGIC
// ============================================================================

/**
 * Select the best payment gateway based on multiple criteria
 *
 * Selection criteria (in order of priority):
 * 1. Customer preference (if specified and valid)
 * 2. Currency and country support
 * 3. Payment method capability
 * 4. Required capabilities
 * 5. Lowest total cost (fee)
 * 6. Gateway priority
 */
/**
 * Performs select best gateway operation
 *
 * @param {GatewaySelectionParams} params - The params
 *
 * @returns {any} The selectbestgateway result
 *
 * @example
 * selectBestGateway(params);
 */

/**
 * Performs select best gateway operation
 *
 * @param {GatewaySelectionParams} /** Params */
  params - The /**  params */
  params
 *
 * @returns {any} The selectbestgateway result
 *
 * @example
 * selectBestGateway(/** Params */
  params);
 */

export function selectBestGateway(
  /** Params */
  params: GatewaySelectionParams
): PaymentGatewayConfig | null {
  const {
    amount,
    currency,
    country,
    paymentMethod = "any",
    requiredCapabilities = [],
    customerPreference,
  } = params;

  // Step 1: Start with enabled gateways
  let candidates = getEnabledGateways();

  if (candidates.length === 0) {
    return null;
  }

  // Step 2: Filter by customer preference if specified
  if (customerPreference) {
    const preferred = candidates.find((g) => g.id === customerPreference);
    if (preferred) {
      // Validate preferred gateway supports transaction
      if (
        preferred.supportedCurrencies.includes(currency) &&
        preferred.supportedCountries.includes(country)
      ) {
        return preferred;
      }
    }
  }

  // Step 3: Filter by currency support
  candidates = candidates.filter((gateway) =>
    gateway.supportedCurrencies.includes(currency)
  );

  if (candidates.length === 0) {
    return null;
  }

  // Step 4: Filter by country support
  candidates = candidates.filter((gateway) =>
    gateway.supportedCountries.includes(country)
  );

  if (candidates.length === 0) {
    return null;
  }

  // Step 5: Filter by payment method capability
  if (paymentMethod !== "any") {
    candidates = filterByPaymentMethod(candidates, paymentMethod);
  }

  if (candidates.length === 0) {
    return null;
  }

  // Step 6: Filter by required capabilities
  if (requiredCapabilities.length > 0) {
    candidates = candidates.filter((gateway) =>
      requiredCapabilities.every((cap) => gateway.capabilities[cap])
    );
  }

  if (candidates.length === 0) {
    return null;
  }

  // Step 7: Score and rank remaining candidates
  const scored = scoreGateways(candidates, amount, country);

  // Return gateway with highest score
  return scored.length > 0 ? scored[0].gateway : null;
}

/**
 * Filter gateways by payment method capability
 */
/**
 * Filters by payment method
 *
 * @param {PaymentGatewayConfig[]} gateways - The gateways
 * @param {PaymentMethod} method - The method
 *
 * @returns {any} The filterbypaymentmethod result
 */

/**
 * Filters by payment method
 *
 * @returns {any} The filterbypaymentmethod result
 */

function filterByPaymentMethod(
  /** Gateways */
  gateways: PaymentGatewayConfig[],
  /** Method */
  method: PaymentMethod
): PaymentGatewayConfig[] {
  switch (method) {
    case "card":
      return gateways.filter((g) => g.capabilities.cardPayments);
    case "upi":
      return gateways.filter((g) => g.capabilities.upi);
    case "netbanking":
      return gateways.filter((g) => g.capabilities.netBanking);
    case "wallet":
      return gateways.filter((g) => g.capabilities.wallets);
    case "emi":
      return gateways.filter((g) => g.capabilities.emi);
    /** Default */
    default:
      return gateways;
  }
}

/**
 * Score gateways based on cost and priority
 * Higher score = better gateway
 */
/**
 * Performs score gateways operation
 *
 * @param {PaymentGatewayConfig[]} gateways - The gateways
 * @param {number} amount - The amount
 * @param {CountryCode} country - The country
 *
 * @returns {number} The scoregateways result
 */

/**
 * Performs score gateways operation
 *
 * @returns {number} The scoregateways result
 */

function scoreGateways(
  /** Gateways */
  gateways: PaymentGatewayConfig[],
  /** Amount */
  amount: number,
  /** Country */
  country: CountryCode
): GatewayWithScore[] {
  const isInternational = country !== "IN";

  const scored: GatewayWithScore[] = gateways.map((gateway) => {
    const fee = calculateGatewayFee(gateway.id, amount, isInternational);
    const totalAmount = amount + fee;
    const reasons: string[] = [];

    let score = 100; // Base score

    // Lower fee = higher score (fee impact: 0-30 points)
    /**
     * Performs fee percentage operation
     *
     * @returns {any} The feepercentage result
     */

    /**
     * Performs fee percentage operation
     *
     * @returns {any} The feepercentage result
     */

    const feePercentage = (fee / amount) * 100;
    score -= Math.min(feePercentage * 10, 30);
    reasons.push(`Fee: ${feePercentage.toFixed(2)}%`);

    // Priority bonus (0-20 points)
    // Lower priority number = higher bonus
    const priorityBonus = Math.max(20 - gateway.priority * 2, 0);
    score += priorityBonus;
    reasons.push(`Priority: ${gateway.priority}`);

    // Capability bonuses
    let capabilityScore = 0;
    if (gateway.capabilities.refunds) capabilityScore += 5;
    if (gateway.capabilities.partialRefunds) capabilityScore += 3;
    if (gateway.capabilities.recurringPayments) capabilityScore += 3;
    if (gateway.capabilities.upi) capabilityScore += 5; // UPI is popular in India
    if (gateway.capabilities.internationalCards && isInternational) {
      capabilityScore += 10;
    }

    score += capabilityScore;
    reasons.push(`Capabilities: +${capabilityScore}`);

    return {
      gateway,
      score,
      fee,
      totalAmount,
      reasons,
    };
  });

  // Sort by score (descending)
  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Calculate total fee for a gateway
 */
/**
 * Calculates fee
 *
 * @param {string} gatewayId - gateway identifier
 * @param {number} amount - The amount
 * @param {CountryCode} country - The country
 *
 * @returns {string} The calculatefee result
 *
 * @example
 * calculateFee("example", 123, country);
 */

/**
 * Calculates fee
 *
 * @returns {string} The calculatefee result
 *
 * @example
 * calculateFee();
 */

export function calculateFee(
  /** Gateway Id */
  gatewayId: string,
  /** Amount */
  amount: number,
  /** Country */
  country: CountryCode
): number {
  const isInternational = country !== "IN";
  return calculateGatewayFee(gatewayId, amount, isInternational);
}

/**
 * Get all suitable gateways ranked by score
 */
/**
 * Retrieves ranked gateways
 *
 * @param {GatewaySelectionParams} params - The params
 *
 * @returns {any} The rankedgateways result
 *
 * @example
 * getRankedGateways(params);
 */

/**
 * Retrieves ranked gateways
 *
 * @param {GatewaySelectionParams} /** Params */
  params - The /**  params */
  params
 *
 * @returns {any} The rankedgateways result
 *
 * @example
 * getRankedGateways(/** Params */
  params);
 */

export function getRankedGateways(
  /** Params */
  params: GatewaySelectionParams
): GatewayWithScore[] {
  const {
    amount,
    currency,
    country,
    paymentMethod = "any",
    requiredCapabilities = [],
  } = params;

  // Start with enabled gateways
  let candidates = getEnabledGateways();

  // Filter by currency
  candidates = candidates.filter((gateway) =>
    gateway.supportedCurrencies.includes(currency)
  );

  // Filter by country
  candidates = candidates.filter((gateway) =>
    gateway.supportedCountries.includes(country)
  );

  // Filter by payment method
  if (paymentMethod !== "any") {
    candidates = filterByPaymentMethod(candidates, paymentMethod);
  }

  // Filter by capabilities
  if (requiredCapabilities.length > 0) {
    candidates = candidates.filter((gateway) =>
      requiredCapabilities.every((cap) => gateway.capabilities[cap])
    );
  }

  // Score and return
  return scoreGateways(candidates, amount, country);
}

/**
 * Check if gateway supports transaction
 */
/**
 * Checks if gateway compatible
 *
 * @returns {string} The isgatewaycompatible result
 *
 * @example
 * isGatewayCompatible();
 */

/**
 * Checks if gateway compatible
 *
 * @returns {string} The isgatewaycompatible result
 *
 * @example
 * isGatewayCompatible();
 */

export function isGatewayCompatible(
  /** Gateway Id */
  gatewayId: string,
  /** Params */
  params: {
    /** Currency */
    currency: CurrencyCode;
    /** Country */
    country: CountryCode;
    /** Payment Method */
    paymentMethod?: PaymentMethod;
  }
): boolean {
  const gateways = getEnabledGateways();
  const gateway = gateways.find((g) => g.id === gatewayId);

  if (!gateway) return false;

  // Check currency support
  if (!gateway.supportedCurrencies.includes(params.currency)) {
    return false;
  }

  // Check country support
  if (!gateway.supportedCountries.includes(params.country)) {
    return false;
  }

  // Check payment method support
  if (params.paymentMethod && params.paymentMethod !== "any") {
    const filtered = filterByPaymentMethod([gateway], params.paymentMethod);
    if (filtered.length === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Get gateway recommendations with explanations
 */
/**
 * Retrieves gateway recommendations
 *
 * @param {GatewaySelectionParams} params - The params
 *
 * @returns {string} The gatewayrecommendations result
 *
 * @example
 * getGatewayRecommendations(params);
 */

/**
 * Retrieves gateway recommendations
 *
 * @param {GatewaySelectionParams} params - The params
 *
 * @returns {any} The gatewayrecommendations result
 *
 * @example
 * getGatewayRecommendations(params);
 */

export function getGatewayRecommendations(params: GatewaySelectionParams): {
  /** Recommended */
  recommended: PaymentGatewayConfig | null;
  /** Alternatives */
  alternatives: GatewayWithScore[];
  /** Reasons */
  reasons: string[];
} {
  const ranked = getRankedGateways(params);

  if (ranked.length === 0) {
    return {
      /** Recommended */
      recommended: null,
      /** Alternatives */
      alternatives: [],
      /** Reasons */
      reasons: [
        "No suitable gateway found",
        `Currency: ${params.currency}`,
        `Country: ${params.country}`,
      ],
    };
  }

  const best = ranked[0];
  const alternatives = ranked.slice(1, 4); // Top 3 alternatives

  const reasons = [
    `Lowest total cost: ${best.totalAmount.toFixed(2)} ${params.currency}`,
    `Transaction fee: ${best.fee.toFixed(2)} ${params.currency}`,
    `Score: ${best.score.toFixed(1)}/100`,
    ...best.reasons,
  ];

  return {
    /** Recommended */
    recommended: best.gateway,
    alternatives,
    reasons,
  };
}

/**
 * Compare two gateways for a transaction
 */
/**
 * Performs compare gateways operation
 *
 * @returns {string} The comparegateways result
 *
 * @example
 * compareGateways();
 */

/**
 * Performs compare gateways operation
 *
 * @returns {string} The comparegateways result
 *
 * @example
 * compareGateways();
 */

export function compareGateways(
  /** Gateway Id1 */
  gatewayId1: string,
  /** Gateway Id2 */
  gatewayId2: string,
  /** Params */
  params: {
    /** Amount */
    amount: number;
    /** Currency */
    currency: CurrencyCode;
    /** Country */
    country: CountryCode;
  }
): {
  /** Winner */
  winner: string;
  /** Comparison */
  comparison: {
    [key: string]: {
      /** Fee */
      fee: number;
      /** Total Amount */
      totalAmount: number;
      /** Score */
      score: number;
    };
  };
} {
  const gateways = getEnabledGateways();
  const gateway1 = gateways.find((g) => g.id === gatewayId1);
  const gateway2 = gateways.find((g) => g.id === gatewayId2);

  if (!gateway1 || !gateway2) {
    throw new Error("One or both gateways not found");
  }

  const scored = scoreGateways(
    [gateway1, gateway2],
    params.amount,
    params.country
  );

  return {
    /** Winner */
    winner: scored[0].gateway.id,
    /** Comparison */
    comparison: {
      [gatewayId1]: {
        /** Fee */
        fee: scored.find((s) => s.gateway.id === gatewayId1)?.fee || 0,
        /** Total Amount */
        totalAmount:
          scored.find((s) => s.gateway.id === gatewayId1)?.totalAmount || 0,
        /** Score */
        score: scored.find((s) => s.gateway.id === gatewayId1)?.score || 0,
      },
      [gatewayId2]: {
        /** Fee */
        fee: scored.find((s) => s.gateway.id === gatewayId2)?.fee || 0,
        /** Total Amount */
        totalAmount:
          scored.find((s) => s.gateway.id === gatewayId2)?.totalAmount || 0,
        /** Score */
        score: scored.find((s) => s.gateway.id === gatewayId2)?.score || 0,
      },
    },
  };
}
