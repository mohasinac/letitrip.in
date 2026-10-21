import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { addressesRepository } from "@mohasinac/appkit/features/addresses/repository/addresses.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
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
    /*
     * 🛑 Revealed, not raw. The repository is ciphertext-by-default, so the
     * seller's own pickup addresses came back as `enc:v1:…` for the contact
     * name, phone and street — which is what a courier label is printed from.
     *
     * Revealed rather than masked: this is the store owner reading their own
     * pickup locations, bounded by `findByOwnerId(user.uid)` above.
     */
    return successResponse({
      addresses: addressesRepository.revealAddresss(addresses),
      total: addresses.length,
    });
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
    // Revealed for the same reason as the GET: the list re-renders from this
    // response, so a raw document would show ciphertext for the row the
    // seller just created.
    return successResponse(addressesRepository.revealAddress(address), "Address created");
  },
}));
