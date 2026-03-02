/**
 * GET /api/ripcoins/history
 *
 * Returns paginated RipCoin transaction history for the authenticated user.
 * Supports Sieve filtering/sorting via query params.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { ripcoinRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
import type { SieveModel } from "@/lib/query";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = request.nextUrl;
    const model: SieveModel = {
      filters: searchParams.get("filters") ?? undefined,
      sorts: searchParams.get("sorts") ?? "-createdAt",
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
    };

    const result = await ripcoinRepository.listForUser(user.uid, model);

    return successResponse(result);
  } catch (error) {
    serverLogger.error("GET /api/ripcoins/history error", { error });
    return handleApiError(error);
  }
}
