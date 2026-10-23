"use server";

/**
 * Seller Server Actions — thin entrypoint
 *
 * Auth + rate-limit + validation, delegates to appkit seller domain functions.
 * Shipping is manual-only: sellers enter a carrier name + tracking number
 * directly, no carrier API integration.
 */

import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import { assertListingTypeAllowed, isListingTypeEnabled } from "@mohasinac/appkit";
import { z } from "zod";
import { requireAuthUser, requireRoleUser } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { AuthorizationError } from "@mohasinac/appkit/errors/authorization-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { isAdminUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { draftToProductInput } from "@mohasinac/appkit/features/seller/utils/product-draft-mapping";
import { becomeSeller, createStore, updateStore, updatePayoutSettings, requestPayout, bulkSellerOrder, createSellerProduct, getSellerStore, getSellerShipping, getSellerPayoutSettings, listSellerOrders, getSellerAnalytics, listSellerPayouts, listSellerCoupons, listSellerMyProducts, sellerUpdateProduct, sellerDeleteProduct, customShipOrder, markEmiInstallmentPaid } from "@mohasinac/appkit/features/seller/actions/seller-actions";
import type { CreateStoreInput, UpdateStoreInput, UpdatePayoutSettingsInput, RequestPayoutInput, BulkSellerOrderResult } from "@mohasinac/appkit/features/seller/actions/seller-actions";
import type { BecomeSellerResult } from "@mohasinac/appkit";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { mediaUrlSchema } from "@/validation/request-schemas";
import {
  productCreateSchema,
  productUpdateSchema,
} from "@/validation/request-schemas";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import type { StoreDocument } from "@mohasinac/appkit/features/stores/schemas/firestore";
import type { OrderDocument } from "@mohasinac/appkit/features/orders/schemas/firestore";
import type { CouponDocument } from "@mohasinac/appkit/features/promotions/schemas/firestore";
import type { ProductDocument } from "@mohasinac/appkit/features/products/schemas/firestore";
import type { FirebaseSieveResult } from "@mohasinac/appkit/providers/db-firebase/sieve";
import { ActionResult, getStoreCapabilities, wrapAction } from "@mohasinac/appkit/server";
import { ERR_RATE_LIMIT, ERR_INVALID_UPDATE } from "./_constants";
import { isValidPostalCode, postalLabelFor, DEFAULT_COUNTRY } from "@mohasinac/appkit/server";

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
    /*
     * Fold the form's FLAT per-type keys into the nested blocks the schema
     * names, BEFORE parsing.
     *
     * `productCreateSchema` has no `.passthrough()`, so without this every
     * `classifiedCity` / `liveSpecies` / `digitalCodeDelivery` / `print*` the
     * seller typed was stripped and the listing saved without the fields that
     * made it that kind of listing — silently, with a success toast.
     *
     * Applied HERE rather than in the ~20 `store/*` new/edit pages that each
     * spread the draft in: one choke point cannot be forgotten by the next
     * page somebody adds.
     */
    const mapped = draftToProductInput(input as Parameters<typeof draftToProductInput>[0]);
    const parsed = productCreateSchema.safeParse(mapped);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input", parsed.error);

    // P-10 — prize-draw listings require legal sign-off before going live;
    // this gate applies to admin too (no bypass), unlike the capability checks below.
    if (
      (parsed.data as Record<string, JsonValue>).listingType === "prize-draw" &&
      !isListingTypeEnabled("prize-draw", await siteSettingsRepository.getSingleton())
    ) {
      throw new AuthorizationError("Prize draw listings are not currently enabled.");
    }

    /*
     * Capability gate — admin bypasses.
     *
     * 🛑 The `if (store)` that used to wrap this was a hole, not a guard: a
     * non-admin caller with no store document fell straight through it and
     * every listing type was permitted. It now refuses, which is also what
     * `createSellerProduct` does one layer down for the same condition.
     *
     * 🛑 The two hand-written per-type checks this replaces covered `auction`
     * and `pre-order` ONLY, so the other seven advanced types were never gated
     * anywhere. `assertListingTypeAllowed` is the single owner of the rule —
     * grepping for a function name finds every caller, grepping for the shape
     * of two `if` statements does not (Root Cause #75).
     *
     * This is belt-and-braces: appkit's `createSellerProduct` runs the same
     * assertion against the same store. Kept here so the action fails before
     * media finalisation rather than after.
     */
    if (!isAdminUser(user)) {
      const store = await getSellerStore(user.uid);
      if (!store) {
        throw new AuthorizationError(
          "No store found for this account. Create your store first.",
        );
      }
      assertListingTypeAllowed((parsed.data as Record<string, JsonValue>).listingType, {
        capabilities: await getStoreCapabilities(store.id),
      });
    }

    return createSellerProduct(
      user.uid,
      user.name ?? user.email ?? "Seller",
      user.email ?? "",
      parsed.data as Record<string, JsonValue>,
      user.role ?? "seller",
    );
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
      /*
       * 🛑 `product.storeId` is the store SLUG, never the seller's Firebase UID.
       *
       * This compared `storeId !== user.uid` — two different namespaces (see
       * CLAUDE.md § "Store Identity Architecture"), so the condition was true for
       * every non-admin seller and the read returned null unconditionally. The
       * WRITE path 500 lines away in appkit's `sellerUpdateProduct` already had
       * this right, comment and all; the read path disagreed with it.
       *
       * Resolve the caller's store the same way the write path and
       * /api/store/products do — by ownerId — and compare slug to slug.
       */
      if (!isAdminUser(profile)) {
        const store = await storeRepository.findByOwnerId(user.uid);
        if (!store || (product as any).storeId !== store.id) return null;
      }
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
      // Same flat -> nested fold as the create path — an edit that leaves the
      // per-type fields untranslated strips them just as thoroughly.
      const mappedUpdate = draftToProductInput(
        input as Parameters<typeof draftToProductInput>[0],
      );
      const parsed = productUpdateSchema.partial().safeParse(mappedUpdate);
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

import { enqueueJob } from "@mohasinac/appkit/features/jobs/actions/enqueue-job";
import {
  shipOrderSchema,
  markEmiInstallmentPaidSchema,
} from "@mohasinac/appkit/features/seller/schemas/order-forms";

/*
 * Both schemas now live in `appkit/src/features/seller/schemas/order-forms.ts`.
 * They were private here, and a `"use server"` module may only export async
 * functions — so the two API routes that POST into these actions could not
 * import the rule they were about to be judged against, and resorted to
 * `parseJsonBody(…).catch(() => ({})) as never`. One definition, two readers.
 */

export async function shipOrderAction(
  orderId: string,
  input: z.infer<typeof shipOrderSchema>,
  /*
   * 🛑 `jobId` is OPTIONAL on purpose, and the union is not split by method.
   *
   * The platform branch returns one and the custom branch cannot, but a
   * caller holding a `ShipOrderValues` already knows which branch it sent —
   * so a second discriminator here would be the same fact twice (Root Cause
   * #42). What matters is that the type ADMITS the field: it was declared
   * `{orderId, method}` and the platform branch returned a third key behind
   * `as never`, which silences every other field's check on that return, not
   * just the one being worked around.
   */
): Promise<ActionResult<{ orderId: string; method: string; jobId?: string }>> {
  return wrapAction(async () => {
    const user = await requireRoleUser(["seller", "admin"]);
      const rl = await rateLimitByIdentifier(`ship-order:${user.uid}`, RateLimitPresets.STRICT);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      const parsed = shipOrderSchema.safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");

      const data = parsed.data;
      /*
       * 🛑 The union's whole point: `tsc` forces this branch to exist.
       *
       * `method` was `z.literal("custom")`, so this function could only ever
       * mean one thing and the "book through us" path had nowhere to go —
       * bug 0e. Widening it to a discriminated union turns every consumer
       * into a compile error until it chooses, which is the enumeration a
       * bare enum plus optional fields would not have produced.
       *
       * The platform branch ENQUEUES rather than booking inline: a carrier
       * call on a 10s sync ceiling times out in the one way that cannot be
       * retried safely (the carrier may have accepted). See the route.
       */
      if (data.method === "platform") {
        const { jobId } = await enqueueJob({
          jobType: "bookShipment",
          payload: {
            orderId,
            pickupAddressId: data.pickupAddressId,
            dimensions: data.dimensions,
          },
          requestedBy: user.uid,
        });
        return { orderId, method: "platform", jobId };
      }
      return customShipOrder(user.uid, user.role ?? "seller", orderId, {
        shippingCarrier: data.shippingCarrier,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
      });
  });
}

// --- Mark EMI Installment Paid -------------------------------------------------

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

/*
 * A courier PICKUP location, not an `AddressDocument` — it carries a
 * `locationName` and an `email` the address entity does not have, and the
 * shipping provider takes it in this shape. So the SHAPE stays; only the
 * postal RULE is shared, which is the half that was wrong: `/^\d{6}$/` is
 * India-only on a field whose country is user-supplied.
 */
// audit-address-shape-ok: a provider pickup payload, not the address entity
const pickupAddressSchema = z.object({
  locationName: z.string().min(2).max(40),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  address: z.string().min(5).max(200),
  address2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  pincode: z.string().trim().min(1, "A postal code is required."),
  country: z.string().default(DEFAULT_COUNTRY),
}).superRefine((v, ctx) => {
  if (!isValidPostalCode(v.country, v.pincode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pincode"],
      message: `That is not a valid ${postalLabelFor(v.country)}.`,
    });
  }
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

