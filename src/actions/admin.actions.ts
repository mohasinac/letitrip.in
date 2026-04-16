"use server";

/**
 * Admin Server Actions — Mutations
 *
 * Admin-only mutations that call repositories directly,
 * bypassing the service → apiClient → API route chain.
 *
 * Read actions live in admin-read.actions.ts.
 * All actions require admin or moderator role.
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  revokeSession as revokeSessionDomain,
  revokeUserSessions as revokeUserSessionsDomain,
  adminUpdateOrder as adminUpdateOrderDomain,
  adminUpdatePayout as adminUpdatePayoutDomain,
  adminUpdateUser as adminUpdateUserDomain,
  adminDeleteUser as adminDeleteUserDomain,
  adminUpdateStoreStatus as adminUpdateStoreStatusDomain,
  adminUpdateProduct as adminUpdateProductDomain,
  adminCreateProduct as adminCreateProductDomain,
  adminDeleteProduct as adminDeleteProductDomain,
} from "@mohasinac/appkit/features/admin";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import type {
  OrderDocument,
  OrderAdminUpdateInput,
  PayoutDocument,
  PayoutUpdateInput,
  UserDocument,
  UserAdminUpdateInput,
  ProductDocument,
  ProductAdminUpdateInput,
} from "@/db/schema";
import {
  validateRequestBody,
  productCreateSchema,
} from "@/lib/validation/schemas";

// ─── Schemas ──────────────────────────────────────────────────────────────

const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

const revokeUserSessionsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

// ─── Server Actions ────────────────────────────────────────────────────────

/**
 * Revoke a single session (admin only).
 */
export async function revokeSessionAction(
  input: z.infer<typeof revokeSessionSchema>,
): Promise<{ success: true; message: string }> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `revoke-session:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = revokeSessionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  const { sessionId } = parsed.data;
  return revokeSessionDomain(admin.uid, sessionId);
}

/**
 * Revoke all sessions for a user (admin only).
 */
export async function revokeUserSessionsAction(
  input: z.infer<typeof revokeUserSessionsSchema>,
): Promise<{ success: true; message: string; revokedCount: number }> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `revoke-user-sessions:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = revokeUserSessionsSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  const { userId } = parsed.data;
  return revokeUserSessionsDomain(admin.uid, userId);
}

// ─── Order mutations ───────────────────────────────────────────────────────

const orderUpdateSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function adminUpdateOrderAction(
  id: string,
  input: z.infer<typeof orderUpdateSchema>,
): Promise<OrderDocument> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `order:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id?.trim()) throw new ValidationError("id is required");

  const parsed = orderUpdateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  return adminUpdateOrderDomain(
    admin.uid,
    id,
    parsed.data as OrderAdminUpdateInput,
  );
}

// ─── Payout mutations ──────────────────────────────────────────────────────

const payoutUpdateSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  adminNote: z.string().optional(),
  processedAt: z.string().optional(), // ISO date string
});

export async function adminUpdatePayoutAction(
  id: string,
  input: z.infer<typeof payoutUpdateSchema>,
): Promise<PayoutDocument> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `payout:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id?.trim()) throw new ValidationError("id is required");

  const parsed = payoutUpdateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  return adminUpdatePayoutDomain(
    admin.uid,
    id,
    parsed.data as PayoutUpdateInput,
  );
}

// ─── User mutations ───────────────────────────────────────────────────────

const userUpdateSchema = z.object({
  role: z.enum(["user", "seller", "admin", "moderator"]).optional(),
  disabled: z.boolean().optional(),
  storeStatus: z.enum(["pending", "approved", "rejected"]).optional(),
});

export async function adminUpdateUserAction(
  uid: string,
  input: z.infer<typeof userUpdateSchema>,
): Promise<UserDocument> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `user:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!uid?.trim()) throw new ValidationError("uid is required");

  const parsed = userUpdateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  return adminUpdateUserDomain(admin.uid, uid, parsed.data as UserAdminUpdateInput);
}

export async function adminDeleteUserAction(uid: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `user:delete:${admin.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!uid?.trim()) throw new ValidationError("uid is required");
  if (uid === admin.uid)
    throw new ValidationError("Cannot delete your own account");

  await adminDeleteUserDomain(admin.uid, uid);
}

// ─── Store approval mutations ─────────────────────────────────────────────

const storeStatusSchema = z.object({
  uid: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function adminUpdateStoreStatusAction(
  input: z.infer<typeof storeStatusSchema>,
): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `store:status:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = storeStatusSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const { uid, action } = parsed.data;
  const newStatus = action === "approve" ? "approved" : "rejected";

  await adminUpdateStoreStatusDomain(admin.uid, {
    uid,
    action: newStatus === "approved" ? "approve" : "reject",
  });
}

// ─── Product mutations (admin override) ──────────────────────────────────

const productAdminUpdateSchema = z.object({
  status: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isPromoted: z.boolean().optional(),
  title: z.string().optional(),
  price: z.number().optional(),
  category: z.string().optional(),
});

export async function adminUpdateProductAction(
  id: string,
  input: z.infer<typeof productAdminUpdateSchema>,
): Promise<ProductDocument> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `product:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id?.trim()) throw new ValidationError("id is required");

  const parsed = productAdminUpdateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  return adminUpdateProductDomain(
    admin.uid,
    id,
    parsed.data as ProductAdminUpdateInput,
  );
}

export async function adminCreateProductAction(
  input: unknown,
): Promise<ProductDocument> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `product:create:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  // Delegate product creation to repository with validation
  const validation = validateRequestBody(productCreateSchema, input);
  if (!validation.success) {
    throw new ValidationError("Invalid product data");
  }

  return adminCreateProductDomain(admin, {
    ...validation.data,
    sellerId: (input as any).sellerId || admin.uid,
    sellerName:
      (input as any).sellerName || admin.name || admin.email || "Admin",
    sellerEmail: (input as any).sellerEmail || admin.email || "",
  } as any);
}

export async function adminDeleteProductAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `product:delete:${admin.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id?.trim()) throw new ValidationError("id is required");

  await adminDeleteProductDomain(admin.uid, id);
}

