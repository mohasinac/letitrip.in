"use server";

/**
 * Address Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to the appkit
 * domain function.  No business logic here.
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import {
  createAddressForUser,
  updateAddressForUser,
  deleteAddressForUser,
  setDefaultAddressForUser,
  listAddressesForUser,
  getAddressByIdForUser,
} from "@mohasinac/appkit/features/account";
import type { AddressDocument } from "@/db/schema/addresses";

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

export async function createAddressAction(
  input: AddressInput,
): Promise<AddressDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `address:create:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = addressBodySchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid address data",
    );

  return createAddressForUser(user.uid, parsed.data) as Promise<AddressDocument>;
}

export async function updateAddressAction(
  addressId: string,
  input: Partial<AddressInput>,
): Promise<AddressDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `address:update:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!addressId?.trim()) throw new ValidationError("addressId is required");

  const parsed = addressBodySchema.partial().safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid address data",
    );

  return updateAddressForUser(user.uid, addressId, parsed.data) as Promise<AddressDocument>;
}

export async function deleteAddressAction(addressId: string): Promise<void> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `address:delete:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!addressId?.trim()) throw new ValidationError("addressId is required");

  return deleteAddressForUser(user.uid, addressId);
}

export async function setDefaultAddressAction(
  addressId: string,
): Promise<AddressDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `address:setDefault:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!addressId?.trim()) throw new ValidationError("addressId is required");

  return setDefaultAddressForUser(user.uid, addressId) as Promise<AddressDocument>;
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listAddressesAction(): Promise<AddressDocument[]> {
  const user = await requireAuthUser();
  return listAddressesForUser(user.uid) as Promise<AddressDocument[]>;
}

export async function getAddressByIdAction(
  id: string,
): Promise<AddressDocument | null> {
  const user = await requireAuthUser();
  return getAddressByIdForUser(user.uid, id) as Promise<AddressDocument | null>;
}

