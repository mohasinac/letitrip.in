import "@/providers.config";
/**
 * Site Settings API Routes
 *
 * Handles global site configuration (singleton document)
 *
 * TODO (Future) - Phase 2:
 * - Implement settings caching (Redis/memory)
 * - Add settings versioning/history
 * - Implement settings validation rules
 * - Add settings change notifications
 * - Implement settings import/export
 * - Add settings backup/restore
 * - Implement feature flag management
 */

import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { siteSettingsRepository } from "@mohasinac/appkit/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { successResponse } from "@mohasinac/appkit/next";
import { getUserFromRequest } from "@/lib/firebase/auth-server";
import { siteSettingsUpdateSchema } from "@/lib/validation/schemas";
import { handleApiError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { sendSiteSettingsChangedEmail } from "@mohasinac/appkit/features/contact";
import { SCHEMA_DEFAULTS } from "@/db/schema";
import { createApiHandler } from "@mohasinac/appkit/http";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { invalidateIntegrationKeysCache } from "@/lib/integration-keys";

/**
 * GET /api/site-settings
 *
 * Get global site settings
 *
 * âœ… Fetches settings via siteSettingsRepository.getSingleton()
 * âœ… Returns public fields only for non-admin users (strips emailSettings, legalPages)
 * âœ… Cache-Control headers set (5 min public / no-cache admin)
 * TODO (Future): Support ETag for conditional requests â€” âœ… Done
 * TODO (Future): Integrate Redis for distributed caching
 */
export const GET = createApiHandler({
  handler: async ({ request }) => {
    // Fetch site settings (singleton pattern)
    const settings = await siteSettingsRepository.getSingleton();

    // Never expose encrypted credential blobs to any client
    const { credentials: _encrypted, ...settingsWithoutCreds } = settings;

    // Check if user is authenticated and is admin
    const user = await getUserFromRequest(request as any);
    const isAdmin = user?.role === "admin";

    // Filter sensitive fields for non-admin users
    let responseData: any;

    if (isAdmin) {
      // Admin: include masked credential values so the UI can show "rzp_liâ€¦key4"
      const credentialsMasked =
        await siteSettingsRepository.getCredentialsMasked();
      responseData = { ...settingsWithoutCreds, credentialsMasked };
    } else {
      // Public: strip admin-only fields, expose the Razorpay key ID for the checkout modal
      const { emailSettings, legalPages, ...publicFields } =
        settingsWithoutCreds;

      // Resolve the public Razorpay key ID: DB wins over env var
      const decrypted = await siteSettingsRepository.getDecryptedCredentials();
      const razorpayKeyIdPublic =
        decrypted.razorpayKeyId ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "";

      responseData = {
        ...publicFields,
        contact: {
          email: settings.contact.email,
          phone: settings.contact.phone,
          whatsappNumber: settings.contact.whatsappNumber,
        },
        razorpayKeyId: razorpayKeyIdPublic,
      };
    }

    const cacheControl = isAdmin
      ? "private, no-cache"
      : "public, max-age=300, s-maxage=600, stale-while-revalidate=120";

    // ETag: shallow hash of the serialised response â€” enables conditional GET (304 Not Modified)
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
});

/**
 * PATCH /api/site-settings
 *
 * Update site settings (admin only)
 *
 * Body: Partial<SiteSettingsDocument>
 *
 * âœ… Requires admin authentication via requireRoleFromRequest
 * âœ… Validates body with siteSettingsUpdateSchema (Zod)
 * âœ… Updates via siteSettingsRepository.updateSingleton()
 * âœ… Writes audit log entry via serverLogger with changed fields and admin identity
 * âœ… Returns updated settings
 * TODO (Future): Invalidate distributed caches (Redis)
 * TODO (Future): Send notification to all admins on settings change â€” âœ… Done
 */
export const PATCH = createRouteHandler<
  (typeof siteSettingsUpdateSchema)["_output"]
>({
  auth: true,
  roles: ["admin"],
  schema: siteSettingsUpdateSchema,
  handler: async ({ user, body }) => {
    // Update settings in repository (singleton pattern)
    const updatedSettings = await siteSettingsRepository.updateSingleton(body!);

    // Invalidate the integration-keys in-process cache so Razorpay/Resend/etc.
    // pick up rotated credentials on the very next request.
    invalidateIntegrationKeysCache();

    // Audit log â€” record which admin changed what fields
    serverLogger.info(ERROR_MESSAGES.API.SITE_SETTINGS_AUDIT_LOG, {
      adminId: user!.uid,
      adminEmail: user!.email,
      changedFields: Object.keys(body!),
      changes: body!,
      timestamp: new Date().toISOString(),
    });

    // Fire-and-forget: notify all admins about the settings change
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || SCHEMA_DEFAULTS.ADMIN_EMAIL;
    sendSiteSettingsChangedEmail({
      adminEmails: [adminEmail],
      changedByEmail: user!.email || adminEmail,
      changedFields: Object.keys(body!),
    }).catch((err) =>
      serverLogger.error(
        ERROR_MESSAGES.API.SETTINGS_CHANGE_NOTIFICATION_ERROR,
        { err },
      ),
    );

    return successResponse(
      updatedSettings,
      SUCCESS_MESSAGES.ADMIN.SETTINGS_SAVED,
    );
  },
});
