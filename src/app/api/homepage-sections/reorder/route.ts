/**
 * Homepage Sections API - Reorder Endpoint
 *
 * Handles reordering homepage sections
 */

import { NextRequest } from "next/server";
import { homepageSectionsRepository } from "@/repositories";
import { requireRoleFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  homepageSectionsReorderSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
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
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
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

    return successResponse(updatedSections, SUCCESS_MESSAGES.SECTION.REORDERED);
  } catch (error) {
    return handleApiError(error);
  }
}
