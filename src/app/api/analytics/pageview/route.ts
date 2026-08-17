import { withProviders } from "@/providers.config";
/**
 * POST /api/analytics/pageview — records one view of a public page.
 *
 * Anonymous, unauthenticated — every visitor (including logged-out ones)
 * triggers this. Rate-limited per IP so it can't be abused as a write
 * amplifier. Writes are day-bucketed (see pageViewsRepository) so this is
 * one Firestore increment per call, never one document per view.
 */

import { z } from "zod";
import { pageViewsRepository, PAGE_VIEW_ENTITY_TYPES } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";

const pageViewSchema = z.object({
  entityType: z.enum(PAGE_VIEW_ENTITY_TYPES),
  entityId: z.string().min(1).max(200),
  url: z.string().min(1).max(500),
});

export const POST = withProviders(createRouteHandler<(typeof pageViewSchema)["_output"]>({
  schema: pageViewSchema,
  handler: async ({ request, body }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.GENEROUS);
    if (!rl.success) return errorResponse("Too many requests", 429);
    await pageViewsRepository.recordView(body!);
    return successResponse({ recorded: true });
  },
}));
