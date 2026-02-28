import * as functions from "firebase-functions/v2";

/** Thin wrapper so we can swap the back-end later without touching every job. */
export const fnLogger = functions.logger;

export function logInfo(
  job: string,
  message: string,
  data?: Record<string, unknown>,
) {
  fnLogger.info(`[${job}] ${message}`, data ?? {});
}

export function logError(
  job: string,
  message: string,
  error: unknown,
  data?: Record<string, unknown>,
) {
  fnLogger.error(`[${job}] ${message}`, {
    error: error instanceof Error ? error.message : String(error),
    ...(data ?? {}),
  });
}

export function logWarn(
  job: string,
  message: string,
  data?: Record<string, unknown>,
) {
  fnLogger.warn(`[${job}] ${message}`, data ?? {});
}
