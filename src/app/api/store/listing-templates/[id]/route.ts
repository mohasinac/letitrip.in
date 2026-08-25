/**
 * Store listing-template detail API — GET / PATCH / DELETE.
 *
 * ## Why this file did not exist until 2026-08-24
 *
 * It simply was never written, while everything that depends on it was:
 *
 *  - `src/constants/api.ts:84` defines `LISTING_TEMPLATE_BY_ID`
 *  - `store/listing-templates/[id]/edit/page.tsx` calls it three times —
 *    GET on load, PATCH on save, DELETE
 *  - `store/listing-templates/page.tsx:73` renders an Edit button routing there
 *
 * So a seller clicked Edit and got a page that 404'd on load, then 404'd again
 * on save and on delete. Root Cause #37's dead-route shape, except a real page
 * and a real button sat in front of it.
 *
 * ## Ownership is checked, not trusted
 *
 * Every verb loads the template and compares its `storeId` to the caller's own
 * store before doing anything. `ROLES_STORE_WRITE` proves the caller owns *a*
 * store, not *this* template — without the check, any seller could read, edit
 * or delete another seller's templates by id.
 */

import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  listingTemplatesRepository,
  listingTemplateUpdateSchema,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

/**
 * Load the template and prove the caller owns it.
 * Returns a tuple so each handler can early-return the error response.
 */
async function loadOwned(uid: string, id: string): Promise<
  | { error: Response; store?: undefined; doc?: undefined }
  | { error?: undefined; store: Awaited<ReturnType<typeof storeRepository.findByOwnerId>>; doc: NonNullable<Awaited<ReturnType<typeof listingTemplatesRepository.findById>>> }
> {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store) return { error: ApiErrors.forbidden("No store") } as const;
  const doc = await listingTemplatesRepository.findById(id);
  if (!doc) return { error: ApiErrors.notFound("Template not found") } as const;
  if (doc.storeId !== store.id) {
    // Deliberately "not found", not "forbidden": a 403 confirms the id exists
    // and belongs to somebody, which is more than a stranger should learn.
    return { error: ApiErrors.notFound("Template not found") } as const;
  }
  return { store, doc } as const;
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
  createRouteHandler<(typeof listingTemplateUpdateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: listingTemplateUpdateSchema,
    handler: async ({ params, user, body }) => {
      const id = (params as { id: string }).id;
      const owned = await loadOwned(user!.uid, id);
      if (owned.error) return owned.error;

      // `storeId`/`ownerId` are not in the update schema at all, so a caller
      // cannot move a template into another store by adding them to the body.
      const updated = await listingTemplatesRepository.update(id, body!);
      return successResponse(updated, "Template updated");
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
      await listingTemplatesRepository.delete(id);
      return successResponse(null, "Template deleted");
    },
  }),
);
