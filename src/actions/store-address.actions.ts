"use server";

/**
 * Store Address Server Actions
 *
 * CRUD operations on store pickup addresses.
 * All actions require seller or admin role and auto-resolve the store
 * from the authenticated user's ownership.
 */

import { z } from "zod";
import { requireRole } from "@/lib/firebase/auth-server";
import { storeAddressRepository } from "@/repositories";
import { storeRepository } from "@/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import type { StoreAddressDocument } from "@/db/schema";

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

// ─── Helper ────────────────────────────────────────────────────────────────

async function resolveSellerStore(uid: string) {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store) throw new NotFoundError("Store not found. Create a store first.");
  return store;
}

// ─── Server Actions ────────────────────────────────────────────────────────

/**
 * List all addresses for the seller's store.
 */
export async function listStoreAddressesAction(): Promise<
  StoreAddressDocument[]
> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `store-address:list:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const store = await resolveSellerStore(user.uid);

  serverLogger.debug("listStoreAddressesAction", {
    uid: user.uid,
    storeSlug: store.storeSlug,
  });

  return storeAddressRepository.findByStore(store.storeSlug);
}

/**
 * Create a new address for the seller's store.
 */
export async function createStoreAddressAction(
  input: StoreAddressInput,
): Promise<StoreAddressDocument> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `store-address:create:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = storeAddressBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid address data",
    );
  }

  const store = await resolveSellerStore(user.uid);

  serverLogger.debug("createStoreAddressAction", {
    uid: user.uid,
    storeSlug: store.storeSlug,
  });

  return storeAddressRepository.create(store.storeSlug, parsed.data);
}

/**
 * Update an existing store address.
 */
export async function updateStoreAddressAction(
  addressId: string,
  input: Partial<StoreAddressInput>,
): Promise<StoreAddressDocument> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `store-address:update:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!addressId?.trim()) {
    throw new ValidationError("addressId is required");
  }

  const parsed = storeAddressBodySchema.partial().safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid address data",
    );
  }

  const store = await resolveSellerStore(user.uid);

  serverLogger.debug("updateStoreAddressAction", {
    uid: user.uid,
    storeSlug: store.storeSlug,
    addressId,
  });

  return storeAddressRepository.update(store.storeSlug, addressId, parsed.data);
}

/**
 * Delete a store address.
 */
export async function deleteStoreAddressAction(
  addressId: string,
): Promise<void> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `store-address:delete:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!addressId?.trim()) {
    throw new ValidationError("addressId is required");
  }

  const store = await resolveSellerStore(user.uid);

  serverLogger.debug("deleteStoreAddressAction", {
    uid: user.uid,
    storeSlug: store.storeSlug,
    addressId,
  });

  return storeAddressRepository.delete(store.storeSlug, addressId);
}

