import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { productTemplateRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_READ, ROLES_STORE_WRITE } from "@/constants";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  category: z.string().max(120).optional(),
  brand: z.string().max(120).optional(),
  condition: z.string().max(60).optional(),
  tags: z.array(z.string().max(60)).max(20).optional(),
  price: z.number().int().min(0).optional(),
  currency: z.string().max(10).optional(),
  shippingPaidBy: z.enum(["buyer", "seller"]).optional(),
  pickupAddressId: z.string().max(120).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_READ],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store found for this account");

      const templates = await productTemplateRepository.findByStore(store.id);
      return successResponse({ templates });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: createSchema,
    handler: async ({ body, user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store found for this account");

      const template = await productTemplateRepository.create({
        ...body!,
        storeId: store.id,
      });

      return successResponse({ template }, undefined, 201);
    },
  }),
);
