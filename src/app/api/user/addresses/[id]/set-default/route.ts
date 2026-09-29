import { withProviders } from "@/providers.config";
/**
 * User Addresses API — Set default
 *
 * POST /api/user/addresses/[id]/set-default — make this address the default
 *
 * 🛑 THIS FILE USED TO BE A COPY OF THE COLLECTION ROUTE.
 *
 * Every line of it — the header, a `GET` that listed the user's addresses, and
 * a `POST` that validated `userAddressCreateSchema` and called
 * `addressesRepository.createForOwner(...)` — belonged to
 * `/api/user/addresses/route.ts` and had been pasted into this directory. There
 * was no set-default logic anywhere in it, so "Set default" has never once
 * worked: the hook posts an empty body, the create schema rejected it, and the
 * buyer got a silent **400** and a list where the badge had not moved.
 *
 * The 400 was the only thing that made it merely broken. A caller that sent a
 * valid address body would have **created a duplicate address** at a URL that
 * says set-default, and returned 201 while the default stayed where it was.
 *
 * `addressesRepository.setDefault()` already existed and does the whole job —
 * it verifies the address belongs to this owner, clears the previous default
 * and sets the new one. It had simply never been called.
 */

import { addressesRepository } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";

const ADDRESS_NOT_FOUND = "Address not found";

/**
 * POST /api/user/addresses/[id]/set-default
 *
 * No request body. `useSetDefaultAddress` posts `{}`, and there is nothing for
 * the caller to say beyond the id already in the path — accepting a body here
 * is how the previous version ended up able to create records.
 *
 * Ownership is checked twice on purpose: here, so a stranger's id answers 404
 * rather than a 500 from a thrown `DatabaseError`; and again inside
 * `setDefault`, which is the real boundary and must not depend on its callers
 * remembering.
 */
export const POST = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, params }) => {
    const { id } = params as { id: string };

    const address = await addressesRepository.findById(id);
    if (!address || address.ownerType !== "user" || address.ownerId !== user!.uid) {
      return errorResponse(ADDRESS_NOT_FOUND, 404);
    }

    const updated = await addressesRepository.setDefault("user", user!.uid, id);

    serverLogger.info("Default address set via API", {
      userId: user!.uid,
      addressId: id,
    });

    /*
     * `DEFAULT_SET`, not `UPDATED`. The constant has existed since addresses
     * were written and had no caller — which is its own small evidence that
     * this endpoint never ran.
     */
    return successResponse(updated, SUCCESS_MESSAGES.ADDRESS.DEFAULT_SET);
  },
}));
