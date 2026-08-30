"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Address Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to the appkit
 * domain function.  No business logic here.
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import {
  createAddressForUser,
  updateAddressForUser,
  deleteAddressForUser,
  setDefaultAddressForUser,
  listAddressesForUser,
  getAddressByIdForUser,
} from "@mohasinac/appkit";
import type { AddressDocument } from "@mohasinac/appkit";
import {
  ERR_RATE_LIMIT,
  ERR_ADDRESS_ID_REQUIRED,
} from "./_constants";
import { addressFormSchema, addressUpdateSchema } from "@mohasinac/appkit/server";

// --- Validation schemas ----------------------------------------------------

/*
 * The SHARED address shape and the SHARED postal rule (W5 / D19).
 *
 * This file declared its own eleven fields with `postalCode: z.string().min(4).max(10)`.
 * There were fifteen such rules across the tree and they disagreed — two of
 * them, including this one, server-side rules on the same entity. The rule is
 * now `COUNTRIES[country].postalPattern`, resolved from the country on the
 * record, which is also what fixes the India-only regex being applied to
 * addresses that are not in India.
 */
const addressBodySchema = addressFormSchema;

export type AddressInput = z.infer<typeof addressBodySchema>;

// --- Server Actions --------------------------------------------------------

export async function createAddressAction(
  input: AddressInput,
): Promise<ActionResult<AddressDocument>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      const rl = await rateLimitByIdentifier(
        `address:create:${user.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const parsed = addressBodySchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid address data",
        );
    
      return createAddressForUser(user.uid, parsed.data) as Promise<AddressDocument>;
  });
}

export async function updateAddressAction(
  addressId: string,
  input: Partial<AddressInput>,
): Promise<ActionResult<AddressDocument>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      const rl = await rateLimitByIdentifier(
        `address:update:${user.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      if (!addressId?.trim()) throw new ValidationError(ERR_ADDRESS_ID_REQUIRED);
    
      const parsed = addressUpdateSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid address data",
        );
    
      return updateAddressForUser(user.uid, addressId, parsed.data) as Promise<AddressDocument>;
  });
}

export async function deleteAddressAction(addressId: string): Promise<void> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `address:delete:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError(ERR_RATE_LIMIT);

  if (!addressId?.trim()) throw new ValidationError(ERR_ADDRESS_ID_REQUIRED);

  return deleteAddressForUser(user.uid, addressId);
}

export async function setDefaultAddressAction(
  addressId: string,
): Promise<ActionResult<AddressDocument>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      const rl = await rateLimitByIdentifier(
        `address:setDefault:${user.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      if (!addressId?.trim()) throw new ValidationError(ERR_ADDRESS_ID_REQUIRED);
    
      return setDefaultAddressForUser(user.uid, addressId) as Promise<AddressDocument>;
  });
}

// --- Read Actions -------------------------------------------------------------

export async function listAddressesAction(): Promise<ActionResult<AddressDocument[]>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return listAddressesForUser(user.uid) as Promise<AddressDocument[]>;
  });
}

export async function getAddressByIdAction(
  id: string,
): Promise<ActionResult<AddressDocument | null>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return getAddressByIdForUser(user.uid, id) as Promise<AddressDocument | null>;
  });
}

