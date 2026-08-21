"use server";

/**
 * Seller Server Actions — thin entrypoint
 *
 * Auth + rate-limit + validation, delegates to appkit seller domain functions.
 * Shipping is manual-only: sellers enter a carrier name + tracking number
 * directly, no carrier API integration.
 */

import { z } from "zod";
import { requireAuthUser, requireRoleUser } from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import { isAdminUser } from "@mohasinac/appkit";
import { getFlag } from "@/lib/features";
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
  markEmiInstallmentPaid,
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
import { serverLogger } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";
import type { StoreDocument } from "@mohasinac/appkit";
import type { OrderDocument } from "@mohasinac/appkit";
import type { CouponDocument } from "@mohasinac/appkit";
import type { ProductDocument } from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";
import { ActionResult, getStoreCapabilities, wrapAction } from "@mohasinac/appkit/server";
import { ERR_RATE_LIMIT, ERR_INVALID_UPDATE } from "./_constants";

// --- Become Seller ------------------------------------------------------------

export async function becomeSellerAction(): Promise<ActionResult<BecomeSellerResult>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      const rl = await rateLimitByIdentifier(`become-seller:${user.uid}`, RateLimitPresets.STRICT);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      return becomeSeller(user.uid);
  });
}

// --- Create Store ------------------------------------------------------------

const createStoreSchema = z.object({
  storeName: z.string().min(2).max(80),
  storeDescription: z.string().max(10000).optional().or(z.literal("")),
  storeCategory: z.string().max(80).optional().or(z.literal("")),
});

export async function createStoreAction(
  input: z.infer<typeof createStoreSchema>,
): Promise<ActionResult<{ store: StoreDocument }>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(`create-store:${user.uid}`, RateLimitPresets.STRICT);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      const parsed = createStoreSchema.safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input", parsed.error);
      return createStore(user.uid, user.name ?? "seller", parsed.data as CreateStoreInput) as any;
  });
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
): Promise<ActionResult<{ store: StoreDocument }>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(`update-store:${user.uid}`, RateLimitPresets.API);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      const parsed = updateStoreSchema.safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input", parsed.error);
      return updateStore(user.uid, parsed.data as UpdateStoreInput) as any;
  });
}

// --- Update Payout Settings ---------------------------------------------------

const bankAccountInputSchema = z.object({
  accountHolderName: z.string().min(2).max(100),
  accountNumber: z.string().regex(/^\d{9,18}$/, "Account number must be 9ï¿½18 digits"),
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
): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(`update-payout-settings:${user.uid}`, RateLimitPresets.STRICT);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      const parsed = updatePayoutSettingsSchema.safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input", parsed.error);
      return updatePayoutSettings(user.uid, parsed.data as UpdatePayoutSettingsInput);
  });
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
): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(`request-payout:${user.uid}`, RateLimitPresets.STRICT);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      const parsed = payoutRequestSchema.safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input", parsed.error);
      return requestPayout(user.uid, user.name ?? user.email ?? user.uid, user.email ?? "", parsed.data as RequestPayoutInput);
  });
}

// --- Bulk Seller Order --------------------------------------------------------

export async function bulkSellerOrderAction(
  orderIds: string[],
): Promise<ActionResult<BulkSellerOrderResult>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(`bulk-order-action:${user.uid}`, RateLimitPresets.STRICT);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      if (!Array.isArray(orderIds) || orderIds.length === 0)
        throw new ValidationError("At least one order ID is required");
      const profile = await userRepository.findById(user.uid);
      return bulkSellerOrder(user.uid, user.role ?? "seller", profile?.displayName ?? user.name ?? user.uid, user.email ?? "", orderIds);
  });
}

// --- Create Seller Product ----------------------------------------------------

export async function createSellerProductAction(input: unknown): Promise<ActionResult<void>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
    const rl = await rateLimitByIdentifier(`create-seller-product:${user.uid}`, RateLimitPresets.API);
    if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
    const parsed = productCreateSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input", parsed.error);

    // P-10 — prize-draw listings require legal sign-off before going live;
    // this gate applies to admin too (no bypass), unlike the capability checks below.
    if ((parsed.data as Record<string, JsonValue>).listingType === "prize-draw" && !getFlag("PRIZE_DRAWS")) {
      throw new AuthorizationError("Prize draw listings are not currently enabled.");
    }

    // Capability gate — admin bypasses
    if (!isAdminUser(user)) {
      const store = await getSellerStore(user.uid);
      if (store) {
        const caps = await getStoreCapabilities(store.id);
        const lt = (parsed.data as Record<string, JsonValue>).listingType;
        if (lt === "auction" && !caps.includes("host_auctions")) {
          throw new AuthorizationError("Your store is not approved to create auction listings.");
        }
        if (lt === "pre-order" && !caps.includes("host_preorders")) {
          throw new AuthorizationError("Your store is not approved to create pre-order listings.");
        }
      }
    }

    return createSellerProduct(user.uid, user.name ?? user.email ?? "Seller", user.email ?? "", parsed.data as Record<string, JsonValue>);
  });
}

// --- Read Actions -------------------------------------------------------------

export async function getSellerStoreAction(): Promise<ActionResult<StoreDocument | null>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return getSellerStore(user.uid) as any;
  });
}

export async function getSellerShippingAction(): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return getSellerShipping(user.uid);
  });
}

export async function getSellerPayoutSettingsAction(): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return getSellerPayoutSettings(user.uid);
  });
}

export async function listSellerOrdersAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<OrderDocument>>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return listSellerOrders(user.uid, params) as any;
  });
}

export async function getSellerAnalyticsAction(): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return getSellerAnalytics(user.uid);
  });
}

export async function listSellerPayoutsAction(params?: { page?: number; pageSize?: number }): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return listSellerPayouts(user.uid, params);
  });
}

export async function listSellerCouponsAction(): Promise<ActionResult<CouponDocument[]>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return listSellerCoupons(user.uid) as any;
  });
}

export async function listSellerMyProductsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return listSellerMyProducts(user.uid, params);
  });
}

export async function getSellerProductAction(id: string): Promise<ActionResult<ProductDocument | null>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      if (!id?.trim()) throw new ValidationError("id is required");
      const product = await productRepository.findById(id);
      if (!product) return null;
      const profile = await userRepository.findById(user.uid);
      if (!isAdminUser(profile) && (product as any).storeId !== user.uid) return null;
      return product as unknown as ProductDocument;
  });
}

export async function sellerUpdateProductAction(
  id: string,
  input: unknown,
): Promise<ActionResult<ProductDocument>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      if (!id?.trim()) throw new ValidationError("id is required");
      const parsed = productUpdateSchema.partial().safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE, parsed.error);
      const profile = await userRepository.findById(user.uid);
      return sellerUpdateProduct(user.uid, profile?.role ?? "user", id, parsed.data as Record<string, JsonValue>) as any;
  });
}

export async function sellerDeleteProductAction(id: string): Promise<void> {
  const user = await requireAuthUser();
  if (!id?.trim()) throw new ValidationError("id is required");
  const profile = await userRepository.findById(user.uid);
  return sellerDeleteProduct(user.uid, profile?.role ?? "user", id);
}

// --- Ship Order ---------------------------------------------------------------

const shipOrderSchema = z.object({
  method: z.literal("custom"),
  shippingCarrier: z.string().min(1),
  trackingNumber: z.string().min(1),
  trackingUrl: z.string().url(),
});

export async function shipOrderAction(
  orderId: string,
  input: z.infer<typeof shipOrderSchema>,
): Promise<ActionResult<{ orderId: string; method: string }>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(`ship-order:${user.uid}`, RateLimitPresets.STRICT);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      const parsed = shipOrderSchema.safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");

      const data = parsed.data;
      return customShipOrder(user.uid, user.role ?? "seller", orderId, {
        shippingCarrier: data.shippingCarrier,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
      });
  });
}

// --- Mark EMI Installment Paid -------------------------------------------------

const markEmiInstallmentPaidSchema = z.object({
  installmentIndex: z.number().int().min(1),
  transactionId: z.string().min(1).optional(),
  proofUrl: z.string().min(1).optional(),
});

export async function markEmiInstallmentPaidAction(
  orderId: string,
  input: z.infer<typeof markEmiInstallmentPaidSchema>,
): Promise<ActionResult<OrderDocument>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
    const rl = await rateLimitByIdentifier(`mark-emi-installment-paid:${user.uid}`, RateLimitPresets.STRICT);
    if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
    const parsed = markEmiInstallmentPaidSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    return markEmiInstallmentPaid(user.uid, user.role ?? "seller", orderId, {
      installmentIndex: data.installmentIndex,
      transactionId: data.transactionId,
      proofUrl: data.proofUrl,
    });
  });
}

// --- Update Seller Shipping ---------------------------------------------------

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

const updateShippingSchema = z.object({
  method: z.literal("custom"),
  customShippingPrice: z.number().min(0),
  customCarrierName: z.string().min(1).max(80),
  pickupAddress: pickupAddressSchema.optional(),
});

export async function updateSellerShippingAction(
  input: z.infer<typeof updateShippingSchema>,
): Promise<ActionResult<unknown>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(`update-shipping:${user.uid}`, RateLimitPresets.STRICT);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      const parsed = updateShippingSchema.safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input", parsed.error);

      const data = parsed.data;
      const config = {
        method: "custom" as const,
        customShippingPrice: data.customShippingPrice,
        customCarrierName: data.customCarrierName,
        isConfigured: true,
        ...(data.pickupAddress
          ? { pickupAddress: { ...data.pickupAddress, isVerified: true } }
          : {}),
      };

      await userRepository.update(user.uid, { shippingConfig: config } as any);
      serverLogger.info("updateSellerShippingAction", { uid: user.uid, method: config.method });

      return { shippingConfig: config };
  });
}

