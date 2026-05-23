import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
  createCheckoutOrderAction,
  ApiErrors,
  PaymentMethodValues,
} from "@mohasinac/appkit";
import { grantAdminCheckoutBypass } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin Checkout Bypass
 *
 * GET  /api/admin/checkout-bypass — returns { enabled: boolean } for the current admin.
 *      Returns 403 if the caller is not an admin (enforced by createRouteHandler roles).
 *
 * POST /api/admin/checkout-bypass — places an order bypassing OTP and payment.
 *      Server-side guards:
 *        1. Caller must be admin (createRouteHandler roles: [...ROLES_ADMIN_ONLY]).
 *        2. siteSettings.featureFlags.adminCheckoutBypass must be true.
 *      The resulting order has paymentMethod "admin_bypass", paymentStatus "paid",
 *      status "processing", and carries adminBypassBy = admin UID for audit trail.
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async () => {
      const settings = await siteSettingsRepository.getSingleton();
      const enabled = settings?.featureFlags?.adminCheckoutBypass === true;
      return successResponse({ enabled });
    },
  }),
);

const bypassSchema = z.object({
  addressId: z.string().min(1, "addressId is required"),
  notes: z.string().max(500).optional(),
  excludedProductIds: z.array(z.string()).optional(),
});

export const POST = withProviders(
  createRouteHandler<(typeof bypassSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    schema: bypassSchema,
    handler: async ({ user, body }) => {
      // Guard: feature flag must be explicitly enabled server-side.
      const settings = await siteSettingsRepository.getSingleton();
      if (settings?.featureFlags?.adminCheckoutBypass !== true) {
        throw ApiErrors.forbidden("Admin checkout bypass is not enabled.");
      }

      const { addressId, notes, excludedProductIds } = body!;
      const adminUid = user!.uid;

      // Pre-verify consent so createCheckoutOrderAction's transaction passes.
      await grantAdminCheckoutBypass(adminUid, addressId, adminUid);

      const result = await createCheckoutOrderAction({
        userId: adminUid,
        userName:
          (user!["displayName"] as string | null | undefined) ??
          user!.email ??
          "Admin",
        userEmail: user!.email ?? "",
        addressId,
        paymentMethod: PaymentMethodValues.ADMIN_BYPASS,
        notes,
        excludedProductIds,
        adminBypass: true,
        adminBypassBy: adminUid,
      });

      return successResponse(result, "Admin bypass order placed successfully.");
    },
  }),
);
