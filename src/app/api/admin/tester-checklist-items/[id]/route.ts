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
  // The six-part case contract. Editable by admins because steps name concrete
  // fixtures (product-tester-offerable) and fixtures change — a wrong step must
  // be fixable without a redeploy and a re-seed.
  roles: z.array(z.enum(["guest", "buyer", "seller", "admin", "employee"])).max(5).optional(),
  startPage: z.string().max(300).optional(),
  steps: z.array(z.string().max(500)).max(40).optional(),
  // Flat scalar maps: the exact values a tester enters, and the values that must
  // be correct afterwards. Scalars only — a nested shape here is one nobody validates.
  inputs: z.record(z.union([z.string().max(300), z.number(), z.boolean()])).optional(),
  expectedData: z.record(z.union([z.string().max(300), z.number(), z.boolean()])).optional(),
  expectedBehaviour: z.string().max(1000).optional(),
  expectedUiState: z.string().max(1000).optional(),
  endResult: z.string().max(1000).optional(),
  href: z.string().max(300).optional(),
  order: z.number().int().min(0).optional(),
  phase: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  adminOnly: z.boolean().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
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
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await testerChecklistItemRepository.findById(id);
      if (!existing) return errorResponse(ERR_ITEM_NOT_FOUND, 404);
      await testerChecklistItemRepository.delete(id);
      return successResponse(null, "Checklist item deleted");
    },
  }),
);
