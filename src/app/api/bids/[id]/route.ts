import "@/providers.config";
/**
 * Bids [id] API Route
 * GET /api/bids/:id — Get bids for a product (id = productId)
 */

import { bidRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));

  serverLogger.info("Bid list by product requested", { productId: id });

  // id is productId
  const bids = await bidRepository.findByProduct(id);
  return Response.json({ success: true, data: (bids ?? []).slice(0, limit) });
}
