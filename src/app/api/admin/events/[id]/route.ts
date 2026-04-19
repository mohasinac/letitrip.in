import "@/providers.config";
/**
 * Admin Events [id] API Route
 * GET    /api/admin/events/:id — Get a single event
 * PATCH  /api/admin/events/:id — Update an event
 * DELETE /api/admin/events/:id — Delete an event
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { eventRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
type RouteContext = { params: Promise<{ id: string }> };

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const events = await eventRepository.list({ filters: `id==${id}`, page: "1", pageSize: "1" });
  const event = events.items[0];
  if (!event) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.GENERIC.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: event });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating event", { id });

  const { startsAt, endsAt, ...rest } = parsed.data;
  const updateData = {
    ...rest,
    ...(startsAt && { startsAt: new Date(startsAt) }),
    ...(endsAt && { endsAt: new Date(endsAt) }),
  };

  const updated = await eventRepository.updateEvent(id, updateData as any);
  return Response.json(successResponse(updated, SUCCESS_MESSAGES.EVENT.UPDATED));
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  serverLogger.info("Admin deleting event", { id });
  await eventRepository.changeStatus(id, "cancelled" as any);
  return Response.json(successResponse(null, SUCCESS_MESSAGES.EVENT.DELETED));
}
