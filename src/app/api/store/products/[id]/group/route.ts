import { withProviders } from "@/providers.config";
import { z } from "zod";
import { isAdminUser, isEmployeeUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE } from "@/constants";
import { USER_ROLE } from "@/constants";
import type { JsonValue } from "@mohasinac/appkit";

const ERR_PRODUCT_NOT_FOUND = "Product not found";
const ERR_FORBIDDEN = "You do not own this listing";

const startGroupSchema = z.object({ slug: z.string().min(1) });

/*
 * 🛑 Title AND rules through ONE schema, with every field optional.
 *
 * The panel saves the title and the rules from the same form, so two PATCH
 * shapes would mean two requests for one logical edit and a window where the
 * stored group is half of what the admin typed. Every field optional, and only
 * the keys PRESENT in the body are written — `.partial()` semantics by hand,
 * so saving a title cannot blank a rule the form did not render.
 *
 * `.strict()`, deliberately. The sibling `PATCH /api/admin/events/[id]` is
 * `.passthrough()` and that is what let a lottery editor write over booked
 * slots (Root Cause #76): a write shape that can EXPRESS state it does not own
 * will eventually overwrite it. Here the stakes are lower, but the habit is the
 * same — an unknown key is a 400, not a silent write.
 */
const updateGroupSchema = z
  .object({
    groupTitle: z.string().max(200).optional(),
    /*
     * `.int()` on the counts and NOT on the discount. A member count is a count
     * of things; the discount is a percentage of money, and `.int()` on
     * anything money-shaped is the exact defect `audit-money-units`'
     * INT_ON_MONEY_FIELD rule blocks — 12.5% off is a real offer.
     */
    groupMinMembers: z.number().int().min(1).max(50).optional(),
    groupMaxMembers: z.number().int().min(1).max(50).optional(),
    groupMaxUnitsPerMember: z.number().int().min(1).max(99).optional(),
    groupRequiredMemberIds: z.array(z.string().min(1)).max(50).optional(),
    groupDiscountPercent: z.number().min(0).max(100).optional(),
  })
  .strict()
  /*
   * Caught HERE rather than at enforcement time. A min above a max makes every
   * selection invalid, so `checkGroupRules` would refuse the whole group with
   * two contradictory messages and the admin would read it as a bug in the
   * picker rather than in what they saved.
   */
  .refine(
    (v) =>
      v.groupMinMembers === undefined ||
      v.groupMaxMembers === undefined ||
      v.groupMinMembers <= v.groupMaxMembers,
    { message: "The minimum number of items cannot exceed the maximum." },
  );

/** Resolves the caller's own product, or any product for admin/employee. */
async function loadScopedProduct(
  user: { uid: string },
  isPrivileged: boolean,
  id: string,
) {
  const product = await productRepository.findById(id);
  if (!product) return null;
  if (isPrivileged) return product;
  const store = await storeRepository.findByOwnerId(user.uid);
  if (!store || product.storeId !== store.id) return null;
  return product;
}

const ROLES = [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE];

export const POST = withProviders(
  createRouteHandler<z.infer<typeof startGroupSchema>>({
    auth: true,
    roles: ROLES,
    schema: startGroupSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id: string }).id;
      const privileged = isAdminUser(user) || isEmployeeUser(user);
      const product = await loadScopedProduct(user!, privileged, id);
      if (!product) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (product.groupId) return errorResponse("This listing is already part of a group", 400);

      await productRepository.startGroup(id, body!.slug);
      return successResponse({ id, groupId: body!.slug });
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof updateGroupSchema>>({
    auth: true,
    roles: ROLES,
    schema: updateGroupSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id: string }).id;
      const privileged = isAdminUser(user) || isEmployeeUser(user);
      const product = await loadScopedProduct(user!, privileged, id);
      if (!product) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (!product.isGroupParent) return errorResponse(ERR_FORBIDDEN, 403);

      /*
       * Only the keys actually SENT are written — the `in` test, not a spread
       * of the whole validated object. Zod gives `undefined` for an absent
       * optional, and writing `undefined` through this repository would clear
       * the stored value: saving a title alone would silently wipe every rule.
       */
      const patch: Record<string, JsonValue> = {};
      for (const key of [
        "groupTitle",
        "groupMinMembers",
        "groupMaxMembers",
        "groupMaxUnitsPerMember",
        "groupRequiredMemberIds",
        "groupDiscountPercent",
      ] as const) {
        /*
         * 🛑 The VALUE must be checked, not just the key's presence. `in` is
         * true for `{ groupTitle: undefined }` — which Zod produces for an
         * absent optional on some shapes — so the `in` test alone would write
         * `undefined` and clear the stored value, the exact failure the
         * comment above says this loop exists to prevent. It is also what
         * `tsc` was objecting to: `body![key]` is `… | undefined` regardless
         * of the `in` narrowing.
         */
        const value = body![key];
        if (value !== undefined) patch[key] = value;
      }

      if (Object.keys(patch).length === 0) {
        return errorResponse("Nothing to update", 400);
      }

      /*
       * 🛑 Through `update`, not `updateGroupTitle`. That method writes exactly
       * one field, so routing the rules through it would need a second write —
       * and `update` is also the method that runs `deriveTaxonomy`, which every
       * other product write path funnels through.
       *
       * 🛑 The rules are set on the PARENT only, which is where
       * `readGroupRules` looks. Copying them onto every child would be five
       * mirror fields per member, drifting the first time one child is edited
       * (Root Cause #42).
       */
      await productRepository.update(id, patch as never);
      return successResponse({ id, ...patch });
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES,
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const privileged = isAdminUser(user) || isEmployeeUser(user);
      const product = await loadScopedProduct(user!, privileged, id);
      if (!product) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (!product.isGroupParent || !product.groupId) {
        return errorResponse(ERR_FORBIDDEN, 403);
      }

      await productRepository.dissolveGroup(product.groupId);
      return successResponse({ id, dissolved: true });
    },
  }),
);
