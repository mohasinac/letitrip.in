import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  addressesRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";
import { adminAddressCreateSchema } from "@mohasinac/appkit/server";

/*
 * The SHARED address shape and the SHARED postal rule (W5 / D19).
 *
 * This file declared its own eleven fields with `postalCode: z.string().min(6).max(6)`.
 * There were fifteen such rules across the tree and they disagreed — two of
 * them, including this one, server-side rules on the same entity. The rule is
 * now `COUNTRIES[country].postalPattern`, resolved from the country on the
 * record, which is also what fixes the India-only regex being applied to
 * addresses that are not in India.
 */
const createAddressSchema = adminAddressCreateSchema;

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const ownerType = url.searchParams.get("ownerType") as "user" | "store" | null;
      const ownerId = url.searchParams.get("ownerId");
      const banStatus = url.searchParams.get("banStatus") as "banned" | "unban_requested" | "suspicious" | null;
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200);
      const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

      if (banStatus) {
        const items = await addressesRepository.listByBanStatus(banStatus, limit, offset);
        return successResponse({ items, total: items.length });
      }

      if (ownerType && ownerId) {
        const items = await addressesRepository.listByOwner(ownerType, ownerId);
        return successResponse({ items, total: items.length });
      }

      return successResponse({ items: [], total: 0 });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createAddressSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:addresses:write",
    schema: createAddressSchema,
    handler: async ({ body }) => {
      const { ownerType, ownerId, ...input } = body!;
      const address = await addressesRepository.createForOwner(ownerType, ownerId, input);
      return successResponse(address, "Address created", 201);
    },
  }),
);
