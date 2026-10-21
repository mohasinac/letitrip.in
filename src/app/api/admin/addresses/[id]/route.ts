import { withProviders } from "@/providers.config";
import { z } from "zod";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const NOT_FOUND = "Address not found";
import { addressesRepository } from "@mohasinac/appkit/features/addresses/repository/addresses.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { adminAddressPatchSchema } from "@mohasinac/appkit/server";

/*
 * The SHARED address shape and the SHARED postal rule (W5 / D19).
 *
 * This file declared its own eleven fields with `postalCode: z.string().min(6).max(6).optional()`.
 * There were fifteen such rules across the tree and they disagreed — two of
 * them, including this one, server-side rules on the same entity. The rule is
 * now `COUNTRIES[country].postalPattern`, resolved from the country on the
 * record, which is also what fixes the India-only regex being applied to
 * addresses that are not in India.
 */
const updateAddressSchema = adminAddressPatchSchema;

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as Record<string, string>).id;
      const address = await addressesRepository.findById(id);
      if (!address) return errorResponse(NOT_FOUND, 404);
      /*
       * 🛑 MASKED, not the raw document. `AddressesRepository.mapDoc`
       * deliberately does NOT decrypt — the repository is
       * ciphertext-by-default with named accessors — so returning the
       * document verbatim answered with `enc:v1:` AES blobs for `fullName`,
       * `phone` and the street lines.
       *
       * Root Cause #38's tell: the single-item GET returns the raw,
       * unstripped document while the LIST endpoint uses the accessor. The
       * list half was fixed; this one was missed.
       *
       * `maskedAddress`, not `revealAddress`: an admin moderating an address
       * needs to identify it, and the owner's own plaintext read is a
       * different, named call on a different route.
       */
      return successResponse(addressesRepository.maskedAddress(address));
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateAddressSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    schema: updateAddressSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as Record<string, string>).id;
      const existing = await addressesRepository.findById(id);
      if (!existing) return errorResponse(NOT_FOUND, 404);

      const { action, banReason, ...updateFields } = body!;

      if (action === "ban") {
        const banned = await addressesRepository.banById(id, {
          banReason: banReason ?? "Banned by admin",
          bannedBy: user!.uid,
        });
        return successResponse(banned, "Address banned");
      }

      if (action === "approve_unban") {
        await addressesRepository.clearBanById(id);
        return successResponse({ id }, "Address unban approved");
      }

      if (action === "reject_unban") {
        // Move back to banned; clear unban request note
        const updated = await addressesRepository.update(id, {
          banStatus: "banned",
          unbanRequestNote: undefined,
          unbanRequestedAt: undefined,
        } as Parameters<typeof addressesRepository.update>[1]);
        return successResponse(updated, "Unban request rejected");
      }

      if (action === "flag_suspicious") {
        const updated = await addressesRepository.update(id, { banStatus: "suspicious" } as Parameters<typeof addressesRepository.update>[1]);
        return successResponse(updated, "Address flagged as suspicious");
      }

      if (action === "clear_ban") {
        await addressesRepository.clearBanById(id);
        return successResponse({ id }, "Ban cleared");
      }

      const updated = await addressesRepository.updateForOwner(
        existing.ownerType,
        existing.ownerId,
        id,
        updateFields,
      );
      return successResponse(updated, "Address updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:addresses:write",
    handler: async ({ params }) => {
      const id = (params as Record<string, string>).id;
      const existing = await addressesRepository.findById(id);
      if (!existing) return errorResponse(NOT_FOUND, 404);
      await addressesRepository.deleteForOwner(existing.ownerType, existing.ownerId, id);
      return successResponse(null, "Address deleted");
    },
  }),
);
