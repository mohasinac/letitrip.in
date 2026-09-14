/**
 * The digital-content pool for one listing.
 *
 * GET    — the seller's view of the pool. Never returns a code or an asset path.
 * POST   — add entries (a code, or an already-uploaded asset).
 * DELETE — remove an UNCLAIMED entry.
 *
 * 🛑 This route returned `501 "Digital code management is not implemented yet."`
 * until 2026-09-14, and it was the only writer the pool ever had — so the pool
 * was ALWAYS EMPTY. Everything downstream was built and correct:
 * `claimDigitalCodeForOrder` runs at checkout, the buyer reveals through
 * `GET /api/orders/{id}/code`, a refund revokes what was unclaimed. With nothing
 * in the pool the claim logged "code pool exhausted" and returned silently, the
 * order completed, and the buyer's panel answered 404. The seller form's "Code
 * Pool Size" field made the listing advertise stock that did not exist.
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
  addPoolEntries,
  listPoolEntries,
  deletePoolEntry,
  assertCanUploadContentKind,
} from "@mohasinac/appkit/server";
import { ROLES_STORE_WRITE, USER_ROLE } from "@/constants";
import { z } from "zod";

const STAFF_ROLES = new Set<string>([
  USER_ROLE.ADMIN,
  USER_ROLE.MODERATOR,
  USER_ROLE.EMPLOYEE,
]);

/**
 * Ownership, resolved the same way every other seller route does it.
 *
 * `storeId` on a product is the store SLUG, never the owner's Auth uid — the
 * seller-actions header records that confusion having shipped once already
 * (listings filed under an id no page, cart grouping or payout ever matched).
 */
async function assertOwnsListing(productId: string, uid: string, role?: string) {
  const product = await productRepository.findById(productId);
  if (!product) return { error: ApiErrors.notFound("Listing not found") };
  if (STAFF_ROLES.has(role ?? "")) return { product };
  const store = await storeRepository.findByOwnerId(uid);
  if (!store || (product as { storeId?: string }).storeId !== store.id) {
    return { error: ApiErrors.notFound("Listing not found") };
  }
  return { product };
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    // 🛑 NO `permission` field here. getServerPermissions() only resolves
    // permissions for "employee", so pairing one with a roles[] that contains
    // "seller" is a GUARANTEED 403 for every seller -- the exact shape
    // audit-permission-role-mismatch exists to catch. Ownership is enforced in
    // the handler by assertOwnsListing, which is stricter than any role gate.
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    handler: async ({ user, params }) => {
      const productId = (params as { id: string }).id;
      const owned = await assertOwnsListing(productId, user!.uid, user!.role);
      if (owned.error) return owned.error;
      return successResponse({ entries: await listPoolEntries(productId) });
    },
  }),
);

type PoolEntryInput = z.infer<typeof addSchema>["entries"][number];

const addSchema = z.object({
  entries: z
    .array(
      z.object({
        contentKind: z.enum(["code", "image", "file"]),
        code: z.string().trim().min(1).max(200).optional(),
        assetPath: z.string().min(1).max(500).optional(),
        fileName: z.string().max(200).optional(),
        contentType: z.string().max(120).optional(),
        expiresAt: z.string().datetime().optional(),
      }),
    )
    // Bounded: this writes one Firestore document per entry in a single batch,
    // and a batch caps at 500 regardless of what the caller hoped for.
    .min(1)
    .max(200),
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
    schema: addSchema,
    handler: async ({ user, params, body }) => {
      const productId = (params as { id: string }).id;
      const owned = await assertOwnsListing(productId, user!.uid, user!.role);
      if (owned.error) return owned.error;

      // Per-entry, because one request may mix a QR image with a code and only
      // the non-image file is staff-restricted.
      for (const e of body!.entries) {
        assertCanUploadContentKind(e.contentKind, user!.role);
      }

      const result = await addPoolEntries(
        body!.entries.map((e: PoolEntryInput) => ({
          productId,
          contentKind: e.contentKind,
          code: e.code,
          assetPath: e.assetPath,
          fileName: e.fileName,
          contentType: e.contentType,
          expiresAt: e.expiresAt ? new Date(e.expiresAt) : undefined,
        })),
      );
      return successResponse(result, `Added ${result.added} entr${result.added === 1 ? "y" : "ies"}`);
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    // 🛑 NO `permission` field here. getServerPermissions() only resolves
    // permissions for "employee", so pairing one with a roles[] that contains
    // "seller" is a GUARANTEED 403 for every seller -- the exact shape
    // audit-permission-role-mismatch exists to catch. Ownership is enforced in
    // the handler by assertOwnsListing, which is stricter than any role gate.
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    handler: async ({ request, user, params }) => {
      const productId = (params as { id: string }).id;
      const codeId = new URL(request.url).searchParams.get("entryId");
      if (!codeId) return ApiErrors.badRequest("entryId is required");
      const owned = await assertOwnsListing(productId, user!.uid, user!.role);
      if (owned.error) return owned.error;
      return successResponse(await deletePoolEntry(productId, codeId), "Entry removed");
    },
  }),
);
