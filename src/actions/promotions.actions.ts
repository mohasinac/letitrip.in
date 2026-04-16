"use server";

/**
 * Promotions Server Action — thin wrapper
 *
 * Business logic lives in @mohasinac/appkit/features/promotions.
 * This wrapper adds Next.js server-action semantics.
 */

import { getPromotions } from "@mohasinac/appkit/features/promotions";
import type { PromotionsResult } from "@mohasinac/appkit/features/promotions";

export type { PromotionsResult };

export async function getPromotionsAction(): Promise<PromotionsResult> {
  return getPromotions();
}

