"use server";

/**
 * Carousel Server Actions (admin only)
 *
 * CRUD mutations for carousel slides — call carouselRepository directly,
 * bypassing the service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireRole } from "@/lib/firebase/auth-server";
import { carouselRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
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
  CarouselSlideDocument,
  CarouselSlideCreateInput,
  CarouselSlideUpdateInput,
} from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@/lib/query";

// ─── Schemas ──────────────────────────────────────────────────────────────

const slideIdSchema = z.object({ id: z.string().min(1, "id is required") });

const createSlideSchema = z.object({
  title: z.string().min(1),
  order: z.number().int().default(0),
  active: z.boolean().default(false),
  media: z.object({
    type: z.enum(["image", "video"]),
    url: z.string().min(1),
    alt: z.string().default(""),
    thumbnail: z.string().optional(),
  }),
  link: z
    .object({
      url: z.string(),
      openInNewTab: z.boolean().default(false),
    })
    .optional(),
  mobileMedia: z
    .object({
      type: z.enum(["image", "video"]),
      url: z.string().min(1),
      alt: z.string().default(""),
    })
    .optional(),
  cards: z.array(z.record(z.string(), z.unknown())).optional(),
  overlay: z.record(z.string(), z.unknown()).optional(),
});

const updateSlideSchema = createSlideSchema.partial();

export type CreateCarouselSlideInput = z.infer<typeof createSlideSchema>;
export type UpdateCarouselSlideInput = z.infer<typeof updateSlideSchema>;

// ─── Server Actions ────────────────────────────────────────────────────────

export async function createCarouselSlideAction(
  input: CreateCarouselSlideInput,
): Promise<CarouselSlideDocument> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `carousel:create:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = createSlideSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid slide data",
    );

  const slide = await carouselRepository.create({
    ...parsed.data,
    createdBy: admin.uid,
  } as unknown as CarouselSlideCreateInput);

  serverLogger.info("createCarouselSlideAction", {
    adminId: admin.uid,
    slideId: slide.id,
  });
  return slide;
}

export async function updateCarouselSlideAction(
  id: string,
  input: UpdateCarouselSlideInput,
): Promise<CarouselSlideDocument> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `carousel:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = slideIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const parsed = updateSlideSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  const existing = await carouselRepository.findById(id);
  if (!existing) throw new NotFoundError("Carousel slide not found");

  const updated = await carouselRepository.update(
    id,
    parsed.data as CarouselSlideUpdateInput,
  );

  serverLogger.info("updateCarouselSlideAction", {
    adminId: admin.uid,
    slideId: id,
  });
  return updated;
}

export async function deleteCarouselSlideAction(id: string): Promise<void> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `carousel:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = slideIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const existing = await carouselRepository.findById(id);
  if (!existing) throw new NotFoundError("Carousel slide not found");

  await carouselRepository.delete(id);

  serverLogger.info("deleteCarouselSlideAction", {
    adminId: admin.uid,
    slideId: id,
  });
}

export async function reorderCarouselSlidesAction(
  slideIds: string[],
): Promise<CarouselSlideDocument[]> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `carousel:reorder:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = z
    .object({ slideIds: z.array(z.string().min(1)).min(1) })
    .safeParse({ slideIds });
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid order",
    );

  await carouselRepository.reorderSlides(
    parsed.data.slideIds.map((id, index) => ({ id, order: index + 1 })),
  );

  const updatedSlides = await carouselRepository.findAll();
  updatedSlides.sort((a, b) => (a.order || 0) - (b.order || 0));

  serverLogger.info("reorderCarouselSlidesAction", {
    adminId: admin.uid,
    count: parsed.data.slideIds.length,
  });
  return updatedSlides;
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listActiveCarouselSlidesAction(): Promise<
  CarouselSlideDocument[]
> {
  const slides = await carouselRepository.getActiveSlides();
  return slides.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function listAllCarouselSlidesAction(): Promise<
  CarouselSlideDocument[]
> {
  return carouselRepository.findAll();
}

export async function getCarouselSlideByIdAction(
  id: string,
): Promise<CarouselSlideDocument | null> {
  return carouselRepository.findById(id);
}
