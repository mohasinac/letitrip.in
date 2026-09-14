import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  categoriesRepository,
  productRepository,
  normalizeError,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const MSG_CATEGORY_NOT_FOUND = "Category not found.";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
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
  display: z
    .object({
      showInMenu: z.boolean().optional(),
      showInFooter: z.boolean().optional(),
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

      const { parentId, ...fields } = body as typeof body & {
        parentId?: string | null;
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
       * Products filed DIRECTLY here — the scalar `category` is the leaf, kept in
       * lockstep with categorySlugs[0] by deriveTaxonomy. Deliberately not
       * findByCategory(), which is array-contains over the whole chain and would
       * also return every product in the descendant subtree; those belong to the
       * children and travel with them.
       */
      const products = await productRepository.findBy("category", id);

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
        if (parentId) {
          // Through the repository so deriveTaxonomy rebuilds the whole ancestor
          // chain from the new leaf rather than leaving a one-element chain.
          await productRepository.update(product.id, { category: parentId });
        } else {
          /*
           * Category-less. Both fields must be cleared EXPLICITLY: deriveTaxonomy
           * returns nothing when there is no leaf ("never destroy a chain we
           * cannot improve on"), so clearing only `category` would leave the old
           * categorySlugs behind and the product would still list under its dead
           * ancestors. onProductWrite sees a falsy new category and stages a
           * decrement with no matching increment, which is what we want.
           */
          await productRepository.update(product.id, {
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
