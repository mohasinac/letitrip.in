import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  testerChecklistItemRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const ERR_ITEM_NOT_FOUND = "Checklist item not found";

const updateChecklistItemSchema = z.object({
  groupKey: z.string().min(1).max(100).optional(),
  groupLabel: z.string().min(1).max(200).optional(),
  pageKey: z.string().min(1).max(100).optional(),
  pageLabel: z.string().min(1).max(200).optional(),
  label: z.string().min(3).max(500).optional(),
  description: z.string().max(2000).optional(),
  href: z.string().max(300).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  adminOnly: z.boolean().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:tester-checklist:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const item = await testerChecklistItemRepository.findById(id);
      if (!item) return errorResponse(ERR_ITEM_NOT_FOUND, 404);
      return successResponse(item);
    },
  }),
);

const updateHandler = createRouteHandler<(typeof updateChecklistItemSchema)["_output"]>({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:tester-checklist:write",
  schema: updateChecklistItemSchema,
  handler: async ({ body, params }) => {
    const id = (params as { id: string }).id;
    const existing = await testerChecklistItemRepository.findById(id);
    if (!existing) return errorResponse(ERR_ITEM_NOT_FOUND, 404);
    const updated = await testerChecklistItemRepository.update(id, body!);
    return successResponse(updated, "Checklist item updated");
  },
});

export const PUT = withProviders(updateHandler);
export const PATCH = withProviders(updateHandler);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:tester-checklist:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await testerChecklistItemRepository.findById(id);
      if (!existing) return errorResponse(ERR_ITEM_NOT_FOUND, 404);
      await testerChecklistItemRepository.delete(id);
      return successResponse(null, "Checklist item deleted");
    },
  }),
);
