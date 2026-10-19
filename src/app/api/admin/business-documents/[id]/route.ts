/**
 * Downloads a statutory business document — GST certificate, Udyam
 * registration, bank passbook.
 *
 * GET /api/admin/business-documents/{id}
 *
 * 🛑 THIS IS THE ONLY WAY THOSE BYTES ARE READABLE. The objects live under
 * `private/business-documents/...`, which mints no `mediaAssets` row and
 * therefore no `/media/{shortId}` slug — and the slug is the thing that would
 * make them world-readable, because `GET /api/media/[...slug]` applies no
 * authentication at all and `storage.rules` is `allow read: if true`. They are
 * additionally AES-256-GCM encrypted at rest; `resolveBusinessDocument`
 * decrypts on the way out.
 *
 * Admin-only, unlike its sibling `GET /api/orders/{id}/code/asset`, which gates
 * on ORDER OWNERSHIP because the buyer paid for that content. Nobody buys a
 * passbook; there is no owner but the business.
 */

import { withProviders } from "@/providers.config";
import { errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { resolveBusinessDocument, codeAssetHeaders } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants/api-roles";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_ADMIN_ONLY,
    permission: "settings:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const res = await resolveBusinessDocument(id);

      if (!res.ok || !res.buffer) {
        /*
         * `errorResponse` rather than `ApiErrors.notFound`, which takes a
         * RESOURCE NAME and appends " not found" — so passing a full sentence
         * through it yields "Document not found not found". The resolver
         * already produces the exact message and status it wants surfaced
         * (including the two 500s that distinguish "stored object is not
         * encrypted but its record says it is" from the reverse).
         */
        return errorResponse(res.message ?? "Not found", res.status ?? 404);
      }

      /*
       * A raw Response, not successResponse: this is a file body, not an
       * envelope. `codeAssetHeaders` is reused verbatim from the digital-asset
       * route rather than copied — the three properties it enforces are
       * exactly the ones needed here and for the same reasons:
       *
       *   - `attachment` ALWAYS, even for a scanned JPEG where `inline` would
       *     be friendlier. Magic bytes prove what a file IS, not that
       *     rendering it is safe, and an HTML document served inline from this
       *     origin is stored XSS against a signed-in admin.
       *   - `nosniff`, closing the other half of that.
       *   - `private, no-store`, because this URL is identical for every
       *     caller and only the session distinguishes them.
       */
      return new Response(new Uint8Array(res.buffer), {
        status: 200,
        headers: codeAssetHeaders(res.contentType!, res.fileName!),
      });
    },
  }),
);
