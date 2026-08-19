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
  slug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().int().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  showOnHomepage: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
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
  schema: updateFaqSchema,
  handler: async ({ body, params }) => {
    const id = (params as { id: string }).id;
    const existing = await faqsRepository.findById(id);
    if (!existing) return errorResponse("FAQ not found", 404);

    // answer/slug need the same shape transform as POST's create handler —
    // answer is stored as {text, format}, never a raw string; slug is stored
    // at the nested "seo.slug" dot-path, never a top-level `slug` field.
    // Spreading `body` directly (the old behavior) would have written a raw
    // string into `answer` (breaking every reader expecting `.text`) and a
    // stray unused top-level `slug` key.
    const { answer, slug, ...rest } = body!;
    const updated = await faqsRepository.update(id, {
      ...rest,
      ...(answer !== undefined ? { answer: { text: answer, format: "html" as const } } : {}),
      ...(slug !== undefined ? { "seo.slug": slug } : {}),
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
