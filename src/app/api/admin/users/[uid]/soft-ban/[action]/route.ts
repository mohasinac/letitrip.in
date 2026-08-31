import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  userRepository,
  notificationRepository,
  normalizeError,
  serverLogger,
} from "@mohasinac/appkit";
import { ROLES_TRUST_SAFETY } from "@/constants";
import { sendNotification } from "@mohasinac/appkit/server";

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_TRUST_SAFETY],
    permission: "admin:user-bans:write",
    handler: async ({ params, user }) => {
      const { uid, action } = params as { uid: string; action: string };
      const target = await userRepository.findById(uid);
      if (!target) return errorResponse("User not found", 404);

      const existing = (target.softBans ?? []).find((b) => b.action === action);
      if (!existing) return errorResponse("Soft ban not found", 404);

      const updatedBans = (target.softBans ?? []).filter((b) => b.action !== action);
      await userRepository.update(uid, { softBans: updatedBans } as any);

      try {
        /*
         * 🛑 Through `sendNotification`, not `notificationRepository.create`.
         *
         * This wrote `body`, `entityId` and `entityType` behind an `as any` —
         * none of which are fields on `NotificationDocument`. The real names
         * are `message`, `relatedId` and `relatedType`, so the bell rendered
         * this notification with NO MESSAGE AT ALL, and the `as any` silenced
         * the one check that would have said so.
         *
         * Going through the central sender also resolves `actionUrl` from
         * relatedType + relatedId, and fans out to email/WhatsApp subject to the
         * user's own preferences — none of which a direct repository write does.
         */
        await sendNotification({
          userId: uid,
          type: "account_action",
          title: `Account restriction lifted: ${action.replace(/_/g, " ")}`,
          message: `The restriction on ${action.replace(/_/g, " ")} has been lifted by ${user!.displayName ?? "an administrator"}.`,
          relatedId: uid,
          relatedType: "user",
          // An account restriction lifting is news the user wants promptly.
          priority: "high",
        });
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("soft-ban lift: notification failed (non-fatal)", { uid, action, error: err instanceof Error ? err.message : String(err) });
      }

      return successResponse({ uid, action }, "Soft ban lifted");
    },
  }),
);
