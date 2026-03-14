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
import { requireRole } from "@/lib/firebase/auth-server";
import {
  sessionRepository,
  orderRepository,
  payoutRepository,
  userRepository,
  productRepository,
} from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
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
  const admin = await requireRole(["admin", "moderator"]);

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
  const session = await sessionRepository.findById(sessionId);
  if (!session) throw new NotFoundError("Session not found");

  await sessionRepository.revokeSession(sessionId, admin.uid);

  serverLogger.info("revokeSessionAction", {
    adminId: admin.uid,
    sessionId,
    targetUserId: session.userId,
  });

  return { success: true, message: "Session revoked" };
}

/**
 * Revoke all sessions for a user (admin only).
 */
export async function revokeUserSessionsAction(
  input: z.infer<typeof revokeUserSessionsSchema>,
): Promise<{ success: true; message: string; revokedCount: number }> {
  const admin = await requireRole(["admin", "moderator"]);

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
  const revokedCount = await sessionRepository.revokeAllUserSessions(
    userId,
    admin.uid,
  );

  serverLogger.info("revokeUserSessionsAction", {
    adminId: admin.uid,
    targetUserId: userId,
    revokedCount,
  });

  return { success: true, message: "All user sessions revoked", revokedCount };
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
  const admin = await requireRole(["admin", "moderator"]);

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

  const existing = await orderRepository.findById(id);
  if (!existing) throw new NotFoundError("Order not found");

  const updated = await orderRepository.update(
    id,
    parsed.data as OrderAdminUpdateInput,
  );

  serverLogger.info("adminUpdateOrderAction", {
    adminId: admin.uid,
    orderId: id,
  });
  return updated;
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
  const admin = await requireRole(["admin"]);

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

  const existing = await payoutRepository.findById(id);
  if (!existing) throw new NotFoundError("Payout not found");

  const updateData: PayoutUpdateInput = {
    ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
    ...(parsed.data.adminNote !== undefined
      ? { adminNote: parsed.data.adminNote }
      : {}),
    ...(parsed.data.processedAt
      ? { processedAt: new Date(parsed.data.processedAt) }
      : {}),
  };

  const updated = await payoutRepository.update(id, updateData);

  serverLogger.info("adminUpdatePayoutAction", {
    adminId: admin.uid,
    payoutId: id,
  });
  return updated;
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
  const admin = await requireRole(["admin"]);

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

  const existing = await userRepository.findById(uid);
  if (!existing) throw new NotFoundError("User not found");

  const updated = await userRepository.update(
    uid,
    parsed.data as UserAdminUpdateInput,
  );

  serverLogger.info("adminUpdateUserAction", {
    adminId: admin.uid,
    targetUid: uid,
    changes: Object.keys(parsed.data),
  });
  return updated;
}

export async function adminDeleteUserAction(uid: string): Promise<void> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `user:delete:${admin.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!uid?.trim()) throw new ValidationError("uid is required");
  if (uid === admin.uid)
    throw new ValidationError("Cannot delete your own account");

  const existing = await userRepository.findById(uid);
  if (!existing) throw new NotFoundError("User not found");

  await userRepository.delete(uid);

  serverLogger.info("adminDeleteUserAction", {
    adminId: admin.uid,
    deletedUid: uid,
  });
}

// ─── Store approval mutations ─────────────────────────────────────────────

const storeStatusSchema = z.object({
  uid: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function adminUpdateStoreStatusAction(
  input: z.infer<typeof storeStatusSchema>,
): Promise<void> {
  const admin = await requireRole(["admin"]);

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

  // Update user's storeStatus
  const user = await userRepository.findById(uid);
  if (!user) throw new NotFoundError("User not found");

  await userRepository.updateStoreApproval(
    uid,
    newStatus as "approved" | "rejected",
  );

  serverLogger.info("adminUpdateStoreStatusAction", {
    adminId: admin.uid,
    targetUid: uid,
    action,
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
  const admin = await requireRole(["admin", "moderator"]);

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

  const existing = await productRepository.findById(id);
  if (!existing) throw new NotFoundError("Product not found");

  const updated = await productRepository.updateProduct(
    id,
    parsed.data as ProductAdminUpdateInput,
  );

  serverLogger.info("adminUpdateProductAction", {
    adminId: admin.uid,
    productId: id,
  });
  return updated;
}

export async function adminCreateProductAction(
  input: unknown,
): Promise<ProductDocument> {
  const admin = await requireRole(["admin"]);

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

  const product = await productRepository.create({
    ...validation.data,
    sellerId: (input as any).sellerId || admin.uid,
    sellerName:
      (input as any).sellerName || admin.displayName || admin.email || "Admin",
    sellerEmail: (input as any).sellerEmail || admin.email || "",
  } as any);

  serverLogger.info("adminCreateProductAction", {
    adminId: admin.uid,
    productId: product.id,
  });

  return product;
}

export async function adminDeleteProductAction(id: string): Promise<void> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `product:delete:${admin.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id?.trim()) throw new ValidationError("id is required");

  const existing = await productRepository.findById(id);
  if (!existing) throw new NotFoundError("Product not found");

  await productRepository.delete(id);

  serverLogger.info("adminDeleteProductAction", {
    adminId: admin.uid,
    productId: id,
  });
}
