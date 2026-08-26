import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  storeRepository,
  serverLogger,
  bundleUpdateSchema,
} from "@mohasinac/appkit";
import { resolveBundleOriginalTotal, findBundleMemberStores } from "@mohasinac/appkit/server";
import { ROLES_STORE_WRITE } from "@/constants";
import { withFeatureGuard } from "@/lib/features";

/**
 * Seller bundle [id] route — mirrors /api/admin/bundles/[id] but scoped to
 * the caller's own store. `loadOwnedBundleOrFail` enforces both the
 * `categoryType:"bundle"` guard and `createdByStoreId` ownership so a
 * seller can never read/write another store's bundle.
 */

const MSG_BUNDLE_ID_REQUIRED = "Bundle ID is required.";
const MSG_BUNDLE_NOT_FOUND = "Bundle not found.";
const MSG_NO_STORE = "No store";

async function loadOwnedBundleOrFail(id: string, storeId: string) {
  const bundle = await categoriesRepository.findById(id);
  if (!bundle) return null;
  if (bundle.categoryType !== "bundle") return null;
  if (bundle.createdByStoreId !== storeId) return null;
  return bundle;
}

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ params, user }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest(MSG_BUNDLE_ID_REQUIRED);
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden(MSG_NO_STORE);
      const bundle = await loadOwnedBundleOrFail(id, store.id);
      if (!bundle) return ApiErrors.notFound(MSG_BUNDLE_NOT_FOUND);
      return successResponse(bundle);
    },
  }),
);

const __PUT__g = withProviders(
  createRouteHandler<(typeof bundleUpdateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: bundleUpdateSchema,
    handler: async ({ body, params, user }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest(MSG_BUNDLE_ID_REQUIRED);
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden(MSG_NO_STORE);
      const bundle = await loadOwnedBundleOrFail(id, store.id);
      if (!bundle) return ApiErrors.notFound(MSG_BUNDLE_NOT_FOUND);

      // Same single-seller rule as create.
      if (body?.bundleProductIds) {
        const memberStores = await findBundleMemberStores(body.bundleProductIds);
        if (memberStores.length > 1) {
          return ApiErrors.badRequest(
            `A bundle's items must all come from one seller — these span ${memberStores.length} (${memberStores.join(", ")}).`,
          );
        }
      }

      const updateBody = body?.bundleProductIds
        ? { ...body, bundleOriginalTotal: await resolveBundleOriginalTotal(body.bundleProductIds) }
        : body;

      await categoriesRepository.update(id, updateBody as never);
      serverLogger.info("Seller bundle updated", { id, storeId: store.id, by: user?.uid });
      const updated = await categoriesRepository.findById(id);
      return successResponse(updated, "Bundle updated");
    },
  }),
);

const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ params, user }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest(MSG_BUNDLE_ID_REQUIRED);
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden(MSG_NO_STORE);
      const bundle = await loadOwnedBundleOrFail(id, store.id);
      if (!bundle) return ApiErrors.notFound(MSG_BUNDLE_NOT_FOUND);

      await categoriesRepository.delete(id);
      serverLogger.info("Seller bundle deleted", { id, storeId: store.id, by: user?.uid });
      return successResponse(null, "Bundle deleted");
    },
  }),
);

export const GET = withFeatureGuard("BUNDLES", __GET__g);
export const PUT = withFeatureGuard("BUNDLES", __PUT__g);
export const DELETE = withFeatureGuard("BUNDLES", __DELETE__g);
