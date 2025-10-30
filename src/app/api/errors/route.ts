import {
  createApiHandler,
  successResponse,
  errorResponse,
  HTTP_STATUS,
} from "@/lib/api";
import type { ErrorLogEntry } from "@/lib/utils/errorLogger";

/**
 * POST /api/errors
 * Error logging endpoint
 * REFACTORED: Uses standardized API utilities
 */
export const POST = createApiHandler(async (request) => {
  const errorEntry: ErrorLogEntry = await request.json();

  // Validate the error entry
  if (!errorEntry.error || !errorEntry.timestamp) {
    return errorResponse("Invalid error log entry", HTTP_STATUS.BAD_REQUEST);
  }

  // In a real application, you would:
  // 1. Store the error in a database
  // 2. Send alerts for critical errors
  // 3. Forward to external monitoring services

  console.error("API Error Log:", {
    timestamp: errorEntry.timestamp,
    error: errorEntry.error.message,
    url: errorEntry.url,
    userAgent: errorEntry.userAgent,
    stack: errorEntry.error.stack,
  });

  // Example: Save to database
  // await saveErrorToDatabase(errorEntry);

  // Example: Send to external service
  // await sendToMonitoringService(errorEntry);

  // Example: Send critical error alerts
  // if (isCriticalError(errorEntry)) {
  //   await sendAlert(errorEntry);
  // }

  return successResponse({ logged: true });
});

// Helper function to determine if an error is critical
function isCriticalError(errorEntry: ErrorLogEntry): boolean {
  const criticalPatterns = [
    /database/i,
    /payment/i,
    /authentication/i,
    /security/i,
    /unauthorized/i,
  ];

  return criticalPatterns.some(
    (pattern) =>
      pattern.test(errorEntry.error.message) ||
      pattern.test(errorEntry.error.name),
  );
}

// Example function to save to database (implement based on your database)
// async function saveErrorToDatabase(errorEntry: ErrorLogEntry) {
//   // Implementation depends on your database choice
//   // Example with Prisma:
//   // await prisma.errorLog.create({
//   //   data: {
//   //     message: errorEntry.error.message,
//   //     stack: errorEntry.error.stack,
//   //     url: errorEntry.url,
//   //     timestamp: new Date(errorEntry.timestamp),
//   //     userAgent: errorEntry.userAgent,
//   //     userId: errorEntry.userId,
//   //   }
//   // });
// }

// Example function to send to external monitoring service
// async function sendToMonitoringService(errorEntry: ErrorLogEntry) {
//   // Example with a webhook or API call
//   // await fetch(process.env.MONITORING_WEBHOOK_URL, {
//   //   method: 'POST',
//   //   headers: { 'Content-Type': 'application/json' },
//   //   body: JSON.stringify(errorEntry)
//   // });
// }
