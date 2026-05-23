import { withProviders } from "@/providers.config";

import { createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { faqsRepository } from "@mohasinac/appkit";
import { sortBy, FAQ_FIELDS } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const DEFAULT_SORTS = [sortBy(FAQ_FIELDS.PRIORITY), sortBy(FAQ_FIELDS.ORDER, "ASC")].join(",");
import { z } from "zod";

const createFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1),
  slug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().int().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  showOnHomepage: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
});

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:faqs:read",
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const category = getStringParam(searchParams, "category");
    const search = getStringParam(searchParams, "q");
    const isActive = getStringParam(searchParams, "isActive");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 200,
    });

    const filters = [getStringParam(searchParams, "filters")].filter(
      Boolean,
    ) as string[];
    if (category) filters.push(`category==${category}`);
    if (isActive === "true" || isActive === "false") {
      filters.push(`isActive==${isActive}`);
    }

    const result = await faqsRepository.list(
      {
        filters: filters.length > 0 ? filters.join(",") : undefined,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      },
      {
        search,
      },
    );

    return successResponse(result);
  },
}));

export const POST = withProviders(
  createRouteHandler<(typeof createFaqSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:faqs:write",
    schema: createFaqSchema,
    handler: async ({ body }) => {
      const b = body!;
      const slugBase = b.slug?.trim() || b.question
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const slug = slugBase.startsWith("faq-") ? slugBase : `faq-${slugBase}`;

      const now = new Date();
      const faq = await faqsRepository.create({
        id: slug,
        question: b.question,
        answer: { text: b.answer, format: "html" as const },
        category: b.category,
        tags: b.tags ?? [],
        order: b.order ?? 0,
        priority: b.priority ?? 0,
        isActive: b.isActive ?? true,
        isPinned: b.isPinned ?? false,
        showOnHomepage: b.showOnHomepage ?? false,
        showInFooter: b.showInFooter ?? false,
        "seo.slug": slug,
        searchTokens: [],
        stats: { views: 0, helpful: 0 },
        createdAt: now,
        updatedAt: now,
      } as any);

      return successResponse(faq, "FAQ created");
    },
  }),
);
