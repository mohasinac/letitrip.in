/**
 * GET /api/rc/history
 *
 * Returns paginated RC transaction history for the authenticated user.
 * Supports Sieve filtering/sorting via query params.
 */

import { rcRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import type { SieveModel } from "@/lib/query";

export const GET = createApiHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const { searchParams } = request.nextUrl;
    const model: SieveModel = {
      filters: searchParams.get("filters") ?? undefined,
      sorts: searchParams.get("sorts") ?? "-createdAt",
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
    };
    const result = await rcRepository.listForUser(user!.uid, model);
    return successResponse(result);
  },
});
