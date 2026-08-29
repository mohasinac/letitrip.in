import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
  createCheckoutOrderAction,
  ApiErrors,
  PaymentMethodValues,
  serverLogger,
  recordAdminAction,
  AdminAuditActionValues,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin Checkout Bypass
 *
 * GET   /api/admin/checkout-bypass — returns { enabled: boolean } for the current admin.
 *       Returns 403 if the caller is not an admin (enforced by createRouteHandler roles).
 *
 * PATCH /api/admin/checkout-bypass — turns the capability on or off.
 *       This route is the ONLY writer, which is what audit-checkout-bypass rule 1
 *       requires. The admin dashboard toggle used to write it through the generic
 *       /api/admin/feature-flags route while referring to the key via the
 *       `ADMIN_CHECKOUT_BYPASS_FLAG_KEY` constant — and since that audit is a
 *       substring scan for the literal, routing around it through a constant made
 *       the second write path invisible to the rule written to forbid it.
 *
 * POST  /api/admin/checkout-bypass — places an order bypassing OTP and payment.
 *       Server-side guards:
 *         1. Caller must be admin (createRouteHandler roles: [...ROLES_ADMIN_ONLY]).
 *         2. Caller must hold `admin:checkout:bypass`.
 *         3. siteSettings.payment.adminCheckoutBypass must be true.
 *       Two gates rather than one on purpose: admins bypass every permission check
 *       (`isEffectiveAdminUser`), so the permission alone would enable this for every
 *       admin. The permission decides WHO, the setting decides WHETHER.
 *       The resulting order has paymentMethod "admin_bypass", paymentStatus "paid",
 *       status "processing", and carries adminBypassBy = admin UID for audit trail.
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:checkout:bypass",
    handler: async () => {
      const settings = await siteSettingsRepository.getSingleton();
      const enabled = settings?.payment?.adminCheckoutBypass === true;
      return successResponse({ enabled });
    },
  }),
);

const toggleSchema = z.object({
  enabled: z.boolean(),
  reason: z.string().max(300).optional(),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof toggleSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:checkout:bypass",
    schema: toggleSchema,
    handler: async ({ user, body }) => {
      const { enabled, reason } = body!;
      const actorUid = user!.uid;
      const why = reason?.trim() || "no reason supplied";

      await siteSettingsRepository.updateSingleton({
        payment: { adminCheckoutBypass: enabled },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      serverLogger.warn("admin.checkoutBypass.toggled", { actorUid, enabled, reason: why });
      await recordAdminAction({
        actorUid,
        action: AdminAuditActionValues.CHECKOUT_BYPASS,
        targetType: "settings",
        targetId: "global",
        reason: `bypass ${enabled ? "enabled" : "disabled"}: ${why}`,
      });

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
    permission: "admin:checkout:bypass",
    schema: bypassSchema,
    handler: async ({ user, body }) => {
      // Guard: feature flag must be explicitly enabled server-side.
      const settings = await siteSettingsRepository.getSingleton();
      if (settings?.payment?.adminCheckoutBypass !== true) {
        throw ApiErrors.forbidden("Admin checkout bypass is not enabled.");
      }

      const { addressId, notes, excludedProductIds } = body!;
      const adminUid = user!.uid;
      const reason = notes?.trim() || "no reason supplied";

      serverLogger.info("admin checkout bypass invoked", {
        actorUid: adminUid,
        reason,
        addressId,
      });

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

      void recordAdminAction({
        actorUid: adminUid,
        action: AdminAuditActionValues.CHECKOUT_BYPASS,
        targetType: "order",
        targetId: result.orderIds[0] ?? addressId,
        reason,
        metadata: { addressId, orderIds: result.orderIds },
      });

      return successResponse(result, "Admin bypass order placed successfully.");
    },
  }),
);
