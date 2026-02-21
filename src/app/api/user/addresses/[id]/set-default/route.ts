/**
 * Set Default Address API
 *
 * POST /api/user/addresses/[id]/set-default
 *
 * Sets the given address as the user's default shipping address.
 * Clears the isDefault flag from all other addresses atomically.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { addressRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/user/addresses/[id]/set-default
 *
 * Sets the given address as the default.
 * Returns the updated address document.
 */
export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const address = await addressRepository.setDefault(user.uid, id);

    serverLogger.info("Default address set via API", {
      userId: user.uid,
      addressId: id,
    });

    return successResponse(address, SUCCESS_MESSAGES.ADDRESS.DEFAULT_SET);
  } catch (error) {
    return handleApiError(error);
  }
}
