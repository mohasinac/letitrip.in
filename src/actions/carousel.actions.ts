"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Carousel Server Actions ï¿½ thin entrypoint (admin only)
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import {
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  reorderCarouselSlides,
  listActiveCarouselSlides,
  listAllCarouselSlides,
  getCarouselSlideById,
} from "@mohasinac/appkit";
import type {
  CarouselSlideInput,
  CarouselSlideUpdateInput,
} from "@mohasinac/appkit";
import type { CarouselSlideDocument } from "@mohasinac/appkit";
import { ERR_RATE_LIMIT, ERR_INVALID_UPDATE } from "./_constants";

const createSlideSchema = z.object({
  title: z.string().min(1),
  order: z.number().int().default(0),
  active: z.boolean().default(false),
  media: z.object({ type: z.enum(["image", "video"]), url: z.string().min(1), alt: z.string().default(""), thumbnail: z.string().optional() }),
  link: z.object({ url: z.string(), openInNewTab: z.boolean().default(false) }).optional(),
  mobileMedia: z.object({ type: z.enum(["image", "video"]), url: z.string().min(1), alt: z.string().default("") }).optional(),
  cards: z.array(z.record(z.string(), z.unknown())).optional(),
  overlay: z.record(z.string(), z.unknown()).optional(),
});

const updateSlideSchema = createSlideSchema.partial();

export async function createCarouselSlideAction(input: CarouselSlideInput): Promise<ActionResult<CarouselSlideDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
      const rl = await rateLimitByIdentifier(`carousel:create:${admin.uid}`, RateLimitPresets.API);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      const parsed = createSlideSchema.safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid slide data");
      return createCarouselSlide(admin.uid, parsed.data as CarouselSlideInput) as any;
  });
}

export async function updateCarouselSlideAction(id: string, input: CarouselSlideUpdateInput): Promise<ActionResult<CarouselSlideDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
      const rl = await rateLimitByIdentifier(`carousel:update:${admin.uid}`, RateLimitPresets.API);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      if (!id?.trim()) throw new ValidationError("Invalid id");
      const parsed = updateSlideSchema.safeParse(input);
      if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE);
      return updateCarouselSlide(admin.uid, id, parsed.data as CarouselSlideUpdateInput) as any;
  });
}

export async function deleteCarouselSlideAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);
  const rl = await rateLimitByIdentifier(`carousel:delete:${admin.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
  if (!id?.trim()) throw new ValidationError("Invalid id");
  return deleteCarouselSlide(admin.uid, id);
}

export async function reorderCarouselSlidesAction(slideIds: string[]): Promise<ActionResult<CarouselSlideDocument[]>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
      const rl = await rateLimitByIdentifier(`carousel:reorder:${admin.uid}`, RateLimitPresets.API);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      if (!Array.isArray(slideIds) || slideIds.length === 0) throw new ValidationError("Invalid order");
      return reorderCarouselSlides(admin.uid, slideIds) as any;
  });
}

export async function listActiveCarouselSlidesAction(): Promise<ActionResult<CarouselSlideDocument[]>> {
  return wrapAction(async () => {
    return listActiveCarouselSlides() as any;
  });
}

export async function listAllCarouselSlidesAction(): Promise<ActionResult<CarouselSlideDocument[]>> {
  return wrapAction(async () => {
    return listAllCarouselSlides() as any;
  });
}

export async function getCarouselSlideByIdAction(id: string): Promise<ActionResult<CarouselSlideDocument | null>> {
  return wrapAction(async () => {
    return getCarouselSlideById(id) as any;
  });
}

