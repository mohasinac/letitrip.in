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
import type { FAQCategory } from "@mohasinac/appkit";
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
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const category = getStringParam(searchParams, "category");
    const search = getStringParam(searchParams, "q");
    const isActive = getStringParam(searchParams, "isActive");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 50,
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
    handler: async ({ body, user }) => {
      const b = body!;
      const slugBase = b.slug?.trim() || b.question
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const slug = slugBase.startsWith("faq-") ? slugBase : `faq-${slugBase}`;

      const now = new Date();
      // 🛑 createWithId, NOT create({ id }). `BaseRepository.create()` mints its
      // own Firestore auto-ID and treats a passed `id` as ordinary field data —
      // so the document landed at e.g. `IfFYhCwFHsN1TmTyBjgk` carrying a stray
      // `id: "faq-…"` data field. That stray field is why the bug looked fine
      // from the outside: the create response echoed the payload back, so the
      // caller read the slug it had asked for while `GET /api/admin/faqs/<slug>`
      // 404'd forever and the edit form opened empty. FAQs are a pure-slug
      // collection (`id === slug`) per CLAUDE.md's Slug Prefix System.
      const faq = await faqsRepository.createWithId(slug, {
        question: b.question,
        answer: { text: b.answer, format: "html" as const },
        category: b.category as FAQCategory,
        // 🛑 A nested object, never the dot-path key "seo.slug". Dot paths are
        // interpreted by update() only; in a create/set() the key is LITERAL,
        // so `{"seo.slug": x}` wrote a top-level field whose NAME contained a
        // dot and left `seo` itself undefined — which is what broke the edit
        // form. The PATCH handler in [id]/route.ts is correct to use the
        // dot-path form; that one really is an update.
        //
        // Deliberately NOT also writing a top-level `slug`. Seeded FAQ docs
        // carry one and FAQS_INDEXED_FIELDS lists it, but a usage sweep found
        // no reader: `FAQ_QUERIES.bySlug` has zero call sites and the
        // repository's own lookup is `.where("seo.slug", "==", slug)`. It is
        // undeclared on FAQDocument for the same reason. Writing it would be a
        // field with no consumer (Root Cause #51).
        seo: { slug },
        tags: b.tags ?? [],
        order: b.order ?? 0,
        priority: b.priority ?? 0,
        isActive: b.isActive ?? true,
        isPinned: b.isPinned ?? false,
        showOnHomepage: b.showOnHomepage ?? false,
        showInFooter: b.showInFooter ?? false,
        relatedFAQs: [],
        useSiteSettings: false,
        // `searchTokens: []` was here — a field renamed to `searchTxt`, and one
        // the route should not send either way: `faqsRepository.create` derives
        // it via `buildFaqSearchTxt` so the seed and every write path produce
        // byte-identical tokens. Passing an empty array only wrote dead data.
        // The blanket `as any` that used to sit on this object is why tsc never
        // flagged the stale name — nor the two defects above. It is gone; the
        // only cast left is `category`, which zod validates as a plain string.
        stats: { views: 0, helpful: 0, notHelpful: 0 },
        createdBy: user!.uid,
        createdAt: now,
        updatedAt: now,
      });

      return successResponse(faq, "FAQ created");
    },
  }),
);
