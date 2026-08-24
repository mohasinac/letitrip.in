import { withProviders } from "@/providers.config";
/**
 * Site Settings API — the PUBLIC read surface.
 *
 * Admin reads and writes live on `/api/admin/site`, which is role- and
 * permission-gated. Nothing authenticated belongs in this file.
 *
 * TODO (Future) - Phase 2:
 * - Implement settings caching (Redis/memory)
 * - Add settings versioning/history
 * - Implement settings import/export
 * - Add settings backup/restore
 */

import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { siteSettingsRepository } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { createApiHandler } from "@mohasinac/appkit";
import { toPublicSiteSettings } from "@mohasinac/appkit/server";
import { resolveEffectiveWatermark } from "@/lib/watermark/resolve-effective-watermark";

/**
 * GET /api/site-settings — PUBLIC. Unauthenticated, edge-cached.
 *
 * Returns exactly `toPublicSiteSettings()`: an allow-list projection, not a
 * spread with deletions. Every field it emits has a proven client reader; see
 * the adapter's header for the full triage and for what the old deny-list was
 * leaking.
 *
 * There is deliberately NO admin branch here any more. The full settings
 * document (plus `credentialsMasked`) is served by `GET /api/admin/site`,
 * which is role- and permission-gated. Removing the branch also removes a
 * cache hazard: this URL is served with `s-maxage=600`, so a response whose
 * body varied by caller identity — with no `Vary` on the session cookie — was
 * one shared-cache quirk away from handing an admin payload to everyone.
 *
 * It also no longer calls `getDecryptedCredentials()`. That was here to
 * surface `razorpayKeyId`, which has no client reader: the checkout modal
 * takes its `keyId` from `POST /api/payment/create-order`. A full AES decrypt
 * of all 26 secrets was running on an anonymous, cacheable path for a field
 * nobody read.
 */
export const GET = withProviders(createApiHandler({
  handler: async ({ request }) => {
    const settings = await siteSettingsRepository.getSingleton();

    // Resolved (marker → wordmark → text) watermark, returned alongside the
    // raw stored `watermark` field so consumers of the *effective* value
    // (MediaVideo's client overlay) never see an empty/text-only default just
    // because the admin hasn't explicitly configured one.
    const responseData = toPublicSiteSettings(settings, {
      effectiveWatermark: resolveEffectiveWatermark(settings),
    });

    const cacheControl = "public, max-age=300, s-maxage=600, stale-while-revalidate=120";

    // ETag: shallow hash of the serialised response — enables conditional GET (304 Not Modified)
    const etag = `"${createHash("md5").update(JSON.stringify(responseData)).digest("hex")}"`;
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: etag, "Cache-Control": cacheControl },
      });
    }

    const response = successResponse(responseData);
    response.headers.set("Cache-Control", cacheControl);
    response.headers.set("ETag", etag);
    return response;
  },
}));

/**
 * PATCH was removed 2026-08-24. It duplicated `PUT /api/admin/site` — same
 * repository call, same roles — but carried no `permission`, so the two admin
 * write paths were guarded differently and free to drift. Its side effects
 * (integration-key cache invalidation, the sms-verification reset job, the
 * audit log entry, the admin notification email) now live on that PUT, which
 * is the single admin write path for site settings.
 */
