import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  serverLogger,
  bundleUpdateSchema,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants/api-roles";

/**
 * Admin bundle [id] route — S-SBUNI-4 2026-05-13.
 *
 * Shares `bundleUpdateSchema` with the collection route. The
 * `loadBundleOrFail` helper enforces the `categoryType:"bundle"` guard so
 * neither PUT nor DELETE can hit a non-bundle category by accident.
 */

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
    handler: async ({ params }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest("Bundle id is required");
      const bundle = await loadBundleOrFail(id);
      if (!bundle) return ApiErrors.notFound("Bundle not found");
      return successResponse(bundle);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof bundleUpdateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: bundleUpdateSchema,
    handler: async ({ body, params, user }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest("Bundle id is required");
      const bundle = await loadBundleOrFail(id);
      if (!bundle) return ApiErrors.notFound("Bundle not found");

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
    handler: async ({ params, user }) => {
      const id = String(params?.id ?? "");
      if (!id) return ApiErrors.badRequest("Bundle id is required");
      const bundle = await loadBundleOrFail(id);
      if (!bundle) return ApiErrors.notFound("Bundle not found");

      await categoriesRepository.delete(id);
      serverLogger.info("Admin bundle deleted", { id, by: user?.uid });
      return successResponse(null, "Bundle deleted");
    },
  }),
);
