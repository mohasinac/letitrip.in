import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  carouselRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

const MSG_SLIDE_NOT_FOUND = "Carousel slide not found.";

const updateSlideSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  background: z.object({
    type: z.enum(["image", "video", "color", "gradient"]),
    url: z.string().optional(),
    mobileUrl: z.string().optional(),
    thumbnail: z.string().optional(),
    color: z.string().optional(),
    gradientFrom: z.string().optional(),
    gradientTo: z.string().optional(),
    gradientAngle: z.number().optional(),
    dimOverlay: z.object({ enabled: z.boolean(), opacity: z.number() }).optional(),
  }).optional(),
  settings: z.object({
    autoplayDelayMs: z.number().min(500).max(30000).optional(),
    height: z.enum(["viewport", "tall", "medium"]).optional(),
  }).optional(),
  cards: z.array(z.object({}).passthrough()).max(2).optional(),
  overlay: z.object({}).passthrough().optional(),
  link: z.object({ url: z.string(), openInNewTab: z.boolean() }).optional(),
}).passthrough();

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:carousel:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const slide = await carouselRepository.findById(id);
      if (!slide) return errorResponse(MSG_SLIDE_NOT_FOUND, 404);
      return successResponse(slide);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    permission: "admin:carousel:write",
    schema: updateSlideSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await carouselRepository.findById(id);
      if (!existing) return errorResponse(MSG_SLIDE_NOT_FOUND, 404);
      const updated = await carouselRepository.update(id, body as any);
      return successResponse(updated, "Carousel slide updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    permission: "admin:carousel:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await carouselRepository.findById(id);
      if (!existing) return errorResponse(MSG_SLIDE_NOT_FOUND, 404);
      await carouselRepository.delete(id);
      return successResponse(null, "Carousel slide deleted");
    },
  }),
);
