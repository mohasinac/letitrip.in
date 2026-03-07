/**
 * GET  /api/seller/store
 * PATCH /api/seller/store
 *
 * Get and update the authenticated seller's store profile.
 * Store data is embedded in the UserDocument.publicProfile + storeSlug fields.
 */

import { z } from "zod";
import { userRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { slugify } from "@/utils";

// ─── GET ─────────────────────────────────────────────────────────────────────

export const GET = createApiHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }) => {
    return successResponse({
      uid: user!.uid,
      storeSlug: user!.storeSlug ?? null,
      storeStatus: user!.storeStatus ?? "pending",
      publicProfile: user!.publicProfile ?? null,
    });
  },
});

// ─── PATCH ────────────────────────────────────────────────────────────────────

const updateStoreSchema = z.object({
  storeName: z.string().min(2).max(80).optional(),
  storeDescription: z.string().max(500).optional().or(z.literal("")),
  storeCategory: z.string().max(80).optional().or(z.literal("")),
  storeLogoURL: z.string().url().optional().or(z.literal("")),
  storeBannerURL: z.string().url().optional().or(z.literal("")),
  storeReturnPolicy: z.string().max(2000).optional().or(z.literal("")),
  storeShippingPolicy: z.string().max(2000).optional().or(z.literal("")),
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

export const PATCH = createApiHandler<(typeof updateStoreSchema)["_output"]>({
  auth: true,
  roles: ["seller", "admin"],
  schema: updateStoreSchema,
  handler: async ({ user, body }) => {
    const {
      storeName,
      storeDescription,
      storeCategory,
      storeLogoURL,
      storeBannerURL,
      storeReturnPolicy,
      storeShippingPolicy,
      bio,
      website,
      location,
      socialLinks,
      isVacationMode,
      vacationMessage,
      isPublic,
    } = body!;

    // Merge incoming fields into existing publicProfile (preserve unrelated fields)
    const existing = user!.publicProfile ?? {
      isPublic: true,
      showEmail: false,
      showPhone: false,
      showOrders: true,
      showWishlist: true,
    };

    const updatedProfile = {
      ...existing,
      ...(storeName !== undefined && { storeName }),
      ...(storeDescription !== undefined && { storeDescription }),
      ...(storeCategory !== undefined && { storeCategory }),
      ...(storeLogoURL !== undefined && { storeLogoURL }),
      ...(storeBannerURL !== undefined && { storeBannerURL }),
      ...(storeReturnPolicy !== undefined && { storeReturnPolicy }),
      ...(storeShippingPolicy !== undefined && { storeShippingPolicy }),
      ...(bio !== undefined && { bio }),
      ...(website !== undefined && { website }),
      ...(location !== undefined && { location }),
      ...(socialLinks !== undefined && {
        socialLinks: { ...existing.socialLinks, ...socialLinks },
      }),
      ...(isVacationMode !== undefined && { isVacationMode }),
      ...(vacationMessage !== undefined && { vacationMessage }),
      ...(isPublic !== undefined && { isPublic }),
    };

    // Regenerate storeSlug when storeName changes and no slug exists yet
    let newStoreSlug = user!.storeSlug;
    if (storeName && !user!.storeSlug) {
      const base = slugify(`${storeName} ${user!.displayName ?? user!.uid}`);
      newStoreSlug = `store-${base}`.slice(0, 80);
    }

    // Mark store as pending admin review if not already approved —
    // approval status can only be set by an admin via /api/admin/stores/[uid]
    const storeStatusUpdate =
      user!.storeStatus !== "approved"
        ? { storeStatus: "pending" as const }
        : {};

    const updatedUser = await userRepository.update(user!.uid, {
      publicProfile: updatedProfile,
      ...(newStoreSlug ? { storeSlug: newStoreSlug } : {}),
      ...storeStatusUpdate,
    } as any);

    serverLogger.info("Seller store updated", {
      uid: user!.uid,
      storeSlug: newStoreSlug,
    });

    return successResponse(
      {
        uid: updatedUser.uid,
        storeSlug: updatedUser.storeSlug ?? null,
        publicProfile: updatedUser.publicProfile ?? null,
      },
      SUCCESS_MESSAGES.USER.STORE_UPDATED,
    );
  },
});
