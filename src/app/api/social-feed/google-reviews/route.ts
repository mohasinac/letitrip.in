import { withProviders } from "@/providers.config";
import { NextResponse } from "next/server";
import { siteSettingsRepository } from "@mohasinac/appkit";
import { fetchGoogleReviews } from "@mohasinac/appkit/server";
import { createApiHandler } from "@mohasinac/appkit";

export const dynamic = "force-dynamic";

/**
 * GET /api/social-feed/google-reviews
 *
 * Proxy for Google Business Reviews via the Google Places API.
 *
 * Query params:
 *   placeId     — Google Place ID (overrides site_settings.googlePlaceId)
 *   maxReviews  — max reviews to return (default 5)
 *   minRating   — minimum star rating to include (default 0)
 *
 * Returns:
 *   { reviews: GoogleReview[], aggregateRating: number, totalRatings: number }
 *   { error: "not-configured" } when API key is absent
 */
export const GET = withProviders(
  createApiHandler({
    handler: async ({ request }) => {
      const { searchParams } = new URL(request.url);
      const queryPlaceId = searchParams.get("placeId") ?? "";
      const maxReviews = Math.max(1, parseInt(searchParams.get("maxReviews") ?? "5", 10));
      const minRating = Math.max(0, parseFloat(searchParams.get("minRating") ?? "0"));

      const credentials = await siteSettingsRepository
        .getDecryptedCredentials()
        .catch(() => ({} as Record<string, string>));

      const apiKey = credentials.googleMapsApiKey ?? "";
      if (!apiKey) {
        return NextResponse.json({ error: "not-configured" });
      }

      const placeId = queryPlaceId || credentials.googlePlaceId || "";
      if (!placeId) {
        return NextResponse.json({ reviews: [], aggregateRating: 0, totalRatings: 0 });
      }

      try {
        const result = await fetchGoogleReviews(placeId, apiKey, maxReviews, minRating);
        return NextResponse.json(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[google-reviews] fetch failed:", message);
        return NextResponse.json({ reviews: [], aggregateRating: 0, totalRatings: 0 });
      }
    },
  }),
);
