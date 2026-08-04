import { withProviders } from "@/providers.config";
/**
 * User Addresses API — Collection
 *
 * GET  /api/user/addresses   — List current user's addresses
 * POST /api/user/addresses   — Create a new address
 *
 * Max addresses per user: 10
 */

import { addressesRepository } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { userAddressCreateSchema } from "@/validation/request-schemas";

import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";

const MAX_ADDRESSES_PER_USER = 10;

/**
 * GET /api/user/addresses
 *
 * Returns addresses for the authenticated user, ordered by createdAt desc.
 * Supports query param: q (text search on label, city, postal code).
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const url = new URL(request!.url);
    const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

    let addresses = await addressesRepository.listByOwner("user", user!.uid);

    if (q) {
      addresses = addresses.filter((a) => {
        const line1 = (a.addressLine1 ?? "").toLowerCase();
        const line2 = (a.addressLine2 ?? "").toLowerCase();
        const postal = (a.postalCode ?? "").toLowerCase();
        const label = (a.label ?? "").toLowerCase();
        const city = (a.city ?? "").toLowerCase();
        return line1.includes(q) || line2.includes(q) || postal.includes(q) || label.includes(q) || city.includes(q);
      });
    }

    return successResponse(addresses);
  },
}));

/**
 * POST /api/user/addresses
 *
 * Creates a new address.
 * Enforces a maximum of 10 addresses per user.
 * If isDefault is true, clears the default flag from all existing addresses.
 */
export const POST = withProviders(createRouteHandler<
  (typeof userAddressCreateSchema)["_output"]
>({
  auth: true,
  schema: userAddressCreateSchema,
  handler: async ({ user, body }) => {
    // Enforce address limit
    const currentCount = await addressesRepository.countByOwner("user", user!.uid);
    if (currentCount >= MAX_ADDRESSES_PER_USER) {
      return errorResponse(
        `You can only store up to ${MAX_ADDRESSES_PER_USER} addresses`,
        422,
      );
    }

    const address = await addressesRepository.createForOwner("user", user!.uid, body!);

    serverLogger.info("Address created via API", {
      userId: user!.uid,
      addressId: address.id,
    });

    return successResponse(address, SUCCESS_MESSAGES.ADDRESS.CREATED, 201);
  },
}));
