/**
 * Downloads the digital asset delivered with an order.
 *
 * GET /api/orders/{orderId}/code/asset
 *
 * 🛑 THIS IS THE ONLY WAY THOSE BYTES ARE READABLE, and that is deliberate. The
 * asset lives under `private/digital-content/...`, which mints no `mediaAssets`
 * row and therefore no `/media/{shortId}` slug — and a slug is the thing that
 * would make it world-readable, because `GET /api/media/[...slug]` applies no
 * authentication at all and `storage.rules` is `allow read: if true`.
 *
 * The gate itself is `resolveCodeAssetForOrder`: the caller must own the order
 * (staff excepted, for support) and the order must be in a delivered state. It
 * answers 404 rather than 403 for someone else's order, matching the reveal and
 * invoice routes — a 403 would confirm that an order with that id exists.
 *
 * Sibling of `GET /api/orders/{id}/code`, which returns a redemption STRING.
 * Which of the two applies is told by `contentKind` on that response.
 */

import { withProviders } from "@/providers.config";
import { createRouteHandler, ApiErrors } from "@mohasinac/appkit";
import { resolveCodeAssetForOrder, codeAssetHeaders } from "@mohasinac/appkit/server";
import { USER_ROLE } from "@/constants";

const STAFF_ROLES = new Set<string>([USER_ROLE.ADMIN, USER_ROLE.MODERATOR]);

export const GET = withProviders(
  createRouteHandler({
    /*
     * `auth: true` with no roles[], exactly like the sibling reveal route
     * /api/orders/[id]/code. The gate here is OWNERSHIP, not role: any signed-in
     * user may ask, and resolveCodeAssetForOrder answers only if the order is
     * theirs. Adding a `permission` alongside a non-staff roles[] would be a
     * guaranteed 403 (getServerPermissions resolves permissions for "employee"
     * only) -- which is what audit-permission-role-mismatch blocks.
     */
    auth: true,
    handler: async ({ user, params }) => {
      const orderId = (params as { id: string }).id;
      const res = await resolveCodeAssetForOrder(
        orderId,
        user!.uid,
        STAFF_ROLES.has(user!.role ?? ""),
      );

      if (!res.ok || !res.buffer) {
        const message = res.message ?? "Not found";
        return res.status === 400
          ? ApiErrors.badRequest(message)
          : ApiErrors.notFound(message);
      }

      // A raw Response, not successResponse: this is a file body, not an
      // envelope. Headers force `attachment` + `nosniff` + `private, no-store` —
      // see codeAssetHeaders for why each one is load-bearing.
      return new Response(new Uint8Array(res.buffer), {
        status: 200,
        headers: codeAssetHeaders(res.contentType!, res.fileName!),
      });
    },
  }),
);
