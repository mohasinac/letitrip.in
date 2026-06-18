import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  faqsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const updateFaqSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:faqs:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const faq = await faqsRepository.findById(id);
      if (!faq) return errorResponse("FAQ not found", 404);
      return successResponse(faq);
    },
  }),
);

const updateHandler = createRouteHandler<(typeof updateFaqSchema)["_output"]>({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:faqs:read",
  schema: updateFaqSchema,
  handler: async ({ body, params }) => {
    const id = (params as { id: string }).id;
    const existing = await faqsRepository.findById(id);
    if (!existing) return errorResponse("FAQ not found", 404);
    const updated = await faqsRepository.update(id, {
      ...body,
      updatedAt: new Date(),
    } as any);
    return successResponse(updated, "FAQ updated");
  },
});

export const PUT = withProviders(updateHandler);
export const PATCH = withProviders(updateHandler);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:faqs:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await faqsRepository.findById(id);
      if (!existing) return errorResponse("FAQ not found", 404);
      await faqsRepository.delete(id);
      return successResponse(null, "FAQ deleted");
    },
  }),
);
