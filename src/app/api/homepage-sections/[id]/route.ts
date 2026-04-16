import "@/providers.config";
/**
 * FAQs API Routes
 *
 * Handles FAQ management with variable interpolation
 *
 * TODO (Future) - Phase 2:
 * - Implement FAQ management (create, update, delete)
 * - Add FAQ search functionality
 * - Implement FAQ voting (helpful/not helpful)
 * - Track FAQ analytics (views, helpful votes)
 * - Add FAQ categorization
 * - Implement FAQ suggestions based on user behavior
 * - Add AI-powered FAQ generation
 * - Implement FAQ A/B testing
 */

import { faqsRepository, siteSettingsRepository } from "@mohasinac/appkit/repositories";
import { successResponse } from "@mohasinac/appkit/next";
import {
  getBooleanParam,
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next";
import { faqCreateSchema } from "@/lib/validation/schemas";
import { invalidateCache } from "@mohasinac/appkit/next";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { SUCCESS_MESSAGES } from "@/constants";
import { slugifyQuestion } from "@/db/schema";
import type { FAQDocument } from "@/db/schema";
import { errorResponse } from "@mohasinac/appkit/next";

/**
 * GET /api/faqs
 *
 * Get FAQs with filtering
 *
 * Query Parameters:
 * - category: FAQCategory (optional)
 * - search: string (optional)
 * - priority: number (optional, 1-10)
 * - featured: boolean (optional)
 *
 * âœ… Fetches FAQs via faqsRepository.findAll()
 * âœ… Filters by category, priority, tags, showOnHomepage params
 * âœ… Full-text search on question + answer text
 * âœ… Sorted by priority (desc) then order (asc)
 * âœ… Interpolates {{companyName}}, {{supportEmail}}, etc. from site settings
 * âœ… Caching implemented with LONG preset (30 min TTL)
 */
export const GET = createRouteHandler({
  handler: async ({ request }) => {
    // Parse query parameters
    const searchParams = getSearchParams(request);
    const category = getStringParam(searchParams, "category");
    const search = getStringParam(searchParams, "search");
    const priorityStr = searchParams.get("priority");
    const showOnHomepageParam = getBooleanParam(searchParams, "showOnHomepage");
    const showOnHomepageStr = searchParams.get("showOnHomepage");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    // Sieve DSL params â€” allow callers to use full Sieve filter/sort expressions
    const sieveFilters = getStringParam(searchParams, "filters");
    const sieveSorts = getStringParam(searchParams, "sorts");
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 100, {
      min: 1,
      max: 200,
    });

    // Parse legacy filters
    const priority = priorityStr ? parseInt(priorityStr, 10) : undefined;
    const showOnHomepage = showOnHomepageParam === true;

    // Helper: build structured Sieve filter string from legacy params
    const buildStructuredFilters = (): string | undefined => {
      const parts: string[] = ["isActive==true"];
      if (category) parts.push(`category==${category}`);
      if (showOnHomepageStr) parts.push(`showOnHomepage==${showOnHomepage}`);
      if (priority !== undefined) parts.push(`priority==${priority}`);
      if (sieveFilters) parts.push(sieveFilters);
      return parts.join(",") || undefined;
    };

    // Normalise the answer field so Sieve field paths resolve consistently
    const normaliseAnswer = (faq: FAQDocument) => ({
      ...faq,
      answer:
        typeof faq.answer === "string"
          ? { text: faq.answer, format: "plain" as const }
          : (faq.answer ?? { text: "", format: "plain" as const }),
    });

    if (search && tags && tags.length > 0) {
      return errorResponse(
        "Combining FAQ full-text token search with tag filters is not supported by the Firestore Sieve adapter",
        400,
      );
    }

    const rawResult = await faqsRepository.list(
      {
        filters: buildStructuredFilters(),
        sorts: sieveSorts || "-priority,order",
        page: String(page),
        pageSize: String(pageSize),
      },
      {
        tags,
        search,
      },
    );

    const sieveResult = {
      ...rawResult,
      items: rawResult.items.map(normaliseAnswer),
    };

    // Step 7: Get site settings, then interpolate only the current page's items
    const siteSettings = await siteSettingsRepository.getSingleton();

    const interpolateVariables = (
      text: string | undefined,
      variables: Record<string, string | undefined>,
    ) => {
      if (!text) return "";
      let result = text;
      Object.entries(variables).forEach(([key, value]) => {
        if (value) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          result = result.replace(regex, value);
        }
      });
      return result;
    };

    const interpolatedFAQs = sieveResult.items.map((faq) => ({
      ...faq,
      answer: {
        ...faq.answer,
        text: interpolateVariables(faq.answer.text, {
          companyName: siteSettings.siteName,
          supportEmail: siteSettings.contact.email,
          supportPhone: siteSettings.contact.phone,
          websiteUrl: `https://${siteSettings.siteName}`,
          companyAddress: siteSettings.contact.address,
        }),
      },
    }));

    // Return with cache headers
    const response = successResponse({
      items: interpolatedFAQs,
      total: sieveResult.total,
      page: sieveResult.page,
      pageSize: sieveResult.pageSize,
      totalPages: sieveResult.totalPages,
      hasMore: sieveResult.hasMore,
      categories: [
        "general",
        "orders_payment",
        "shipping_delivery",
        "returns_refunds",
        "product_information",
        "account_security",
        "technical_support",
      ] as const,
    });
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
    );
    return response;
  },
});

/**
 * POST /api/faqs
 *
 * Create new FAQ (admin only)
 *
 * Body:
 * - question: string (required)
 * - answer: object (text, format)
 * - category: FAQCategory (required)
 * - priority: number (1-10)
 * - isPinned: boolean
 * - tags: string[]
 * - relatedFAQs: string[]
 *
 * âœ… Requires admin authentication via requireRoleFromRequest
 * âœ… Validates body with faqCreateSchema (Zod)
 * âœ… Auto-assigns order (max existing + 1)
 * âœ… Creates FAQ via faqsRepository.create()
 * âœ… Invalidates FAQ cache after creation
 * âœ… Returns created FAQ with 201 status
 * TODO (Future): Generate SEO-friendly slug for FAQ permalinks â€” âœ… Done
 */
export const POST = createRouteHandler<(typeof faqCreateSchema)["_output"]>({
  auth: true,
  roles: ["admin"],
  schema: faqCreateSchema,
  handler: async ({ user, body }) => {
    // Auto-assign order â€” single Firestore query, avoids full collection load
    const latestFAQ = await faqsRepository.list({
      sorts: "-order",
      page: "1",
      pageSize: "1",
    });
    const maxOrder = latestFAQ.items[0]?.order ?? 0;
    const order = maxOrder + 1;

    // Create FAQ with admin as creator and SEO slug derived from the question
    const seoSlug = slugifyQuestion(body!.question);
    const faq = await faqsRepository.create({
      ...body!,
      order,
      createdBy: user!.uid,
      seo: { slug: seoSlug },
    } as any);

    // Invalidate FAQ cache
    invalidateCache("/api/faqs");

    return successResponse(faq, SUCCESS_MESSAGES.FAQ.CREATED, 201);
  },
});
