"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Promotions Server Action â€” thin wrapper
 *
 * Business logic lives in @mohasinac/appkit/features/promotions.
 * This wrapper adds Next.js server-action semantics.
 */

import { getPromotions, type PromotionsResult } from "@mohasinac/appkit";


export async function getPromotionsAction(): Promise<ActionResult<PromotionsResult>> {
  return wrapAction(async () => {
    return getPromotions();
  });
}

