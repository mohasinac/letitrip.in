import { withProviders } from "@/providers.config";
/**
 * User Addresses API — Individual address
 *
 * GET    /api/user/addresses/[id]  — Get a single address
 * PUT    /api/user/addresses/[id]  — Update address; users may request unban via banStatus:"unban_requested"
 * DELETE /api/user/addresses/[id]  — Delete address (blocked if banned)
 */

import { addressesRepository } from "@mohasinac/appkit/features/addresses/repository/addresses.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";

const ADDRESS_NOT_FOUND = "Address not found";

/**
 * GET /api/user/addresses/[id]
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, params }) => {
    const { id } = params as { id: string };
    const address = await addressesRepository.findById(id);
    if (!address || address.ownerType !== "user" || address.ownerId !== user!.uid) {
      return errorResponse(ADDRESS_NOT_FOUND, 404);
    }
    /*
     * 🛑 Revealed, not returned raw. `AddressesRepository` is
     * ciphertext-by-default — its `mapDoc` deliberately does NOT decrypt, so
     * every read hands back `enc:v1:…` for `fullName`, `phone`,
     * `addressLine1` and `addressLine2` unless a named accessor is used.
     *
     * This route feeds the address EDIT FORM, so without the reveal the
     * buyer opened their own address and found ciphertext in the input boxes
     * — and saving would have written it back as literal text.
     *
     * Revealed rather than masked: the owner is editing their own record, and
     * the ownership check three lines up is what bounds it.
     */
    return successResponse(addressesRepository.revealAddress(address));
  },
}));

/**
 * PUT /api/user/addresses/[id]
 *
 * Users may update standard fields OR submit an unban request by setting
 * { banStatus: "unban_requested", unbanRequestNote: "..." }.
 * All other ban fields are stripped — only admin can set banStatus to "banned".
 */
export const PUT = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request, params }) => {
    const { id } = params as { id: string };
    const address = await addressesRepository.findById(id);
    if (!address || address.ownerType !== "user" || address.ownerId !== user!.uid) {
      return errorResponse(ADDRESS_NOT_FOUND, 404);
    }

    type AddressUpdateBody = {
      label?: string; fullName?: string; phone?: string;
      addressLine1?: string; addressLine2?: string; landmark?: string;
      city?: string; state?: string; postalCode?: string; country?: string;
      isDefault?: boolean;
      banStatus?: string; unbanRequestNote?: string;
    };
    const body = await request!.json().catch(() => ({})) as AddressUpdateBody;
    const { banStatus, unbanRequestNote, ...safeFields } = body;

    type AddressUpdatePayload = Omit<AddressUpdateBody, "banStatus" | "unbanRequestNote"> & {
      banStatus?: "unban_requested";
      unbanRequestNote?: string;
      unbanRequestedAt?: Date;
    };
    const updatePayload: AddressUpdatePayload = { ...safeFields };
    if (banStatus === "unban_requested" && address.banStatus === "banned") {
      updatePayload.banStatus = "unban_requested";
      if (typeof unbanRequestNote === "string" && unbanRequestNote.trim()) {
        updatePayload.unbanRequestNote = unbanRequestNote.trim();
        updatePayload.unbanRequestedAt = new Date();
      }
    }

    const updated = await addressesRepository.updateForOwner("user", user!.uid, id, updatePayload as any);

    serverLogger.info("Address updated via API", { userId: user!.uid, addressId: id });
    // Same reveal as the GET above — the form re-renders from this response,
    // so returning the raw document would put ciphertext straight back into
    // the fields the user just edited.
    return successResponse(
      addressesRepository.revealAddress(updated),
      SUCCESS_MESSAGES.ADDRESS.UPDATED,
    );
  },
}));

/**
 * DELETE /api/user/addresses/[id]
 *
 * Blocked if address is actively banned.
 */
export const DELETE = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, params }) => {
    const { id } = params as { id: string };
    const address = await addressesRepository.findById(id);
    if (!address || address.ownerType !== "user" || address.ownerId !== user!.uid) {
      return errorResponse(ADDRESS_NOT_FOUND, 404);
    }
    if (address.banStatus === "banned") {
      return errorResponse("Banned addresses cannot be deleted — contact support.", 403);
    }

    await addressesRepository.deleteForOwner("user", user!.uid, id);
    serverLogger.info("Address deleted via API", { userId: user!.uid, addressId: id });
    return successResponse(null, SUCCESS_MESSAGES.ADDRESS.DELETED);
  },
}));
