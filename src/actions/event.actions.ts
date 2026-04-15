"use server";

/**
 * Event Server Actions (admin only)
 *
 * CRUD + status mutations for events — call eventRepository directly,
 * bypassing the service → apiClient → API route chain.
 *
 * User-facing event entry (participate) also lives here.
 */

import { z } from "zod";
import { requireRole, requireAuth } from "@/lib/firebase/auth-server";
import { eventRepository, eventEntryRepository } from "@/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import {
  coerceMediaField,
  getMediaUrl,
  type MediaField,
} from "@mohasinac/appkit/utils";
import type {
  EventDocument,
  EventCreateInput,
  EventUpdateInput,
  EventStatus,
  EventEntryDocument,
} from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@mohasinac/appkit/providers/db-firebase";
import { resolveDate } from "@/utils";
import { ERROR_MESSAGES } from "@/constants";
import { maskPublicEventEntry } from "@mohasinac/appkit/security";
import {
  finalizeStagedMediaField,
  finalizeStagedMediaObject,
  finalizeStagedMediaObjectArray,
} from "@mohasinac/appkit/features/media";

// ─── Schemas ──────────────────────────────────────────────────────────────

const eventIdSchema = z.object({ id: z.string().min(1, "id is required") });

const dateInputSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return resolveDate(value);
}, z.date().optional());

const singleImageMediaSchema = z
  .union([
    z.object({
      url: z.string().url(),
      type: z.enum(["image", "video", "file"]),
      alt: z.string().optional(),
      thumbnailUrl: z.string().url().optional(),
    }),
    z.string().url().transform((url) => ({ url, type: "image" as const })),
  ])
  .nullable()
  .optional();

const mediaFieldSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video", "file"]),
  alt: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

const createEventSchema = z.object({
  type: z.enum(["sale", "offer", "poll", "survey", "feedback"]),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "ended"]).default("draft"),
  startsAt: dateInputSchema,
  endsAt: dateInputSchema,
  coverImage: singleImageMediaSchema,
  coverImageUrl: z.string().url().optional(),
  eventImages: z.array(mediaFieldSchema).max(10).optional().default([]),
  winnerImages: z.array(mediaFieldSchema).max(5).optional().default([]),
  additionalImages: z.array(mediaFieldSchema).max(10).optional().default([]),
  tags: z.array(z.string()).optional(),
  saleConfig: z.any().optional(),
  offerConfig: z.any().optional(),
  pollConfig: z.any().optional(),
  surveyConfig: z.any().optional(),
  feedbackConfig: z.any().optional(),
});

const updateEventSchema = createEventSchema.partial();

const changeStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["draft", "active", "paused", "ended"]),
});

const updateEntrySchema = z.object({
  eventId: z.string().min(1),
  entryId: z.string().min(1),
  reviewStatus: z.enum(["approved", "flagged"]),
  reviewNote: z.string().optional(),
});

const enterEventSchema = z.object({
  pollVotes: z.array(z.string()).optional(),
  pollComment: z.string().optional(),
  formResponses: z.record(z.string(), z.unknown()).optional(),
});

export type EnterEventInput = z.infer<typeof enterEventSchema>;

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ─── Admin Actions ─────────────────────────────────────────────────────────

export async function createEventAction(
  input: CreateEventInput,
): Promise<EventDocument> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `event:create:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid event data",
    );

  const finalizedCoverUrl = await finalizeStagedMediaField(
    getMediaUrl(parsed.data.coverImage) ?? parsed.data.coverImageUrl,
  );
  const finalizedCoverImage = await finalizeStagedMediaObject(
    coerceMediaField(
      parsed.data.coverImage ?? finalizedCoverUrl ?? null,
      "image",
    ) as MediaField | null,
  );
  const finalizedEventImages = await finalizeStagedMediaObjectArray(
    parsed.data.eventImages,
  );
  const finalizedWinnerImages = await finalizeStagedMediaObjectArray(
    parsed.data.winnerImages,
  );
  const finalizedAdditionalImages = await finalizeStagedMediaObjectArray(
    parsed.data.additionalImages,
  );

  const event = await eventRepository.createEvent({
    ...parsed.data,
    coverImage: finalizedCoverImage ?? null,
    coverImageUrl: finalizedCoverImage?.url ?? finalizedCoverUrl,
    eventImages: finalizedEventImages,
    winnerImages: finalizedWinnerImages,
    additionalImages: finalizedAdditionalImages,
    createdBy: admin.uid,
  } as unknown as EventCreateInput);

  serverLogger.info("createEventAction", {
    adminId: admin.uid,
    eventId: event.id,
  });
  return event;
}

export async function updateEventAction(
  id: string,
  input: UpdateEventInput,
): Promise<EventDocument> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `event:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = eventIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const parsed = updateEventSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  const existing = await eventRepository.findById(id);
  if (!existing) throw new NotFoundError("Event not found");

  const finalizedCoverUrl = await finalizeStagedMediaField(
    getMediaUrl(parsed.data.coverImage) ?? parsed.data.coverImageUrl,
  );
  const finalizedCoverImage = parsed.data.coverImageUrl === null
    ? null
    : await finalizeStagedMediaObject(
        coerceMediaField(
          parsed.data.coverImage ?? finalizedCoverUrl ?? null,
          "image",
        ) as MediaField | null,
      );
  const finalizedEventImages = parsed.data.eventImages
    ? await finalizeStagedMediaObjectArray(parsed.data.eventImages)
    : undefined;
  const finalizedWinnerImages = parsed.data.winnerImages
    ? await finalizeStagedMediaObjectArray(parsed.data.winnerImages)
    : undefined;
  const finalizedAdditionalImages = parsed.data.additionalImages
    ? await finalizeStagedMediaObjectArray(parsed.data.additionalImages)
    : undefined;

  const updated = await eventRepository.updateEvent(
    id,
    {
      ...parsed.data,
      coverImage:
        parsed.data.coverImageUrl === null
          ? null
          : (finalizedCoverImage ?? undefined),
      coverImageUrl:
        parsed.data.coverImageUrl === null
          ? undefined
          : (finalizedCoverImage?.url ?? finalizedCoverUrl),
      eventImages: finalizedEventImages,
      winnerImages: finalizedWinnerImages,
      additionalImages: finalizedAdditionalImages,
    } as EventUpdateInput,
  );

  serverLogger.info("updateEventAction", { adminId: admin.uid, eventId: id });
  return updated;
}

export async function deleteEventAction(id: string): Promise<void> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `event:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = eventIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const existing = await eventRepository.findById(id);
  if (!existing) throw new NotFoundError("Event not found");

  await eventRepository.delete(id);

  serverLogger.info("deleteEventAction", { adminId: admin.uid, eventId: id });
}

export async function changeEventStatusAction(
  input: z.infer<typeof changeStatusSchema>,
): Promise<EventDocument> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `event:status:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = changeStatusSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const existing = await eventRepository.findById(parsed.data.id);
  if (!existing) throw new NotFoundError("Event not found");

  const updated = await eventRepository.changeStatus(
    parsed.data.id,
    parsed.data.status as EventStatus,
  );

  serverLogger.info("changeEventStatusAction", {
    adminId: admin.uid,
    eventId: parsed.data.id,
    status: parsed.data.status,
  });
  return updated;
}

export async function adminUpdateEventEntryAction(
  input: z.infer<typeof updateEntrySchema>,
): Promise<void> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `event:entry:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = updateEntrySchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const { eventId, entryId, reviewStatus, reviewNote } = parsed.data;

  await eventEntryRepository.reviewEntry(
    entryId,
    reviewStatus as EventEntryDocument["reviewStatus"],
    admin.uid,
    reviewNote,
  );

  serverLogger.info("adminUpdateEventEntryAction", {
    adminId: admin.uid,
    eventId,
    entryId,
    reviewStatus,
  });
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listPublicEventsAction(
  params?:
    | string
    | {
        filters?: string;
        sorts?: string;
        page?: number;
        pageSize?: number;
      },
): Promise<FirebaseSieveResult<EventDocument>> {
  // Normalise: accept either a query-string ("filters=...&sorts=...") or an object
  let filters: string | undefined;
  let sorts: string | undefined;
  let page = 1;
  let pageSize = 20;

  if (typeof params === "string" && params) {
    const sp = new URLSearchParams(params);
    filters = sp.get("filters") ?? undefined;
    sorts = sp.get("sorts") ?? undefined;
    if (sp.has("page")) page = Number(sp.get("page"));
    if (sp.has("pageSize")) pageSize = Number(sp.get("pageSize"));
    // Handle legacy keys passed by EventBanner ("status", "types", etc.)
    if (!filters) {
      const parts: string[] = [];
      if (sp.has("status")) parts.push(`status==${sp.get("status")}`);
      if (sp.has("type")) parts.push(`type==${sp.get("type")}`);
      if (sp.has("types")) {
        const types = sp.get("types")!.split(",");
        if (types.length === 1) parts.push(`type==${types[0]}`);
      }
      if (parts.length) filters = parts.join(",");
    }
  } else if (params && typeof params === "object") {
    filters = params.filters;
    sorts = params.sorts;
    page = params.page ?? 1;
    pageSize = params.pageSize ?? 20;
  }

  const base = "status==active";
  return eventRepository.list({
    filters: filters ? `${base},${filters}` : base,
    sorts: sorts ?? "startsAt",
    page,
    pageSize,
  });
}

export async function getPublicEventByIdAction(
  id: string,
): Promise<EventDocument | null> {
  const event = await eventRepository.findById(id);
  if (!event || event.status !== "active") return null;
  return event;
}

export async function getEventLeaderboardAction(
  eventId: string,
): Promise<ReturnType<typeof maskPublicEventEntry<EventEntryDocument>>[]> {
  const entries = await eventEntryRepository.getLeaderboard(eventId);
  return entries.map(maskPublicEventEntry);
}

export async function adminListEventsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<EventDocument>> {
  const sieve: SieveModel = {
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  };
  return eventRepository.list(sieve);
}

export async function adminGetEventByIdAction(
  id: string,
): Promise<EventDocument | null> {
  return eventRepository.findById(id);
}

export async function adminGetEventEntriesAction(
  eventId: string,
  params?: { page?: number; pageSize?: number },
): Promise<EventEntryDocument[]> {
  const result = await eventEntryRepository.listForEvent(eventId, {
    sorts: "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  });
  return result.items;
}

export async function adminGetEventStatsAction(eventId: string): Promise<{
  totalEntries: number;
  approvedEntries: number;
  flaggedEntries: number;
  pendingEntries: number;
} | null> {
  const event = await eventRepository.findById(eventId);
  if (!event) return null;
  const totalEntries = event.stats?.totalEntries ?? 0;
  const approvedEntries = event.stats?.approvedEntries ?? 0;
  const flaggedEntries = event.stats?.flaggedEntries ?? 0;
  return {
    totalEntries,
    approvedEntries,
    flaggedEntries,
    pendingEntries: Math.max(
      0,
      totalEntries - approvedEntries - flaggedEntries,
    ),
  };
}

// ─── Public Entry Action ───────────────────────────────────────────────────

/**
 * Enter/submit to a public event (poll, survey, or feedback).
 * Auth is required only for poll/survey/non-anonymous feedback events.
 */
export async function enterEventAction(
  eventId: string,
  input: EnterEventInput,
): Promise<{ entryId: string }> {
  // Optional auth — some events don't require login
  let user: { uid: string; displayName?: string; email?: string } | undefined =
    undefined;
  try {
    user = await requireAuth();
  } catch {
    // unauthenticated is allowed; validated below per event type
  }

  const parsed = enterEventSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }
  const body = parsed.data;

  const event = await eventRepository.findById(eventId);
  if (!event || event.status !== "active") {
    throw new NotFoundError(ERROR_MESSAGES.EVENT.ENTRIES_CLOSED);
  }

  const now = new Date();
  const endsAt = resolveDate(event.endsAt);
  if (endsAt && now > endsAt) {
    throw new ValidationError(ERROR_MESSAGES.EVENT.ENTRIES_CLOSED);
  }

  const requiresLogin =
    event.type === "poll" ||
    event.type === "survey" ||
    (event.type === "feedback" && !event.feedbackConfig?.anonymous);

  if (requiresLogin && !user) {
    throw new AuthorizationError(ERROR_MESSAGES.EVENT.LOGIN_REQUIRED);
  }

  if (user && event.type === "survey" && event.surveyConfig) {
    const userEntryCount = await eventEntryRepository.countUserEntries(
      eventId,
      user.uid,
    );
    if (userEntryCount >= event.surveyConfig.maxEntriesPerUser) {
      throw new ValidationError(ERROR_MESSAGES.EVENT.ALREADY_ENTERED);
    }
  }

  if (event.type === "poll" && event.pollConfig) {
    const validOptionIds = event.pollConfig.options.map((o) => o.id);
    const votes = body.pollVotes ?? [];
    if (votes.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
    }
    if (!votes.every((v) => validOptionIds.includes(v))) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
    }
    if (!event.pollConfig.allowMultiSelect && votes.length > 1) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
    }
  }

  if (
    (event.type === "survey" || event.type === "feedback") &&
    event[`${event.type}Config` as "surveyConfig" | "feedbackConfig"]
  ) {
    const config =
      event[`${event.type}Config` as "surveyConfig" | "feedbackConfig"]!;
    const formFields = "formFields" in config ? config.formFields : [];
    for (const field of formFields) {
      if (field.required && !body.formResponses?.[field.id]) {
        throw new ValidationError(
          `${ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD}: ${field.label}`,
        );
      }
    }
  }

  const autoApprove =
    event.type === "poll" ||
    event.type === "feedback" ||
    (event.type === "survey" && !event.surveyConfig?.entryReviewRequired);

  const reviewStatus = autoApprove ? "approved" : "pending";

  const entry = await eventEntryRepository.createEntry({
    eventId,
    userId: user?.uid,
    userDisplayName: user?.displayName,
    userEmail: user?.email,
    pollVotes: body.pollVotes,
    pollComment: body.pollComment,
    formResponses: body.formResponses,
    reviewStatus,
  });

  await eventRepository.incrementTotalEntries(eventId);
  if (autoApprove) {
    await eventRepository.incrementApprovedEntries(eventId);
  }

  serverLogger.info("enterEventAction", {
    entryId: entry.id,
    eventId,
    type: event.type,
    userId: user?.uid,
  });

  return { entryId: entry.id };
}

