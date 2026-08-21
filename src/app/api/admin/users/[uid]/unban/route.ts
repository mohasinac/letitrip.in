import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  userRepository,
  addressesRepository,
  savedPaymentMethodsRepository,
  normalizeError,
  serverLogger,
  recordAdminAction,
  AdminAuditActionValues,
} from "@mohasinac/appkit";
import { sendNotification } from "@mohasinac/appkit/server";
import { getAdminAuth } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:user-bans:write",
    handler: async ({ params, user }) => {
      const uid = (params as { uid: string }).uid;
      const target = await userRepository.findById(uid);
      if (!target) return errorResponse("User not found", 404);

      // Re-enable Firebase Auth login
      try {
        await getAdminAuth().updateUser(uid, { disabled: false });
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("unban: Auth re-enable failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
      }

      // Clear ban fields
      await userRepository.update(uid, {
        isDisabled: false,
        hardBanReason: undefined,
        hardBannedAt: undefined,
        hardBannedBy: undefined,
      } as any);

      // Reverse address auto-ban (leaves manually-admin-banned addresses untouched)
      try {
        await addressesRepository.unbanAutoForOwner("user", uid);
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("unban: address unban failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
      }

      // Reverse payment method auto-ban
      try {
        await savedPaymentMethodsRepository.unbanAutoForUser(uid);
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("unban: payment method unban failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
      }

      // Notify user
      try {
        await sendNotification({
          userId: uid,
          type: "account_action",
          priority: "normal",
          title: "Account access restored",
          message: "Your account access has been restored by an administrator.",
          relatedId: uid,
          relatedType: "user",
        });
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("unban: user notification failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
      }

      void recordAdminAction({
        actorUid: user!.uid,
        action: AdminAuditActionValues.USER_UNBAN,
        targetType: "user",
        targetId: uid,
        targetLabel: target.displayName ?? uid,
      });

      return successResponse({ uid }, "User unbanned");
    },
  }),
);
