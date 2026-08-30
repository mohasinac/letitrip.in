"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Store Address Server Actions — thin entrypoint
 *
 * Authenticates (seller/admin only), validates, rate-limits,
 * then delegates to appkit domain functions.  No business logic here.
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import {
  listStoreAddressesForSeller,
  createStoreAddressForSeller,
  updateStoreAddressForSeller,
  deleteStoreAddressForSeller,
} from "@mohasinac/appkit";
import type { StoreAddressDocument } from "@mohasinac/appkit";
import { ERR_RATE_LIMIT, ERR_ADDRESS_ID_REQUIRED } from "./_constants";
import { addressFormSchema, addressUpdateSchema } from "@mohasinac/appkit/server";

// --- Validation ------------------------------------------------------------

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
const storeAddressBodySchema = addressFormSchema;

export type StoreAddressInput = z.infer<typeof storeAddressBodySchema>;

// --- Server Actions --------------------------------------------------------

export async function listStoreAddressesAction(): Promise<ActionResult<StoreAddressDocument[]>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(
        `store-address:list:${user.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
      return listStoreAddressesForSeller(user.uid) as Promise<StoreAddressDocument[]>;
  });
}

export async function createStoreAddressAction(
  input: StoreAddressInput,
): Promise<ActionResult<StoreAddressDocument>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(
        `store-address:create:${user.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const parsed = storeAddressBodySchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid address data",
        );
    
      return createStoreAddressForSeller(user.uid, parsed.data) as Promise<StoreAddressDocument>;
  });
}

export async function updateStoreAddressAction(
  addressId: string,
  input: Partial<StoreAddressInput>,
): Promise<ActionResult<StoreAddressDocument>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(
        `store-address:update:${user.uid}`,
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
    
      return updateStoreAddressForSeller(user.uid, addressId, parsed.data) as Promise<StoreAddressDocument>;
  });
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
    throw new AuthorizationError(ERR_RATE_LIMIT);

  if (!addressId?.trim()) throw new ValidationError(ERR_ADDRESS_ID_REQUIRED);

  return deleteStoreAddressForSeller(user.uid, addressId);
}

