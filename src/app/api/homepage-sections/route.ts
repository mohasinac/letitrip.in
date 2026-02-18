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
import { getSearchParams } from "@/lib/api/request-helpers";
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
 * TODO: Implement sections fetching
 * TODO: Return only enabled sections by default
 * TODO: Sort by order field
 * TODO: Add aggressive caching (CDN + Redis, 5 min TTL)
 * TODO: Support personalization based on user data
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = getSearchParams(request);
    const includeDisabled = searchParams.get("includeDisabled") === "true";

    // Check authorization for disabled sections (admin only)
    if (includeDisabled) {
      const user = await getUserFromRequest(request);
      if (user?.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            error: ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED,
          },
          { status: 403 },
        );
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
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SECTION.FETCH_FAILED },
      { status: 500 },
    );
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
 * TODO: Implement section creation
 * TODO: Require admin authentication
 * TODO: Validate section type and config
 * TODO: Handle section-specific validation (e.g., max products for products section)
 * TODO: Return created section
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(homepageSectionCreateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.FAILED,
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 },
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

    return NextResponse.json(
      {
        success: true,
        data: section,
        message: SUCCESS_MESSAGES.SECTION.CREATED,
      },
      { status: 201 },
    );
  } catch (error) {
    serverLogger.error("POST /api/homepage-sections error", { error });

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SECTION.CREATE_FAILED },
      { status: 500 },
    );
  }
}
