/**
 * Bids API — Single Resource
 *
 * GET /api/bids/[id] — Get a single bid by ID (public)
 */

import { NextRequest } from "next/server";
import { bidRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/bids/[id]
 *
 * Returns a single bid document by its ID.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const bid = await bidRepository.findById(id);
    if (!bid) {
      return errorResponse(ERROR_MESSAGES.BID.NOT_FOUND, 404);
    }

    return successResponse(bid);
  } catch (error) {
    serverLogger.error(`GET /api/bids/${"{id}"} error`, { error });
    return handleApiError(error);
  }
}
