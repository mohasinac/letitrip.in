import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  carouselsRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const MSG_CAROUSEL_NOT_FOUND = "Carousel not found.";

const updateCarouselSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(["active", "draft"]).optional(),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof updateCarouselSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:carousel:write",
    schema: updateCarouselSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await carouselsRepository.findById(id);
      if (!existing) return errorResponse(MSG_CAROUSEL_NOT_FOUND, 404);
      await carouselsRepository.updateCarousel(id, body!);
      const updated = await carouselsRepository.findById(id);
      return successResponse(updated, "Carousel updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:carousel:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await carouselsRepository.findById(id);
      if (!existing) return errorResponse(MSG_CAROUSEL_NOT_FOUND, 404);
      await carouselsRepository.delete(id);
      return successResponse(null, "Carousel deleted");
    },
  }),
);

// The sibling admin `[id]` routes all pair a ROLES_ADMIN_MOD read with
// ROLES_ADMIN_ONLY writes; this file had the import but never the handler, which
// is why `ROLES_ADMIN_MOD` sat unused. Without a GET there is no way to load a
// single carousel for editing, so a created carousel could never be renamed,
// published, or deleted from the UI.
//
// Gated on roles alone (no `permission:`), matching those siblings — pairing a
// permission with a roles array that includes moderator 403s every moderator,
// since permissions only resolve for admin/employee.
//
// Declared LAST deliberately: audit-permission-role-mismatch scans an 800-char
// window from each `createRouteHandler({`, and these handlers are short enough
// that a GET placed above the writes has the writes' `permission:` fall inside
// its window, flagging a pairing that does not exist. Keeping the roles-only
// handler at the end of the file keeps each window to a single handler.
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const carousel = await carouselsRepository.findById(id);
      if (!carousel) return errorResponse(MSG_CAROUSEL_NOT_FOUND, 404);
      return successResponse(carousel);
    },
  }),
);
