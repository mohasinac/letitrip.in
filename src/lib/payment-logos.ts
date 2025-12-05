/**
 * @fileoverview TypeScript Module
 * @module src/lib/payment-logos
 * @description This file contains functionality related to payment-logos
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Payment Logo Manager
 * Handles loading payment logos from Firebase Storage or fallback
 */

import { getPaymentLogoUrl } from "@/services/static-assets-client.service";

// Default fallback logos (base64 or text-based)
const DEFAULT_LOGOS: Record<string, string> = {
  visa: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%231A1F71" font-family="Arial,sans-serif" font-size="12" font-weight="bold">VISA</text></svg>',
  /** Mastercard */
  mastercard:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><circle cx="15" cy="16" r="8" fill="%23EB001B"/><circle cx="25" cy="16" r="8" fill="%23F79E1B"/></svg>',
  amex: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23006FCF" font-family="Arial,sans-serif" font-size="10" font-weight="bold">AMEX</text></svg>',
  /** Discover */
  discover:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23FF6000" font-family="Arial,sans-serif" font-size="9" font-weight="bold">DISCOVER</text></svg>',
  /** Dinersclub */
  dinersclub:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%230079BE" font-family="Arial,sans-serif" font-size="8" font-weight="bold">DINERS</text></svg>',
  jcb: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%230E4C96" font-family="Arial,sans-serif" font-size="12" font-weight="bold">JCB</text></svg>',
  /** Paypal */
  paypal:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23003087" font-family="Arial,sans-serif" font-size="10" font-weight="bold">PayPal</text></svg>',
  /** Paidy */
  paidy:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%234CC764" font-family="Arial,sans-serif" font-size="10" font-weight="bold">Paidy</text></svg>',
  /** Alipay */
  alipay:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2300A0E9" font-family="Arial,sans-serif" font-size="9" font-weight="bold">Alipay+</text></svg>',
  /** Unionpay */
  unionpay:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23E21836" font-family="Arial,sans-serif" font-size="8" font-weight="bold">UnionPay</text></svg>',
  /** Atome */
  atome:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2300C9A7" font-family="Arial,sans-serif" font-size="10" font-weight="bold">Atome</text></svg>',
};

// Cache for loaded logos
const logoCache = new Map<string, string>();

/**
 * Get payment logo URL (from Storage or fallback)
 */
/**
 * Retrieves payment logo
 *
 * @param {string} paymentId - payment identifier
 *
 * @returns {Promise<any>} Promise resolving to paymentlogo result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getPaymentLogo("example");
 */

/**
 * Retrieves payment logo
 *
 * @param {string} paymentId - payment identifier
 *
 * @returns {Promise<any>} Promise resolving to paymentlogo result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getPaymentLogo("example");
 */

export async function getPaymentLogo(paymentId: string): Promise<string> {
  // Check cache first
  if (logoCache.has(paymentId)) {
    return logoCache.get(paymentId)!;
  }

  try {
    // Try to load from Firebase Storage
    const url = await getPaymentLogoUrl(paymentId);
    if (url) {
      logoCache.set(paymentId, url);
      return url;
    }
  } catch (error) {
    console.warn(`Could not load logo for ${paymentId}, using fallback`);
  }

  // Use fallback
  const fallback = DEFAULT_LOGOS[paymentId] || getTextFallback(paymentId);
  logoCache.set(paymentId, fallback);
  return fallback;
}

/**
 * Generate text-based fallback logo
 */
/**
 * Retrieves text fallback
 *
 * @param {string} paymentId - payment identifier
 *
 * @returns {string} The textfallback result
 */

/**
 * Retrieves text fallback
 *
 * @param {string} paymentId - payment identifier
 *
 * @returns {string} The textfallback result
 */

function getTextFallback(paymentId: string): string {
  const text = paymentId.charAt(0).toUpperCase() + paymentId.slice(1);
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><rect width="48" height="32" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="Arial,sans-serif" font-size="8" font-weight="600">${encodeURIComponent(
    text,
  )}</text></svg>`;
}

/**
 * Preload all payment logos
 */
/**
 * Performs preload payment logos operation
 *
 * @param {string[]} paymentIds - The payment ids
 *
 * @returns {Promise<any>} Promise resolving to preloadpaymentlogos result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * preloadPaymentLogos(paymentIds);
 */

/**
 * Performs preload payment logos operation
 *
 * @param {string[]} paymentIds - The payment ids
 *
 * @returns {Promise<any>} Promise resolving to preloadpaymentlogos result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * preloadPaymentLogos(paymentIds);
 */

export async function preloadPaymentLogos(paymentIds: string[]): Promise<void> {
  await Promise.all(paymentIds.map((id) => getPaymentLogo(id)));
}

/**
 * Clear logo cache
 */
/**
 * Performs clear logo cache operation
 *
 * @returns {void} No return value
 *
 * @example
 * clearLogoCache();
 */

/**
 * Performs clear logo cache operation
 *
 * @returns {void} No return value
 *
 * @example
 * clearLogoCache();
 */

export function clearLogoCache(): void {
  logoCache.clear();
}

/**
 * Get all cached logos
 */
/**
 * Retrieves cached logos
 *
 * @returns {any} The cachedlogos result
 *
 * @example
 * getCachedLogos();
 */

/**
 * Retrieves cached logos
 *
 * @returns {any} The cachedlogos result
 *
 * @example
 * getCachedLogos();
 */

export function getCachedLogos(): Map<string, string> {
  return new Map(logoCache);
}

export default {
  getPaymentLogo,
  preloadPaymentLogos,
  clearLogoCache,
  getCachedLogos,
};
