import { z } from "zod";
import { withProviders } from "@/providers.config";
import { isSellerUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { orderRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE, USER_ROLE } from "@/constants";

const ROLES = [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE];

const assignSchema = z.object({
  workerId: z.string().min(1).optional(),
});

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof assignSchema>>({
    auth: true,
    roles: ROLES,
    schema: assignSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);

      if (isSellerUser(user)) {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || order.storeId !== store.id) return errorResponse("Order not found", 404);
      }

      if (body?.workerId) {
        await orderRepository.assignWorker(id, body.workerId);
        return successResponse({ id, assignedWorkerId: body.workerId });
      }
      await orderRepository.unassignWorker(id);
      return successResponse({ id, assignedWorkerId: null });
    },
  }),
);
