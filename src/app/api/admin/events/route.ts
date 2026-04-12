import "@/providers.config";
/**
 * Admin Events API Route
 * GET /api/admin/events  — Paginated list with Sieve filtering
 * POST /api/admin/events — Create a new event
 */

import { z } from "zod";
import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@mohasinac/appkit/next";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next";
import { eventRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import type { SieveModel } from "@/lib/query/firebase-sieve";
import { mediaFieldSchema } from "@mohasinac/appkit/utils";
import {
  finalizeStagedMediaField,
  finalizeStagedMediaObject,
  finalizeStagedMediaObjectArray,
} from "@/lib/media/finalize";

// ---------------------------------------------------------------------------
// Validation schema for event creation
// ---------------------------------------------------------------------------
const createEventSchema = z.object({
  type: z.enum(["sale", "offer", "poll", "survey", "feedback"]),
  title: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  description: z.string().default(""),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  coverImage: mediaFieldSchema.nullable().optional(),
  coverImageUrl: z.string().url().optional(),
  eventImages: z.array(mediaFieldSchema).max(10).optional().default([]),
  winnerImages: z.array(mediaFieldSchema).max(5).optional().default([]),
  additionalImages: z.array(mediaFieldSchema).max(10).optional().default([]),
  saleConfig: z
    .object({
      discountPercent: z.number().min(1).max(100),
      bannerText: z.string().optional(),
      affectedCategories: z.array(z.string()).optional(),
    })
    .optional(),
  offerConfig: z
    .object({
      couponId: z.string().min(1),
      displayCode: z.string().min(1),
      bannerText: z.string().optional(),
    })
    .optional(),
  pollConfig: z
    .object({
      allowMultiSelect: z.boolean(),
      allowComment: z.boolean(),
      options: z.array(z.object({ id: z.string(), label: z.string() })).min(2),
      resultsVisibility: z.enum(["always", "after_vote", "after_end"]),
    })
    .optional(),
  surveyConfig: z
    .object({
      requireLogin: z.boolean(),
      maxEntriesPerUser: z.number().min(1).default(1),
      hasLeaderboard: z.boolean(),
      hasPointSystem: z.boolean(),
      pointsLabel: z.string().optional(),
      entryReviewRequired: z.boolean(),
      formFields: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          label: z.string(),
          placeholder: z.string().optional(),
          required: z.boolean(),
          options: z.array(z.string()).optional(),
          order: z.number(),
        }),
      ),
    })
    .optional(),
  feedbackConfig: z
    .object({
      formFields: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          label: z.string(),
          placeholder: z.string().optional(),
          required: z.boolean(),
          options: z.array(z.string()).optional(),
          order: z.number(),
        }),
      ),
      anonymous: z.boolean(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// GET — list events
// ---------------------------------------------------------------------------
export const GET = createRouteHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 25, {
      min: 1,
      max: 100,
    });
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    // Build Sieve filter string from named params + raw filters
    const filtersArr: string[] = [];
    const type = getStringParam(searchParams, "type");
    const status = getStringParam(searchParams, "status");
    const rawFilters = getStringParam(searchParams, "filters");
    if (type) filtersArr.push(`type==${type}`);
    if (status) filtersArr.push(`status==${status}`);
    if (rawFilters) filtersArr.push(rawFilters);

    const model: SieveModel = {
      filters: filtersArr.join(",") || undefined,
      sorts,
      page,
      pageSize,
    };

    serverLogger.info("Admin events list requested", { model });

    const result = await eventRepository.list(model);

    return successResponse({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  },
});

// ---------------------------------------------------------------------------
// POST — create event
// ---------------------------------------------------------------------------
export const POST = createRouteHandler({
  auth: true,
  roles: ["admin"],
  schema: createEventSchema,
  handler: async (data) => {
    const body = data.body!;
    const user = data.user!;
    const coverImageUrl = await finalizeStagedMediaField(
      body.coverImage?.url ?? body.coverImageUrl,
    );
    const coverImage = body.coverImage
      ? await finalizeStagedMediaObject({
          ...body.coverImage,
          url: coverImageUrl ?? body.coverImage.url,
        })
      : undefined;
    const eventImages = await finalizeStagedMediaObjectArray(body.eventImages);
    const winnerImages = await finalizeStagedMediaObjectArray(body.winnerImages);
    const additionalImages = await finalizeStagedMediaObjectArray(
      body.additionalImages,
    );
    const event = await eventRepository.createEvent({
      type: body.type,
      title: body.title,
      description: body.description ?? "",
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt),
      coverImage,
      coverImageUrl: coverImage?.url ?? coverImageUrl,
      eventImages,
      winnerImages,
      additionalImages,
      saleConfig: body.saleConfig,
      offerConfig: body.offerConfig,
      pollConfig: body.pollConfig,
      surveyConfig: body.surveyConfig as
        | import("@/db/schema").SurveyConfig
        | undefined,
      feedbackConfig: body.feedbackConfig as
        | import("@/db/schema").FeedbackConfig
        | undefined,
      status: "draft",
      createdBy: user.uid,
    });

    serverLogger.info("Admin event created", {
      eventId: event.id,
      type: event.type,
      adminUid: user.uid,
    });

    return successResponse(event, SUCCESS_MESSAGES.EVENT.CREATED, 201);
  },
});
