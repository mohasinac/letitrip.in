"use server";
import { z } from "zod";
import { requireRoleUser, requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  rateLimitByIdentifier, RateLimitPresets, } from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import { resolveDate } from "@mohasinac/appkit/utils";


/**
 * Event Server Actions � thin entrypoint
 *
 * Authenticates, rate-limits, validates, then delegates to
 * appkit event domain functions. No business logic here.
 */

import {
  createEvent,
  updateEvent,
  deleteEvent,
  changeEventStatus,
  adminUpdateEventEntry,
  listPublicEvents,
  getPublicEventById,
  getEventLeaderboard,
  adminListEvents,
  adminGetEventById,
  adminGetEventEntries,
  adminGetEventStats,
  enterEvent,
  type CreateEventInput,
  type UpdateEventInput,
  type EnterEventInput,
} from "@mohasinac/appkit/features/events/server";
import type { EventDocument, EventEntryDocument } from "@/db/schema/events";
import type { FirebaseSieveResult } from "@mohasinac/appkit/providers/db-firebase";
import { maskPublicEventEntry } from "@mohasinac/appkit/security";

// --- Schemas --------------------------------------------------------------

const eventIdSchema = z.object({ id: z.string().min(1, "id is required") });

const dateInputSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
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

// --- Admin Actions ---------------------------------------------------------

export async function createEventAction(
  input: CreateEventInput,
): Promise<EventDocument> {
  const admin = await requireRoleUser(["admin", "moderator"]);
  const rl = await rateLimitByIdentifier(`event:create:${admin.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid event data");
  return createEvent(admin.uid, parsed.data as CreateEventInput);
}

export async function updateEventAction(
  id: string,
  input: UpdateEventInput,
): Promise<EventDocument> {
  const admin = await requireRoleUser(["admin", "moderator"]);
  const rl = await rateLimitByIdentifier(`event:update:${admin.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const idParsed = eventIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");
  const parsed = updateEventSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid update data");
  return updateEvent(admin.uid, id, parsed.data as UpdateEventInput);
}

export async function deleteEventAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin", "moderator"]);
  const rl = await rateLimitByIdentifier(`event:delete:${admin.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const idParsed = eventIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");
  return deleteEvent(admin.uid, id);
}

export async function changeEventStatusAction(
  input: z.infer<typeof changeStatusSchema>,
): Promise<EventDocument> {
  const admin = await requireRoleUser(["admin", "moderator"]);
  const rl = await rateLimitByIdentifier(`event:status:${admin.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = changeStatusSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  return changeEventStatus(admin.uid, parsed.data.id, parsed.data.status as any);
}

export async function adminUpdateEventEntryAction(
  input: z.infer<typeof updateEntrySchema>,
): Promise<void> {
  const admin = await requireRoleUser(["admin", "moderator"]);
  const rl = await rateLimitByIdentifier(`event:entry:${admin.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = updateEntrySchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  return adminUpdateEventEntry(
    admin.uid,
    parsed.data.eventId,
    parsed.data.entryId,
    parsed.data.reviewStatus,
    parsed.data.reviewNote,
  );
}

// --- Read Actions ----------------------------------------------------------

export async function listPublicEventsAction(
  params?: string | { filters?: string; sorts?: string; page?: number; pageSize?: number },
): Promise<FirebaseSieveResult<EventDocument>> {
  return listPublicEvents(params);
}

export async function getPublicEventByIdAction(
  id: string,
): Promise<EventDocument | null> {
  return getPublicEventById(id);
}

export async function getEventLeaderboardAction(
  eventId: string,
): Promise<ReturnType<typeof maskPublicEventEntry<EventEntryDocument>>[]> {
  return getEventLeaderboard(eventId);
}

export async function adminListEventsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<EventDocument>> {
  return adminListEvents(params);
}

export async function adminGetEventByIdAction(
  id: string,
): Promise<EventDocument | null> {
  return adminGetEventById(id);
}

export async function adminGetEventEntriesAction(
  eventId: string,
  params?: { page?: number; pageSize?: number },
): Promise<EventEntryDocument[]> {
  return adminGetEventEntries(eventId, params);
}

export async function adminGetEventStatsAction(eventId: string) {
  return adminGetEventStats(eventId);
}

// --- Public Entry Action ---------------------------------------------------

export async function enterEventAction(
  eventId: string,
  input: EnterEventInput,
): Promise<{ entryId: string }> {
  let user: { uid: string; displayName?: string; email?: string } | undefined;
  try {
    const auth = await requireAuthUser();
    user = { uid: auth.uid, displayName: auth.name ?? undefined, email: auth.email ?? undefined };
  } catch {
    // unauthenticated allowed for some event types
  }

  const parsed = enterEventSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");

  return enterEvent(eventId, parsed.data as EnterEventInput, user);
}

// --- Re-export types -------------------------------------------------------

export type { CreateEventInput, UpdateEventInput, EnterEventInput };
