import { withProviders } from "@/providers.config";
/**
 * Admin Event Entries API Route
 * GET /api/admin/events/:id/entries — List entries for an event
 */

import { successResponse } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { eventEntryRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";

import { requireRoleFromRequest } from "@/lib/firebase/auth-server";

type RouteContext = { params: Promise<{ id: string }> };

const __GET__g = withProviders(async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  await requireRoleFromRequest(request, ["admin", "employee"]);
  const { id: eventId } = await context.params;
  const searchParams = getSearchParams(request);
  const page = getNumberParam(searchParams, "page", 1, { min: 1 });
  const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 50 });
  const filters = getStringParam(searchParams, "filters");
  const q = (getStringParam(searchParams, "q") || "").trim().toLowerCase();

  serverLogger.info("Admin listing event entries", {
    eventId,
    page,
    pageSize,
    filters,
    q,
  });

  // Without a search term this is an ordinary paginated read.
  //
  // WITH one it cannot be, and not by choice: `userEmail` and
  // `userDisplayName` are encrypted (EVENT_ENTRY_PII_FIELDS), and ciphertext
  // has no usable prefix, so Firestore cannot match them. The only place the
  // plaintext exists is in memory after `mapDoc` decrypts it.
  //
  // So a search scans a BOUNDED window and refines it here — the same shape as
  // orderRepository.listPaymentReviewQueue. What it must not do is what this
  // used to: filter a single already-cut PAGE and then report
  // `total: filtered.length, totalPages: 1, hasMore: false`. A match on page 2
  // was unreachable, and the count asserted that one page was the entire
  // result set.
  const SEARCH_SCAN_LIMIT = 500;
  const result = await eventEntryRepository.listForEvent(eventId, {
    page: q ? 1 : page,
    pageSize: q ? SEARCH_SCAN_LIMIT : pageSize,
    filters: filters || undefined,
  });

  if (!q) {
    return Response.json(successResponse(result));
  }

  const filtered = result.items.filter((entry) => {
    const displayName = (entry.userDisplayName || "").toLowerCase();
    const email = (entry.userEmail || "").toLowerCase();
    const userId = (entry.userId || "").toLowerCase();
    const entryId = (entry.id || "").toLowerCase();
    return (
      displayName.includes(q) ||
      email.includes(q) ||
      userId.includes(q) ||
      entryId.includes(q)
    );
  });

  // Paginate the refined set ourselves, and be honest about the bound: if the
  // scan saturated, `total` is a FLOOR, not a count — render it as "500+".
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const truncated = result.items.length >= SEARCH_SCAN_LIMIT;

  return Response.json(successResponse({
    ...result,
    items: pageItems,
    page,
    pageSize,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)) + (truncated ? 1 : 0),
    hasMore: start + pageSize < filtered.length || truncated,
    truncated,
  }));
});

export const GET = __GET__g;
