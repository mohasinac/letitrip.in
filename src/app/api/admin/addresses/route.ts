import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  addressesRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const createAddressSchema = z.object({
  ownerType: z.enum(["user", "store"]),
  ownerId: z.string().min(1),
  label: z.string().min(1),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(6).max(6),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:addresses:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const ownerType = url.searchParams.get("ownerType") as "user" | "store" | null;
      const ownerId = url.searchParams.get("ownerId");

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
