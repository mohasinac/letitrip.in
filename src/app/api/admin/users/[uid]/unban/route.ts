import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  userRepository,
} from "@mohasinac/appkit";
import { sendNotification } from "@mohasinac/appkit/server";
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
        await sendNotification({
          userId: uid,
          type: "account_action",
          priority: "normal",
          title: "Account access restored",
          message: "Your account access has been restored by an administrator.",
          relatedId: uid,
          relatedType: "user",
        });
      } catch { /* non-fatal */ }

      return successResponse({ uid }, "User unbanned");
    },
  }),
);
