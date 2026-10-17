import { withProviders } from "@/providers.config";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { isAdminUser, isEmployeeUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { orderRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { USER_ROLE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    handler: async ({ request, user }) => {
      const url = new URL(request.url);
      const assignedToMe = url.searchParams.get("assignedTo") === "me";

      let storeId: string;

      if (isAdminUser(user)) {
        const sid = url.searchParams.get("storeId");
        if (!sid) return errorResponse("storeId required for admin", 400);
        storeId = sid;
      } else if (isEmployeeUser(user)) {
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

      /*
       * 🛑 REVEALED at the route, because the view that consumes this is a
       * CLIENT component and decryption needs the key.
       *
       * `findFulfillmentQueue` returns ciphertext-by-default documents, so this
       * used to send `enc:v1:` blobs to the browser, where `FulfillmentView`
       * rendered them as the buyer's name. Revealed rather than masked: a
       * seller packing their own order needs the real name on the label.
       */
      return successResponse({
        orders: orderRepository.revealOrders(orders),
        total: orders.length,
      });
    },
  }),
);
