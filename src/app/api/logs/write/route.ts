/**
 * Client Logging API Route
 *
 * Allows client-side logs to be written to server log files
 * This enables the Logger class to persist client errors to disk
 */

import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { z } from "zod";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";

const logSchema = z.object({
  level: z.enum(["debug", "info", "warn", "error"]),
  message: z.string().min(1),
  timestamp: z.string().min(1),
  data: z.any().optional(),
});

/**
 * POST /api/logs/write
 * Write log entry from client to server log files
 */
export const POST = createApiHandler<(typeof logSchema)["_output"]>({
  schema: logSchema,
  handler: async ({ body }) => {
    const { level, message, timestamp, data } = body!;
    const logMessage = `[CLIENT] ${message}`;
    const logData = { ...data, timestamp, source: "client" };
    switch (level) {
      case "debug": serverLogger.debug(logMessage, logData); break;
      case "info":  serverLogger.info(logMessage, logData);  break;
      case "warn":  serverLogger.warn(logMessage, logData);  break;
      case "error": serverLogger.error(logMessage, logData); break;
    }
    return successResponse(null, SUCCESS_MESSAGES.LOGS.WRITTEN);
  },
});

