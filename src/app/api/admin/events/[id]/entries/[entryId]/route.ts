import "@/providers.config";
/**
 * Admin Event Entry [entryId] API Route
 * PATCH /api/admin/events/:id/entries/:entryId — Review an entry (approve/reject/flag)
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/server";
import { eventEntryRepository } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";

type RouteContext = { params: Promise<{ id: string; entryId: string }> };

const reviewEntrySchema = z.object({
  status: z.enum(["approved", "rejected", "flagged"]),
  reviewNote: z.string().optional(),
  points: z.number().optional(),
});

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: eventId, entryId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = reviewEntrySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin reviewing event entry", { eventId, entryId, status: parsed.data.status });

  await eventEntryRepository.reviewEntry(entryId, parsed.data.status as any, "admin", parsed.data.reviewNote);
  return Response.json(successResponse({ entryId, ...parsed.data }, SUCCESS_MESSAGES.EVENT.UPDATED));
}
