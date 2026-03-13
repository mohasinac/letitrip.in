/**
 * Loyalty — RC Earn Helpers
 *
 * Server-only calculation utilities for crediting RC as a loyalty
 * reward. Two earn triggers are supported:
 *
 *   1. Store purchase  — user earns coins proportional to ₹ spent.
 *   2. Event entry     — user earns a flat coin reward on eligible event entry.
 *
 * Rates are driven by a LoyaltyConfig stored in siteSettings.loyalty.
 * Use siteSettingsRepository.getLoyaltyConfig() to fetch the live config.
 * All functions are pure and have no side-effects.
 */

import type { LoyaltyConfig } from "@/db/schema";

/**
 * Calculate how many RC a user earns from a store purchase.
 *
 * @param spendAmountRs - Total amount paid in ₹ (after discounts, before GST)
 * @param config        - LoyaltyConfig from siteSettings.loyalty
 * @returns             Whole number of coins to credit (0 when disabled)
 *
 * @example
 *   calculatePurchaseCoins(350, { active: true, rupeePerCoin: 10, ... })
 *   // → 35
 */
export function calculatePurchaseCoins(
  spendAmountRs: number,
  config: LoyaltyConfig,
): number {
  if (!config.active || spendAmountRs <= 0 || config.rupeePerCoin <= 0) {
    return 0;
  }
  return Math.floor(spendAmountRs / config.rupeePerCoin);
}

/**
 * Calculate how many RC a user earns for submitting a valid event entry.
 * Respects the per-event override: if the event specifies coinReward > 0,
 * that value is used directly; otherwise falls back to config.eventEntryCoins.
 *
 * @param eventCoinReward - The event's own coinReward field (may be 0 / undefined)
 * @param config          - LoyaltyConfig from siteSettings.loyalty
 * @returns               Whole number of coins to credit (0 when disabled)
 *
 * @example
 *   calculateEventCoins(20, { active: true, eventEntryCoins: 5, ... })
 *   // → 20  (event override)
 *
 *   calculateEventCoins(0, { active: true, eventEntryCoins: 5, ... })
 *   // → 5   (platform default)
 *
 *   calculateEventCoins(0, { active: false, eventEntryCoins: 5, ... })
 *   // → 0   (loyalty disabled)
 */
export function calculateEventCoins(
  eventCoinReward: number | undefined,
  config: LoyaltyConfig,
): number {
  if (!config.active) return 0;
  const reward = eventCoinReward ?? 0;
  return reward > 0 ? reward : config.eventEntryCoins;
}
