/**
 * Public Events API Route
 * GET /api/events — List active events (public, no auth required)
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { eventRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

export const GET = createApiHandler({
  auth: false,
  handler: async (_: { request: NextRequest }) => {
    serverLogger.info("Public events list requested");

    const events = await eventRepository.listActive();

    // Strip internal/admin fields before returning
    const publicEvents = events.map(({ createdBy: _cb, ...evt }) => evt);

    return successResponse(publicEvents);
  },
});
