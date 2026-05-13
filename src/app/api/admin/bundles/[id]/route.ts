import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  serverLogger,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants/api-roles";

const bundleQueryRuleSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("static"),
    productIds: z.array(z.string().min(1)).min(0).max(64),
  }),
  z.object({
    type: z.literal("dynamic"),
    filter: z.object({
      categorySlug: z.string().optional(),
      brandSlug: z.string().optional(),
      tags: z.array(z.string()).optional(),
      listingType: z.enum(["standard", "pre-order"]).optional(),
    }),
    orderBy: z
      .enum(["price-asc", "price-desc", "createdAt-desc"])
      .optional(),
    limit: z.number().int().min(1).max(64),
  }),
]);

const updateBundleSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional(),
  bundlePriceInPaise: z.number().int().min(100).optional(),
  bundleQueryRule: bundleQueryRuleSchema.optional(),
  bundleProductIds: z.array(z.string().min(1)).min(0).max(64).optional(),
  display: z
    .object({
      coverImage: z.string().url().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

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
  createRouteHandler<(typeof updateBundleSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: updateBundleSchema,
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
