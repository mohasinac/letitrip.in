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

import { NextRequest, NextResponse } from "next/server";
import { faqsRepository, siteSettingsRepository } from "@/repositories";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
  getBooleanParam,
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { applySieveToArray } from "@/helpers/data/sieve.helper";
import { requireRoleFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  faqCreateSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import {
  withCache,
  CachePresets,
  invalidateCache,
} from "@/lib/api/cache-middleware";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { slugifyQuestion } from "@/db/schema";

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
 * Ã¢Å“â€¦ Fetches FAQs via faqsRepository.findAll()
 * Ã¢Å“â€¦ Filters by category, priority, tags, showOnHomepage params
 * Ã¢Å“â€¦ Full-text search on question + answer text
 * Ã¢Å“â€¦ Sorted by priority (desc) then order (asc)
 * Ã¢Å“â€¦ Interpolates {{companyName}}, {{supportEmail}}, etc. from site settings
 * Ã¢Å“â€¦ Caching implemented with LONG preset (30 min TTL)
 */
export const GET = withCache(async (request: NextRequest) => {
  try {
    // Parse query parameters
    const searchParams = getSearchParams(request);
    const category = getStringParam(searchParams, "category");
    const search = getStringParam(searchParams, "search");
    const priorityStr = searchParams.get("priority");
    const showOnHomepageParam = getBooleanParam(searchParams, "showOnHomepage");
    const showOnHomepageStr = searchParams.get("showOnHomepage");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    // Sieve DSL params — allow callers to use full Sieve filter/sort expressions
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

    // Step 1: Fetch all FAQs
    let faqs = await faqsRepository.findAll();

    // Step 2: Pre-filter for complex cases that Sieve can't handle natively
    // Tags: array membership (any tag in requested list)
    if (tags && tags.length > 0) {
      faqs = faqs.filter((faq) => faq.tags?.some((tag) => tags.includes(tag)));
    }

    // Step 3: Normalize answer field (must happen before Sieve so field paths resolve)
    faqs = faqs.map((faq) => ({
      ...faq,
      answer:
        typeof faq.answer === "string"
          ? { text: faq.answer, format: "plain" as const }
          : (faq.answer ?? { text: "", format: "plain" as const }),
    }));

    // Step 4: Full-text search — multi-field, can't be done purely in Sieve DSL
    if (search) {
      const searchLower = search.toLowerCase();
      faqs = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchLower) ||
          (faq.answer.text ?? "").toLowerCase().includes(searchLower),
      );
    }

    // Step 5: Build internal Sieve filter string from legacy params
    const internalFiltersArr: string[] = [];
    if (category) internalFiltersArr.push(`category==${category}`);
    if (showOnHomepageStr)
      internalFiltersArr.push(`showOnHomepage==${showOnHomepage}`);
    if (priority !== undefined)
      internalFiltersArr.push(`priority==${priority}`);

    // Merge internal filters with any caller-provided Sieve filters
    const mergedFilters =
      [...internalFiltersArr, ...(sieveFilters ? [sieveFilters] : [])].join(
        ",",
      ) || undefined;

    // Step 6: Apply Sieve (filter, sort, paginate)
    const sieveResult = await applySieveToArray({
      items: faqs,
      model: {
        filters: mergedFilters,
        sorts: sieveSorts || "-priority,order",
        page,
        pageSize,
      },
      fields: {
        id: { canFilter: true, canSort: false },
        question: { canFilter: true, canSort: true },
        category: { canFilter: true, canSort: true },
        status: { canFilter: true, canSort: true },
        priority: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => Number(v),
        },
        order: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => Number(v),
        },
        showOnHomepage: {
          canFilter: true,
          canSort: false,
          parseValue: (v: string) => v === "true",
        },
        isFeatured: {
          canFilter: true,
          canSort: false,
          parseValue: (v: string) => v === "true",
        },
        createdAt: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => new Date(v),
        },
      },
      options: { defaultPageSize: 100, maxPageSize: 200 },
    });

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
    return NextResponse.json(
      {
        success: true,
        data: interpolatedFAQs,
        meta: {
          total: sieveResult.total,
          page: sieveResult.page,
          pageSize: sieveResult.pageSize,
          totalPages: sieveResult.totalPages,
          hasMore: sieveResult.hasMore,
          categories: [
            "orders_payment",
            "shipping_delivery",
            "returns_refunds",
            "product_information",
            "account_security",
            "technical_support",
            "general",
          ],
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    serverLogger.error("GET /api/faqs error", { error });
    return errorResponse(ERROR_MESSAGES.FAQ.FETCH_FAILED, 500);
  }
}, CachePresets.LONG);

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
 * - featured: boolean
 * - tags: string[]
 * - relatedFAQs: string[]
 *
 * Ã¢Å“â€¦ Requires admin authentication via requireRoleFromRequest
 * Ã¢Å“â€¦ Validates body with faqCreateSchema (Zod)
 * Ã¢Å“â€¦ Auto-assigns order (max existing + 1)
 * Ã¢Å“â€¦ Creates FAQ via faqsRepository.create()
 * Ã¢Å“â€¦ Invalidates FAQ cache after creation
 * Ã¢Å“â€¦ Returns created FAQ with 201 status
 * TODO (Future): Generate SEO-friendly slug for FAQ permalinks — ✅ Done
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(faqCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Auto-assign order (always compute from existing FAQs)
    const allFAQs = await faqsRepository.findAll();
    const maxOrder = Math.max(...allFAQs.map((f) => f.order || 0), 0);
    const order = maxOrder + 1;

    // Create FAQ with admin as creator and SEO slug derived from the question
    const seoSlug = slugifyQuestion(validation.data.question);
    const faq = await faqsRepository.create({
      ...validation.data,
      order,
      createdBy: user.uid,
      seo: { slug: seoSlug },
    } as any);

    // Invalidate FAQ cache
    invalidateCache("/api/faqs");

    return successResponse(faq, SUCCESS_MESSAGES.FAQ.CREATED, 201);
  } catch (error) {
    serverLogger.error("POST /api/faqs error", { error });
    return errorResponse(ERROR_MESSAGES.FAQ.CREATE_FAILED, 500);
  }
}
