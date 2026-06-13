import { withProviders } from "@/providers.config";
import { z } from "zod";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const NOT_FOUND = "Address not found";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  addressesRepository,
} from "@mohasinac/appkit";

const updateAddressSchema = z.object({
  label: z.string().min(1).optional(),
  fullName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  postalCode: z.string().min(6).max(6).optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:addresses:read",
    handler: async ({ params }) => {
      const id = (params as Record<string, string>).id;
      const address = await addressesRepository.findById(id);
      if (!address) return errorResponse(NOT_FOUND, 404);
      return successResponse(address);
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const PATCH = withProviders(
  createRouteHandler<(typeof updateAddressSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:addresses:write",
    schema: updateAddressSchema,
    handler: async ({ params, body }) => {
      const id = (params as Record<string, string>).id;
      const existing = await addressesRepository.findById(id);
      if (!existing) return errorResponse(NOT_FOUND, 404);
      const updated = await addressesRepository.updateForOwner(
        existing.ownerType,
        existing.ownerId,
        id,
        body!,
      );
      return successResponse(updated, "Address updated");
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
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
