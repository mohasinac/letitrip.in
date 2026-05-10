"use server";

/**
 * Demo Seed Server Actions — thin entrypoint
 *
 * Admin-controlled seed action — delegates to appkit demoSeed which calls the API route.
 */

import {
  demoSeed,
  type SeedCollectionName,
  type SeedOperationResult,
} from "@mohasinac/appkit";

/**
 * Run seed load/delete operation. Controlled via admin dashboard.
 */
export async function demoSeedAction(vars: {
  action: "load" | "delete";
  collections?: SeedCollectionName[];
  dryRun?: boolean;
}): Promise<SeedOperationResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return demoSeed(vars, baseUrl);
}

