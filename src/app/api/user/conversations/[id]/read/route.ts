/**
 * POST /api/user/conversations/[id]/read — zero out the caller's unread counter
 * and flip `isRead` on inbound messages.
 *
 * Same role resolution + RTDB ping fan-out as the send-message route.
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  getConversation,
  markConversationRead,
  storeRepository,
  getAdminRealtimeDb,
  serverLogger,
} from "@mohasinac/appkit";

async function pingRtdb(paths: string[]): Promise<void> {
  try {
    const db = getAdminRealtimeDb();
    const now = Date.now();
    await Promise.all(
      paths.filter(Boolean).map((p) => db.ref(p).set(now)),
    );
  } catch (err) {
    serverLogger.warn("conversations: RTDB ping failed", {
      paths,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const conv = await getConversation(id);
      if (!conv) return errorResponse("Conversation not found", 404);

      let role: "buyer" | "seller";
      let sellerOwnerId: string | null = null;
      if (conv.buyerId === user!.uid) {
        role = "buyer";
        const store = await storeRepository.findById(conv.storeId);
        sellerOwnerId = (store as { ownerId?: string } | null)?.ownerId ?? null;
      } else {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (store?.id && store.id === conv.storeId) {
          role = "seller";
          sellerOwnerId = user!.uid;
        } else if (user!.role === "admin") {
          role = "seller";
          const ownerStore = await storeRepository.findById(conv.storeId);
          sellerOwnerId = (ownerStore as { ownerId?: string } | null)?.ownerId ?? null;
        } else {
          return errorResponse("Conversation not found", 404);
        }
      }

      await markConversationRead(id, role);
      await pingRtdb([
        `chats/${id}/lastUpdate`,
        `chats/user/${conv.buyerId}/lastUpdate`,
        sellerOwnerId ? `chats/user/${sellerOwnerId}/lastUpdate` : "",
      ]);

      return successResponse({ ok: true });
    },
  }),
);
