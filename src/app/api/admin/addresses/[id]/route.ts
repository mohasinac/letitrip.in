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
  action: z.enum(["ban", "approve_unban", "reject_unban", "flag_suspicious", "clear_ban"]).optional(),
  banReason: z.string().optional(),
});

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

export const PATCH = withProviders(
  createRouteHandler<(typeof updateAddressSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:addresses:write",
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
