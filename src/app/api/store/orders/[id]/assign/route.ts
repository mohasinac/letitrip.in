import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  orderRepository,
  storeRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const assignSchema = z.object({
  workerId: z.string().nullable(),
});

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    permission: "store:api:write",
    schema: assignSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);

      if (user!.role !== "admin") {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || order.storeId !== store.id)
          return errorResponse("Order not found", 404);
      }

      const updated = body!.workerId
        ? await orderRepository.assignWorker(id, body!.workerId)
        : await orderRepository.unassignWorker(id);

      return successResponse(updated, "Worker assignment updated");
    },
  }),
);
