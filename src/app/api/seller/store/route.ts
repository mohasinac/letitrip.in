/**
 * GET   /api/seller/store  — Get the authenticated seller's StoreDocument
 * POST  /api/seller/store  — Create the seller's store (first-time setup)
 * PATCH /api/seller/store  — Update an existing store
 *
 * Store data lives in the `stores` Firestore collection as a separate document.
 * UserDocument keeps storeId + storeSlug as indexed convenience fields.
 */

import { z } from "zod";
import { storeRepository, userRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { slugify } from "@/utils";
import { ApiError, NotFoundError } from "@/lib/errors";

// ─── GET ─────────────────────────────────────────────────────────────────────

export const GET = createApiHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    return successResponse({ store: store ?? null });
  },
});

// ─── POST — first-time store creation ────────────────────────────────────────

const createStoreSchema = z.object({
  storeName: z.string().min(2).max(80),
  storeDescription: z.string().max(500).optional().or(z.literal("")),
  storeCategory: z.string().max(80).optional().or(z.literal("")),
});

export const POST = createApiHandler<(typeof createStoreSchema)["_output"]>({
  auth: true,
  roles: ["seller", "admin"],
  schema: createStoreSchema,
  handler: async ({ user, body }) => {
    const existing = await storeRepository.findByOwnerId(user!.uid);
    if (existing) {
      throw new ApiError(409, "Store already exists for this seller");
    }

    const { storeName, storeDescription, storeCategory } = body!;
    const slugBase = slugify(`${storeName} ${user!.displayName ?? user!.uid}`);
    const storeSlug = `store-${slugBase}`.slice(0, 80);

    const store = await storeRepository.create({
      storeSlug,
      ownerId: user!.uid,
      storeName,
      storeDescription: storeDescription || undefined,
      storeCategory: storeCategory || undefined,
      isPublic: false,
      status: "pending",
    });

    // Mirror storeId + storeSlug onto UserDocument for indexed lookups
    await userRepository.update(user!.uid, {
      storeId: store.id,
      storeSlug: store.storeSlug,
      storeStatus: "pending",
    } as Parameters<typeof userRepository.update>[1]);

    serverLogger.info("Seller created store", {
      uid: user!.uid,
      storeSlug: store.storeSlug,
    });

    return successResponse({ store }, SUCCESS_MESSAGES.USER.STORE_UPDATED);
  },
});

// ─── PATCH — update existing store ───────────────────────────────────────────

const updateStoreSchema = z.object({
  storeName: z.string().min(2).max(80).optional(),
  storeDescription: z.string().max(500).optional().or(z.literal("")),
  storeCategory: z.string().max(80).optional().or(z.literal("")),
  storeLogoURL: z.string().url().optional().or(z.literal("")),
  storeBannerURL: z.string().url().optional().or(z.literal("")),
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

export const PATCH = createApiHandler<(typeof updateStoreSchema)["_output"]>({
  auth: true,
  roles: ["seller", "admin"],
  schema: updateStoreSchema,
  handler: async ({ user, body }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) {
      throw new NotFoundError("Store not found. Create a store first.");
    }

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
    } = body!;

    const updated = await storeRepository.updateStore(store.storeSlug, {
      ...(storeName !== undefined && { storeName }),
      ...(storeDescription !== undefined && { storeDescription }),
      ...(storeCategory !== undefined && { storeCategory }),
      ...(storeLogoURL !== undefined && { storeLogoURL }),
      ...(storeBannerURL !== undefined && { storeBannerURL }),
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

    return successResponse(
      { store: updated },
      SUCCESS_MESSAGES.USER.STORE_UPDATED,
    );
  },
});
