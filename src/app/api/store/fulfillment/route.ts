import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  orderRepository,
  storeRepository,
  userRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { USER_ROLE } from "@/constants/api-roles";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    permission: "store:api:write",
    handler: async ({ request, user }) => {
      const url = new URL(request.url);
      const assignedToMe = url.searchParams.get("assignedTo") === "me";

      let storeId: string;

      if (user!.role === "admin") {
        const sid = url.searchParams.get("storeId");
        if (!sid) return errorResponse("storeId required for admin", 400);
        storeId = sid;
      } else if (user!.role === "employee") {
        const userDoc = (await userRepository.findById(user!.uid)) as { storeId?: string } | null;
        if (!userDoc?.storeId)
          return errorResponse("Employee is not affiliated with a store", 403);
        storeId = userDoc.storeId;
      } else {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store) return errorResponse("Store not found", 404);
        storeId = store.id;
      }

      let orders = await orderRepository.findFulfillmentQueue(storeId);
      if (assignedToMe) {
        orders = orders.filter((o) => o.assignedWorkerId === user!.uid);
      }

      return successResponse({ orders, total: orders.length });
    },
  }),
);
