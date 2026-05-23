import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  userRepository,
  notificationRepository,
} from "@mohasinac/appkit";
import { ROLES_TRUST_SAFETY } from "@/constants";

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
        await notificationRepository.create({
          userId: uid,
          type: "account_action",
          title: `Account restriction lifted: ${action.replace(/_/g, " ")}`,
          body: `The restriction on ${action.replace(/_/g, " ")} has been lifted by ${user!.displayName ?? "an administrator"}.`,
          isRead: false,
          entityId: uid,
          entityType: "user",
          createdAt: new Date(),
        } as any);
      } catch { /* non-fatal */ }

      return successResponse({ uid, action }, "Soft ban lifted");
    },
  }),
);
