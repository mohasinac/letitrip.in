import { z } from "zod";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  orderRepository,
  storeRepository,
  isSellerUser,
  assertEmiShippable,
  type JsonValue,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { USER_ROLE } from "@/constants/api-roles";

const ROLES = [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE];

const ERR_ORDER_NOT_FOUND = "Order not found";

const SELLER_ALLOWED_STATUSES = new Set(["processing", "shipped"]);

const patchOrderSchema = z.object({
  status: z.enum(["processing", "shipped", "delivered", "cancelled"]).optional(),
  trackingNumber: z.string().optional(),
  shippingCarrier: z.string().optional(),
  trackingUrl: z.string().optional(),
  cancellationReason: z.string().optional(),
  markPicked: z.boolean().optional(),
  markPacked: z.boolean().optional(),
  assignedWorkerId: z.string().optional(),
});

/**
 * Loads the order and enforces store scope in one step. Sellers may only
 * touch their own store's orders; admin/employee see all. A missing order
 * OR a scope mismatch both return 404 (not 403) to avoid leaking order
 * existence to a seller probing another store's IDs.
 */
async function loadScopedOrder(
  user: { uid: string; role?: string },
  id: string,
): Promise<Awaited<ReturnType<typeof orderRepository.findById>> | null> {
  const order = await orderRepository.findById(id);
  if (!order) return null;
  if (!isSellerUser(user)) return order;
  const store = await storeRepository.findByOwnerId(user.uid);
  if (!store || order.storeId !== store.id) return null;
  return order;
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const order = await loadScopedOrder(user!, id);
      if (!order) return errorResponse(ERR_ORDER_NOT_FOUND, 404);
      return successResponse(order);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof patchOrderSchema>>({
    auth: true,
    roles: ROLES,
    permission: "store:api:write",
    schema: patchOrderSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const order = await loadScopedOrder(user!, id);
      if (!order) return errorResponse(ERR_ORDER_NOT_FOUND, 404);

      const data = body!;
      const isSeller = isSellerUser(user);

      if (data.markPicked) {
        await orderRepository.markPicked(id);
        return successResponse({ id, markedPicked: true });
      }
      if (data.markPacked) {
        await orderRepository.markPacked(id);
        return successResponse({ id, markedPacked: true });
      }
      if (data.assignedWorkerId) {
        await orderRepository.assignWorker(id, data.assignedWorkerId);
        return successResponse({ id, assignedWorkerId: data.assignedWorkerId });
      }

      if (!data.status) return errorResponse("status is required", 400);

      if (isSeller && !SELLER_ALLOWED_STATUSES.has(data.status)) {
        return errorResponse("Sellers may only set status to processing or shipped", 403);
      }

      if (data.status === "cancelled") {
        await orderRepository.cancelOrder(id, data.cancellationReason ?? "Cancelled by seller");
        return successResponse({ id, status: "cancelled" });
      }

      const additionalData: Record<string, JsonValue> = {};
      if (data.trackingNumber) additionalData.trackingNumber = data.trackingNumber;
      if (data.shippingCarrier) additionalData.shippingCarrier = data.shippingCarrier;
      if (data.trackingUrl) additionalData.trackingUrl = data.trackingUrl;

      if (data.status === "shipped" && !data.trackingNumber) {
        return errorResponse("trackingNumber is required to mark an order as shipped", 400);
      }
      if (data.status === "shipped") {
        await assertEmiShippable(order);
        // Mirror customShipOrder's side effects (seller-actions.ts) so an
        // order shipped through this direct-status path also becomes
        // payout-eligible — previously only the POST /ship path set these.
        additionalData.shippingDate = new Date().toISOString();
        additionalData.payoutStatus = "eligible";
      }

      await orderRepository.updateStatus(id, data.status, additionalData);
      return successResponse({ id, status: data.status, ...additionalData });
    },
  }),
);
