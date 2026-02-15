/**
 * Homepage Sections API - Individual Section Routes
 *
 * Handles individual homepage section operations
 */

import { NextRequest, NextResponse } from "next/server";
import { homepageSectionsRepository } from "@/repositories";
import { requireRoleFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  homepageSectionUpdateSchema,
} from "@/lib/validation/schemas";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

/**
 * GET /api/homepage-sections/[id]
 *
 * Get homepage section by ID
 *
 * Public access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch homepage section
    const section = await homepageSectionsRepository.findById(id);

    if (!section) {
      throw new NotFoundError(ERROR_MESSAGES.SECTION.NOT_FOUND);
    }

    return NextResponse.json({
      success: true,
      data: section,
    });
  } catch (error) {
    const { id } = await params;
    serverLogger.error(`GET /api/homepage-sections/${id} error`, { error });

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SECTION.FETCH_FAILED },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/homepage-sections/[id]
 *
 * Update homepage section
 *
 * Requires admin authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Fetch homepage section
    const section = await homepageSectionsRepository.findById(id);

    if (!section) {
      throw new NotFoundError(ERROR_MESSAGES.SECTION.NOT_FOUND);
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(homepageSectionUpdateSchema, body);

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

    // Update homepage section
    const updatedSection = await homepageSectionsRepository.update(
      id,
      validation.data as any,
    );

    return NextResponse.json({
      success: true,
      data: updatedSection,
    });
  } catch (error) {
    const { id } = await params;
    serverLogger.error(`PATCH /api/homepage-sections/${id} error`, { error });

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

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SECTION.UPDATE_FAILED },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/homepage-sections/[id]
 *
 * Delete homepage section
 *
 * Requires admin authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Fetch homepage section
    const section = await homepageSectionsRepository.findById(id);

    if (!section) {
      throw new NotFoundError(ERROR_MESSAGES.SECTION.NOT_FOUND);
    }

    // Delete homepage section (hard delete - sections can be removed)
    await homepageSectionsRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.SECTION.DELETED,
    });
  } catch (error) {
    const { id } = await params;
    serverLogger.error(`DELETE /api/homepage-sections/${id} error`, { error });

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

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.SECTION.DELETE_FAILED },
      { status: 500 },
    );
  }
}
