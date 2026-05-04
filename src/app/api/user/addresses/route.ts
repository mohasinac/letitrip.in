import { withProviders } from "@/providers.config";
/**
 * User Addresses API — Collection
 *
 * GET  /api/user/addresses   — List current user's addresses
 * POST /api/user/addresses   — Create a new address
 *
 * Max addresses per user: 10
 */

import { addressRepository } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { userAddressCreateSchema } from "@/validation/request-schemas";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";

const MAX_ADDRESSES_PER_USER = 10;

/**
 * GET /api/user/addresses
 *
 * Returns addresses for the authenticated user, ordered by createdAt desc.
 * Supports query params: q, addressType (pipe-separated), verified, activeOnly.
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const url = new URL(request!.url);
    const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const addressTypeParam = url.searchParams.get("addressType") ?? "";
    const verified = url.searchParams.get("verified");
    const activeOnly = url.searchParams.get("activeOnly");

    let addresses = await addressRepository.findByUser(user!.uid);

    if (q) {
      addresses = addresses.filter((a) => {
        const line1 = ((a as any).addressLine1 ?? "").toLowerCase();
        const line2 = ((a as any).addressLine2 ?? "").toLowerCase();
        const postal = ((a as any).postalCode ?? "").toLowerCase();
        const label = ((a as any).label ?? "").toLowerCase();
        return line1.includes(q) || line2.includes(q) || postal.includes(q) || label.includes(q);
      });
    }

    if (addressTypeParam) {
      const types = addressTypeParam.split("|").filter(Boolean);
      addresses = addresses.filter((a) => {
        const t = ((a as any).type ?? (a as any).addressType ?? "").toLowerCase();
        return types.includes(t);
      });
    }

    if (verified === "true") {
      addresses = addresses.filter((a) => (a as any).verified === true);
    }

    if (activeOnly === "true") {
      addresses = addresses.filter((a) => (a as any).active !== false);
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
}));

