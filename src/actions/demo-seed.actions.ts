"use server";

/**
 * Demo Seed Server Action
 *
 * Dev-only action for loading/deleting seed data.
 * Replaces the direct apiClient.post() call in useDemoSeed mutation.
 *
 * The POST /api/demo/seed route handler contains the actual logic;
 * this action delegates to it via a server-side fetch to preserve the
 * existing route logic intact (which is 800+ lines of collection-specific
 * seeding with PII encryption, Auth user creation, subcollection handling, etc).
 */

import { serverLogger } from "@/lib/server-logger";
import { ValidationError } from "@mohasinac/appkit/errors";

export type SeedCollectionName =
  | "users"
  | "addresses"
  | "categories"
  | "stores"
  | "products"
  | "orders"
  | "reviews"
  | "bids"
  | "coupons"
  | "carouselSlides"
  | "homepageSections"
  | "siteSettings"
  | "faqs"
  | "notifications"
  | "payouts"
  | "blogPosts"
  | "events"
  | "eventEntries"
  | "sessions"
  | "carts";

export interface SeedOperationResult {
  message: string;
  details: {
    created?: number;
    updated?: number;
    deleted?: number;
    skipped?: number;
    errors?: number;
    collections?: string[];
  };
}

/**
 * Run seed load/delete operation. Dev-only — throws in production.
 */
export async function demoSeedAction(vars: {
  action: "load" | "delete";
  collections?: SeedCollectionName[];
}): Promise<SeedOperationResult> {
  if (process.env.NODE_ENV === "production") {
    throw new ValidationError("Not available in production");
  }

  // Delegate to the existing API route handler which has all the complex
  // collection-specific seeding logic (800+ lines). We call it server-side
  // so there's no browser round-trip — this runs in the same Node process.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/demo/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vars),
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: "Seed operation failed" }));
    serverLogger.error("demoSeedAction failed", {
      status: response.status,
      body: errorBody,
    });
    throw new ValidationError(errorBody.message ?? "Seed operation failed");
  }

  const result = await response.json();
  return result.data as SeedOperationResult;
}
