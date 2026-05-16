/**
 * Store Order Detail API
 *
 * GET   /api/store/orders/[id]
 *   Read a single order (seller scope — admin can see all).
 *
 * PATCH /api/store/orders/[id]
 *   Update order status / tracking. The standard path is a manual update —
 *   the seller types in a carrier + tracking number.
 *
 *   When the seller's `shippingConfig.method === "shiprocket"` AND no manual
 *   tracking data is supplied, status=shipped triggers the full Shiprocket
 *   auto-create flow via `shipOrderAction`:
 *
 *     1. Validate package dimensions in body.shiprocketPackage
 *     2. Delegate to shipOrderAction({ method: "shiprocket", … })
 *     3. shipOrderAction calls Shiprocket create-order → AWB → pickup and
 *        writes shiprocketOrderId/shipmentId/AWB/trackingUrl/status back to
 *        the order.
 *
 *   This is O5 — "Shiprocket auto-create on ship". The dedicated POST
 *   `/api/store/orders/[id]/ship` endpoint still works for callers that
 *   prefer an explicit ship request.
 */
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  orderRepository,
  storeRepository,
  userRepository,
  OrderStatusValues,
  ShippingMethodValues,
} from "@mohasinac/appkit";
import { shipOrderAction } from "@/actions/seller.actions";

// ─── Validation ────────────────────────────────────────────────────────────

const shiprocketPackageSchema = z.object({
  weight: z.number().positive().max(500),
  length: z.number().positive().max(200),
  breadth: z.number().positive().max(200),
  height: z.number().positive().max(200),
  courierId: z.number().int().positive().optional(),
});

const updateOrderSchema = z.object({
  status: z
    .enum(["confirmed", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  trackingNumber: z.string().optional(),
  shippingCarrier: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  cancellationReason: z.string().optional(),
  /**
   * Package dimensions required when the seller's shipping method is
   * `shiprocket` and they are transitioning the order to `status="shipped"`
   * via this PATCH endpoint. When present, this route delegates to
   * `shipOrderAction` and returns the Shiprocket auto-create result.
   */
  shiprocketPackage: shiprocketPackageSchema.optional(),
});

// ─── Helpers ───────────────────────────────────────────────────────────────

async function resolveSellerStoreId(uid: string): Promise<string | null> {
  const store = await storeRepository.findByOwnerId(uid);
  return store?.id ?? null;
}

const SELLER_ALLOWED_STATUSES = ["processing", "shipped"] as const;

interface SellerShippingConfigLike {
  isConfigured?: boolean;
  method?: string;
}

async function getSellerShippingMethod(uid: string): Promise<string | null> {
  const userDoc = (await userRepository.findById(uid)) as
    | { shippingConfig?: SellerShippingConfigLike }
    | null;
  const cfg = userDoc?.shippingConfig;
  if (!cfg?.isConfigured) return null;
  return cfg.method ?? null;
}

type ShiprocketPackageInput = z.infer<typeof shiprocketPackageSchema>;

type AutoShipResult =
  | { ok: true; updated: Record<string, unknown> | null; result: unknown }
  | { ok: false; message: string };

/**
 * Dispatch the Shiprocket auto-ship flow for an order.
 * Returns a discriminated result so the caller can build the response
 * without any additional try/catch nesting.
 */
async function tryAutoShip(
  id: string,
  pkg: ShiprocketPackageInput,
): Promise<AutoShipResult> {
  try {
    const result = await shipOrderAction(id, {
      method: "shiprocket",
      packageWeight: pkg.weight,
      packageLength: pkg.length,
      packageBreadth: pkg.breadth,
      packageHeight: pkg.height,
      courierId: pkg.courierId,
    });
    const updated = (await orderRepository.findById(id)) as Record<string, unknown> | null;
    return { ok: true, updated, result };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to ship via Shiprocket";
    return { ok: false, message };
  }
}

// ─── Handlers ──────────────────────────────────────────────────────────────

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);

      if (user!.role !== "admin") {
        const storeId = await resolveSellerStoreId(user!.uid);
        if (!storeId || order.storeId !== storeId)
          return errorResponse("Order not found", 404);
      }

      return successResponse(order);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateOrderSchema)["_output"]>({
    auth: true,
    roles: ["seller", "admin"],
    schema: updateOrderSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);

      const isAdmin = user!.role === "admin";
      if (!isAdmin) {
        const storeId = await resolveSellerStoreId(user!.uid);
        if (!storeId || order.storeId !== storeId)
          return errorResponse("Order not found", 404);

        if (
          body!.status &&
          !(SELLER_ALLOWED_STATUSES as readonly string[]).includes(body!.status)
        ) {
          return errorResponse(
            "Sellers can only update status to processing or shipped",
            403,
          );
        }
      }

      const {
        status,
        cancellationReason,
        shiprocketPackage,
        ...trackingData
      } = body!;

      // ── O5 — auto-fire Shiprocket flow when the seller's method is shiprocket
      //    and the transition is to "shipped" with no manual tracking fields.
      const noManualTracking =
        !trackingData.trackingNumber &&
        !trackingData.shippingCarrier &&
        !trackingData.trackingUrl;

      if (status === "shipped" && noManualTracking) {
        const method = await getSellerShippingMethod(user!.uid);
        if (method === ShippingMethodValues.SHIPROCKET) {
          if (!shiprocketPackage) {
            return errorResponse(
              "Shiprocket auto-ship requires package dimensions (shiprocketPackage)",
              400,
              { code: "SHIPROCKET_PACKAGE_REQUIRED" },
            );
          }
          const shipResult = await tryAutoShip(id, shiprocketPackage);
          if (!shipResult.ok) {
            return errorResponse(shipResult.message, 400, { code: "SHIPROCKET_FAILED" });
          }
          return successResponse(
            { ...shipResult.updated, shiprocket: shipResult.result },
            "Order shipped via Shiprocket",
          );
        }
      }

      // ── Manual / non-shiprocket path (existing behaviour).
      if (status === "cancelled") {
        await orderRepository.cancelOrder(
          id,
          cancellationReason ?? "Cancelled by seller",
        );
      } else if (status) {
        await orderRepository.updateStatus(
          id,
          status,
          trackingData as Record<string, unknown>,
        );
      } else {
        await orderRepository.updateStatus(
          id,
          order.status as (typeof OrderStatusValues)[keyof typeof OrderStatusValues],
          trackingData as Record<string, unknown>,
        );
      }

      const updated = await orderRepository.findById(id);
      return successResponse(updated, "Order updated");
    },
  }),
);
