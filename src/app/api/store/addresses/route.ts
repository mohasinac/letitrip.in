import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { addressesRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_READ, ROLES_STORE_WRITE } from "@/constants";
import { addressFormSchema } from "@mohasinac/appkit/server";

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
const createAddressSchema = addressFormSchema;

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_READ],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const addresses = await addressesRepository.listByOwner("store", store.id);
    return successResponse({ addresses, total: addresses.length });
  },
}));

export const POST = withProviders(createRouteHandler<(typeof createAddressSchema)["_output"]>({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  schema: createAddressSchema,
  handler: async ({ body, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const address = await addressesRepository.createForOwner("store", store.id, body!);
    return successResponse(address, "Address created");
  },
}));
