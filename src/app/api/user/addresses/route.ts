/**
 * User Addresses API — Collection
 *
 * GET  /api/user/addresses   — List current user's addresses
 * POST /api/user/addresses   — Create a new address
 *
 * Max addresses per user: 10
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { addressRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  validateRequestBody,
  formatZodErrors,
  userAddressCreateSchema,
} from "@/lib/validation/schemas";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

const MAX_ADDRESSES_PER_USER = 10;

/**
 * GET /api/user/addresses
 *
 * Returns all addresses for the authenticated user, ordered by createdAt desc.
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const addresses = await addressRepository.findByUser(user.uid);

    return successResponse(addresses);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/user/addresses
 *
 * Creates a new address.
 * Enforces a maximum of 10 addresses per user.
 * If isDefault is true, clears the default flag from all existing addresses.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Parse + validate body
    const body = await request.json();
    const validation = validateRequestBody(userAddressCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Enforce address limit
    const currentCount = await addressRepository.count(user.uid);
    if (currentCount >= MAX_ADDRESSES_PER_USER) {
      return errorResponse(
        `You can only store up to ${MAX_ADDRESSES_PER_USER} addresses`,
        422,
      );
    }

    const address = await addressRepository.create(user.uid, validation.data);

    serverLogger.info("Address created via API", {
      userId: user.uid,
      addressId: address.id,
    });

    return successResponse(address, SUCCESS_MESSAGES.ADDRESS.CREATED, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
