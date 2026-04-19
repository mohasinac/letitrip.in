import "@/providers.config";
/**
 * User Addresses API — Collection
 *
 * GET  /api/user/addresses   — List current user's addresses
 * POST /api/user/addresses   — Create a new address
 *
 * Max addresses per user: 10
 */

import { addressRepository } from "@mohasinac/appkit/server";
import { successResponse, errorResponse } from "@mohasinac/appkit/server";
import { createRouteHandler } from "@mohasinac/appkit/server";
import { userAddressCreateSchema } from "@/validation/request-schemas";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";

const MAX_ADDRESSES_PER_USER = 10;

/**
 * GET /api/user/addresses
 *
 * Returns all addresses for the authenticated user, ordered by createdAt desc.
 */
export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const addresses = await addressRepository.findByUser(user!.uid);
    return successResponse(addresses);
  },
});

/**
 * POST /api/user/addresses
 *
 * Creates a new address.
 * Enforces a maximum of 10 addresses per user.
 * If isDefault is true, clears the default flag from all existing addresses.
 */
export const POST = createRouteHandler<
  (typeof userAddressCreateSchema)["_output"]
>({
  auth: true,
  schema: userAddressCreateSchema,
  handler: async ({ user, body }) => {
    // Enforce address limit
    const currentCount = await addressRepository.count(user!.uid);
    if (currentCount >= MAX_ADDRESSES_PER_USER) {
      return errorResponse(
        `You can only store up to ${MAX_ADDRESSES_PER_USER} addresses`,
        422,
      );
    }

    const address = await addressRepository.create(user!.uid, body!);

    serverLogger.info("Address created via API", {
      userId: user!.uid,
      addressId: address.id,
    });

    return successResponse(address, SUCCESS_MESSAGES.ADDRESS.CREATED, 201);
  },
});

