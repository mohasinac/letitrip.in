/**
 * Signed upload for a delivered digital asset (a QR image, or an admin-only file).
 *
 * POST ?step=sign     → { uploadUrl, storagePath, contentKind }
 * POST ?step=finalize → { storagePath, contentType, fileName, contentKind }
 *
 * 🛑 NOT `/api/media/sign`. That pipeline ends by creating a `mediaAssets` row,
 * and the row IS a `/media/{shortId}` URL — which `GET /api/media/[...slug]`
 * serves with no authentication whatsoever, over a bucket whose Storage rule is
 * `allow read: if true`. A purchased QR there would be a paid good at a public
 * URL. These bytes land under `private/digital-content/...`, mint no row, and
 * are readable only through `GET /api/orders/{id}/code/asset`, which checks that
 * the caller owns the order.
 *
 * Two steps because bytes must never traverse the Next.js function: Rule #6 caps
 * a request body at 4.5 MB, and a signed PUT straight to Storage has no such
 * ceiling. `finalize` is where the file is proven to be what it claimed.
 */

import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  storeRepository,
  productRepository,
} from "@mohasinac/appkit";
import {
  signDigitalContentUpload,
  finalizeDigitalContentUpload,
  contentKindForMime,
  assertCanUploadContentKind,
} from "@mohasinac/appkit/server";
import { ROLES_STORE_WRITE, USER_ROLE } from "@/constants";
import { z } from "zod";

const STAFF_ROLES = new Set<string>([
  USER_ROLE.ADMIN,
  USER_ROLE.MODERATOR,
  USER_ROLE.EMPLOYEE,
]);

async function assertOwnsListing(productId: string, uid: string, role?: string) {
  const product = await productRepository.findById(productId);
  if (!product) return ApiErrors.notFound("Listing not found");
  if (STAFF_ROLES.has(role ?? "")) return null;
  const store = await storeRepository.findByOwnerId(uid);
  if (!store || (product as { storeId?: string }).storeId !== store.id) {
    return ApiErrors.notFound("Listing not found");
  }
  return null;
}

const bodySchema = z.object({
  step: z.enum(["sign", "finalize"]),
  fileName: z.string().min(1).max(200).optional(),
  contentType: z.string().min(1).max(120),
  size: z.number().int().positive().optional(),
  storagePath: z.string().min(1).max(500).optional(),
});

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    // 🛑 NO `permission` field here. getServerPermissions() only resolves
    // permissions for "employee", so pairing one with a roles[] that contains
    // "seller" is a GUARANTEED 403 for every seller -- the exact shape
    // audit-permission-role-mismatch exists to catch. Ownership is enforced in
    // the handler by assertOwnsListing, which is stricter than any role gate.
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    schema: bodySchema,
    handler: async ({ user, params, body }) => {
      const productId = (params as { id: string }).id;
      const denied = await assertOwnsListing(productId, user!.uid, user!.role);
      if (denied) return denied;

      /*
       * The role gate is applied at BOTH steps, keyed on the MIME. A seller may
       * attach an image (the QR/voucher case, which is the whole point of
       * widening this beyond strings); any other file type is staff-only,
       * because those bytes are later streamed to a buyer and a mislabelled
       * document is stored XSS. Checking only at `sign` would leave `finalize`
       * as an unguarded second door onto the same path.
       */
      assertCanUploadContentKind(contentKindForMime(body!.contentType), user!.role);

      if (body!.step === "sign") {
        if (!body!.fileName || !body!.size) {
          return ApiErrors.badRequest("fileName and size are required to sign an upload");
        }
        return successResponse(
          await signDigitalContentUpload({
            productId,
            fileName: body!.fileName,
            contentType: body!.contentType,
            size: body!.size,
          }),
        );
      }

      if (!body!.storagePath) {
        return ApiErrors.badRequest("storagePath is required to finalize an upload");
      }
      /*
       * Confine the path to THIS listing's folder. Without it a seller could
       * finalize — and then attach to their own listing — an asset uploaded
       * under someone else's product id. The path prefix is the only thing
       * tying an upload to a listing, since nothing else records who signed it.
       */
      if (!body!.storagePath.includes(`/${productId}/`)) {
        return ApiErrors.badRequest("That upload does not belong to this listing");
      }
      return successResponse(
        await finalizeDigitalContentUpload(body!.storagePath, body!.contentType),
      );
    },
  }),
);
