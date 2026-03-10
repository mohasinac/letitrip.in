/**
 * POST /api/seller/orders/[id]/ship
 *
 * Marks an order as shipped.
 *
 * For CUSTOM shipping method:
 *   Body: { method: "custom", shippingCarrier, trackingNumber, trackingUrl }
 *
 * For SHIPROCKET shipping method:
 *   Body: { method: "shiprocket", packageWeight, packageLength, packageBreadth,
 *            packageHeight, courierId? }
 */

import { z } from "zod";
import { userRepository, orderRepository } from "@/repositories";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ORDER_FIELDS } from "@/db/schema";
import { serverLogger } from "@/lib/server-logger";
import {
  shiprocketCreateOrder,
  shiprocketGenerateAWB,
  shiprocketGeneratePickup,
  isShiprocketTokenExpired,
} from "@/lib/shiprocket/client";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

// ─── Schemas ────────────────────────────────────────────────────────────────

const customShipSchema = z.object({
  method: z.literal("custom"),
  shippingCarrier: z
    .string()
    .min(1, ERROR_MESSAGES.SHIPPING.CARRIER_NAME_REQUIRED),
  trackingNumber: z.string().min(1, "Tracking number is required"),
  trackingUrl: z.string().url(ERROR_MESSAGES.SHIPPING.INVALID_TRACKING_URL),
});

const shiprocketShipSchema = z.object({
  method: z.literal("shiprocket"),
  packageWeight: z.number().positive().max(500),
  packageLength: z.number().positive().max(200),
  packageBreadth: z.number().positive().max(200),
  packageHeight: z.number().positive().max(200),
  courierId: z.number().optional(),
});

const shipOrderSchema = z.discriminatedUnion("method", [
  customShipSchema,
  shiprocketShipSchema,
]);

type IdParams = { id: string };

// ─── Route ────────────────────────────────────────────────────────────────────

export const POST = createApiHandler<
  (typeof shipOrderSchema)["_output"],
  IdParams
>({
  auth: true,
  rateLimit: RateLimitPresets.STRICT,
  schema: shipOrderSchema,
  handler: async ({ user: authUser, body: data, params }) => {
    const user = await userRepository.findById(authUser!.uid);
    if (!user) throw new AuthorizationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    if (user.role !== "seller" && user.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    const { id: orderId } = params!;
    const order = await orderRepository.findById(orderId);
    if (!order)
      throw new NotFoundError(ERROR_MESSAGES.SHIPPING.ORDER_NOT_FOUND);

    if (user.role !== "admin" && order.sellerId !== authUser!.uid) {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    if (order.status === "shipped" || order.status === "delivered") {
      throw new ValidationError(ERROR_MESSAGES.SHIPPING.ORDER_ALREADY_SHIPPED);
    }
    if (order.status !== "confirmed") {
      throw new ValidationError(ERROR_MESSAGES.SHIPPING.ORDER_NOT_SHIPPABLE);
    }

    // ── Custom shipping ──────────────────────────────────────────────────────
    if (data!.method === "custom") {
      const d = data as (typeof customShipSchema)["_output"];
      await orderRepository.update(orderId, {
        status: "shipped",
        shippingMethod: "custom",
        shippingCarrier: d.shippingCarrier,
        trackingNumber: d.trackingNumber,
        trackingUrl: d.trackingUrl,
        shippingDate: new Date(),
        [ORDER_FIELDS.PAYOUT_STATUS]: "eligible",
      });

      serverLogger.info("Order shipped (custom)", {
        orderId,
        uid: authUser!.uid,
        carrier: d.shippingCarrier,
      });
      return successResponse(
        { orderId, method: "custom" },
        SUCCESS_MESSAGES.SHIPPING.ORDER_SHIPPED,
      );
    }

    // ── Shiprocket shipping ──────────────────────────────────────────────────
    const d = data as (typeof shiprocketShipSchema)["_output"];
    const shippingConfig = user.shippingConfig;

    if (!shippingConfig?.isConfigured)
      throw new ValidationError(ERROR_MESSAGES.SHIPPING.NOT_CONFIGURED);
    if (shippingConfig.method !== "shiprocket")
      throw new ValidationError(ERROR_MESSAGES.SHIPPING.INVALID_METHOD);
    if (!shippingConfig.pickupAddress?.isVerified)
      throw new ValidationError(
        ERROR_MESSAGES.SHIPPING.PICKUP_ADDRESS_REQUIRED,
      );

    const token = shippingConfig.shiprocketToken;
    if (
      !token ||
      isShiprocketTokenExpired(shippingConfig.shiprocketTokenExpiry)
    ) {
      throw new ValidationError(
        ERROR_MESSAGES.SHIPPING.SHIPROCKET_CREDS_REQUIRED,
      );
    }

    const rawAddr = order.shippingAddress ?? "";
    if (!rawAddr)
      throw new ValidationError(
        "Order is missing a shipping address. Cannot ship via Shiprocket.",
      );

    let parsedAddr: Record<string, string> = {};
    try {
      parsedAddr = JSON.parse(rawAddr);
    } catch {
      parsedAddr = { address: rawAddr };
    }

    const addrName = parsedAddr["name"] ?? order.userName ?? "";
    const addrLine = parsedAddr["address"] ?? parsedAddr["line1"] ?? rawAddr;
    const addrCity = parsedAddr["city"] ?? "";
    const addrPincode = parsedAddr["pincode"] ?? parsedAddr["zip"] ?? "";
    const addrState = parsedAddr["state"] ?? "";
    const addrEmail = parsedAddr["email"] ?? order.userEmail ?? "";
    const addrPhone = parsedAddr["phone"] ?? "";

    const srOrderPayload = {
      order_id: orderId,
      order_date: (order.createdAt instanceof Date
        ? order.createdAt
        : new Date(
            (order.createdAt as unknown as { toDate(): Date }).toDate?.() ??
              order.createdAt,
          )
      )
        .toISOString()
        .slice(0, 19),
      pickup_location: shippingConfig.pickupAddress.locationName,
      billing_customer_name: addrName,
      billing_last_name: "",
      billing_address: addrLine,
      billing_city: addrCity,
      billing_pincode: addrPincode,
      billing_state: addrState,
      billing_country: "India",
      billing_email: addrEmail,
      billing_phone: addrPhone,
      shipping_is_billing: true,
      shipping_customer_name: addrName,
      shipping_last_name: "",
      shipping_address: addrLine,
      shipping_city: addrCity,
      shipping_pincode: addrPincode,
      shipping_country: "India",
      shipping_state: addrState,
      shipping_email: addrEmail,
      shipping_phone: addrPhone,
      order_items: [
        {
          name: order.productTitle,
          sku: order.productId,
          units: order.quantity,
          selling_price: order.unitPrice,
        },
      ],
      payment_method: (order.paymentMethod === "cod" ? "COD" : "Prepaid") as
        | "COD"
        | "Prepaid",
      sub_total: order.totalPrice,
      length: d.packageLength,
      breadth: d.packageBreadth,
      height: d.packageHeight,
      weight: d.packageWeight,
    };

    const srOrderResponse = await shiprocketCreateOrder(token, srOrderPayload);
    if (!srOrderResponse.order_id || !srOrderResponse.shipment_id) {
      throw new ValidationError(ERROR_MESSAGES.SHIPPING.ORDER_CREATE_FAILED);
    }

    const awbResponse = await shiprocketGenerateAWB(token, {
      shipment_id: srOrderResponse.shipment_id,
      courier_id: d.courierId,
    });
    const awb = awbResponse.awb_code;
    if (!awb)
      throw new ValidationError(ERROR_MESSAGES.SHIPPING.AWB_ASSIGN_FAILED);

    const pickupResponse = await shiprocketGeneratePickup(token, {
      shipment_id: [srOrderResponse.shipment_id],
    });
    if (!pickupResponse.pickup_scheduled_date) {
      serverLogger.warn("Pickup scheduling returned no date. Proceeding.", {
        orderId,
        srShipmentId: srOrderResponse.shipment_id,
      });
    }

    const trackingUrl = `https://shiprocket.co/tracking/${awb}`;

    await orderRepository.update(orderId, {
      status: "shipped",
      shippingMethod: "shiprocket",
      trackingUrl,
      shiprocketOrderId: srOrderResponse.order_id,
      shiprocketShipmentId: srOrderResponse.shipment_id,
      shiprocketAWB: awb,
      shiprocketStatus: "Pickup Scheduled",
      shiprocketUpdatedAt: new Date(),
      shippingDate: new Date(),
      [ORDER_FIELDS.PAYOUT_STATUS]: "eligible",
    });

    serverLogger.info("Order shipped via Shiprocket", {
      orderId,
      uid: authUser!.uid,
      awb,
      srOrderId: srOrderResponse.order_id,
    });

    return successResponse(
      {
        orderId,
        method: "shiprocket",
        awb,
        trackingUrl,
        shiprocketOrderId: srOrderResponse.order_id,
        pickupScheduledDate: pickupResponse.pickup_scheduled_date,
      },
      SUCCESS_MESSAGES.SHIPPING.ORDER_SHIPPED,
    );
  },
});
