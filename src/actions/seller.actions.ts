"use server";

/**
 * Seller Server Actions � thin entrypoint
 *
 * Auth + rate-limit + validation ? delegates to appkit seller domain functions.
 * Shiprocket-specific shipping (updateSellerShipping, verifyShiprocketPickupOtp,
 * and the shiprocket branch of shipOrder) remain here because they depend on
 * @/lib/shiprocket/client which is a permanent letitrip-only dependency.
 */

import { z } from "zod";
import { requireAuthUser, requireRoleUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import {
  becomeSeller,
  createStore,
  updateStore,
  updatePayoutSettings,
  requestPayout,
  bulkSellerOrder,
  createSellerProduct,
  getSellerStore,
  getSellerShipping,
  getSellerPayoutSettings,
  listSellerOrders,
  getSellerAnalytics,
  listSellerPayouts,
  listSellerCoupons,
  listSellerMyProducts,
  sellerUpdateProduct,
  sellerDeleteProduct,
  customShipOrder,
  type BecomeSellerResult,
  type CreateStoreInput,
  type UpdateStoreInput,
  type UpdatePayoutSettingsInput,
  type RequestPayoutInput,
  type BulkSellerOrderResult,
} from "@mohasinac/appkit";
import { userRepository } from "@mohasinac/appkit";
import { mediaUrlSchema } from "@/validation/request-schemas";
import {
  productCreateSchema,
  productUpdateSchema,
} from "@/validation/request-schemas";
import {
  shiprocketAuthenticate,
  shiprocketAddPickupLocation,
  shiprocketVerifyPickupOTP,
  shiprocketCreateOrder,
  shiprocketGenerateAWB,
  shiprocketGeneratePickup,
  isShiprocketTokenExpired,
  SHIPROCKET_TOKEN_TTL_MS,
} from "@mohasinac/appkit";
import { resolveDate } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { NotFoundError } from "@mohasinac/appkit";
import { orderRepository } from "@mohasinac/appkit";
import { OrderStatusValues, ShippingMethodValues } from "@mohasinac/appkit";
import type { StoreDocument } from "@mohasinac/appkit";
import type { SellerPayoutDetails, SellerShippingConfig } from "@mohasinac/appkit";
import type { OrderDocument } from "@mohasinac/appkit";
import type { CouponDocument } from "@mohasinac/appkit";
import type { ProductDocument } from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";

// --- Become Seller ------------------------------------------------------------

export async function becomeSellerAction(): Promise<BecomeSellerResult> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(`become-seller:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  return becomeSeller(user.uid);
}

// --- Create Store ------------------------------------------------------------

const createStoreSchema = z.object({
  storeName: z.string().min(2).max(80),
  storeDescription: z.string().max(10000).optional().or(z.literal("")),
  storeCategory: z.string().max(80).optional().or(z.literal("")),
});

export async function createStoreAction(
  input: z.infer<typeof createStoreSchema>,
): Promise<{ store: StoreDocument }> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(`create-store:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = createStoreSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  return createStore(user.uid, user.name ?? "seller", parsed.data as CreateStoreInput) as any;
}

// --- Update Store ------------------------------------------------------------

const updateStoreSchema = z.object({
  storeName: z.string().min(2).max(80).optional(),
  storeDescription: z.string().max(10000).optional().or(z.literal("")),
  storeCategory: z.string().max(80).optional().or(z.literal("")),
  storeLogoURL: mediaUrlSchema.optional().or(z.literal("")),
  storeBannerURL: mediaUrlSchema.optional().or(z.literal("")),
  returnPolicy: z.string().max(2000).optional().or(z.literal("")),
  shippingPolicy: z.string().max(2000).optional().or(z.literal("")),
  bio: z.string().max(300).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    facebook: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
  }).optional(),
  isVacationMode: z.boolean().optional(),
  vacationMessage: z.string().max(300).optional().or(z.literal("")),
  isPublic: z.boolean().optional(),
});

export async function updateStoreAction(
  input: z.infer<typeof updateStoreSchema>,
): Promise<{ store: StoreDocument }> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(`update-store:${user.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = updateStoreSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  return updateStore(user.uid, parsed.data as UpdateStoreInput) as any;
}

// --- Update Payout Settings ---------------------------------------------------

const bankAccountInputSchema = z.object({
  accountHolderName: z.string().min(2).max(100),
  accountNumber: z.string().regex(/^\d{9,18}$/, "Account number must be 9�18 digits"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  bankName: z.string().min(2).max(100),
  accountType: z.enum(["savings", "current"]).default("savings"),
});

const updatePayoutSettingsSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("upi"), upiId: z.string().regex(/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Please enter a valid UPI ID") }),
  z.object({ method: z.literal("bank_transfer"), bankAccount: bankAccountInputSchema }),
]);

export async function updatePayoutSettingsAction(
  input: z.infer<typeof updatePayoutSettingsSchema>,
): Promise<unknown> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(`update-payout-settings:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = updatePayoutSettingsSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  return updatePayoutSettings(user.uid, parsed.data as UpdatePayoutSettingsInput);
}

// --- Request Payout -----------------------------------------------------------

const payoutRequestSchema = z.object({
  paymentMethod: z.enum(["bank_transfer", "upi"]),
  bankAccount: z.object({
    accountHolderName: z.string().min(1),
    accountNumberMasked: z.string().min(1),
    ifscCode: z.string().min(1),
    bankName: z.string().min(1),
  }).optional(),
  upiId: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (d) => d.paymentMethod === "upi" ? !!d.upiId : !!d.bankAccount,
  { message: "Missing payment details for selected method" },
);

export async function requestPayoutAction(
  input: z.infer<typeof payoutRequestSchema>,
): Promise<unknown> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(`request-payout:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = payoutRequestSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  return requestPayout(user.uid, user.name ?? user.email ?? user.uid, user.email ?? "", parsed.data as RequestPayoutInput);
}

// --- Bulk Seller Order --------------------------------------------------------

export async function bulkSellerOrderAction(
  orderIds: string[],
): Promise<BulkSellerOrderResult> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(`bulk-order-action:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  if (!Array.isArray(orderIds) || orderIds.length === 0)
    throw new ValidationError("At least one order ID is required");
  const profile = await userRepository.findById(user.uid);
  return bulkSellerOrder(user.uid, user.role ?? "seller", profile?.displayName ?? user.name ?? user.uid, user.email ?? "", orderIds);
}

// --- Create Seller Product ----------------------------------------------------

export async function createSellerProductAction(input: unknown): Promise<void> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(`create-seller-product:${user.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = productCreateSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  return createSellerProduct(user.uid, user.name ?? user.email ?? "Seller", user.email ?? "", parsed.data as Record<string, unknown>);
}

// --- Read Actions -------------------------------------------------------------

export async function getSellerStoreAction(): Promise<StoreDocument | null> {
  const user = await requireAuthUser();
  return getSellerStore(user.uid) as any;
}

export async function getSellerShippingAction() {
  const user = await requireAuthUser();
  return getSellerShipping(user.uid);
}

export async function getSellerPayoutSettingsAction() {
  const user = await requireAuthUser();
  return getSellerPayoutSettings(user.uid);
}

export async function listSellerOrdersAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<OrderDocument>> {
  const user = await requireAuthUser();
  return listSellerOrders(user.uid, params) as any;
}

export async function getSellerAnalyticsAction() {
  const user = await requireAuthUser();
  return getSellerAnalytics(user.uid);
}

export async function listSellerPayoutsAction(params?: { page?: number; pageSize?: number }) {
  const user = await requireAuthUser();
  return listSellerPayouts(user.uid, params);
}

export async function listSellerCouponsAction(): Promise<CouponDocument[]> {
  const user = await requireAuthUser();
  return listSellerCoupons(user.uid) as any;
}

export async function listSellerMyProductsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}) {
  const user = await requireAuthUser();
  return listSellerMyProducts(user.uid, params);
}

export async function sellerUpdateProductAction(
  id: string,
  input: unknown,
): Promise<ProductDocument> {
  const user = await requireAuthUser();
  if (!id?.trim()) throw new ValidationError("id is required");
  const parsed = productUpdateSchema.partial().safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid update data");
  const profile = await userRepository.findById(user.uid);
  return sellerUpdateProduct(user.uid, profile?.role ?? "user", id, parsed.data as Record<string, unknown>) as any;
}

export async function sellerDeleteProductAction(id: string): Promise<void> {
  const user = await requireAuthUser();
  if (!id?.trim()) throw new ValidationError("id is required");
  const profile = await userRepository.findById(user.uid);
  return sellerDeleteProduct(user.uid, profile?.role ?? "user", id);
}

// --- Ship Order ---------------------------------------------------------------

const customShipSchema = z.object({
  method: z.literal("custom"),
  shippingCarrier: z.string().min(1),
  trackingNumber: z.string().min(1),
  trackingUrl: z.string().url(),
});

const shiprocketShipSchema = z.object({
  method: z.literal("shiprocket"),
  packageWeight: z.number().positive().max(500),
  packageLength: z.number().positive().max(200),
  packageBreadth: z.number().positive().max(200),
  packageHeight: z.number().positive().max(200),
  courierId: z.number().optional(),
});

const shipOrderSchema = z.discriminatedUnion("method", [customShipSchema, shiprocketShipSchema]);

export async function shipOrderAction(
  orderId: string,
  input: z.infer<typeof shipOrderSchema>,
): Promise<{ orderId: string; method: string; awb?: string; trackingUrl?: string; pickupScheduledDate?: string }> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(`ship-order:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = shipOrderSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");

  const data = parsed.data;

  if (data.method === "custom") {
    return customShipOrder(user.uid, user.role ?? "seller", orderId, {
      shippingCarrier: data.shippingCarrier,
      trackingNumber: data.trackingNumber,
      trackingUrl: data.trackingUrl,
    });
  }

  // -- Shiprocket branch --
  const userDoc = await userRepository.findById(user.uid);
  if (!userDoc) throw new AuthorizationError("User not found");

  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError("Order not found");
  if (user.role !== "admin" && (order as any).sellerId !== user.uid)
    throw new AuthorizationError("You do not own this order");
  if (order.status === OrderStatusValues.SHIPPED || order.status === OrderStatusValues.DELIVERED)
    throw new ValidationError("Order is already shipped");
  if (order.status !== OrderStatusValues.CONFIRMED)
    throw new ValidationError("Order must be confirmed before shipping");

  const shippingConfig = (userDoc as any).shippingConfig;
  if (!shippingConfig?.isConfigured) throw new ValidationError("Shipping is not configured");
  if (shippingConfig.method !== "shiprocket") throw new ValidationError("Shipping method mismatch");
  if (!shippingConfig.pickupAddress?.isVerified) throw new ValidationError("Pickup address not verified");
  const token = shippingConfig.shiprocketToken;
  if (!token || isShiprocketTokenExpired(shippingConfig.shiprocketTokenExpiry))
    throw new ValidationError("Shiprocket token is missing or expired. Please reconnect.");

  const rawAddr = (order as any).shippingAddress ?? "";
  let parsedAddr: Record<string, string> = {};
  try { parsedAddr = JSON.parse(rawAddr); } catch { parsedAddr = { address: rawAddr }; }

  const orderDate = (resolveDate((order as any).createdAt) ?? new Date()).toISOString().slice(0, 19);
  const srOrderResponse = await shiprocketCreateOrder(token, {
    order_id: orderId,
    order_date: orderDate,
    pickup_location: shippingConfig.pickupAddress.locationName,
    billing_customer_name: parsedAddr["name"] ?? (order as any).userName ?? "",
    billing_last_name: "",
    billing_address: parsedAddr["address"] ?? parsedAddr["line1"] ?? rawAddr,
    billing_city: parsedAddr["city"] ?? "",
    billing_pincode: parsedAddr["pincode"] ?? parsedAddr["zip"] ?? "",
    billing_state: parsedAddr["state"] ?? "",
    billing_country: "India",
    billing_email: parsedAddr["email"] ?? (order as any).userEmail ?? "",
    billing_phone: parsedAddr["phone"] ?? "",
    shipping_is_billing: true,
    shipping_customer_name: parsedAddr["name"] ?? (order as any).userName ?? "",
    shipping_last_name: "",
    shipping_address: parsedAddr["address"] ?? parsedAddr["line1"] ?? rawAddr,
    shipping_city: parsedAddr["city"] ?? "",
    shipping_pincode: parsedAddr["pincode"] ?? parsedAddr["zip"] ?? "",
    shipping_country: "India",
    shipping_state: parsedAddr["state"] ?? "",
    shipping_phone: parsedAddr["phone"] ?? "",
    order_items: [{ name: (order as any).productTitle, sku: (order as any).productId, units: (order as any).quantity, selling_price: (order as any).unitPrice }],
    payment_method: ((order as any).paymentMethod === "cod" ? "COD" : "Prepaid") as "COD" | "Prepaid",
    sub_total: (order as any).totalPrice,
    length: data.packageLength,
    breadth: data.packageBreadth,
    height: data.packageHeight,
    weight: data.packageWeight,
  });

  if (!srOrderResponse.order_id || !srOrderResponse.shipment_id)
    throw new ValidationError("Failed to create Shiprocket order");

  const awbResponse = await shiprocketGenerateAWB(token, {
    shipment_id: srOrderResponse.shipment_id,
    courier_id: data.courierId,
  });
  const awb = awbResponse.awb_code;
  if (!awb) throw new ValidationError("Failed to assign AWB");

  const pickupResponse = await shiprocketGeneratePickup(token, {
    shipment_id: [srOrderResponse.shipment_id],
  });

  const trackingUrl = `https://shiprocket.co/tracking/${awb}`;
  await orderRepository.update(orderId, {
    status: OrderStatusValues.SHIPPED,
    shippingMethod: ShippingMethodValues.SHIPROCKET,
    trackingUrl,
    shiprocketOrderId: srOrderResponse.order_id,
    shiprocketShipmentId: srOrderResponse.shipment_id,
    shiprocketAWB: awb,
    shiprocketStatus: "Pickup Scheduled",
    shiprocketUpdatedAt: new Date(),
    shippingDate: new Date(),
    payoutStatus: "eligible",
  } as any);

  serverLogger.info("shipOrderAction (shiprocket)", { orderId, uid: user.uid, awb });
  return { orderId, method: "shiprocket", awb, trackingUrl, pickupScheduledDate: pickupResponse.pickup_scheduled_date };
}

// --- Update Seller Shipping (shiprocket � stays in letitrip) ------------------

const pickupAddressSchema = z.object({
  locationName: z.string().min(2).max(40),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  address: z.string().min(5).max(200),
  address2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  country: z.string().default("India"),
});

const updateShippingSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("custom"),
    customShippingPrice: z.number().min(0),
    customCarrierName: z.string().min(1).max(80),
  }),
  z.object({
    method: z.literal("shiprocket"),
    shiprocketCredentials: z.object({ email: z.string().email(), password: z.string().min(1) }).optional(),
    pickupAddress: pickupAddressSchema.optional(),
  }),
]);

export async function updateSellerShippingAction(
  input: z.infer<typeof updateShippingSchema>,
): Promise<unknown> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(`update-shipping:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = updateShippingSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");

  const userDoc = await userRepository.findById(user.uid);
  if (!userDoc) throw new AuthorizationError("User not found");

  const data = parsed.data;
  let config: any;
  let otpPending = false;
  let newPickupLocationId: number | undefined;

  if (data.method === "custom") {
    config = { method: "custom", customShippingPrice: data.customShippingPrice, customCarrierName: data.customCarrierName, isConfigured: true };
  } else {
    const existing = (userDoc as any).shippingConfig;
    let token = existing?.shiprocketToken;
    let tokenExpiry = existing?.shiprocketTokenExpiry;
    const existingEmail = existing?.shiprocketEmail;

    if (data.shiprocketCredentials || !token || (tokenExpiry && new Date() >= new Date(tokenExpiry))) {
      if (!data.shiprocketCredentials) throw new ValidationError("Shiprocket credentials are required to reconnect");
      const authResult = await shiprocketAuthenticate({ email: data.shiprocketCredentials.email, password: data.shiprocketCredentials.password })
        .catch((err: Error) => { throw new ValidationError(`Shiprocket auth failed: ${err.message}`); });
      token = authResult.token;
      tokenExpiry = new Date(Date.now() + SHIPROCKET_TOKEN_TTL_MS);
    }

    const shiprocketEmail = data.shiprocketCredentials?.email ?? existingEmail ?? "";
    config = { method: "shiprocket", shiprocketEmail, shiprocketToken: token, shiprocketTokenExpiry: tokenExpiry, pickupAddress: existing?.pickupAddress, isConfigured: Boolean(existing?.pickupAddress?.isVerified) };

    if (data.pickupAddress && token) {
      const pickupResult = await shiprocketAddPickupLocation(token, {
        pickup_location: data.pickupAddress.locationName,
        name: data.pickupAddress.name,
        email: data.pickupAddress.email,
        phone: data.pickupAddress.phone,
        address: data.pickupAddress.address,
        address_2: data.pickupAddress.address2 ?? "",
        city: data.pickupAddress.city,
        state: data.pickupAddress.state,
        country: data.pickupAddress.country || "India",
        pin_code: data.pickupAddress.pincode,
      }).catch((err: Error) => { throw new ValidationError(`Failed to add pickup address: ${err.message}`); });

      newPickupLocationId = pickupResult.address?.pickup_location_id;
      otpPending = true;
      config.pickupAddress = { ...data.pickupAddress, isVerified: false, shiprocketAddressId: newPickupLocationId };
      config.isConfigured = false;
    }
  }

  await userRepository.update(user.uid, { shippingConfig: config } as any);
  serverLogger.info("updateSellerShippingAction", { uid: user.uid, method: config.method, otpPending });

  const { shiprocketToken: _t, shiprocketTokenExpiry: _e, ...safeConfig } = config;
  return { shippingConfig: { ...safeConfig, isTokenValid: Boolean(config.shiprocketToken && !isShiprocketTokenExpired(config.shiprocketTokenExpiry)) }, otpPending, pickupLocationId: newPickupLocationId };
}

// --- Verify Shiprocket Pickup OTP (stays in letitrip) -------------------------

export async function verifyShiprocketPickupOtpAction(
  input: { otp: number; pickupLocationId: number },
): Promise<{ message: string }> {
  const user = await requireRoleUser(["seller", "admin"]);
  const rl = await rateLimitByIdentifier(`verify-pickup-otp:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = z.object({ otp: z.number().int().min(100000).max(999999), pickupLocationId: z.number().int().positive() }).safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");

  const userDoc = await userRepository.findById(user.uid);
  if (!userDoc) throw new AuthorizationError("User not found");

  const config = (userDoc as any).shippingConfig;
  if (!config || config.method !== "shiprocket") throw new ValidationError("Shiprocket shipping is not configured");
  if (!config.shiprocketToken) throw new ValidationError("Shiprocket token is missing. Please reconnect.");

  const result = await shiprocketVerifyPickupOTP(config.shiprocketToken, {
    otp: parsed.data.otp,
    pickup_location_id: parsed.data.pickupLocationId,
  }).catch((err: Error) => { throw new ValidationError(`Pickup verification failed: ${err.message}`); });

  if (!result.success) throw new ValidationError(result.message || "Pickup OTP verification failed");

  const updatedConfig = {
    ...config,
    pickupAddress: config.pickupAddress ? { ...config.pickupAddress, isVerified: true, shiprocketAddressId: parsed.data.pickupLocationId } : undefined,
    isConfigured: true,
  };

  await userRepository.update(user.uid, { shippingConfig: updatedConfig } as any);
  serverLogger.info("verifyShiprocketPickupOtpAction", { uid: user.uid });
  return { message: result.message || "Pickup address verified successfully" };
}

export type { BecomeSellerResult, CreateStoreInput, UpdateStoreInput, UpdatePayoutSettingsInput, RequestPayoutInput, BulkSellerOrderResult };
