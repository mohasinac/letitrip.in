/**
 * Homepage Sections API Routes
 *
 * Handles dynamic homepage section configuration
 *
 * TODO (Future) - Phase 2:
 * - Implement section management (create, update, delete, reorder)
 * - Add section templates/presets
 * - Implement section A/B testing
 * - Track section analytics (engagement, conversions)
 * - Add section scheduling (show between dates)
 * - Implement section targeting (user segments)
 * - Add section preview mode
 * - Implement drag-and-drop reordering
 */

import { homepageSectionsRepository } from "@/repositories";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getBooleanParam, getSearchParams } from "@/lib/api/request-helpers";
import { getUserFromRequest } from "@/lib/security/authorization";
import { homepageSectionCreateSchema } from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { createApiHandler } from "@/lib/api/api-handler";

/**
 * GET /api/homepage-sections
 *
 * Get active homepage sections
 *
 * Query Parameters:
 * - includeDisabled: boolean (optional, admin only)
 *
 * Ã¢Å“â€¦ Fetches enabled sections via homepageSectionsRepository.findAll()
 * Ã¢Å“â€¦ Returns only enabled sections by default; all for admins (includeDisabled=true)
 * Ã¢Å“â€¦ Sorted by order field ascending
 * Ã¢Å“â€¦ Cache-Control headers set (5 min public / no-cache admin)
 * TODO (Future): Support personalization based on user segments
 */
export const GET = createApiHandler({
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const includeDisabled =
      getBooleanParam(searchParams, "includeDisabled") === true;

    // Check authorization for disabled sections (admin only)
    if (includeDisabled) {
      const user = await getUserFromRequest(request);
      if (user?.role !== "admin") {
        return errorResponse(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED, 403);
      }
    }

    // Query sections from repository
    const sections = includeDisabled
      ? await homepageSectionsRepository.findAll()
      : await homepageSectionsRepository.getEnabledSections();

    // Sort by order field (ascending - top to bottom)
    sections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const sectionsResponse = successResponse(sections, undefined, 200, {
      totalSections: sections.length,
      enabledSections: sections.filter((s: any) => s.enabled).length,
    });
    sectionsResponse.headers.set(
      "Cache-Control",
      includeDisabled
        ? "private, no-cache"
        : "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
    );
    return sectionsResponse;
  },
});

/**
 * POST /api/homepage-sections
 *
 * Create new homepage section (admin only)
 *
 * Body:
 * - type: SectionType (required)
 * - config: object (section-specific configuration, required)
 * - order: number (optional, auto-assigned if not provided)
 * - enabled: boolean (optional, defaults to true)
 *
 * Ã¢Å“â€¦ Requires admin authentication via requireRoleFromRequest
 * Ã¢Å“â€¦ Validates body with homepageSectionCreateSchema (Zod)
 * Ã¢Å“â€¦ Auto-assigns order (max existing + 1) when not provided
 * Ã¢Å“â€¦ Creates section via homepageSectionsRepository.create()
 * Ã¢Å“â€¦ Returns created section with 201 status
 * TODO (Future): Validate section-specific config structure per type
 */
export const POST = createApiHandler<
  (typeof homepageSectionCreateSchema)["_output"]
>({
  auth: true,
  roles: ["admin"],
  schema: homepageSectionCreateSchema,
  handler: async ({ body }) => {
    const allSections = await homepageSectionsRepository.findAll();
    const maxOrder = allSections.reduce(
      (max, section) => Math.max(max, section.order || 0),
      0,
    );
    const order = body!.order !== undefined ? body!.order : maxOrder + 1;
    const section = await homepageSectionsRepository.create({
      ...body!,
      order,
    } as any);
    return successResponse(section, SUCCESS_MESSAGES.SECTION.CREATED, 201);
  },
});
