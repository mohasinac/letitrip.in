"use server";

import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import { isListingTypeEnabled } from "@mohasinac/appkit";
import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
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
import { requireRoleUser } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { revokeSession as revokeSessionDomain, revokeUserSessions as revokeUserSessionsDomain, adminUpdateOrder as adminUpdateOrderDomain, adminUpdatePayout as adminUpdatePayoutDomain, adminUpdateUser as adminUpdateUserDomain, adminDeleteUser as adminDeleteUserDomain, adminUpdateStoreStatus as adminUpdateStoreStatusDomain, adminUpdateProduct as adminUpdateProductDomain, adminCreateProduct as adminCreateProductDomain, adminDeleteProduct as adminDeleteProductDomain } from "@mohasinac/appkit/features/admin/actions/admin-actions";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { AuthorizationError } from "@mohasinac/appkit/errors/authorization-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import type { OrderDocument, OrderAdminUpdateInput } from "@mohasinac/appkit/features/orders/schemas/firestore";
import type { PayoutDocument, PayoutUpdateInput } from "@mohasinac/appkit/features/payments/schemas/firestore";
import type { UserDocument, UserAdminUpdateInput } from "@mohasinac/appkit/features/auth/schemas/firestore";
import type { ProductDocument, ProductAdminUpdateInput } from "@mohasinac/appkit/features/products/schemas/firestore";
import {
  validateRequestBody,
  productCreateSchema,
} from "@/validation/request-schemas";
import { ERR_RATE_LIMIT, ERR_INVALID_UPDATE } from "./_constants";
/*
 * 🛑 Built from appkit's VALUES object, not by importing its zod schema.
 *
 * A zod schema cannot cross the version boundary: the consumer root is on
 * zod 4, appkit depends on zod 3, and embedding a zod-3 schema in a consumer
 * `z.object({...})` does not merely mistype — zod 4 THROWS at parse time
 * ("Invalid element at key ...: expected a Zod schema"), so every call to the
 * enclosing action failed. The values object is a plain JS object with no zod
 * in it, so it is the one thing that CAN be shared; zod 4's `z.enum()`
 * accepts it directly, and it stays the single source of truth.
 */
import { PayoutStatusValues } from "@mohasinac/appkit/features/payments/schemas/firestore";
import { StoreStatusValues } from "@mohasinac/appkit/features/stores/schemas/firestore";
import { USER_ROLE } from "@/constants";
const payoutStatusSchema = z.enum(PayoutStatusValues);
const storeStatusSchema = z.enum(StoreStatusValues);
const userRoleSchema = z.enum(USER_ROLE);

// --- Schemas --------------------------------------------------------------

const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

const revokeUserSessionsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

// --- Server Actions --------------------------------------------------------

/**
 * Revoke a single session (admin only).
 */
export async function revokeSessionAction(
  input: z.infer<typeof revokeSessionSchema>,
): Promise<ActionResult<{ success: true; message: string }>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin", "moderator"]);
    
      const rl = await rateLimitByIdentifier(
        `revoke-session:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const parsed = revokeSessionSchema.safeParse(input);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid input",
        );
      }
    
      const { sessionId } = parsed.data;
      return revokeSessionDomain(admin.uid, sessionId);
  });
}

/**
 * Revoke all sessions for a user (admin only).
 */
export async function revokeUserSessionsAction(
  input: z.infer<typeof revokeUserSessionsSchema>,
): Promise<ActionResult<{ success: true; message: string; revokedCount: number }>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin", "moderator"]);
    
      const rl = await rateLimitByIdentifier(
        `revoke-user-sessions:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const parsed = revokeUserSessionsSchema.safeParse(input);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid input",
        );
      }
    
      const { userId } = parsed.data;
      return revokeUserSessionsDomain(admin.uid, userId);
  });
}

// --- Order mutations -------------------------------------------------------

const orderUpdateSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function adminUpdateOrderAction(
  id: string,
  input: z.infer<typeof orderUpdateSchema>,
): Promise<ActionResult<OrderDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin", "moderator"]);
    
      const rl = await rateLimitByIdentifier(
        `order:update:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      if (!id?.trim()) throw new ValidationError("id is required");
    
      const parsed = orderUpdateSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE,
        );
    
      return adminUpdateOrderDomain(
        admin.uid,
        id,
        parsed.data as OrderAdminUpdateInput,
      );
  });
}

// --- Payout mutations ------------------------------------------------------

const payoutUpdateSchema = z.object({
  status: payoutStatusSchema.optional(),
  adminNote: z.string().optional(),
  processedAt: z.string().optional(), // ISO date string
});

export async function adminUpdatePayoutAction(
  id: string,
  input: z.infer<typeof payoutUpdateSchema>,
): Promise<ActionResult<PayoutDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
    
      const rl = await rateLimitByIdentifier(
        `payout:update:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      if (!id?.trim()) throw new ValidationError("id is required");
    
      const parsed = payoutUpdateSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE,
        );
    
      return adminUpdatePayoutDomain(
        admin.uid,
        id,
        parsed.data as PayoutUpdateInput,
      );
  });
}

// --- User mutations -------------------------------------------------------

const userUpdateSchema = z.object({
  role: userRoleSchema.optional(),
  disabled: z.boolean().optional(),
  storeStatus: storeStatusSchema.optional(),
});

export async function adminUpdateUserAction(
  uid: string,
  input: z.infer<typeof userUpdateSchema>,
): Promise<ActionResult<UserDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
    
      const rl = await rateLimitByIdentifier(
        `user:update:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      if (!uid?.trim()) throw new ValidationError("uid is required");
    
      const parsed = userUpdateSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE,
        );
    
      return adminUpdateUserDomain(admin.uid, uid, parsed.data as UserAdminUpdateInput);
  });
}

export async function adminDeleteUserAction(uid: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `user:delete:${admin.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError(ERR_RATE_LIMIT);

  if (!uid?.trim()) throw new ValidationError("uid is required");
  if (uid === admin.uid)
    throw new ValidationError("Cannot delete your own account");

  await adminDeleteUserDomain(admin.uid, uid);
}

// --- Store approval mutations ---------------------------------------------

const storeApprovalSchema = z.object({
  uid: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function adminUpdateStoreStatusAction(
  input: z.infer<typeof storeApprovalSchema>,
): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `store:status:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError(ERR_RATE_LIMIT);

  const parsed = storeApprovalSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const { uid, action } = parsed.data;

  await adminUpdateStoreStatusDomain(admin.uid, { uid, action });
}

// --- Product mutations (admin override) ----------------------------------

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
): Promise<ActionResult<ProductDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin", "moderator"]);
    
      const rl = await rateLimitByIdentifier(
        `product:update:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      if (!id?.trim()) throw new ValidationError("id is required");
    
      const parsed = productAdminUpdateSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE,
        );
    
      return adminUpdateProductDomain(
        admin.uid,
        id,
        parsed.data as ProductAdminUpdateInput,
      );
  });
}

export async function adminCreateProductAction(
  input: unknown,
): Promise<ActionResult<ProductDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
    
      const rl = await rateLimitByIdentifier(
        `product:create:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      // Delegate product creation to repository with validation
      const validation = validateRequestBody(productCreateSchema, input);
      if (!validation.success) {
        throw new ValidationError("Invalid product data");
      }

      // P-10 — prize-draw listings require legal sign-off before going live.
      // Gated by the listing-type control an admin can see, not by the deleted
      // FEATURE_PRIZE_DRAWS env flag. Same switch that hides the type everywhere else.
      if (
        validation.data.listingType === "prize-draw" &&
        !isListingTypeEnabled("prize-draw", await siteSettingsRepository.getSingleton())
      ) {
        throw new AuthorizationError("Prize draw listings are not currently enabled.");
      }

      return adminCreateProductDomain(admin, {
        ...validation.data,
        sellerId: (input as any).sellerId || admin.uid,
        sellerName:
          (input as any).sellerName || admin.name || admin.email || "Admin",
        sellerEmail: (input as any).sellerEmail || admin.email || "",
      } as any);
  });
}

export async function adminDeleteProductAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `product:delete:${admin.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError(ERR_RATE_LIMIT);

  if (!id?.trim()) throw new ValidationError("id is required");

  await adminDeleteProductDomain(admin.uid, id);
}

