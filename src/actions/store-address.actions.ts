"use server";

/**
 * Store Address Server Actions — thin entrypoint
 *
 * Authenticates (seller/admin only), validates, rate-limits,
 * then delegates to appkit domain functions.  No business logic here.
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import {
  listStoreAddressesForSeller,
  createStoreAddressForSeller,
  updateStoreAddressForSeller,
  deleteStoreAddressForSeller,
} from "@mohasinac/appkit/features/stores/server";
import type { StoreAddressDocument } from "@/db/schema/store-addresses";

// ─── Validation ────────────────────────────────────────────────────────────

const storeAddressBodySchema = z.object({
  label: z.string().min(1).max(60),
  fullName: z.string().min(1).max(120),
  phone: z.string().min(7).max(20),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(4).max(10),
  country: z.string().min(1).max(80),
  isDefault: z.boolean().optional().default(false),
});

export type StoreAddressInput = z.infer<typeof storeAddressBodySchema>;

// ─── Server Actions ────────────────────────────────────────────────────────

export async function listStoreAddressesAction(): Promise<
  StoreAddressDocument[]
> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(
    `store-address:list:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");
  return listStoreAddressesForSeller(user.uid) as Promise<StoreAddressDocument[]>;
}

export async function createStoreAddressAction(
  input: StoreAddressInput,
): Promise<StoreAddressDocument> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(
    `store-address:create:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = storeAddressBodySchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid address data",
    );

  return createStoreAddressForSeller(user.uid, parsed.data) as Promise<StoreAddressDocument>;
}

export async function updateStoreAddressAction(
  addressId: string,
  input: Partial<StoreAddressInput>,
): Promise<StoreAddressDocument> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(
    `store-address:update:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!addressId?.trim()) throw new ValidationError("addressId is required");

  const parsed = storeAddressBodySchema.partial().safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid address data",
    );

  return updateStoreAddressForSeller(user.uid, addressId, parsed.data) as Promise<StoreAddressDocument>;
}

export async function deleteStoreAddressAction(
  addressId: string,
): Promise<void> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(
    `store-address:delete:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  return deleteStoreAddressForSeller(user.uid, addressId);
}

