import { withProviders } from "@/providers.config";
/**
 * Set stock and made-to-order across every member of one group, in one request.
 *
 * PATCH /api/store/products/{id}/group/stock
 *
 * 🛑 STOCK IS INDEPENDENT PER LISTING. This is a shared EDITING SURFACE, not a
 * shared pool and not a bill of materials. A spare attack ring is one physical
 * object the seller happens to have, so selling it must not decrement anything
 * else — the user's own framing was *"if I have a spare attack ring for Galeon
 * I can sell it to someone who wants it in the same colour"*. All this endpoint
 * does is save N independent numbers without making the seller open N editors.
 *
 * 🛑 It writes only the members NAMED in the body. A "set every child to this"
 * convenience would be one slip away from zeroing a group — and the panel has
 * the per-member inputs anyway, so there is nothing to gain by inventing a
 * broadcast.
 */
import { z } from "zod";
import { isAdminUser, isEmployeeUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE, USER_ROLE } from "@/constants";

const ROLES = [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE];

/*
 * Capped at 50 members, matching the group-rule caps. A group larger than that
 * is a catalogue, and an unbounded body here would be an unbounded number of
 * Firestore writes in one request — straight through Rule #6's budget.
 */
const stockSchema = z
  .object({
    members: z
      .array(
        z
          .object({
            productId: z.string().min(1),
            /*
             * `.nonnegative()`, not `.positive()`: zero is a real and common
             * value — it is how a seller says "none left" without retiring the
             * listing. No upper bound beyond the int check; a seller with 400
             * of a part is unusual, not wrong.
             */
            stockQuantity: z.number().int().nonnegative().optional(),
            madeToOrder: z.boolean().optional(),
          })
          .strict()
          /*
           * A member entry that names neither field is a no-op the caller
           * almost certainly did not intend — most likely a UI sending every
           * row whether or not it changed. Refused loudly rather than written
           * as an empty patch.
           */
          .refine(
            (m) => m.stockQuantity !== undefined || m.madeToOrder !== undefined,
            { message: "Each member must set stockQuantity, madeToOrder, or both." },
          ),
      )
      .min(1)
      .max(50),
  })
  .strict();

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof stockSchema>>({
    auth: true,
    roles: ROLES,
    schema: stockSchema,
    handler: async ({ params, body, user }) => {
      const parentId = (params as { id: string }).id;
      const privileged = isAdminUser(user) || isEmployeeUser(user);

      const parent = await productRepository.findById(parentId);
      if (!parent) return errorResponse("Product not found", 404);
      if (!parent.isGroupParent || !parent.groupId) {
        return errorResponse("This listing is not a group parent", 400);
      }

      /*
       * Ownership on the PARENT, then membership on each child — two checks,
       * because they answer different questions. A seller may edit their own
       * group; passing a `productId` that belongs to someone else's catalogue
       * must not write to it just because the parent checked out.
       */
      if (!privileged) {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || parent.storeId !== store.id) {
          return errorResponse("You do not own this listing", 403);
        }
      }

      /*
       * The UNFILTERED scope. An admin editing stock must see draft and
       * non-standard children — the public scope hides both, so a draft child's
       * stock would be unsettable and the request would read as "that product
       * is not in this group".
       */
      const members = await productRepository.findAllByGroupId(parent.groupId);
      const byId = new Map(members.map((m) => [m.id, m]));

      const updated: string[] = [];
      const rejected: { productId: string; reason: string }[] = [];

      for (const entry of body!.members) {
        const member = byId.get(entry.productId);
        if (!member) {
          rejected.push({
            productId: entry.productId,
            reason: "Not a member of this group",
          });
          continue;
        }

        const patch: Record<string, unknown> = {};
        if (entry.stockQuantity !== undefined) {
          patch.stockQuantity = entry.stockQuantity;
          /*
           * 🛑 `availableQuantity` is set TOO, and this is the field that
           * actually gates availability — `baseAvailable` reads it first and
           * every unavailable-clause query keys on it. Writing only
           * `stockQuantity` would leave a seller's "I found 3 more" invisible
           * on every surface, which is `stockQuantity`-vs-`availableQuantity`
           * drift of exactly the kind Root Cause #42 describes.
           *
           * Setting them equal is right HERE because this is a manual stocktake
           * — the seller is stating what they physically have, which is by
           * definition what is available. The checkout decrement moves
           * `availableQuantity` alone, on purpose, so the two legitimately
           * differ between stocktakes.
           */
          patch.availableQuantity = entry.stockQuantity;
        }
        if (entry.madeToOrder !== undefined) patch.madeToOrder = entry.madeToOrder;

        await productRepository.update(member.id, patch as never);
        updated.push(member.id);
      }

      /*
       * 207-style partial result rather than a throw. The seller edited several
       * rows; refusing the lot because one id went stale (another session
       * unlinked it mid-edit) would discard work that was correct. Both lists
       * are returned so the panel can say which rows did not take.
       */
      return successResponse(
        { updated, rejected },
        rejected.length === 0
          ? `Updated ${updated.length} listing${updated.length === 1 ? "" : "s"}.`
          : `Updated ${updated.length}; ${rejected.length} could not be updated.`,
      );
    },
  }),
);
