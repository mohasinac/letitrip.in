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
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { eventRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import type {
  EventDocument,
  EventCreateInput,
  EventUpdateInput,
  EventStatus,
} from "@/db/schema";
import {
  EVENTS_COLLECTION as EVT_COL,
  EVENT_ENTRIES_COLLECTION as EVT_ENTRIES_COL,
} from "@/db/schema";

// ─── Schemas ──────────────────────────────────────────────────────────────

const eventIdSchema = z.object({ id: z.string().min(1, "id is required") });

const createEventSchema = z.object({
  type: z.enum(["sale", "offer", "poll", "survey", "feedback"]),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "ended"]).default("draft"),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  imageUrl: z.string().optional(),
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

  const event = await eventRepository.createEvent({
    ...parsed.data,
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

  const updated = await eventRepository.updateEvent(
    id,
    parsed.data as EventUpdateInput,
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

  // Update the entry sub-document path: events/{eventId}/eventEntries/{entryId}
  const { getFirestore } = await import("firebase-admin/firestore");
  const db = getFirestore();
  await db
    .collection(EVT_COL)
    .doc(eventId)
    .collection(EVT_ENTRIES_COL)
    .doc(entryId)
    .update({
      reviewStatus,
      reviewNote: reviewNote ?? null,
      reviewedAt: new Date(),
      reviewedBy: admin.uid,
    });

  serverLogger.info("adminUpdateEventEntryAction", {
    adminId: admin.uid,
    eventId,
    entryId,
    reviewStatus,
  });
}
