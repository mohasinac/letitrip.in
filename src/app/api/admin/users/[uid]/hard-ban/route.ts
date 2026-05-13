import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  userRepository,
  orderRepository,
  sessionRepository,
  storeRepository,
  productRepository,
  bidRepository,
  notificationRepository,
} from "@mohasinac/appkit";
import { getAdminAuth } from "@mohasinac/appkit/server";

const schema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

export const POST = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    auth: true,
    roles: ["admin"],
    permission: "admin:user-bans:write",
    schema,
    handler: async ({ params, body, user }) => {
      const uid = (params as { uid: string }).uid;
      if (uid === user!.uid) return errorResponse("Cannot ban yourself", 400);

      const target = await userRepository.findById(uid);
      if (!target) return errorResponse("User not found", 404);
      if (target.role === "admin") return errorResponse("Cannot ban an admin", 400);

      // 1. Disable Firebase Auth login
      try {
        await getAdminAuth().updateUser(uid, { disabled: true });
      } catch {
        // non-fatal — user may not have Auth record
      }

      // 2. Mark banned on Firestore doc
      await userRepository.update(uid, {
        isDisabled: true,
        hardBanReason: body!.reason,
        hardBannedAt: new Date(),
        hardBannedBy: user!.uid,
      } as any);

      // 3. Delete active sessions
      try {
        const sessions = await sessionRepository.findActiveByUser(uid);
        await Promise.all(sessions.map((s) => sessionRepository.delete(s.id)));
      } catch { /* non-fatal */ }

      // 4. Cascade to store if seller
      if (target.role === "seller") {
        try {
          const store = await storeRepository.findByOwnerId(uid);
          if (store) {
            await storeRepository.update(store.id, { status: "suspended" } as any);
            const products = await productRepository.findByStore(store.id);
            await Promise.all(
              products.map((p) => productRepository.update(p.id, { status: "archived" } as any)),
            );
          }
        } catch { /* non-fatal */ }
      }

      // 5. Cancel active bids
      try {
        const bids = await bidRepository.findBy("bidderId", uid);
        const activeBids = bids.filter((b) => b.status === "active");
        await Promise.all(activeBids.map((b) => bidRepository.update(b.id, { status: "cancelled" } as any)));
      } catch { /* non-fatal */ }

      // 6. Notify user
      try {
        await notificationRepository.create({
          userId: uid,
          type: "account_action",
          title: "Account permanently suspended",
          body: `Your account has been permanently suspended. Reason: ${body!.reason}. You may appeal by emailing support@letitrip.in.`,
          isRead: false,
          entityId: uid,
          entityType: "user",
          createdAt: new Date(),
        } as any);
      } catch { /* non-fatal */ }

      return successResponse({ uid }, "User hard-banned");
    },
  }),
);
