"use server";

/**
 * Promotions Server Action — thin wrapper
 *
 * Business logic lives in @mohasinac/appkit/features/promotions.
 * This wrapper adds Next.js server-action semantics.
 */

import { getPromotions, type PromotionsResult } from "@mohasinac/appkit";

export type { PromotionsResult };

export async function getPromotionsAction(): Promise<PromotionsResult> {
  return getPromotions();
}

