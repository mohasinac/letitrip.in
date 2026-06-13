import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  itemRequestsRepository,
} from "@mohasinac/appkit";
import { ROLES_AUTHENTICATED } from "@/constants";

// Cheap PII filter for replies — strips phone-like sequences and email addresses.
function stripPii(input: string): string {
  return input
    .replace(/\b\d{10,12}\b/g, "[number removed]")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email removed]")
    .replace(/(?:upi:\/\/|@)[\w.-]+@[\w.-]+/g, "[UPI removed]");
}

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ request, params, user }) => {
      const id = (params as { id: string }).id;
      const doc = await itemRequestsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      if (doc.status !== "open") return errorResponse("Request not accepting replies", 409);
      const reply = (await request.json().catch(() => ({}))) as { body?: string };
      if (!reply.body?.trim()) return errorResponse("Reply body required", 400);
      const cleaned = stripPii(reply.body);
      const replyEntry = {
        id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        authorId: user!.uid,
        authorName: (user!.name as string | undefined) ?? "Anonymous",
        body: cleaned,
        isOpInitiatedThread: false,
        createdAt: new Date(),
      };
      const updated = await itemRequestsRepository.update(id, {
        replies: [...doc.replies, replyEntry],
        replyCount: doc.replyCount + 1,
      });
      return successResponse(updated, "Reply posted", 201);
    },
  }),
);
