/**
 * Logger — re-exported from @mohasinac/core
 *
 * Implementation lives in packages/core/src/Logger.ts.
 * Backward-compatible: `enableFileLogging: true` defaults to `/api/logs/write`.
 */
export { Logger, logger } from "@mohasinac/appkit/core";
export type { LogLevel, LogEntry, LoggerOptions } from "@mohasinac/appkit/core";
