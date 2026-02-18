/**
 * User Address API — Single Resource
 *
 * GET    /api/user/addresses/[id]   — Get a single address
 * PATCH  /api/user/addresses/[id]   — Update an address
 * DELETE /api/user/addresses/[id]   — Delete an address
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { addressRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  validateRequestBody,
  formatZodErrors,
  userAddressUpdateSchema,
} from "@/lib/validation/schemas";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/user/addresses/[id]
 *
 * Returns a single address that belongs to the authenticated user.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const address = await addressRepository.findById(user.uid, id);

    if (!address) {
      return errorResponse(ERROR_MESSAGES.ADDRESS.NOT_FOUND, 404);
    }

    return successResponse(address);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/user/addresses/[id]
 *
 * Partially updates a user address.
 * If isDefault is set to true, clears the flag from all other addresses.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const body = await request.json();
    const validation = validateRequestBody(userAddressUpdateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    const address = await addressRepository.update(
      user.uid,
      id,
      validation.data,
    );

    serverLogger.info("Address updated via API", {
      userId: user.uid,
      addressId: id,
    });

    return successResponse(address, SUCCESS_MESSAGES.ADDRESS.UPDATED);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/user/addresses/[id]
 *
 * Deletes a user address.
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = params;

    await addressRepository.delete(user.uid, id);

    serverLogger.info("Address deleted via API", {
      userId: user.uid,
      addressId: id,
    });

    return successResponse(null, SUCCESS_MESSAGES.ADDRESS.DELETED);
  } catch (error) {
    return handleApiError(error);
  }
}
