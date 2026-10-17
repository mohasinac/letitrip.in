import { withProviders } from "@/providers.config";
import { z } from "zod";
import { itemRequestsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { ApiErrors, errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_AUTHENTICATED } from "@/constants";

/*
 * A public reply on an item request. Bounded because every reply is appended
 * to ONE document's array — an unbounded body is an unbounded document, and
 * Firestore's 1 MiB per-document ceiling is a hard failure for every later
 * reply, not just the oversized one.
 *
 * `stripPii` still runs on the validated string: the schema proves it IS a
 * string, and `stripPii` decides what that string may contain. Those are
 * different jobs and neither replaces the other.
 */
const replySchema = z.object({
  body: z.string().trim().min(1, "Reply body required").max(4000),
});

/**
 * Cheap PII filter for replies — phone-like sequences, emails and UPI handles.
 *
 * 🛑 ORDER IS THE WHOLE FIX, and the previous order meant the UPI rule never
 * fired (F1 #5's defect, in this local copy of it):
 *
 *   - the PHONE rule ran first, so `9876543210@upi` became
 *     `[number removed]@upi` and the UPI rule then matched nothing;
 *   - the EMAIL rule ran second and ate `user@paytm.com`-shaped VPAs;
 *   - and a bare `name@bank` — the commonest VPA shape there is — matched
 *     NONE of the three, so it passed straight through a filter reporting
 *     success.
 *
 * So the specific rules run before the general ones: explicit `upi://`, then
 * anything with a TLD dot is an email, then any remaining `token@token` has no
 * dot and is therefore a VPA, and only then digits. Each rule leaves a
 * placeholder, so a later rule cannot re-match what an earlier one removed.
 */
function stripPii(input: string): string {
  return input
    .replace(/upi:\/\/\S+/gi, "[UPI removed]")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email removed]")
    .replace(/[\w.-]{2,}@[\w-]{2,}/g, "[UPI removed]")
    .replace(/\b\d{10,12}\b/g, "[number removed]");
}

export const POST = withProviders(
  createRouteHandler<(typeof replySchema)["_output"]>({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    schema: replySchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      const doc = await itemRequestsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      if (doc.status !== "open") return errorResponse("Request not accepting replies", 409);
      const cleaned = stripPii(body!.body);
      const replyEntry = {
        id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        authorId: user!.uid,
        authorName: (user!.name as string | undefined) ?? "Anonymous",
        body: cleaned,
        isOpInitiatedThread: false,
        createdAt: new Date(),
      };
      // Atomic append — see `appendReply`. The read-modify-write this replaces
      // dropped one of two replies posted in the same second, silently.
      await itemRequestsRepository.appendReply(id, replyEntry);
      const updated = await itemRequestsRepository.findById(id);
      return successResponse(updated, "Reply posted", 201);
    },
  }),
);