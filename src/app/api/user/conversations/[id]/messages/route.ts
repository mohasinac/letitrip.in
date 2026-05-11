/**
 * POST /api/user/conversations/[id]/messages — send a message.
 *
 * Resolves senderRole from the caller's relationship to the conversation:
 *   - buyerId === uid                  → "buyer"
 *   - store.ownerId === uid            → "seller"
 *   - admin                            → role is read from body or defaults
 *                                        to "seller" (so admin replies appear
 *                                        as the store)
 *
 * After write: bumps two RTDB ping paths so live subscribers (the chat
 * window + the conversation list / nav bell) refetch:
 *   - chats/{convId}/lastUpdate
 *   - chats/user/{buyerId}/lastUpdate
 *   - chats/user/{sellerOwnerId}/lastUpdate   (resolved via store)
 */
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  getConversation,
  sendMessage,
  storeRepository,
  getAdminRealtimeDb,
  serverLogger,
  MESSAGE_MAX_LENGTH,
} from "@mohasinac/appkit";

const sendSchema = z.object({
  body: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});

async function pingRtdb(paths: string[]): Promise<void> {
  try {
    const db = getAdminRealtimeDb();
    const now = Date.now();
    await Promise.all(
      paths.filter(Boolean).map((p) => db.ref(p).set(now)),
    );
  } catch (err) {
    // RTDB ping is best-effort — clients will still see the new message on
    // their next refetch (focus / poll / explicit refresh).
    serverLogger.warn("conversations: RTDB ping failed", {
      paths,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export const POST = withProviders(
  createRouteHandler<(typeof sendSchema)["_output"]>({
    auth: true,
    schema: sendSchema,
    handler: async ({ user, body, params }) => {
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

      const updated = await sendMessage({
        conversationId: id,
        senderId: user!.uid,
        senderRole: role,
        body: body!.body,
      });

      await pingRtdb([
        `chats/${id}/lastUpdate`,
        `chats/user/${conv.buyerId}/lastUpdate`,
        sellerOwnerId ? `chats/user/${sellerOwnerId}/lastUpdate` : "",
      ]);

      return successResponse(updated, "Message sent");
    },
  }),
);
