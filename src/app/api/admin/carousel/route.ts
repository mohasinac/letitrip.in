import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  carouselRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import type { SieveModel } from "@mohasinac/appkit";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit";

const cardSchema = z.object({
  id: z.string().optional(),
  zone: z.number().int().min(1).max(6),
  mobileZone: z.number().int().optional(),
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
  }),
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    textColor: z.string().optional(),
    textAlign: z.enum(["left", "center", "right"]).optional(),
  }).optional(),
  buttons: z.array(z.object({
    id: z.string().optional(),
    text: z.string(),
    href: z.string(),
    variant: z.enum(["primary", "secondary", "outline", "ghost", "link"]),
    openInNewTab: z.boolean().optional(),
  })).max(3).optional(),
  hover: z.object({
    effect: z.enum(["scale", "color", "glow", "none"]),
    scaleValue: z.number().optional(),
    colorValue: z.string().optional(),
  }).optional(),
  isButtonOnly: z.boolean().optional(),
}).passthrough();

const overlaySchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  button: z.object({
    text: z.string(),
    link: z.string(),
    variant: z.enum(["primary", "secondary", "outline"]),
    openInNewTab: z.boolean(),
  }).optional(),
}).optional();

const createSlideSchema = z.object({
  title: z.string().min(1).max(200),
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
  cards: z.array(cardSchema).max(2).optional(),
  overlay: overlaySchema,
  link: z.object({ url: z.string(), openInNewTab: z.boolean() }).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:carousel:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 100 });
      const sorts = getStringParam(searchParams, "sorts") || "order";
      const rawFilters = getStringParam(searchParams, "filters");

      const model: SieveModel = {
        filters: rawFilters || undefined,
        sorts,
        page,
        pageSize,
      };

      const result = await carouselRepository.list(model);
      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    permission: "admin:carousel:write",
    schema: createSlideSchema,
    handler: async ({ body, user }) => {
      const slide = await carouselRepository.create({
        ...(body as object),
        createdBy: user!.uid,
      } as Parameters<typeof carouselRepository.create>[0]);
      return successResponse(slide, "Carousel slide created", 201);
    },
  }),
);
