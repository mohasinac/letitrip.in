import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  userRepository,
  notificationRepository,
} from "@mohasinac/appkit";
import { getAdminAuth } from "@mohasinac/appkit/server";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    permission: "admin:user-bans:write",
    handler: async ({ params, user }) => {
      const uid = (params as { uid: string }).uid;
      const target = await userRepository.findById(uid);
      if (!target) return errorResponse("User not found", 404);

      // Re-enable Firebase Auth login
      try {
        await getAdminAuth().updateUser(uid, { disabled: false });
      } catch { /* non-fatal */ }

      // Clear ban fields
      await userRepository.update(uid, {
        isDisabled: false,
        hardBanReason: undefined,
        hardBannedAt: undefined,
        hardBannedBy: undefined,
      } as any);

      // Notify user
      try {
        await notificationRepository.create({
          userId: uid,
          type: "account_action",
          title: "Account access restored",
          body: "Your account access has been restored by an administrator.",
          isRead: false,
          entityId: uid,
          entityType: "user",
          createdAt: new Date(),
        } as any);
      } catch { /* non-fatal */ }

      return successResponse({ uid }, "User unbanned");
    },
  }),
);
