import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  serverLogger,
  bundleUpdateSchema,
} from "@mohasinac/appkit";
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

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:categories:read",
    handler: async ({ params }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest(MSG_BUNDLE_ID_REQUIRED);
      const bundle = await loadBundleOrFail(id);
      if (!bundle) return ApiErrors.notFound(MSG_BUNDLE_NOT_FOUND);
      return successResponse(bundle);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof bundleUpdateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:categories:write",
    schema: bundleUpdateSchema,
    handler: async ({ body, params, user }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest(MSG_BUNDLE_ID_REQUIRED);
      const bundle = await loadBundleOrFail(id);
      if (!bundle) return ApiErrors.notFound(MSG_BUNDLE_NOT_FOUND);

      await categoriesRepository.update(id, body as never);
      serverLogger.info("Admin bundle updated", { id, by: user?.uid });
      const updated = await categoriesRepository.findById(id);
      return successResponse(updated, "Bundle updated");
    },
  }),
);

export const DELETE = withProviders(
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
