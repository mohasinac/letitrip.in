import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  productFeaturesRepository,
} from "@mohasinac/appkit";

const productTypeEnum = z.enum(["product", "auction", "preorder", "all"]);
const categoryEnum = z.enum([
  "shipping",
  "seller",
  "condition",
  "platform",
  "auction",
  "preorder",
  "custom",
]);
const scopeEnum = z.enum(["platform", "store"]);

const createSchema = z.object({
  label: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  icon: z.string().min(1).max(2000),
  iconColor: z.string().max(80).optional(),
  category: categoryEnum,
  scope: scopeEnum,
  productTypes: z.array(productTypeEnum).min(1),
  storeId: z.string().optional(),
  isActive: z.boolean(),
  displayOrder: z.number().int().min(0).max(10_000),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const scope = url.searchParams.get("scope") as
        | "platform"
        | "store"
        | null;
      const storeId = url.searchParams.get("storeId") || undefined;
      const isActiveParam = url.searchParams.get("isActive");
      const isActive =
        isActiveParam == null ? undefined : isActiveParam === "true";
      const items = await productFeaturesRepository.listFiltered({
        scope: scope ?? undefined,
        storeId,
        isActive,
      });
      return successResponse({ items, total: items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    schema: createSchema,
    handler: async ({ body }) => {
      try {
        const doc = await productFeaturesRepository.create(body!);
        return successResponse(doc, "Feature created");
      } catch (err) {
        return errorResponse(
          err instanceof Error ? err.message : "Failed to create feature",
          400,
        );
      }
    },
  }),
);
