import { withProviders } from "@/providers.config";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
  invalidateIntegrationKeysCache,
  serverLogger,
  ERROR_MESSAGES,
} from "@mohasinac/appkit";
import { enqueueJob, sendSiteSettingsChangedEmail } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY, SCHEMA_DEFAULTS } from "@/constants";
import { normalizeError } from "@mohasinac/appkit";

/**
 * The top-level groups `AdminSiteSettingsView.buildFullPayload()` sends.
 *
 * Deliberately NOT `siteSettingsUpdateSchema`: that schema declares only a
 * subset of these groups, and Zod strips unknown keys — so validating through
 * it would silently drop `integrations`, `platformLimits`, `auctionConfig`,
 * `notificationChannels`, `emi`, `gst`, `laborRate`, `theme` and `watermark`
 * on every save. Worse, its `featureFlags` shape omits `listingTypes` /
 * `categoryTypes`, and `updateSingleton` writes through Firestore's `.update()`,
 * which replaces a nested map wholesale — the first save would have wiped
 * every per-listing-type flag.
 *
 * A top-level key allow-list gives the protection that actually matters here
 * (nothing outside this set can be written) without truncating group contents.
 * `actionConfig` / `navConfig` / `disabledRoutes` are excluded on purpose:
 * they have dedicated write paths (`updateActionConfigDomain` /
 * `updateNavConfigDomain`) that also maintain `disabledRoutes`.
 */
const WRITABLE_SITE_GROUPS = [
  "siteName", "tagline", "motto", "logo", "favicon", "background", "contact",
  "payment", "emi", "commissions", "laborRate", "gst", "auctionConfig",
  "socialLinks", "emailSettings", "seo", "features", "featureFlags",
  "legalPages", "shipping", "returns", "faq", "aboutContent", "navbarConfig",
  "footerConfig", "announcementBar", "watermark", "credentials", "theme",
  "featuredResults", "notificationChannels", "integrations", "platformLimits",
  "adSettings",
] as const;

const siteGroupSchema = z
  .object(
    Object.fromEntries(
      WRITABLE_SITE_GROUPS.map((k) => [k, z.unknown().optional()]),
    ) as Record<(typeof WRITABLE_SITE_GROUPS)[number], z.ZodOptional<z.ZodUnknown>>,
  )
  .strict();

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:read",
    handler: async () => {
      const settings = await siteSettingsRepository.getSingleton();
      const credentialsMasked = await siteSettingsRepository.getCredentialsMasked();
      // Strip the raw `enc:v1:` blobs. They are ciphertext, but nothing reads
      // them — the editor hydrates every credential input from
      // `credentialsMasked` — so shipping them just puts every encrypted
      // secret into an admin's browser memory, devtools and HAR exports.
      const { credentials: _encrypted, ...safe } = settings;
      return successResponse({ ...safe, credentialsMasked });
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof siteGroupSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:write",
    schema: siteGroupSchema,
    handler: async ({ user, body }) => {
      // Read the pre-update flag so we can detect an off->on transition below —
      // updateSingleton() merges, so body.featureFlags?.smsVerification alone
      // can't tell us whether this request actually flipped the flag.
      const previousSettings = await siteSettingsRepository.getSingleton().catch(() => null);
      const wasSmsVerificationOn = previousSettings?.featureFlags?.smsVerification === true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await siteSettingsRepository.updateSingleton(body! as any);

      // Homepage is ISR-cached (revalidate=120) and reads siteSettings directly
      // in the Server Component — bust it now instead of waiting up to 2min.
      revalidatePath("/");

      // Invalidate the integration-keys in-process cache so Razorpay/Resend/etc.
      // pick up rotated credentials on the very next request.
      invalidateIntegrationKeysCache();

      // Re-enabling SMS verification after a period of being off means every
      // previously-verified user's phoneVerified flag reflects a verification
      // that happened under different rules (or none, if it was off when they
      // signed up) — reset everyone + clear rate-limit state via the async job
      // primitive (bulk fan-out over the users collection, unbounded).
      const isSmsVerificationOnNow = updated.featureFlags?.smsVerification === true;
      if (!wasSmsVerificationOn && isSmsVerificationOnNow) {
        await enqueueJob({
          jobType: "resetOtpVerification",
          payload: {},
          requestedBy: user!.uid,
        }).catch((err) => {
          serverLogger.error("Failed to enqueue resetOtpVerification job", {
            error: normalizeError(err).message,
          });
        });
      }

      // Audit log — record which admin changed what fields
      serverLogger.info(ERROR_MESSAGES.API.SITE_SETTINGS_AUDIT_LOG, {
        adminId: user!.uid,
        adminEmail: user!.email,
        changedFields: Object.keys(body!),
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
          { error: normalizeError(err).message },
        ),
      );

      // Never echo the encrypted credential blobs back, same as GET.
      const { credentials: _encrypted, ...safe } = updated;
      return successResponse(safe, "Settings saved");
    },
  }),
);
