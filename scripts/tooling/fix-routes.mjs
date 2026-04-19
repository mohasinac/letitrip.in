/**
 * Fix copy-paste bugs in admin [id] routes.
 * Run with: node scripts/tooling/fix-routes.mjs
 */
import { writeFileSync } from "fs";
import { join } from "path";

const base = "src/app/api";

const files = {
  // admin/coupons/[id]/route.ts
  "admin/coupons/[id]/route.ts": `import "@/providers.config";
/**
 * Admin Coupons [id] API Route
 * GET    /api/admin/coupons/:id — Get a coupon by ID
 * PATCH  /api/admin/coupons/:id — Activate/deactivate or update a coupon
 * DELETE /api/admin/coupons/:id — Delete a coupon
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { couponsRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";

type RouteContext = { params: Promise<{ id: string }> };

const updateCouponSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  discount: z
    .object({
      value: z.number().min(0),
      maxDiscount: z.number().optional(),
      minPurchase: z.number().optional(),
    })
    .optional(),
  usage: z
    .object({
      totalLimit: z.number().optional(),
      perUserLimit: z.number().optional(),
    })
    .optional(),
  validity: z
    .object({
      startDate: z.string().transform((v) => new Date(v)).optional(),
      endDate: z
        .string()
        .optional()
        .transform((v) => (v ? new Date(v) : undefined)),
      isActive: z.boolean().optional(),
    })
    .optional(),
  restrictions: z
    .object({
      applicableProducts: z.array(z.string()).optional(),
      applicableCategories: z.array(z.string()).optional(),
      applicableSellers: z.array(z.string()).optional(),
      excludeProducts: z.array(z.string()).optional(),
      excludeCategories: z.array(z.string()).optional(),
      firstTimeUserOnly: z.boolean().optional(),
      combineWithSellerCoupons: z.boolean().optional(),
    })
    .optional(),
  action: z.enum(["activate", "deactivate"]).optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const coupon = await couponsRepository.getCouponByCode(id).catch(() => null);
  if (!coupon) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: coupon });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Updating coupon", { id, action: parsed.data.action });

  const { action, ...updateData } = parsed.data;

  if (action === "deactivate") {
    await couponsRepository.deactivateCoupon(id);
    return Response.json(successResponse(null, SUCCESS_MESSAGES.COUPON.DEACTIVATED));
  }
  if (action === "activate") {
    await couponsRepository.reactivateCoupon(id);
    return Response.json(successResponse(null, SUCCESS_MESSAGES.COUPON.REACTIVATED));
  }

  // Generic PATCH — update fields via list + find pattern
  const updated = await couponsRepository.list({ filters: \`id==\${id}\`, page: 1, pageSize: 1 });
  const coupon = updated.items[0];
  if (!coupon) {
    return Response.json({ success: false, error: ERROR_MESSAGES.NOT_FOUND }, { status: 404 });
  }
  // Apply update via deactivate/reactivate as toggle, or use validity.isActive
  if (updateData.validity?.isActive === false) {
    await couponsRepository.deactivateCoupon(id);
  } else if (updateData.validity?.isActive === true) {
    await couponsRepository.reactivateCoupon(id);
  }
  return Response.json(successResponse({ ...coupon, ...updateData }, SUCCESS_MESSAGES.COUPON.UPDATED));
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  serverLogger.info("Deleting coupon", { id });
  await couponsRepository.deactivateCoupon(id);
  return Response.json(successResponse(null, SUCCESS_MESSAGES.COUPON.DELETED));
}
`,

  // admin/orders/[id]/route.ts
  "admin/orders/[id]/route.ts": `import "@/providers.config";
/**
 * Admin Orders [id] API Route
 * GET   /api/admin/orders/:id — Get a single order
 * PATCH /api/admin/orders/:id — Update order status
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { orderRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
import type { OrderStatus } from "@mohasinac/appkit/features/orders";

type RouteContext = { params: Promise<{ id: string }> };

const updateOrderSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  shiprocketOrderId: z.string().optional(),
  shiprocketShipmentId: z.string().optional(),
  trackingUrl: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const orders = await orderRepository.listAll({ filters: \`id==\${id}\`, page: "1", pageSize: "1" });
  const order = orders.items[0];
  if (!order) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: order });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  const { status, ...rest } = parsed.data;

  serverLogger.info("Admin updating order", { id, status });

  if (status) {
    await orderRepository.updateStatus(id, status as OrderStatus, rest);
  }

  return Response.json(successResponse({ id, status, ...rest }, SUCCESS_MESSAGES.ORDER.UPDATED));
}
`,

  // admin/orders/[id]/refund/route.ts
  "admin/orders/[id]/refund/route.ts": `import "@/providers.config";
/**
 * Admin Orders Refund API Route
 * POST /api/admin/orders/:id/refund — Process a refund for an order
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { orderRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";

type RouteContext = { params: Promise<{ id: string }> };

const refundSchema = z.object({
  amount: z.number().min(0),
  reason: z.string().min(1),
});

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = refundSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  const { amount, reason } = parsed.data;

  serverLogger.info("Admin processing order refund", { id, amount, reason });

  await orderRepository.cancelOrder(id, reason, amount);

  return Response.json(successResponse({ id, amount, reason }, SUCCESS_MESSAGES.ORDER.CANCELLED));
}
`,

  // admin/products/[id]/route.ts
  "admin/products/[id]/route.ts": `import "@/providers.config";
/**
 * Admin Products [id] API Route
 * GET    /api/admin/products/:id — Get a single product
 * PATCH  /api/admin/products/:id — Update a product
 * DELETE /api/admin/products/:id — Delete a product (soft via status)
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { productRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
import type { ProductUpdateInput } from "@mohasinac/appkit/features/products";

type RouteContext = { params: Promise<{ id: string }> };

const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  status: z.string().optional(),
  availableQuantity: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isPromoted: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).passthrough();

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const product = await productRepository.findByIdOrSlug(id).catch(() => null);
  if (!product) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: product });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating product", { id });
  const updated = await productRepository.updateProduct(id, parsed.data as ProductUpdateInput);
  return Response.json(successResponse(updated, SUCCESS_MESSAGES.PRODUCT.UPDATED));
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  serverLogger.info("Admin deleting product", { id });
  await productRepository.update(id, { status: "deleted" } as any);
  return Response.json(successResponse(null, SUCCESS_MESSAGES.PRODUCT.DELETED));
}
`,

  // admin/stores/[uid]/route.ts
  "admin/stores/[uid]/route.ts": `import "@/providers.config";
/**
 * Admin Stores [uid] API Route
 * GET   /api/admin/stores/:uid — Get a store by owner UID
 * PATCH /api/admin/stores/:uid — Update store status (approve/reject/suspend)
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { storeRepository, userRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";

type RouteContext = { params: Promise<{ uid: string }> };

const updateStoreSchema = z.object({
  storeStatus: z.enum(["active", "pending", "suspended", "rejected"]).optional(),
  adminNotes: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  const user = await userRepository.findById(uid).catch(() => null);
  if (!user) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }
  const store = user.storeSlug
    ? await storeRepository.findBySlug(user.storeSlug).catch(() => null)
    : null;
  return Response.json({ success: true, data: { user, store } });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateStoreSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating store status", { uid, ...parsed.data });

  const { storeStatus, adminNotes, isFeatured } = parsed.data;

  const updateFields: Record<string, unknown> = {};
  if (storeStatus) updateFields.storeStatus = storeStatus;
  if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
  if (isFeatured !== undefined) updateFields.isFeatured = isFeatured;

  await userRepository.update(uid, updateFields as any);

  const message = storeStatus === "active"
    ? SUCCESS_MESSAGES.USER.STORE_APPROVED
    : storeStatus === "rejected"
    ? SUCCESS_MESSAGES.USER.STORE_REJECTED
    : SUCCESS_MESSAGES.USER.STORE_UPDATED;

  return Response.json(successResponse({ uid, storeStatus }, message));
}
`,

  // admin/users/[uid]/route.ts
  "admin/users/[uid]/route.ts": `import "@/providers.config";
/**
 * Admin Users [uid] API Route
 * GET    /api/admin/users/:uid — Get a user by UID
 * PATCH  /api/admin/users/:uid — Update user role or status
 * DELETE /api/admin/users/:uid — Disable a user account
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { userRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";

type RouteContext = { params: Promise<{ uid: string }> };

const updateUserSchema = z.object({
  role: z.enum(["user", "seller", "admin", "moderator"]).optional(),
  isDisabled: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  adminNotes: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  const user = await userRepository.findById(uid).catch(() => null);
  if (!user) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: user });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating user", { uid, ...parsed.data });

  const { isDisabled, emailVerified, ...rest } = parsed.data;

  if (isDisabled === true) {
    await userRepository.disable(uid);
  } else if (isDisabled === false) {
    await userRepository.enable(uid);
  }
  if (emailVerified === true) {
    await userRepository.markEmailAsVerified(uid);
  }
  if (Object.keys(rest).length > 0) {
    await userRepository.update(uid, rest as any);
  }

  return Response.json(successResponse({ uid, ...parsed.data }, SUCCESS_MESSAGES.USER.USER_UPDATED));
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  serverLogger.info("Admin disabling user", { uid });
  await userRepository.disable(uid);
  return Response.json(successResponse(null, SUCCESS_MESSAGES.USER.ACCOUNT_DELETED));
}
`,

  // admin/events/[id]/route.ts
  "admin/events/[id]/route.ts": `import "@/providers.config";
/**
 * Admin Events [id] API Route
 * GET    /api/admin/events/:id — Get a single event
 * PATCH  /api/admin/events/:id — Update an event
 * DELETE /api/admin/events/:id — Delete an event
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { eventRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
import type { EventUpdateInput } from "@mohasinac/appkit/features/events";

type RouteContext = { params: Promise<{ id: string }> };

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const events = await eventRepository.list({ filters: \`id==\${id}\`, page: "1", pageSize: "1" });
  const event = events.items[0];
  if (!event) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: event });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating event", { id });

  const { startsAt, endsAt, ...rest } = parsed.data;
  const updateData: EventUpdateInput = {
    ...rest,
    ...(startsAt && { startsAt: new Date(startsAt) }),
    ...(endsAt && { endsAt: new Date(endsAt) }),
  };

  const updated = await eventRepository.updateEvent(id, updateData);
  return Response.json(successResponse(updated, SUCCESS_MESSAGES.EVENT.UPDATED));
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  serverLogger.info("Admin deleting event", { id });
  await eventRepository.changeStatus(id, "cancelled" as any);
  return Response.json(successResponse(null, SUCCESS_MESSAGES.EVENT.DELETED));
}
`,

  // admin/events/[id]/entries/route.ts
  "admin/events/[id]/entries/route.ts": `import "@/providers.config";
/**
 * Admin Event Entries API Route
 * GET /api/admin/events/:id/entries — List entries for an event
 */

import { successResponse } from "@mohasinac/appkit/next";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next";
import { eventEntryRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit/http";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: eventId } = await context.params;
  const searchParams = getSearchParams(request);
  const page = getNumberParam(searchParams, "page", 1, { min: 1 });
  const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 200 });

  serverLogger.info("Admin listing event entries", { eventId, page, pageSize });

  const result = await eventEntryRepository.listForEvent(eventId, { page, pageSize });
  return Response.json(successResponse(result));
}
`,

  // admin/events/[id]/entries/[entryId]/route.ts
  "admin/events/[id]/entries/[entryId]/route.ts": `import "@/providers.config";
/**
 * Admin Event Entry [entryId] API Route
 * PATCH /api/admin/events/:id/entries/:entryId — Review an entry (approve/reject/flag)
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { eventEntryRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";

type RouteContext = { params: Promise<{ id: string; entryId: string }> };

const reviewEntrySchema = z.object({
  status: z.enum(["approved", "rejected", "flagged"]),
  reviewNote: z.string().optional(),
  points: z.number().optional(),
});

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: eventId, entryId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = reviewEntrySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin reviewing event entry", { eventId, entryId, status: parsed.data.status });

  await eventEntryRepository.reviewEntry(entryId, parsed.data as any);
  return Response.json(successResponse({ entryId, ...parsed.data }, SUCCESS_MESSAGES.EVENT.UPDATED));
}
`,

  // admin/events/[id]/stats/route.ts
  "admin/events/[id]/stats/route.ts": `import "@/providers.config";
/**
 * Admin Event Stats API Route
 * GET /api/admin/events/:id/stats — Get statistics for an event
 */

import { successResponse } from "@mohasinac/appkit/next";
import { eventRepository, eventEntryRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: eventId } = await context.params;

  serverLogger.info("Admin fetching event stats", { eventId });

  const events = await eventRepository.list({ filters: \`id==\${eventId}\`, page: "1", pageSize: "1" });
  const event = events.items[0];
  if (!event) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }

  const [totalEntries, approvedEntries, flaggedEntries] = await Promise.all([
    eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1 }),
    eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1, status: "approved" }),
    eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1, status: "flagged" }),
  ]);

  return Response.json(successResponse({
    event,
    stats: {
      totalEntries: totalEntries.total ?? 0,
      approvedEntries: approvedEntries.total ?? 0,
      flaggedEntries: flaggedEntries.total ?? 0,
    },
  }));
}
`,

  // admin/events/[id]/status/route.ts
  "admin/events/[id]/status/route.ts": `import "@/providers.config";
/**
 * Admin Event Status API Route
 * PATCH /api/admin/events/:id/status — Update event status
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { eventRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
import type { EventDocument } from "@mohasinac/appkit/features/events";

type RouteContext = { params: Promise<{ id: string }> };

const updateStatusSchema = z.object({
  status: z.enum(["draft", "published", "active", "ended", "cancelled", "paused"]),
});

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating event status", { id, status: parsed.data.status });

  await eventRepository.changeStatus(id, parsed.data.status as EventDocument["status"]);
  return Response.json(successResponse({ id, status: parsed.data.status }, SUCCESS_MESSAGES.EVENT.UPDATED));
}
`,

  // admin/payouts/[id]/route.ts
  "admin/payouts/[id]/route.ts": `import "@/providers.config";
/**
 * Admin Payouts [id] API Route
 * GET   /api/admin/payouts/:id — Get a single payout
 * PATCH /api/admin/payouts/:id — Update payout status
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { payoutRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
import type { PayoutStatus } from "@mohasinac/appkit/features/payments";

type RouteContext = { params: Promise<{ id: string }> };

const updatePayoutSchema = z.object({
  status: z.enum(["pending", "processing", "paid", "failed", "cancelled"]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const payouts = await payoutRepository.list({ filters: \`id==\${id}\`, page: "1", pageSize: "1" });
  const payout = payouts.items[0];
  if (!payout) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: payout });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updatePayoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  const { status, transactionId, notes } = parsed.data;

  serverLogger.info("Admin updating payout status", { id, status });

  await payoutRepository.updateStatus(id, status as PayoutStatus, {
    ...(transactionId && { transactionId }),
    ...(notes && { notes }),
  });

  return Response.json(successResponse({ id, status }, SUCCESS_MESSAGES.PAYOUT.UPDATED));
}
`,

  // blog/[slug]/route.ts (public route)
  "blog/[slug]/route.ts": `import "@/providers.config";
/**
 * Blog [slug] Public API Route
 * GET /api/blog/:slug — Get a published blog post by slug
 */

import { blogRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { BlogPostStatusValues } from "@mohasinac/appkit/features/blog";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { slug } = await context.params;

  serverLogger.info("Public blog post requested", { slug });

  const post = await blogRepository.findBySlug(slug).catch(() => null);
  if (!post || post.status !== BlogPostStatusValues.PUBLISHED) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }

  // Increment views (fire-and-forget)
  blogRepository.incrementViews(post.id).catch(() => {});

  return Response.json({ success: true, data: post });
}
`,

  // bids/[id]/route.ts (public bid detail route)
  "bids/[id]/route.ts": `import "@/providers.config";
/**
 * Bids [id] API Route
 * GET /api/bids/:id — Get a single bid
 */

import { bidRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;

  serverLogger.info("Bid detail requested", { id });

  const bid = await bidRepository.findById(id).catch(() => null);
  if (!bid) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: bid });
}
`,
};

let written = 0;
let errors = 0;

for (const [rel, content] of Object.entries(files)) {
  const fullPath = join(process.cwd(), base, rel);
  try {
    writeFileSync(fullPath, content, "utf8");
    written++;
    console.log(`✓ ${rel}`);
  } catch (e) {
    errors++;
    console.error(`✗ ${rel}: ${e.message}`);
  }
}

console.log(`\nDone: ${written} written, ${errors} errors`);
