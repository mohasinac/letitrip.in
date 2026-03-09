"use server";

/**
 * Address Server Actions
 *
 * Create, update, delete, and set-default on user addresses — calls the
 * repository directly, bypassing the service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import { addressRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError, ValidationError } from "@/lib/errors";
import type { AddressDocument } from "@/db/schema";

// ─── Validation schemas ────────────────────────────────────────────────────

const addressBodySchema = z.object({
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

export type AddressInput = z.infer<typeof addressBodySchema>;

// ─── Server Actions ────────────────────────────────────────────────────────

/**
 * Create a new address for the authenticated user.
 */
export async function createAddressAction(
  input: AddressInput,
): Promise<AddressDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `address:create:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = addressBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid address data",
    );
  }

  serverLogger.debug("createAddressAction", { uid: user.uid });
  return addressRepository.create(user.uid, parsed.data);
}

/**
 * Update an existing address owned by the authenticated user.
 */
export async function updateAddressAction(
  addressId: string,
  input: Partial<AddressInput>,
): Promise<AddressDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `address:update:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!addressId?.trim()) {
    throw new ValidationError("addressId is required");
  }

  const parsed = addressBodySchema.partial().safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid address data",
    );
  }

  serverLogger.debug("updateAddressAction", { uid: user.uid, addressId });
  return addressRepository.update(user.uid, addressId, parsed.data);
}

/**
 * Delete an address owned by the authenticated user.
 */
export async function deleteAddressAction(addressId: string): Promise<void> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `address:delete:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!addressId?.trim()) {
    throw new ValidationError("addressId is required");
  }

  serverLogger.debug("deleteAddressAction", { uid: user.uid, addressId });
  return addressRepository.delete(user.uid, addressId);
}

/**
 * Set an address as the default for the authenticated user.
 */
export async function setDefaultAddressAction(
  addressId: string,
): Promise<AddressDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `address:setDefault:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!addressId?.trim()) {
    throw new ValidationError("addressId is required");
  }

  serverLogger.debug("setDefaultAddressAction", { uid: user.uid, addressId });
  return addressRepository.setDefault(user.uid, addressId);
}
