/**
 * GET /api/seller/store/addresses — List pickup addresses for the seller's store.
 *
 * The seller's store slug is resolved from their user record.
 * Returns an array of StoreAddressDocument objects.
 *
 * Mutations (create/update/delete) use Server Actions.
 */

import { storeRepository, storeAddressRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";

export const GET = createApiHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store?.storeSlug)
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);

    const addresses = await storeAddressRepository.findByStore(store.storeSlug);
    return successResponse(addresses);
  },
});
