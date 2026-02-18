/**
 * Homepage Sections API Routes
 *
 * Handles dynamic homepage section configuration
 *
 * TODO - Phase 2 Refactoring:
 * - Implement section management (create, update, delete, reorder)
 * - Add section templates/presets
 * - Implement section A/B testing
 * - Track section analytics (engagement, conversions)
 * - Add section scheduling (show between dates)
 * - Implement section targeting (user segments)
 * - Add section preview mode
 * - Implement drag-and-drop reordering
 */

import { NextRequest, NextResponse } from "next/server";
import { homepageSectionsRepository } from "@/repositories";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getBooleanParam, getSearchParams } from "@/lib/api/request-helpers";
import {
  getUserFromRequest,
  requireRoleFromRequest,
} from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  homepageSectionCreateSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

/**
 * GET /api/homepage-sections
 *
 * Get active homepage sections
 *
 * Query Parameters:
 * - includeDisabled: boolean (optional, admin only)
 *
 * ✅ Fetches enabled sections via homepageSectionsRepository.findAll()
 * ✅ Returns only enabled sections by default; all for admins (includeDisabled=true)
 * ✅ Sorted by order field ascending
 * ✅ Cache-Control headers set (5 min public / no-cache admin)
 * TODO (Future): Support personalization based on user segments
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
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
      : (await homepageSectionsRepository.findAll()).filter((s) => s.enabled);

    // Sort by order field (ascending - top to bottom)
    sections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return NextResponse.json(
      {
        success: true,
        data: sections,
        meta: {
          totalSections: sections.length,
          enabledSections: sections.filter((s: any) => s.enabled).length,
        },
      },
      {
        headers: {
          // Add cache headers for public access
          "Cache-Control": includeDisabled
            ? "private, no-cache" // Admin: no cache
            : "public, max-age=300, s-maxage=600, stale-while-revalidate=120", // Public: 5-10 min cache + SWR
        },
      },
    );
  } catch (error) {
    serverLogger.error("GET /api/homepage-sections error", { error });
    return errorResponse(ERROR_MESSAGES.SECTION.FETCH_FAILED, 500);
  }
}

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
 * ✅ Requires admin authentication via requireRoleFromRequest
 * ✅ Validates body with homepageSectionCreateSchema (Zod)
 * ✅ Auto-assigns order (max existing + 1) when not provided
 * ✅ Creates section via homepageSectionsRepository.create()
 * ✅ Returns created section with 201 status
 * TODO (Future): Validate section-specific config structure per type
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(homepageSectionCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Auto-assign order position if not provided
    const allSections = await homepageSectionsRepository.findAll();
    const maxOrder = allSections.reduce(
      (max, section) => Math.max(max, section.order || 0),
      0,
    );
    const order =
      validation.data.order !== undefined
        ? validation.data.order
        : maxOrder + 1;

    // TODO (Future): Validate section-specific config based on type
    // const sectionTypes = ['hero', 'featuredProducts', 'categories', 'testimonials', etc.]
    // Validate config structure matches type requirements

    // Create homepage section
    const section = await homepageSectionsRepository.create({
      ...validation.data,
      order,
    } as any);

    return successResponse(section, SUCCESS_MESSAGES.SECTION.CREATED, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
