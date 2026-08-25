/*
 * WHY: This route did not exist, and three things pointed at it.
 *
 *      `SellerStoreCategoriesView:146` navigates every row to
 *      `ROUTES.STORE.STORE_CATEGORIES_EDIT(row.id)`; that page then calls
 *      `STORE_CATEGORY_BY_ID` three times — GET on load, PATCH on save, DELETE
 *      on delete. All three 404'd. A seller could open a storefront category
 *      and do nothing with it.
 *
 *      This is the THIRD instance of the same shape found in this rework:
 *      `/api/store/listing-templates/[id]` was identical, and
 *      `/store/features/new` was its create-side twin (a page that collected a
 *      field, validated it, and never called an API at all). Recurrent Root
 *      Cause #37's dead-route shape, but with a real page and a real link in
 *      front of it.
 *
 * WHAT: GET / PATCH / DELETE, store-scoped.
 *
 * Ownership is proved per verb before acting, and a category belonging to
 * another store returns **not found** rather than **forbidden** — a 403
 * confirms the id exists and belongs to somebody, which is more than a
 * stranger should learn.
 *
 * @tag domain:store-extensions
 * @tag layer:route
 * @tag pattern:crud
 * @tag access:seller
 * @tag consumers:store/categories/[id]/edit
 * @tag sideEffects:firestore
 */

import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  storeCategoriesRepository,
  storeCategoryUpdateSchema,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

/** Load the category and prove the caller's store owns it. */
async function loadOwned(uid: string, id: string) {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store) return { error: ApiErrors.forbidden("No store") } as const;
  const doc = await storeCategoriesRepository.findById(id);
  if (!doc) return { error: ApiErrors.notFound("Category not found") } as const;
  if (doc.storeId !== store.id) {
    return { error: ApiErrors.notFound("Category not found") } as const;
  }
  return { doc, store } as const;
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const owned = await loadOwned(user!.uid, id);
      if (owned.error) return owned.error;
      return successResponse(owned.doc);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof storeCategoryUpdateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: storeCategoryUpdateSchema,
    handler: async ({ params, user, body }) => {
      const id = (params as { id: string }).id;
      const owned = await loadOwned(user!.uid, id);
      if (owned.error) return owned.error;

      // `storeId` is not in the update schema at all, so a caller cannot move
      // a category into another store by adding it to the body.
      const updated = await storeCategoriesRepository.update(id, body!);
      return successResponse(updated, "Category updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const owned = await loadOwned(user!.uid, id);
      if (owned.error) return owned.error;
      await storeCategoriesRepository.delete(id);
      return successResponse(null, "Category deleted");
    },
  }),
);
