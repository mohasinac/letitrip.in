/**
 * User Address API — Single Resource
 *
 * GET    /api/user/addresses/[id]   — Get a single address
 * PATCH  /api/user/addresses/[id]   — Update an address
 * DELETE /api/user/addresses/[id]   — Delete an address
 */

import { addressRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { userAddressUpdateSchema } from "@/lib/validation/schemas";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

type IdParams = { id: string };

/**
 * GET /api/user/addresses/[id]
 */
export const GET = createApiHandler<never, IdParams>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
    const { id } = params!;
    const address = await addressRepository.findById(user!.uid, id);
    if (!address) return errorResponse(ERROR_MESSAGES.ADDRESS.NOT_FOUND, 404);
    return successResponse(address);
  },
});

/**
 * PATCH /api/user/addresses/[id]
 */
export const PATCH = createApiHandler<
  (typeof userAddressUpdateSchema)["_output"],
  IdParams
>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  schema: userAddressUpdateSchema,
  handler: async ({ user, body, params }) => {
    const { id } = params!;

    const address = await addressRepository.update(user!.uid, id, body!);

    serverLogger.info("Address updated via API", {
      userId: user!.uid,
      addressId: id,
    });
    return successResponse(address, SUCCESS_MESSAGES.ADDRESS.UPDATED);
  },
});

/**
 * DELETE /api/user/addresses/[id]
 */
export const DELETE = createApiHandler<never, IdParams>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
    const { id } = params!;

    await addressRepository.delete(user!.uid, id);

    serverLogger.info("Address deleted via API", {
      userId: user!.uid,
      addressId: id,
    });
    return successResponse(null, SUCCESS_MESSAGES.ADDRESS.DELETED);
  },
});
