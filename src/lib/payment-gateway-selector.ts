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

export type PaymentMethod =
  | "card"
  | "upi"
  | "netbanking"
  | "wallet"
  | "emi"
  | "any";

export interface GatewaySelectionParams {
  amount: number;
  currency: CurrencyCode;
  country: CountryCode;
  paymentMethod?: PaymentMethod;
  requiredCapabilities?: Array<keyof PaymentGatewayConfig["capabilities"]>;
  customerPreference?: string; // Gateway ID preferred by customer
}

export interface GatewayWithScore {
  gateway: PaymentGatewayConfig;
  score: number;
  fee: number;
  totalAmount: number;
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
export function selectBestGateway(
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
function filterByPaymentMethod(
  gateways: PaymentGatewayConfig[],
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
    default:
      return gateways;
  }
}

/**
 * Score gateways based on cost and priority
 * Higher score = better gateway
 */
function scoreGateways(
  gateways: PaymentGatewayConfig[],
  amount: number,
  country: CountryCode
): GatewayWithScore[] {
  const isInternational = country !== "IN";

  const scored: GatewayWithScore[] = gateways.map((gateway) => {
    const fee = calculateGatewayFee(gateway.id, amount, isInternational);
    const totalAmount = amount + fee;
    const reasons: string[] = [];

    let score = 100; // Base score

    // Lower fee = higher score (fee impact: 0-30 points)
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
export function calculateFee(
  gatewayId: string,
  amount: number,
  country: CountryCode
): number {
  const isInternational = country !== "IN";
  return calculateGatewayFee(gatewayId, amount, isInternational);
}

/**
 * Get all suitable gateways ranked by score
 */
export function getRankedGateways(
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
export function isGatewayCompatible(
  gatewayId: string,
  params: {
    currency: CurrencyCode;
    country: CountryCode;
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
export function getGatewayRecommendations(params: GatewaySelectionParams): {
  recommended: PaymentGatewayConfig | null;
  alternatives: GatewayWithScore[];
  reasons: string[];
} {
  const ranked = getRankedGateways(params);

  if (ranked.length === 0) {
    return {
      recommended: null,
      alternatives: [],
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
    recommended: best.gateway,
    alternatives,
    reasons,
  };
}

/**
 * Calculate total amount with fee
 */
export function calculateTotalWithFee(
  amount: number,
  gatewayId: string,
  isInternational: boolean
): {
  amount: number;
  fee: number;
  total: number;
  feePercentage: number;
} {
  const fee = calculateGatewayFee(gatewayId, amount, isInternational);
  const total = amount + fee;
  const feePercentage = amount > 0 ? (fee / amount) * 100 : 0;

  return {
    amount,
    fee,
    total,
    feePercentage,
  };
}

/**
 * Compare all suitable gateways for a transaction
 * Returns ranked list with scores
 */
export function compareGateways(
  params: GatewaySelectionParams
): GatewayWithScore[] {
  return getRankedGateways(params);
}

/**
 * Get gateway recommendation with detailed reasoning
 */
export function getGatewayRecommendation(
  params: GatewaySelectionParams
): GatewayWithScore | null {
  const ranked = getRankedGateways(params);
  return ranked.length > 0 ? ranked[0] : null;
}
