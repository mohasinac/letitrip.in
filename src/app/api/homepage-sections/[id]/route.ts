/**
 * Homepage Sections API - Individual Section Routes
 *
 * Handles individual homepage section operations
 */

import { NextRequest } from "next/server";
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
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
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

    return successResponse(section);
  } catch (error) {
    return handleApiError(error);
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
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Update homepage section
    const updatedSection = await homepageSectionsRepository.update(
      id,
      validation.data as any,
    );

    return successResponse(updatedSection);
  } catch (error) {
    return handleApiError(error);
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

    return successResponse(undefined, SUCCESS_MESSAGES.SECTION.DELETED);
  } catch (error) {
    return handleApiError(error);
  }
}
