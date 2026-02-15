/**
 * Homepage Sections API - Reorder Endpoint
 *
 * Handles reordering homepage sections
 */

import { NextRequest, NextResponse } from "next/server";
import { homepageSectionsRepository } from "@/repositories";
import { requireRoleFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  homepageSectionsReorderSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

/**
 * POST /api/homepage-sections/reorder
 *
 * Reorder homepage sections
 *
 * Body:
 * - sectionIds: string[] (array of section IDs in desired order)
 *
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(homepageSectionsReorderSchema, body);

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

    const { sectionIds } = validation.data;

    // Update order for each section
    const updatePromises = sectionIds.map((sectionId, index) =>
      homepageSectionsRepository.update(sectionId, { order: index + 1 }),
    );

    await Promise.all(updatePromises);

    // Fetch updated sections in new order
    const updatedSections = await homepageSectionsRepository.findAll();
    updatedSections.sort((a, b) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({
      success: true,
      data: updatedSections,
      message: SUCCESS_MESSAGES.SECTION.REORDERED,
    });
  } catch (error) {
    serverLogger.error("POST /api/homepage-sections/reorder error", { error });

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
      { success: false, error: ERROR_MESSAGES.SECTION.REORDER_FAILED },
      { status: 500 },
    );
  }
}
