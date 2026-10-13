import { withProviders } from "@/providers.config";
import { itemRequestsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { itemRequestCreateSchema } from "@mohasinac/appkit/features/store-extensions/schemas/item-request-create-form";
import { finalizeStagedMediaArray } from "@mohasinac/appkit/features/media/finalize";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_AUTHENTICATED } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async () => {
      const result = await itemRequestsRepository.listOpen({ limit: 50 });
      return successResponse({ items: result.items, total: result.items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof itemRequestCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    schema: itemRequestCreateSchema,
    handler: async ({ user, body }) => {
      // This list is read by ANYONE (`GET` above is `auth: false`), so an
      // unvalidated write here was an unvalidated publish. The schema is
      // `.strict()` and declares neither `approvedAt` nor `approvedBy`, so a
      // caller can no longer forge the record of having been cleared.
      /*
       * 🛑 F1 #8 — the uploads were never finalized, so they stayed in `tmp/`
       * and `mediaTmpCleanup` reaped them. The request was created, the
       * response was 201, and the photos the user attached vanished some hours
       * later with nothing reporting it. Every other create route that accepts
       * media does this (admin events, admin products); this one was missed.
       *
       * Non-fatal by construction: `finalizeStagedMediaUrl` returns the same
       * `/media/<shortId>` URL whether or not the promotion succeeded, so a
       * Storage hiccup costs the file its promotion, never the request.
       */
      const imageUrls = await finalizeStagedMediaArray(body!.imageUrls);

      const doc = await itemRequestsRepository.create({
        ...body!,
        imageUrls,
        opUserId: user!.uid,
        opDisplayName: user!.name ?? "Anonymous",
        status: "pending-approval",
        replies: [],
        replyCount: 0,
      });
      return successResponse(doc, "Request submitted for review", 201);
    },
  }),
);
