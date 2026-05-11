import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { productTemplateRepository, storeRepository } from "@mohasinac/appkit";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
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
    roles: ["seller", "admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as Record<string, string>)?.id;
      if (!id) return ApiErrors.badRequest("Missing id");
      const template = await productTemplateRepository.findById(id);
      if (!template) return ApiErrors.notFound("Template not found");
      return successResponse({ template });
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof updateSchema)["_output"]>({
    auth: true,
    roles: ["seller", "admin", "moderator"],
    schema: updateSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as Record<string, string>)?.id;
      if (!id) return ApiErrors.badRequest("Missing id");

      const existing = await productTemplateRepository.findById(id);
      if (!existing) return ApiErrors.notFound("Template not found");

      if (user!.role === "seller") {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || existing.storeId !== store.id) {
          return ApiErrors.forbidden("You can only edit your own templates");
        }
      }

      const updated = await productTemplateRepository.update(id, body ?? {});
      return successResponse({ template: updated });
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ params, user }) => {
      const id = (params as Record<string, string>)?.id;
      if (!id) return ApiErrors.badRequest("Missing id");

      const existing = await productTemplateRepository.findById(id);
      if (!existing) return ApiErrors.notFound("Template not found");

      if (user!.role === "seller") {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || existing.storeId !== store.id) {
          return ApiErrors.forbidden("You can only delete your own templates");
        }
      }

      await productTemplateRepository.deleteTemplate(id);
      return successResponse({ deleted: true });
    },
  }),
);
