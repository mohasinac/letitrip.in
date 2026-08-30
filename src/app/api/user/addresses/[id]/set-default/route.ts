import { withProviders } from "@/providers.config";
/**
 * User Addresses API â€” Collection
 *
 * GET  /api/user/addresses   â€” List current user's addresses
 * POST /api/user/addresses   â€” Create a new address
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
 * Supports query params: q, defaultOnly, banStatus (pipe-separated).
 *
 * 🛑 It used to support `addressType`, `verified` and `activeOnly` — three
 * fields `AddressDocument` has never had. Each was reached through an `as any`
 * cast, so every comparison was against `""` and the facets could not match a
 * row. They rendered, they counted toward the filter badge, and they filtered
 * nothing.
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const url = new URL(request!.url);
    const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const defaultOnly = url.searchParams.get("defaultOnly");
    const banStatusParam = url.searchParams.get("banStatus") ?? "";

    let addresses = await addressesRepository.listByOwner("user", user!.uid);

    // No `as any`: every field read below is declared on `AddressDocument`,
    // which is the whole difference between these filters and the three they
    // replaced.
    if (q) {
      addresses = addresses.filter((a) => {
        const haystack = [a.addressLine1, a.addressLine2, a.postalCode, a.label, a.city]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    if (defaultOnly === "true") {
      addresses = addresses.filter((a) => a.isDefault === true);
    }

    if (banStatusParam) {
      const wanted = new Set(banStatusParam.split("|").filter(Boolean));
      addresses = addresses.filter((a) => !!a.banStatus && wanted.has(a.banStatus));
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
