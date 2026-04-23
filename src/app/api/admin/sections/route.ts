import { withProviders } from "@/providers.config";
/**
 * Admin Homepage Sections API Route
 * GET  /api/admin/sections — List sections with pagination
 * POST /api/admin/sections — Create a new section
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
  serverLogger,
} from "@mohasinac/appkit";
import { homepageSectionsRepository } from "@mohasinac/appkit";
import {
  type HomepageSectionCreateInput,
  type SectionType,
} from "@mohasinac/appkit";
import { validateRequestBody, formatZodErrors } from "@/validation/request-schemas";
import { z } from "zod";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@mohasinac/appkit";

/**
 * GET /api/admin/sections
 *
 * Query params:
 *  - filters  (string) — Sieve filters (e.g. enabled==true)
 *  - sorts    (string) — Sieve sorts (e.g. order)
 *  - page     (number) — page number (default 1)
 *  - pageSize (number) — results per page (default 50, max 200)
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);

      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 50, {
        min: 1,
        max: 200,
      });
      const filters = getStringParam(searchParams, "filters");
      const sorts = getStringParam(searchParams, "sorts") || "order";

      serverLogger.info("Admin homepage sections list requested", {
        filters,
        sorts,
        page,
        pageSize,
      });

      const result = await homepageSectionsRepository.list({
        filters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      });
    },
  }),
);

/**
 * POST /api/admin/sections
 *
 * Create a new homepage section
 */
const sectionCreateSchema = z.object({
  type: z.enum([
    "welcome",
    "stats",
    "trust-indicators",
    "categories",
    "brands",
    "products",
    "pre-orders",
    "auctions",
    "banner",
    "features",
    "reviews",
    "whatsapp-community",
    "faq",
    "blog-articles",
    "newsletter",
    "stores",
    "events",
  ] as const),
  enabled: z.boolean().optional().default(true),
  order: z.number().optional(),
  config: z.object({}).passthrough(), // Allow any config based on type
});

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ request, user }) => {
      const body = await request.json();
      const validation = validateRequestBody(sectionCreateSchema, body);

      if (!validation.success) {
        return errorResponse(
          ERROR_MESSAGES.VALIDATION.FAILED,
          400,
          formatZodErrors(validation.errors),
        );
      }

      const { type, enabled, config, order } = validation.data;

      let resolvedOrder = order;
      if (resolvedOrder === undefined) {
        const latest = await homepageSectionsRepository.list({
          sorts: "-order",
          page: "1",
          pageSize: "1",
        });
        resolvedOrder =
          typeof latest.items[0]?.order === "number"
            ? latest.items[0].order + 1
            : 1;
      }

      const input: HomepageSectionCreateInput = {
        type: type as SectionType,
        enabled: enabled ?? true,
        order: resolvedOrder,
        config: config as any,
      };

      const section = await homepageSectionsRepository.create(input);

      serverLogger.info("Homepage section created", {
        id: section.id,
        type: section.type,
        createdBy: user?.uid,
      });

      return successResponse(section, SUCCESS_MESSAGES.SECTION.CREATED, 201);
    },
  }),
);
