import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  serverLogger,
  bundleUpdateSchema,
} from "@mohasinac/appkit";
import { resolveBundleOriginalTotal, findBundleMemberStores } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin bundle [id] route — S-SBUNI-4 2026-05-13.
 *
 * Shares `bundleUpdateSchema` with the collection route. The
 * `loadBundleOrFail` helper enforces the `categoryType:"bundle"` guard so
 * neither PUT nor DELETE can hit a non-bundle category by accident.
 */

const MSG_BUNDLE_ID_REQUIRED = "Bundle ID is required.";
const MSG_BUNDLE_NOT_FOUND = "Bundle not found.";

async function loadBundleOrFail(id: string) {
  const bundle = await categoriesRepository.findById(id);
  if (!bundle) return null;
  if (bundle.categoryType !== "bundle") return null;
  return bundle;
}

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest(MSG_BUNDLE_ID_REQUIRED);
      const bundle = await loadBundleOrFail(id);
      if (!bundle) return ApiErrors.notFound(MSG_BUNDLE_NOT_FOUND);
      return successResponse(bundle);
    },
  }),
);

const __PUT__g = withProviders(
  createRouteHandler<(typeof bundleUpdateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: bundleUpdateSchema,
    handler: async ({ body, params, user }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest(MSG_BUNDLE_ID_REQUIRED);
      const bundle = await loadBundleOrFail(id);
      if (!bundle) return ApiErrors.notFound(MSG_BUNDLE_NOT_FOUND);

      // Same single-seller rule as create — an edit is the other way a
      // cross-store bundle could come into existence.
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
      serverLogger.info("Admin bundle updated", { id, by: user?.uid });
      const updated = await categoriesRepository.findById(id);
      return successResponse(updated, "Bundle updated");
    },
  }),
);

const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:categories:delete",
    handler: async ({ params, user }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest(MSG_BUNDLE_ID_REQUIRED);
      const bundle = await loadBundleOrFail(id);
      if (!bundle) return ApiErrors.notFound(MSG_BUNDLE_NOT_FOUND);

      await categoriesRepository.delete(id);
      serverLogger.info("Admin bundle deleted", { id, by: user?.uid });
      return successResponse(null, "Bundle deleted");
    },
  }),
);

export const GET = __GET__g;
export const PUT = __PUT__g;
export const DELETE = __DELETE__g;
