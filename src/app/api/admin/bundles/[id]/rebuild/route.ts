import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  productRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

function isProductAvailable(p: { status?: string; isSold?: boolean; availableQuantity?: number } | null): boolean {
  if (!p) return false;
  if (p.isSold) return false;
  if (typeof p.availableQuantity === "number" && p.availableQuantity <= 0) return false;
  return p.status === "published";
}

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:categories:write",
    handler: async ({ params }) => {
      const id = String(params?.id ?? "");
      if (!id) throw ApiErrors.badRequest("Bundle ID is required.");

      const bundle = await categoriesRepository.findById(id);
      if (!bundle || bundle.categoryType !== "bundle") {
        throw ApiErrors.notFound("Bundle not found.");
      }

      const productIds: string[] = bundle.bundleProductIds ?? [];
      let bundleStockStatus: "in_stock" | "out_of_stock" = "out_of_stock";

      if (productIds.length > 0) {
        const products = await Promise.all(productIds.map((pid) => productRepository.findById(pid)));
        const allAvailable = products.every(
          (p) => isProductAvailable(p as any),
        );
        bundleStockStatus = allAvailable ? "in_stock" : "out_of_stock";
      }

      await categoriesRepository.update(id, { bundleStockStatus } as any);

      return successResponse({ id, bundleStockStatus }, "Bundle stock status rebuilt.");
    },
  }),
);
