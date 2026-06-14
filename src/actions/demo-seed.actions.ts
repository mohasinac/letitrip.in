"use server";

/**
 * Demo Seed Server Actions — thin entrypoint
 *
 * Admin-controlled seed action — delegates to appkit demoSeed which calls the API route.
 */

import { ActionResult, demoSeed, wrapAction } from "@mohasinac/appkit/server";
import type {
  SeedCollectionName,
  SeedOperationResult,
} from "@mohasinac/appkit";

/**
 * Run seed load/delete operation. Controlled via admin dashboard.
 */
export async function demoSeedAction(vars: {
  action: "load" | "delete";
  collections?: SeedCollectionName[];
  dryRun?: boolean;
}): Promise<ActionResult<SeedOperationResult>> {
  return wrapAction(async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return demoSeed(vars, baseUrl);
  });
}

