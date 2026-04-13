import "@/providers.config";
/**
 * Media Trim API Route — DISABLED for Free Tier
 *
 * FFmpeg video trimming requires system binaries and processing power.
 * This feature is disabled on Vercel Free + Firebase Blaze free tier.
 *
 * To re-enable:
 * 1. Deploy to Firebase Cloud Functions (not Vercel) with custom Docker image
 * 2. Or upgrade to a paid tier with media processing capability
 * 3. Or use client-side FFmpeg.js for lightweight trimming
 */

import { errorResponse } from "@mohasinac/appkit/next";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security";
import { trimDataSchema } from "@/lib/validation/schemas";

/**
 * POST /api/media/trim
 *
 * ⚠️ DISABLED on free tier
 * Requires Firebase Cloud Functions with FFmpeg or paid tier upgrade
 */
export const POST = createRouteHandler<(typeof trimDataSchema)["_output"]>({
  auth: true,
  schema: trimDataSchema,
  handler: async ({ request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);

    return errorResponse(
      "Video trimming is not available on the free tier. " +
      "This feature requires FFmpeg and system resources not available on Vercel Free. " +
      "Alternatives: (1) Use client-side FFmpeg.js for lightweight trimming, " +
      "(2) Deploy to Firebase Cloud Functions with custom Docker image, " +
      "(3) Upgrade to a paid tier.",
      503,
    );
  },
});
