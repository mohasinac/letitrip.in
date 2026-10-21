import { withProviders } from "@/providers.config";
import { z } from "zod";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { categoriesRepository } from "@mohasinac/appkit/features/categories/repository/categories.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const MSG_CATEGORY_NOT_FOUND = "Category not found.";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  /*
   * 🛑 THESE THREE WERE MISSING, and the consequence is the one this file's
   * `parentId` note already describes two lines down: `z.object()` STRIPS
   * unknown keys, so a caller sending them got a 200 and no write.
   *
   * `isFeatured` was here alone, which is what made it easy to miss — the
   * editor now sends all four together, and three of them would have been
   * discarded silently while the admin watched a success toast. All four are
   * in `CATEGORIES_UPDATABLE_FIELDS`, so the repository was never the
   * obstacle; this schema was.
   */
  featuredPriority: z.number().int().min(0).optional(),
  isSearchable: z.boolean().optional(),
  showOnHomepage: z.boolean().optional(),
  /*
   * Re-parent. `null` moves the category to the top as a new root.
   *
   * 🛑 THIS FIELD DID NOT EXIST, AND ITS ABSENCE WAS SILENT. `z.object()` STRIPS
   * unknown keys, so a caller sending a new parent got a 200 and no move — the
   * same shape as the admin grouped-listings route that answered 200 and wrote
   * nothing. Re-parenting was simply unreachable through the API.
   *
   * It is handled separately from the field spread below, because a move rewrites
   * the whole subtree's parentIds/path/tier/ancestors and shifts the rollup
   * between two ancestor chains. Spreading it into `update()` would write the new
   * parent id and leave every descendant claiming the old ancestors.
   */
  parentId: z.string().nullable().optional(),
  /*
   * 🛑 A PARTIAL `display` IS MERGED OVER THE STORED MAP IN THE HANDLER, NOT
   * WRITTEN AS-IS — see the merge below. `BaseRepository.update` calls
   * `doc().update(payload)` and `prepareForFirestore` is only
   * `removeUndefined`, so there is no dot-path flattening anywhere in the
   * chain: a nested map handed to `update()` REPLACES its stored counterpart
   * wholesale.
   *
   * `display` carries six fields — `icon`, `coverImage`, `color`,
   * `mosaicImages`, `showInMenu`, `showInFooter` — and the admin editor sends
   * `display: { showInMenu }` on every save. So saving a category to change
   * its NAME silently destroyed its cover image, its emoji, its colour and,
   * on a bundle, the `mosaicImages` collage that is derived at seed time and
   * cannot be recomputed at render time.
   *
   * `coverImage` is declared here because `z.object()` STRIPS unknown keys:
   * without it the editor's new image field would return 200, show a success
   * toast and write nothing — the Root Cause #76b shape this file's other two
   * 🛑 notes already record.
   */
  display: z
    .object({
      showInMenu: z.boolean().optional(),
      showInFooter: z.boolean().optional(),
      coverImage: z.string().optional(),
    })
    .optional(),
  /*
   * The five category-content fields (B3 + C2c).
   *
   * 🛑 THEY HAD TO BE DECLARED HERE OR THE EDITOR WOULD HAVE BEEN A NO-OP.
   * `z.object()` STRIPS unknown keys, so an admin saving a description
   * template through a schema that did not name it would get a 200, a success
   * toast, and no write — the same defect as the admin grouped-listings route
   * (Root Cause #76b), and the same reason `parentId` above carries its own
   * 🛑 note.
   *
   * `highlights` and `faqs` are the older pair and have had NO editor since
   * they shipped; `contentBody`, `descriptionTemplates` and `productDefaults`
   * arrived in B3 with none either. All five are in
   * `CATEGORIES_UPDATABLE_FIELDS`, so the repository has always been willing.
   *
   * 🛑 And these shapes are declared HERE rather than imported from appkit,
   * which looks like the duplication Root Cause #75 is about and is not
   * available to avoid: measured 2026-10-11, appkit compiles against **zod
   * 3.25.76** while this repo resolves **zod 4.4.3**. An appkit `ZodObject`
   * nested in a consumer `z.array(...)` does not typecheck across that major
   * split — verified, not assumed. The direction that works is
   * consumer-schema → appkit handler, which is what every other route does.
   * The appkit mirrors stay the FIRESTORE contract; these are the ROUTE's.
   */
  /*
   * The regional-naming pair. Declared here for the same reason as everything
   * below it: `z.object()` strips what it does not name, so an admin
   * correcting a wave's Hasbro name would get a 200, a success toast and no
   * write. Both are in `CATEGORIES_UPDATABLE_FIELDS`, so the repository is
   * willing.
   *
   * `.min(1)` rather than plain `.optional()`: the way to CLEAR this field is
   * to omit it, not to send `""`, which would store an empty string that every
   * reader then has to treat as absent.
   */
  hasbroName: z.string().min(1).max(120).optional(),
  hasbroCoverImage: z.string().min(1).max(500).optional(),
  highlights: z.array(z.string().min(1).max(200)).max(12).optional(),
  faqs: z
    .array(z.object({ question: z.string().min(1).max(300), answer: z.string().min(1).max(2000) }))
    .max(20)
    .optional(),
  contentBody: z.string().max(12000).optional(),
  descriptionTemplates: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        label: z.string().min(1).max(160),
        variant: z.enum(["default", "new_in_box", "new_in_packet", "pre_owned", "replica"]),
        body: z.string().min(1).max(12000),
        placeholders: z.array(z.string()).optional(),
        isTested: z.boolean().optional(),
        version: z.number().int().optional(),
      }),
    )
    .max(8)
    .optional(),
  productDefaults: z
    .object({
      taxCodeId: z.string().optional(),
      specifications: z
        .array(z.object({ name: z.string(), value: z.string(), unit: z.string().optional() }))
        .max(20)
        .optional(),
      defaultFeatures: z.array(z.string()).max(24).optional(),
      defaultCondition: z.string().optional(),
      defaultAuthenticity: z.enum(["original", "reproduction", "unverified"]).optional(),
      inTheBox: z.array(z.string()).max(20).optional(),
      /*
       * Accepted and passed through UNVALIDATED in shape, because the editor
       * CARRIES IT rather than editing it: the band is seed-owned market data
       * plus C1's rollup output. Refusing it would make every admin save strip
       * a measured band; validating it here would be a third place its shape
       * is declared.
       */
      priceGuidance: z.unknown().optional(),
      seoTitleTemplate: z.string().max(200).optional(),
      seoDescriptionTemplate: z.string().max(400).optional(),
      seoKeywords: z.array(z.string()).max(30).optional(),
      weightG: z.number().nonnegative().optional(),
      dimensionsCm: z
        .object({ l: z.number().positive(), w: z.number().positive(), h: z.number().positive() })
        .optional(),
      shippingPaidBy: z.string().optional(),
      fragile: z.boolean().optional(),
      faqTemplates: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .max(10)
        .optional(),
    })
    .optional(),
});

/**
 * Apply a re-parent if one was asked for. Returns an error response to send, or
 * `null` when there is nothing to do or the move succeeded.
 *
 * Extracted from the PUT handler purely to keep the nesting shallow — the move
 * needs three guards (asked for / actually different / target exists) before it
 * can run, and inline that put the call at brace-depth 6.
 */
async function applyParentChange(
  id: string,
  existing: { parentIds: string[] },
  parentId: string | null | undefined,
): Promise<Response | null> {
  if (parentId === undefined) return null;

  const currentParent = existing.parentIds[existing.parentIds.length - 1] ?? null;
  if (parentId === currentParent) return null;

  if (parentId) {
    const target = await categoriesRepository.findById(parentId);
    if (!target) return errorResponse("New parent category not found.", 404);
  }

  try {
    await categoriesRepository.moveCategory({ categoryId: id, newParentId: parentId });
    return null;
  } catch (err) {
    const normalized = normalizeError(err);
    /*
     * 409, not 500: a rejected move means the requested shape is impossible —
     * the new parent is inside the subtree being moved — which is a conflict
     * with the tree's current state rather than a server fault.
     */
    return errorResponse(normalized.message || "Failed to move category.", 409);
  }
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const category = await categoriesRepository.findById(id);
      if (!category) return errorResponse(MSG_CATEGORY_NOT_FOUND, 404);
      return successResponse(category);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof updateCategorySchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    schema: updateCategorySchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await categoriesRepository.findById(id);
      if (!existing) return errorResponse(MSG_CATEGORY_NOT_FOUND, 404);

      const { parentId, display, ...rest } = body as typeof body & {
        parentId?: string | null;
      };

      /*
       * The partial `display` merged over what is stored. See the schema note:
       * `update()` replaces a nested map, so the payload has to carry the
       * COMPLETE intended map or the keys it omits are deleted.
       *
       * Merged here rather than converted to `display.x` dot paths because
       * `categoriesRepository.update` is typed `Partial<CategoryDocument>`,
       * which a dot-path key does not satisfy — and `existing` is already
       * loaded two lines up for the 404, so the merge costs no extra read.
       */
      const fields = {
        ...rest,
        ...(display
          ? { display: { ...(existing.display ?? {}), ...display } }
          : {}),
      };

      /*
       * A move is a different operation from a field edit, so it runs through
       * moveCategory -> reparentSubtree rather than being spread into update().
       * Ordered move-first: if the move is rejected (a cycle), the field edit
       * must not have already landed.
       */
      const moveFailure = await applyParentChange(id, existing, parentId);
      if (moveFailure) return moveFailure;

      const updated = Object.keys(fields).length
        ? await categoriesRepository.update(id, {
            ...(fields as any),
            updatedAt: new Date(),
          })
        : await categoriesRepository.findByIdOrFail(id);

      return successResponse(updated, "Category updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:categories:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await categoriesRepository.findById(id);
      if (!existing) return errorResponse(MSG_CATEGORY_NOT_FOUND, 404);

      const parentId = existing.parentIds[existing.parentIds.length - 1] ?? null;

      /*
       * CASCADE TO THE PARENT, replacing the old "has subcategories -> 409".
       *
       * 🛑 WHY THE ANCESTOR ROLLUPS NEED NO ARITHMETIC HERE. Everything moves to
       * the IMMEDIATE parent, which is already in the same ancestor chain — so
       * every ancestor above it counted these items before the delete and still
       * counts them after. Only this category's own count transfers to the
       * parent's own count, which the product re-file does by itself. Adding a
       * rollup delta on top would double-count.
       *
       * Deleting a root is allowed and needs no arithmetic either, for the
       * mirror-image reason: there is no ancestor above it holding a rollup to
       * correct. Its children become roots and its products become category-less.
       */
      const children = await categoriesRepository.getChildren(id);
      /*
       * Products filed DIRECTLY here.
       *
       * 🛑 I4 — this was `findBy("category", id)`, which matches only the
       * scalar: the DEFAULT leaf. A product that named this category as its
       * SECOND assignment was invisible to it, so the delete left that id
       * dangling in the product's `categoryIds` and its closure — resolving to
       * a page that no longer exists, with nothing reporting it.
       *
       * `array-contains` on the ASSIGNED list finds both cases. Deliberately
       * still not `findByCategory()`, which is array-contains over the CLOSURE
       * and would also return every product in the descendant subtree; those
       * belong to the children and travel with them.
       */
      const products = await productRepository.findByAssignment(id);

      /*
       * 🛑 ORDER IS LOAD-BEARING. Re-filing a product fires onProductWrite's
       * re-file branch, which stages a DECREMENT against this category — and
       * `batch.update()` on an already-deleted document throws, losing every
       * increment in that batch. The products must move while the document is
       * still there.
       *
       * Deleting a ROOT is allowed: its children simply become roots themselves
       * (tier 0, empty parentIds, their own id as rootId — calculateCategoryFields
       * already produces exactly that for a null parent), and its products become
       * category-less, which is a legal product state.
       */
      for (const product of products) {
        /*
         * 🛑 THE DELETED ID MUST LEAVE `categoryIds`, not just the `category`
         * scalar. `readAssignments` prefers a non-empty `categoryIds` over the
         * scalar, so writing `{ category: parentId }` alone was a no-op for any
         * multi-assigned product: deriveTaxonomy re-resolved the doomed id
         * (still present, still readable, because the products move while the
         * category document is deliberately still there), rebuilt the same
         * closure, and ignored the parent entirely. The product kept pointing at
         * a page that stopped existing one line later — dangling, with a 200.
         *
         * Pruning rather than replacing the field is what preserves the OTHER
         * assignments. The cascade semantics are unchanged: whatever was filed
         * here moves to the immediate parent, which is in the same root, so the
         * one-per-root rule still holds and the ancestor rollups still need no
         * arithmetic (see the comment above).
         *
         * 🔴 KNOWN INTERACTION, to be decided WITH the leaf-rule flip, not
         * before it: the immediate parent is by definition a non-leaf, so once
         * `ENFORCE_LEAF_FILING` becomes a hard 400 this cascade refuses every
         * single it re-files, and deleting a populated category starts failing.
         * The alternatives are all worse than naming it here (making the
         * products category-less loses taxonomy silently; refusing the delete
         * blocks an admin action), so the flip has to grant this path an
         * explicit exemption. Recorded rather than guessed at: today the rule is
         * reporting-only, so nothing is broken yet.
         */
        const assigned = product.categoryIds ?? [];
        const kept = assigned.filter((cid) => cid !== id);

        if (kept.length > 0) {
          const next = parentId && !kept.includes(parentId) ? [...kept, parentId] : kept;
          await productRepository.update(product.id, { categoryIds: next });
        } else if (parentId) {
          /*
           * Through the repository so deriveTaxonomy rebuilds the whole ancestor
           * chain from the new leaf rather than leaving a one-element chain.
           *
           * A product matched only by the scalar query carries no `categoryIds`
           * at all; it keeps that shape rather than gaining a field here, so
           * this stays the pre-I1 behaviour for pre-I1 rows.
           */
          await productRepository.update(
            product.id,
            assigned.length > 0 ? { categoryIds: [parentId] } : { category: parentId },
          );
        } else {
          /*
           * Category-less — a root was deleted. Every field must be cleared
           * EXPLICITLY: deriveTaxonomy returns nothing when there is no leaf
           * ("never destroy a chain we cannot improve on"), so clearing only
           * `category` would leave the old categorySlugs behind and the product
           * would still list under its dead ancestors. onProductWrite sees a
           * falsy new category and stages a decrement with no matching
           * increment, which is what we want.
           */
          await productRepository.update(product.id, {
            categoryIds: [],
            category: "",
            categorySlugs: [],
            categoryNames: [],
          });
        }
      }

      for (const child of children) {
        await categoriesRepository.moveCategory({
          categoryId: child.id,
          newParentId: parentId,
        });
      }

      await categoriesRepository.delete(id);
      return successResponse(
        { reassignedProducts: products.length, reassignedChildren: children.length, movedTo: parentId },
        "Category deleted",
      );
    },
  }),
);
