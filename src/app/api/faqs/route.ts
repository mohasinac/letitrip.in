/**
 * FAQs API Routes
 *
 * Handles FAQ management with variable interpolation
 *
 * TODO - Phase 2 Refactoring:
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
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
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
 * ✅ Fetches FAQs via faqsRepository.findAll()
 * ✅ Filters by category, priority, tags, showOnHomepage params
 * ✅ Full-text search on question + answer text
 * ✅ Sorted by priority (desc) then order (asc)
 * ✅ Interpolates {{companyName}}, {{supportEmail}}, etc. from site settings
 * ✅ Caching implemented with LONG preset (30 min TTL)
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

    // Parse filters
    const priority = priorityStr ? parseInt(priorityStr, 10) : undefined;
    const showOnHomepage = showOnHomepageParam === true;

    // Query all FAQs
    let faqs = await faqsRepository.findAll();

    // Filter by category
    if (category) {
      faqs = faqs.filter((faq) => faq.category === category);
    }

    // Filter by homepage display
    if (showOnHomepageStr) {
      faqs = faqs.filter((faq) => faq.showOnHomepage === showOnHomepage);
    }

    // Filter by priority
    if (priority !== undefined) {
      faqs = faqs.filter((faq) => faq.priority === priority);
    }

    // Filter by tags (any tag match)
    if (tags && tags.length > 0) {
      faqs = faqs.filter((faq) => faq.tags?.some((tag) => tags.includes(tag)));
    }

    // Normalize answer field: handle both string and { text, format } shapes
    faqs = faqs.map((faq) => ({
      ...faq,
      answer:
        typeof faq.answer === "string"
          ? { text: faq.answer, format: "plain" as const }
          : (faq.answer ?? { text: "", format: "plain" as const }),
    }));

    // Filter by search query (question + answer)
    if (search) {
      const searchLower = search.toLowerCase();
      faqs = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchLower) ||
          (faq.answer.text ?? "").toLowerCase().includes(searchLower),
      );
    }

    // Get site settings for variable interpolation
    const siteSettings = await siteSettingsRepository.getSingleton();

    // Helper function to interpolate variables
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

    // Interpolate variables in answers
    const interpolatedFAQs = faqs.map((faq) => ({
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

    // Sort by priority (higher first), then by order
    interpolatedFAQs.sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return (a.order || 0) - (b.order || 0);
    });

    // Return with cache headers
    return NextResponse.json(
      {
        success: true,
        data: interpolatedFAQs,
        meta: {
          total: interpolatedFAQs.length,
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
 * ✅ Requires admin authentication via requireRoleFromRequest
 * ✅ Validates body with faqCreateSchema (Zod)
 * ✅ Auto-assigns order (max existing + 1)
 * ✅ Creates FAQ via faqsRepository.create()
 * ✅ Invalidates FAQ cache after creation
 * ✅ Returns created FAQ with 201 status
 * TODO (Future): Generate SEO-friendly slug for FAQ permalinks
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

    // Create FAQ with admin as creator
    const faq = await faqsRepository.create({
      ...validation.data,
      order,
      createdBy: user.uid,
    } as any);

    // Invalidate FAQ cache
    invalidateCache("/api/faqs");

    return successResponse(faq, SUCCESS_MESSAGES.FAQ.CREATED, 201);
  } catch (error) {
    serverLogger.error("POST /api/faqs error", { error });
    return errorResponse(ERROR_MESSAGES.FAQ.CREATE_FAILED, 500);
  }
}
