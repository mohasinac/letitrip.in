import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  userRepository,
  sessionRepository,
  storeRepository,
  productRepository,
  bidRepository,
  addressesRepository,
  savedPaymentMethodsRepository,
  normalizeError,
  serverLogger,
  isAdminUser,
  isSellerUser,
} from "@mohasinac/appkit";
import { sendNotification } from "@mohasinac/appkit/server";
import { getAdminAuth } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

const schema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

async function cascadeAddressClusterBan(
  uid: string,
  banData: { banReason: string; bannedBy: string },
): Promise<void> {
  const userAddresses = await addressesRepository.listByOwner("user", uid);
  const uniqueHashes = [...new Set(userAddresses.map((a) => a.addressHash).filter(Boolean))] as string[];
  for (const hash of uniqueHashes) {
    const cluster = await addressesRepository.listByAddressHash(hash);
    const hasBannedAccount = cluster.some((a) => a.ownerId !== uid && a.banStatus === "banned");
    if (!hasBannedAccount) continue;
    const otherOwners = [...new Set(cluster.filter((a) => a.ownerId !== uid).map((a) => `${a.ownerType}|${a.ownerId}`))];
    for (const ownerKey of otherOwners) {
      const [ownerType, ownerId] = ownerKey.split("|");
      await addressesRepository.banAllForOwner(ownerType as "user" | "store", ownerId, banData);
    }
  }
}

async function cascadePaymentClusterBan(
  uid: string,
  banData: { banReason: string; bannedBy: string },
): Promise<void> {
  const userMethods = await savedPaymentMethodsRepository.listByUser(uid);
  for (const method of userMethods) {
    if (!method.identifierHash) continue;
    const cluster = await savedPaymentMethodsRepository.listByIdentifierHash(method.identifierHash);
    const hasBannedAccount = cluster.some((m) => m.userId !== uid && m.banStatus === "banned");
    if (!hasBannedAccount) continue;
    const otherUserIds = [...new Set(cluster.filter((m) => m.userId !== uid).map((m) => m.userId))];
    for (const otherId of otherUserIds) {
      await savedPaymentMethodsRepository.banAllForUser(otherId, banData);
    }
  }
}

export const POST = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:user-bans:write",
    schema,
    handler: async ({ params, body, user }) => {
      const uid = (params as { uid: string }).uid;
      if (uid === user!.uid) return errorResponse("Cannot ban yourself", 400);

      const target = await userRepository.findById(uid);
      if (!target) return errorResponse("User not found", 404);
      if (isAdminUser(target)) return errorResponse("Cannot ban an admin", 400);

      // 1. Disable Firebase Auth login
      try {
        await getAdminAuth().updateUser(uid, { disabled: true });
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("hard-ban: Auth disable failed (user may lack Auth record)", { uid, error: err instanceof Error ? err.message : String(err) });
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
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("hard-ban: session cleanup failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
      }

      // 4. Cascade to store if seller
      if (isSellerUser(target)) {
        try {
          const store = await storeRepository.findByOwnerId(uid);
          if (store) {
            await storeRepository.update(store.id, { status: "suspended" } as any);
            const products = await productRepository.findByStore(store.id);
            await Promise.all(
              products.map((p) => productRepository.update(p.id, { status: "archived" } as any)),
            );
          }
        } catch (err) {
          void normalizeError(err);
          serverLogger.warn("hard-ban: store/product cascade failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
        }
      }

      // 5. Cancel active bids
      try {
        const bids = await bidRepository.findBy("bidderId", uid);
        const activeBids = bids.filter((b) => b.status === "active");
        await Promise.all(activeBids.map((b) => bidRepository.update(b.id, { status: "cancelled" } as any)));
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("hard-ban: bid cancellation failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
      }

      // 6. Cascade address ban + cross-account cluster ban
      try {
        const banData = { banReason: `User hard-banned: ${body!.reason}`, bannedBy: user!.uid };
        await addressesRepository.banAllForOwner("user", uid, banData);
        await cascadeAddressClusterBan(uid, banData);
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("hard-ban: address cluster ban failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
      }

      // 7. Cascade payment method ban + cross-account cluster ban
      try {
        const banData = { banReason: `User hard-banned: ${body!.reason}`, bannedBy: user!.uid };
        await savedPaymentMethodsRepository.banAllForUser(uid, banData);
        await cascadePaymentClusterBan(uid, banData);
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("hard-ban: payment method cluster ban failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
      }

      // 8. Notify user
      try {
        await sendNotification({
          userId: uid,
          type: "account_action",
          priority: "high",
          title: "Account permanently suspended",
          message: `Your account has been permanently suspended. Reason: ${body!.reason}. You may appeal by emailing support@letitrip.in.`,
          relatedId: uid,
          relatedType: "user",
        });
      } catch (err) {
        void normalizeError(err);
        serverLogger.warn("hard-ban: user notification failed (non-fatal)", { uid, error: err instanceof Error ? err.message : String(err) });
      }

      return successResponse({ uid }, "User hard-banned");
    },
  }),
);