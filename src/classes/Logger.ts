/**
 * Logger — re-exported from @lir/core
 *
 * Implementation lives in packages/core/src/Logger.ts.
 * Backward-compatible: `enableFileLogging: true` defaults to `/api/logs/write`.
 */
export { Logger, logger } from "@lir/core";
export type { LogLevel, LogEntry, LoggerOptions } from "@lir/core";
