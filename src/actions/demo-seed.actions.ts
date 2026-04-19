"use server";

/**
 * Demo Seed Server Actions — thin entrypoint
 *
 * Dev-only auth + delegates to appkit demoSeed which calls the API route.
 */

import { ValidationError } from "@mohasinac/appkit/server";
import {
  demoSeed,
  type SeedCollectionName,
  type SeedOperationResult,
} from "@mohasinac/appkit/server";

/**
 * Run seed load/delete operation. Dev-only — throws if NODE_ENV is production.
 */
export async function demoSeedAction(vars: {
  action: "load" | "delete";
  collections?: SeedCollectionName[];
}): Promise<SeedOperationResult> {
  if (process.env.NODE_ENV === "production") {
    throw new ValidationError("Not available in production");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return demoSeed(vars, baseUrl);
}

export type { SeedCollectionName, SeedOperationResult };

