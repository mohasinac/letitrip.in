"use server";

/**
 * Seller Server Actions
 *
 * Mutations for seller role application, store management, payouts, and
 * products — calls repositories directly, bypassing the service → apiClient
 * → API route chain.
 */

import { z } from "zod";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import {
  userRepository,
  storeRepository,
  productRepository,
  orderRepository,
  payoutRepository,
  couponsRepository,
} from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  ApiError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import {
  generateStoreSlug,
  DEFAULT_PLATFORM_FEE_RATE,
  ORDER_FIELDS,
} from "@/db/schema";
import {
  productCreateSchema,
  mediaUrlSchema,
  productUpdateSchema,
} from "@/lib/validation/schemas";
import type {
  UserDocument,
  StoreDocument,
  SellerPayoutDetails,
  OrderDocument,
  CouponDocument,
  ProductDocument,
  SellerShippingConfig,
} from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@/lib/query";
import { resolveDate } from "@/utils";
import {
  shiprocketAuthenticate,
  shiprocketAddPickupLocation,
  shiprocketVerifyPickupOTP,
  shiprocketCreateOrder,
  shiprocketGenerateAWB,
  shiprocketGeneratePickup,
  isShiprocketTokenExpired,
  SHIPROCKET_TOKEN_TTL_MS,
} from "@/lib/shiprocket/client";
import {
  finalizeStagedMediaUrl,
  finalizeStagedMediaField,
  finalizeStagedMediaArray,
} from "@/lib/media/finalize";

async function finalizeProductMediaReferences<T extends Record<string, unknown>>(
  data: T,
): Promise<T> {
  const finalized = { ...data } as T & {
    mainImage?: string;
    images?: string[];
    video?: {
      url?: string;
      thumbnailUrl?: string;
      duration?: number;
      trimStart?: number;
      trimEnd?: number;
    };
  };

  if (typeof finalized.mainImage === "string" && finalized.mainImage) {
    finalized.mainImage = await finalizeStagedMediaUrl(finalized.mainImage);
  }

  if (Array.isArray(finalized.images) && finalized.images.length > 0) {
    finalized.images = await finalizeStagedMediaArray(finalized.images);
  }

  if (finalized.video?.url) {
    finalized.video = {
      ...finalized.video,
      url: await finalizeStagedMediaUrl(finalized.video.url),
      thumbnailUrl: await finalizeStagedMediaField(finalized.video.thumbnailUrl),
    };
  }

  return finalized as T;
}

export interface BecomeSellerActionResult {
  storeStatus: "pending" | "approved" | "rejected";
  alreadySeller?: boolean;
}

/**
 * Apply to become a seller.
 *
 * - Auth required (must be a regular user, not already a seller/admin)
 * - Sets role="seller", storeStatus="pending" on the user document
 * - Returns `alreadySeller: true` if the user is already a seller/admin
 * - Rate-limited by uid (STRICT: 5 req/60 s)
 */
export async function becomeSellerAction(): Promise<BecomeSellerActionResult> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `become-seller:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const profile = await userRepository.findById(user.uid);
  if (profile?.role === "seller" || profile?.role === "admin") {
    return {
      alreadySeller: true,
      storeStatus:
        (profile.storeStatus as "pending" | "approved" | "rejected") ??
        "pending",
    };
  }

  await userRepository.update(user.uid, {
    role: "seller",
    storeStatus: "pending",
  } as Partial<UserDocument>);

  serverLogger.info("becomeSellerAction: application submitted", {
    uid: user.uid,
  });

  return { storeStatus: "pending" };
}

// ─── Create Store ─────────────────────────────────────────────────────────────

const createStoreSchema = z.object({
  storeName: z.string().min(2).max(80),
  storeDescription: z.string().max(500).optional().or(z.literal("")),
  storeCategory: z.string().max(80).optional().or(z.literal("")),
});

/**
 * Create the seller's store for the first time.
 *
 * - Requires seller or admin role
 * - Generates a unique URL slug from store name + owner name
 * - Mirrors storeId + storeSlug onto UserDocument for indexed lookups
 * - Throws 409 if the seller already has a store
 */
export async function createStoreAction(
  input: z.infer<typeof createStoreSchema>,
): Promise<{ store: StoreDocument }> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `create-store:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = createStoreSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const { storeName, storeDescription, storeCategory } = parsed.data;

  const existing = await storeRepository.findByOwnerId(user.uid);
  if (existing) throw new ApiError(409, "Store already exists for this seller");

  const ownerName = user.name ?? "seller";
  const baseSlug = `store-${generateStoreSlug(storeName, ownerName)}`.slice(
    0,
    80,
  );

  let storeSlug = baseSlug;
  let attempt = 1;
  while (await storeRepository.findBySlug(storeSlug)) {
    attempt++;
    const suffix = `-${attempt}`;
    storeSlug = `${baseSlug.slice(0, 80 - suffix.length)}${suffix}`;
  }

  const store = await storeRepository.create({
    storeSlug,
    ownerId: user.uid,
    storeName,
    storeDescription: storeDescription || undefined,
    storeCategory: storeCategory || undefined,
    isPublic: false,
    status: "pending",
  });

  await userRepository.update(user.uid, {
    storeId: store.id,
    storeSlug: store.storeSlug,
    storeStatus: "pending",
  } as Parameters<typeof userRepository.update>[1]);

  serverLogger.info("createStoreAction: store created", {
    uid: user.uid,
    storeSlug: store.storeSlug,
  });

  return { store };
}

// ─── Update Store ─────────────────────────────────────────────────────────────

const updateStoreSchema = z.object({
  storeName: z.string().min(2).max(80).optional(),
  storeDescription: z.string().max(500).optional().or(z.literal("")),
  storeCategory: z.string().max(80).optional().or(z.literal("")),
  storeLogoURL: mediaUrlSchema.optional().or(z.literal("")),
  storeBannerURL: mediaUrlSchema.optional().or(z.literal("")),
  returnPolicy: z.string().max(2000).optional().or(z.literal("")),
  shippingPolicy: z.string().max(2000).optional().or(z.literal("")),
  bio: z.string().max(300).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  socialLinks: z
    .object({
      twitter: z.string().url().optional().or(z.literal("")),
      instagram: z.string().url().optional().or(z.literal("")),
      facebook: z.string().url().optional().or(z.literal("")),
      linkedin: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  isVacationMode: z.boolean().optional(),
  vacationMessage: z.string().max(300).optional().or(z.literal("")),
  isPublic: z.boolean().optional(),
});

/**
 * Update the authenticated seller's store profile.
 *
 * - Requires seller or admin role
 * - All fields optional — only provided fields are updated
 */
export async function updateStoreAction(
  input: z.infer<typeof updateStoreSchema>,
): Promise<{ store: StoreDocument }> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `update-store:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = updateStoreSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const store = await storeRepository.findByOwnerId(user.uid);
  if (!store) throw new NotFoundError("Store not found. Create a store first.");

  const {
    storeName,
    storeDescription,
    storeCategory,
    storeLogoURL,
    storeBannerURL,
    returnPolicy,
    shippingPolicy,
    bio,
    website,
    location,
    socialLinks,
    isVacationMode,
    vacationMessage,
    isPublic,
  } = parsed.data;

  // Finalize any staged tmp media URLs before persisting
  const finalLogoURL = await finalizeStagedMediaField(storeLogoURL);
  const finalBannerURL = await finalizeStagedMediaField(storeBannerURL);

  const updated = await storeRepository.updateStore(store.storeSlug, {
    ...(storeName !== undefined && { storeName }),
    ...(storeDescription !== undefined && { storeDescription }),
    ...(storeCategory !== undefined && { storeCategory }),
    ...(finalLogoURL !== undefined && { storeLogoURL: finalLogoURL }),
    ...(finalBannerURL !== undefined && { storeBannerURL: finalBannerURL }),
    ...(returnPolicy !== undefined && { returnPolicy }),
    ...(shippingPolicy !== undefined && { shippingPolicy }),
    ...(bio !== undefined && { bio }),
    ...(website !== undefined && { website }),
    ...(location !== undefined && { location }),
    ...(socialLinks !== undefined && {
      socialLinks: { ...store.socialLinks, ...socialLinks },
    }),
    ...(isVacationMode !== undefined && { isVacationMode }),
    ...(vacationMessage !== undefined && { vacationMessage }),
    ...(isPublic !== undefined && { isPublic }),
  });

  return { store: updated };
}

// ─── Update Payout Settings ───────────────────────────────────────────────────

const bankAccountInputSchema = z.object({
  accountHolderName: z.string().min(2).max(100),
  accountNumber: z
    .string()
    .regex(/^\d{9,18}$/, "Account number must be 9–18 digits"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code (e.g. HDFC0001234)"),
  bankName: z.string().min(2).max(100),
  accountType: z.enum(["savings", "current"]).default("savings"),
});

const updatePayoutSettingsSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("upi"),
    upiId: z
      .string()
      .regex(
        /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/,
        "Please enter a valid UPI ID (e.g. name@upi)",
      ),
  }),
  z.object({
    method: z.literal("bank_transfer"),
    bankAccount: bankAccountInputSchema,
  }),
]);

function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return "****";
  return "X".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

type SafePayoutDetails = Omit<SellerPayoutDetails, "bankAccount"> & {
  bankAccount?: Omit<
    NonNullable<SellerPayoutDetails["bankAccount"]>,
    "accountNumber"
  >;
};

/**
 * Save or update UPI ID or bank account payout details.
 *
 * - Requires seller or admin role
 * - Stores full account number server-side; returns masked version to client
 */
export async function updatePayoutSettingsAction(
  input: z.infer<typeof updatePayoutSettingsSchema>,
): Promise<{ payoutDetails: SafePayoutDetails }> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `update-payout-settings:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = updatePayoutSettingsSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const data = parsed.data;
  let payoutDetails: SellerPayoutDetails;

  if (data.method === "upi") {
    payoutDetails = { method: "upi", upiId: data.upiId, isConfigured: true };
  } else {
    const { accountNumber, ...bankRest } = data.bankAccount;
    payoutDetails = {
      method: "bank_transfer",
      bankAccount: {
        ...bankRest,
        accountNumber,
        accountNumberMasked: maskAccountNumber(accountNumber),
      },
      isConfigured: true,
    };
  }

  await userRepository.update(user.uid, { payoutDetails });

  serverLogger.info("updatePayoutSettingsAction: payout details updated", {
    uid: user.uid,
    method: payoutDetails.method,
  });

  if (!payoutDetails.bankAccount) return { payoutDetails };
  const { accountNumber: _removed, ...safeBank } = payoutDetails.bankAccount;
  return { payoutDetails: { ...payoutDetails, bankAccount: safeBank } };
}

// ─── Request Payout ───────────────────────────────────────────────────────────

const payoutRequestBankSchema = z.object({
  accountHolderName: z.string().min(1),
  accountNumberMasked: z.string().min(1),
  ifscCode: z.string().min(1),
  bankName: z.string().min(1),
});

const payoutRequestSchema = z
  .object({
    paymentMethod: z.enum(["bank_transfer", "upi"]),
    bankAccount: payoutRequestBankSchema.optional(),
    upiId: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.paymentMethod === "upi" ? !!data.upiId : !!data.bankAccount,
    { message: "Missing payment details for selected method" },
  );

async function computeSellerEarnings(sellerId: string) {
  const products = await productRepository.findBySeller(sellerId);
  const productIds = products.slice(0, 50).map((p) => p.id);

  let deliveredOrders: Awaited<
    ReturnType<typeof orderRepository.findByProduct>
  > = [];
  if (productIds.length > 0) {
    const batches = await Promise.all(
      productIds.map((id) =>
        orderRepository
          .findByProduct(id)
          .catch(() => [] as typeof deliveredOrders),
      ),
    );
    deliveredOrders = batches.flat().filter((o) => o.status === "delivered");
  }

  const paidOutIds = await payoutRepository.getPaidOutOrderIds(sellerId);
  const eligibleOrders = deliveredOrders.filter((o) => !paidOutIds.has(o.id));

  const grossAmount = eligibleOrders.reduce(
    (sum, o) => sum + (o.totalPrice ?? 0),
    0,
  );
  const platformFee = parseFloat(
    (grossAmount * DEFAULT_PLATFORM_FEE_RATE).toFixed(2),
  );
  const netAmount = parseFloat((grossAmount - platformFee).toFixed(2));

  return {
    eligibleOrders,
    grossAmount,
    platformFee,
    netAmount,
    productCount: products.length,
  };
}

/**
 * Request a new payout for eligible delivered order earnings.
 *
 * - Requires seller or admin role
 * - Throws if a pending payout already exists or no earnings are available
 */
export async function requestPayoutAction(
  input: z.infer<typeof payoutRequestSchema>,
): Promise<unknown> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `request-payout:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = payoutRequestSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const { paymentMethod, bankAccount, upiId, notes } = parsed.data;

  const existing = await payoutRepository.findBySeller(user.uid);
  const hasPending = existing.some(
    (p) => p.status === "pending" || p.status === "processing",
  );
  if (hasPending)
    throw new ValidationError("A payout is already pending or processing.");

  const earnings = await computeSellerEarnings(user.uid);
  if (earnings.netAmount <= 0 || earnings.eligibleOrders.length === 0)
    throw new ValidationError("No eligible earnings available for payout.");

  const sellerName = user.name ?? user.email ?? user.uid;
  const sellerEmail = user.email ?? "";

  const payout = await payoutRepository.create({
    sellerId: user.uid,
    sellerName,
    sellerEmail,
    amount: earnings.netAmount,
    grossAmount: earnings.grossAmount,
    platformFee: earnings.platformFee,
    platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
    currency: "INR",
    paymentMethod,
    ...(bankAccount && { bankAccount }),
    ...(upiId && { upiId }),
    ...(notes && { notes }),
    orderIds: earnings.eligibleOrders.map((o) => o.id),
  });

  serverLogger.info("requestPayoutAction: payout requested", {
    uid: user.uid,
    payoutId: payout.id,
    netAmount: earnings.netAmount,
  });

  return payout;
}

// ─── Bulk Seller Order Action ─────────────────────────────────────────────────

const bulkSellerOrderSchema = z
  .array(z.string().min(1))
  .min(1, "At least one order ID is required");

export interface BulkSellerOrderResult {
  payoutId: string;
  requested: string[];
  skipped: string[];
  eligibleCount: number;
  skippedCount: number;
  netAmount: number;
  grossAmount: number;
  platformFee: number;
}

/**
 * Request payout for a batch of custom-shipped delivered orders.
 *
 * - Requires seller or admin role
 * - Validates payout details are configured
 * - Skips ineligible orders; creates one payout document and marks all eligible
 */
export async function bulkSellerOrderAction(
  orderIds: string[],
): Promise<BulkSellerOrderResult> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `bulk-order-action:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = bulkSellerOrderSchema.safeParse(orderIds);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "No orders selected",
    );

  // Fetch Firestore user document for payoutDetails (not in JWT claims)
  const userDoc = await userRepository.findById(user.uid);
  if (!userDoc) throw new AuthorizationError("User not found");

  if (!userDoc.payoutDetails?.isConfigured) {
    throw new ValidationError(
      "Payout details are not set up. Please configure your payout method before requesting a payout.",
    );
  }

  const orders = await Promise.all(
    parsed.data.map((id) => orderRepository.findById(id)),
  );

  const requested: string[] = [];
  const skipped: string[] = [];
  const eligible: NonNullable<
    Awaited<ReturnType<typeof orderRepository.findById>>
  >[] = [];

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const id = parsed.data[i];

    if (!order) {
      skipped.push(id);
      continue;
    }
    if (user.role !== "admin" && order.sellerId !== user.uid) {
      skipped.push(id);
      continue;
    }
    if (order.status !== "delivered") {
      skipped.push(id);
      continue;
    }
    if (order.shippingMethod !== "custom") {
      skipped.push(id);
      continue;
    }
    if (order.payoutStatus === "requested" || order.payoutStatus === "paid") {
      skipped.push(id);
      continue;
    }
    eligible.push(order as NonNullable<typeof order>);
  }

  if (eligible.length === 0)
    throw new ValidationError("No eligible orders found.");

  const PLATFORM_COMMISSION_RATE = 0.05;
  const grossAmount = eligible.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
  const platformFee =
    Math.round(grossAmount * PLATFORM_COMMISSION_RATE * 100) / 100;
  const netAmount = Math.round((grossAmount - platformFee) * 100) / 100;

  const payoutDoc = await payoutRepository.create({
    sellerId: user.uid,
    sellerName: (userDoc.displayName ?? user.email ?? user.uid) as string,
    sellerEmail: (user.email ?? "") as string,
    orderIds: eligible.map((o) => o.id!),
    amount: netAmount,
    grossAmount,
    platformFee,
    platformFeeRate: PLATFORM_COMMISSION_RATE,
    currency: "INR",
    paymentMethod:
      userDoc.payoutDetails.method === "upi"
        ? ("upi" as const)
        : ("bank_transfer" as const),
    upiId:
      userDoc.payoutDetails.method === "upi"
        ? userDoc.payoutDetails.upiId
        : undefined,
    bankAccount:
      userDoc.payoutDetails.method === "bank_transfer"
        ? userDoc.payoutDetails.bankAccount
        : undefined,
    notes: `Payout request for ${eligible.length} custom-shipped delivered order(s)`,
  });

  const payoutId = payoutDoc.id;

  await Promise.all(
    eligible.map((o) =>
      orderRepository.update(o.id!, { payoutStatus: "requested", payoutId }),
    ),
  );

  eligible.forEach((o) => requested.push(o.id!));

  serverLogger.info("bulkSellerOrderAction: bulk payout requested", {
    uid: user.uid,
    payoutId,
    orderCount: eligible.length,
    netAmount,
  });

  return {
    payoutId,
    requested,
    skipped,
    eligibleCount: eligible.length,
    skippedCount: skipped.length,
    netAmount,
    grossAmount,
    platformFee,
  };
}

// ─── Create Seller Product ────────────────────────────────────────────────────

/**
 * Create a new product listing for the authenticated seller.
 *
 * - Requires seller or admin role
 * - Validates with productCreateSchema
 * - Injects sellerId, sellerName, sellerEmail, status: "draft"
 */
export async function createSellerProductAction(input: unknown): Promise<void> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `create-seller-product:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = productCreateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const finalizedMediaData = await finalizeProductMediaReferences(parsed.data);

  await productRepository.create({
    ...finalizedMediaData,
    sellerId: user.uid,
    sellerName: user.name ?? user.email ?? "Seller",
    sellerEmail: user.email ?? "",
    status: "draft",
  } as any);

  serverLogger.info("createSellerProductAction: product created", {
    uid: user.uid,
  });
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function getSellerStoreAction(): Promise<StoreDocument | null> {
  const user = await requireAuth();
  return storeRepository.findByOwnerId(user.uid);
}

export async function getSellerShippingAction() {
  const user = await requireAuth();
  const userData = await userRepository.findById(user.uid);
  if (!userData) return null;
  const config = userData.shippingConfig;
  if (!config) return null;
  // Strip sensitive token from response
  if (config.method === "shiprocket" && config.shiprocketToken) {
    const { shiprocketToken: _removed, ...safe } = config;
    return safe;
  }
  return config;
}

export async function getSellerPayoutSettingsAction() {
  const user = await requireAuth();
  const userData = await userRepository.findById(user.uid);
  if (!userData?.payoutDetails) return { method: "upi", isConfigured: false };
  const details = userData.payoutDetails;
  if (!details.bankAccount) return details;
  const { accountNumber: _removed, ...safeBank } = details.bankAccount;
  return { ...details, bankAccount: safeBank };
}

export async function listSellerOrdersAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<OrderDocument>> {
  const user = await requireAuth();
  const sellerProducts = await productRepository.findBySeller(user.uid);
  const productIds = sellerProducts.map((p) => p.id);
  if (productIds.length === 0) {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: params?.pageSize ?? 20,
      totalPages: 0,
      hasMore: false,
    };
  }
  return orderRepository.listForSeller(productIds, {
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  });
}

export async function getSellerAnalyticsAction() {
  const user = await requireAuth();
  const sellerId = user.uid;
  const products = await productRepository.findBySeller(sellerId);
  const productIds = products.map((p) => p.id);
  let allOrders: OrderDocument[] = [];
  if (productIds.length > 0) {
    const batches = await Promise.all(
      productIds
        .slice(0, 20)
        .map((id) =>
          orderRepository.findByProduct(id).catch(() => [] as OrderDocument[]),
        ),
    );
    allOrders = batches.flat();
  }
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((s, o) => s + (o.totalPrice ?? 0), 0);
  const totalProducts = products.length;
  const publishedProducts = products.filter(
    (p) => p.status === "published",
  ).length;
  const now = new Date();
  const monthMap = new Map<
    string,
    { month: string; orders: number; revenue: number }
  >();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, {
      month: d.toLocaleDateString("en", { month: "short", year: "numeric" }),
      orders: 0,
      revenue: 0,
    });
  }
  for (const o of allOrders) {
    const d = new Date(o.createdAt as any);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthMap.has(key)) {
      const e = monthMap.get(key)!;
      e.orders += 1;
      e.revenue += o.totalPrice ?? 0;
    }
  }
  return {
    totalOrders,
    totalRevenue,
    totalProducts,
    publishedProducts,
    monthlyRevenue: Array.from(monthMap.values()),
  };
}

export async function listSellerPayoutsAction(params?: {
  page?: number;
  pageSize?: number;
}) {
  const user = await requireAuth();
  const payouts = await payoutRepository.findBySeller(user.uid);
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  return {
    items: payouts.slice(start, start + pageSize),
    total: payouts.length,
    page,
    pageSize,
    hasMore: start + pageSize < payouts.length,
  };
}

export async function listSellerCouponsAction(): Promise<CouponDocument[]> {
  const user = await requireAuth();
  return couponsRepository.getSellerCoupons(user.uid);
}

export async function listSellerMyProductsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}) {
  const user = await requireAuth();
  const products = await productRepository.findBySeller(user.uid);
  // Simple pagination since findBySeller returns all
  const filters = params?.filters;
  let filtered = products;
  if (filters?.includes("status==")) {
    const match = filters.match(/status==([\w]+)/);
    if (match) filtered = products.filter((p) => p.status === match[1]);
  }
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
    hasMore: start + pageSize < filtered.length,
  };
}

export async function sellerUpdateProductAction(
  id: string,
  input: unknown,
): Promise<ProductDocument> {
  const user = await requireAuth();
  if (!id?.trim()) throw new ValidationError("id is required");

  const existing = await productRepository.findById(id);
  if (!existing) throw new NotFoundError("Product not found");
  const profile = await userRepository.findById(user.uid);
  if (profile?.role !== "admin" && existing.sellerId !== user.uid)
    throw new AuthorizationError("You do not own this product");

  const parsed = productUpdateSchema.partial().safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  const finalizedMediaData = await finalizeProductMediaReferences(parsed.data);

  const updated = await productRepository.updateProduct(
    id,
    finalizedMediaData as any,
  );
  serverLogger.info("sellerUpdateProductAction", {
    userId: user.uid,
    productId: id,
  });
  return updated;
}

export async function sellerDeleteProductAction(id: string): Promise<void> {
  const user = await requireAuth();
  if (!id?.trim()) throw new ValidationError("id is required");

  const existing = await productRepository.findById(id);
  if (!existing) throw new NotFoundError("Product not found");
  const profile = await userRepository.findById(user.uid);
  if (profile?.role !== "admin" && existing.sellerId !== user.uid)
    throw new AuthorizationError("You do not own this product");

  await productRepository.delete(id);
  serverLogger.info("sellerDeleteProductAction", {
    userId: user.uid,
    productId: id,
  });
}

// ─── Ship Order ───────────────────────────────────────────────────────────────

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

const shipOrderSchema = z.discriminatedUnion("method", [
  customShipSchema,
  shiprocketShipSchema,
]);

export async function shipOrderAction(
  orderId: string,
  input: z.infer<typeof shipOrderSchema>,
): Promise<{
  orderId: string;
  method: string;
  awb?: string;
  trackingUrl?: string;
  pickupScheduledDate?: string;
}> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `ship-order:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = shipOrderSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const userDoc = await userRepository.findById(user.uid);
  if (!userDoc) throw new AuthorizationError("User not found");

  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError("Order not found");
  if (user.role !== "admin" && order.sellerId !== user.uid)
    throw new AuthorizationError("You do not own this order");
  if (order.status === "shipped" || order.status === "delivered")
    throw new ValidationError("Order is already shipped");
  if (order.status !== "confirmed")
    throw new ValidationError("Order must be confirmed before shipping");

  const data = parsed.data;

  if (data.method === "custom") {
    await orderRepository.update(orderId, {
      status: "shipped",
      shippingMethod: "custom",
      shippingCarrier: data.shippingCarrier,
      trackingNumber: data.trackingNumber,
      trackingUrl: data.trackingUrl,
      shippingDate: new Date(),
      [ORDER_FIELDS.PAYOUT_STATUS]: "eligible",
    });
    serverLogger.info("shipOrderAction (custom)", {
      orderId,
      uid: user.uid,
      carrier: data.shippingCarrier,
    });
    return { orderId, method: "custom" };
  }

  // ── Shiprocket ──
  const shippingConfig = userDoc.shippingConfig;
  if (!shippingConfig?.isConfigured)
    throw new ValidationError("Shipping is not configured");
  if (shippingConfig.method !== "shiprocket")
    throw new ValidationError("Shipping method mismatch");
  if (!shippingConfig.pickupAddress?.isVerified)
    throw new ValidationError("Pickup address not verified");
  const token = shippingConfig.shiprocketToken;
  if (!token || isShiprocketTokenExpired(shippingConfig.shiprocketTokenExpiry))
    throw new ValidationError(
      "Shiprocket token is missing or expired. Please reconnect.",
    );

  const rawAddr = order.shippingAddress ?? "";
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

  const srOrderResponse = await shiprocketCreateOrder(token, {
    order_id: orderId,
    order_date: (resolveDate(order.createdAt) ?? new Date())
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

  serverLogger.info("shipOrderAction (shiprocket)", {
    orderId,
    uid: user.uid,
    awb,
  });
  return {
    orderId,
    method: "shiprocket",
    awb,
    trackingUrl,
    pickupScheduledDate: pickupResponse.pickup_scheduled_date,
  };
}

// ─── Update Seller Shipping ───────────────────────────────────────────────────

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
    shiprocketCredentials: z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .optional(),
    pickupAddress: pickupAddressSchema.optional(),
  }),
]);

export async function updateSellerShippingAction(
  input: z.infer<typeof updateShippingSchema>,
): Promise<{
  shippingConfig: Omit<
    SellerShippingConfig,
    "shiprocketToken" | "shiprocketTokenExpiry"
  > & { isTokenValid?: boolean };
  otpPending: boolean;
  pickupLocationId?: number;
}> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `update-shipping:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = updateShippingSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const userDoc = await userRepository.findById(user.uid);
  if (!userDoc) throw new AuthorizationError("User not found");

  const data = parsed.data;
  let config: SellerShippingConfig;
  let otpPending = false;
  let newPickupLocationId: number | undefined;

  if (data.method === "custom") {
    config = {
      method: "custom",
      customShippingPrice: data.customShippingPrice,
      customCarrierName: data.customCarrierName,
      isConfigured: true,
    };
  } else {
    const existing = userDoc.shippingConfig;
    let token = existing?.shiprocketToken;
    let tokenExpiry = existing?.shiprocketTokenExpiry;
    const existingEmail = existing?.shiprocketEmail;

    if (
      data.shiprocketCredentials ||
      !token ||
      (tokenExpiry && new Date() >= new Date(tokenExpiry))
    ) {
      if (!data.shiprocketCredentials)
        throw new ValidationError(
          "Shiprocket credentials are required to reconnect",
        );

      const authResult = await shiprocketAuthenticate({
        email: data.shiprocketCredentials.email,
        password: data.shiprocketCredentials.password,
      }).catch((err: Error) => {
        throw new ValidationError(`Shiprocket auth failed: ${err.message}`);
      });

      token = authResult.token;
      tokenExpiry = new Date(Date.now() + SHIPROCKET_TOKEN_TTL_MS);
    }

    const shiprocketEmail =
      data.shiprocketCredentials?.email ?? existingEmail ?? "";
    config = {
      method: "shiprocket",
      shiprocketEmail,
      shiprocketToken: token,
      shiprocketTokenExpiry: tokenExpiry,
      pickupAddress: existing?.pickupAddress,
      isConfigured: Boolean(existing?.pickupAddress?.isVerified),
    };

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
      }).catch((err: Error) => {
        throw new ValidationError(
          `Failed to add pickup address: ${err.message}`,
        );
      });

      newPickupLocationId = pickupResult.address?.pickup_location_id;
      otpPending = true;
      config.pickupAddress = {
        ...data.pickupAddress,
        isVerified: false,
        shiprocketAddressId: newPickupLocationId,
      };
      config.isConfigured = false;
    }
  }

  await userRepository.update(user.uid, { shippingConfig: config });
  serverLogger.info("updateSellerShippingAction", {
    uid: user.uid,
    method: config.method,
    otpPending,
  });

  const {
    shiprocketToken: _t,
    shiprocketTokenExpiry: _e,
    ...safeConfig
  } = config as any;
  return {
    shippingConfig: {
      ...safeConfig,
      isTokenValid: Boolean(
        (config as any).shiprocketToken &&
        !isShiprocketTokenExpired((config as any).shiprocketTokenExpiry),
      ),
    },
    otpPending,
    pickupLocationId: newPickupLocationId,
  };
}

// ─── Verify Shiprocket Pickup OTP ─────────────────────────────────────────────

export async function verifyShiprocketPickupOtpAction(input: {
  otp: number;
  pickupLocationId: number;
}): Promise<{ message: string }> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `verify-pickup-otp:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = z
    .object({
      otp: z.number().int().min(100000).max(999999),
      pickupLocationId: z.number().int().positive(),
    })
    .safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const userDoc = await userRepository.findById(user.uid);
  if (!userDoc) throw new AuthorizationError("User not found");

  const config = userDoc.shippingConfig;
  if (!config || config.method !== "shiprocket")
    throw new ValidationError("Shiprocket shipping is not configured");
  if (!config.shiprocketToken)
    throw new ValidationError("Shiprocket token is missing. Please reconnect.");

  const result = await shiprocketVerifyPickupOTP(config.shiprocketToken, {
    otp: parsed.data.otp,
    pickup_location_id: parsed.data.pickupLocationId,
  }).catch((err: Error) => {
    throw new ValidationError(`Pickup verification failed: ${err.message}`);
  });

  if (!result.success)
    throw new ValidationError(
      result.message || "Pickup OTP verification failed",
    );

  const updatedConfig = {
    ...config,
    pickupAddress: config.pickupAddress
      ? {
          ...config.pickupAddress,
          isVerified: true,
          shiprocketAddressId: parsed.data.pickupLocationId,
        }
      : undefined,
    isConfigured: true,
  };
  await userRepository.update(user.uid, { shippingConfig: updatedConfig });
  serverLogger.info("verifyShiprocketPickupOtpAction", {
    uid: user.uid,
    pickupLocationId: parsed.data.pickupLocationId,
  });
  return { message: "Pickup address verified successfully" };
}
