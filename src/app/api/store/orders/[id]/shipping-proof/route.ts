import { z } from "zod";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  orderRepository,
  storeRepository,
  isSellerUser,
} from "@mohasinac/appkit";
import { mediaUrlSchema } from "@/validation/request-schemas";
import { ROLES_STORE_WRITE, USER_ROLE } from "@/constants";

const ROLES = [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE];

const shippingProofSchema = z.object({
  shippingProofUrl: mediaUrlSchema,
  shippingProofMimeType: z.string().min(1),
});

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof shippingProofSchema>>({
    auth: true,
    roles: ROLES,
    permission: "store:api:write",
    schema: shippingProofSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);

      if (isSellerUser(user)) {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || order.storeId !== store.id) return errorResponse("Order not found", 404);
      }

      await orderRepository.update(id, {
        shippingProofUrl: body!.shippingProofUrl,
        shippingProofMimeType: body!.shippingProofMimeType,
        shippingProofUploadedAt: new Date(),
        shippingProofUploadedBy: user!.uid,
      } as never);

      return successResponse({ id, shippingProofUrl: body!.shippingProofUrl });
    },
  }),
);
