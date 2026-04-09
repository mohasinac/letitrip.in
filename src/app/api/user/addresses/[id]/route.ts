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
import { createRouteHandler } from "@mohasinac/appkit/next";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security";

type IdParams = { id: string };

/**
 * GET /api/user/addresses/[id]
 */
export const GET = createRouteHandler<never, IdParams>({
  auth: true,
  handler: async ({ user, params, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;
    const address = await addressRepository.findById(user!.uid, id);
    if (!address) return errorResponse(ERROR_MESSAGES.ADDRESS.NOT_FOUND, 404);
    return successResponse(address);
  },
});

/**
 * PATCH /api/user/addresses/[id]
 */
export const PATCH = createRouteHandler<
  (typeof userAddressUpdateSchema)["_output"],
  IdParams
>({
  auth: true,
  schema: userAddressUpdateSchema,
  handler: async ({ user, body, params, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
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
export const DELETE = createRouteHandler<never, IdParams>({
  auth: true,
  handler: async ({ user, params, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;

    await addressRepository.delete(user!.uid, id);

    serverLogger.info("Address deleted via API", {
      userId: user!.uid,
      addressId: id,
    });
    return successResponse(null, SUCCESS_MESSAGES.ADDRESS.DELETED);
  },
});
