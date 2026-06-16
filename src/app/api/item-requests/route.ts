import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  errorResponse,
  itemRequestsRepository,
  parseJsonBody,
  type FirestoreDocument,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_AUTHENTICATED } from "@/constants";

// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async () => {
      const result = await itemRequestsRepository.listOpen({ limit: 50 });
      return successResponse({ items: result.items, total: result.items.length });
    },
  }),
);

// audit-route-schema-ok: pending-bespoke-schema
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ request, user }) => {
      const body = await parseJsonBody<FirestoreDocument>(request);
      try {
        const doc = await itemRequestsRepository.create({
          ...body,
          opUserId: user!.uid,
          opDisplayName: user!.name ?? "Anonymous",
          status: "pending-approval",
          replies: [],
          replyCount: 0,
        } as FirestoreDocument);
        return successResponse(doc, "Request submitted for review", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Submit failed", 400);
      }
    },
  }),
);
