/**
 * Server-Side Logger
 *
 * Writes logs directly to files on the server (Node.js environment only)
 * Used for API routes and server components
 */

import {
  writeFile,
  mkdir,
  readdir,
  stat,
  unlink,
  appendFile,
} from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { redactPii } from "@/utils";

const LOGS_DIR = path.join(process.cwd(), "logs");
const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_FILES = 10;

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

/**
 * Ensure logs directory exists
 */
async function ensureLogsDir(): Promise<void> {
  if (!existsSync(LOGS_DIR)) {
    await mkdir(LOGS_DIR, { recursive: true });
  }
}

/**
 * Get current log file path
 */
function getLogFilePath(level: LogLevel): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return path.join(LOGS_DIR, `${level}-${date}.log`);
}

/**
 * Format log entry for file
 */
function formatLogEntry(entry: LogEntry): string {
  const sanitized = entry.data ? redactPii(entry.data) : undefined;
  const dataStr = sanitized
    ? `\n  Data: ${JSON.stringify(sanitized, null, 2)}`
    : "";
  return `[${entry.level.toUpperCase()}] ${entry.timestamp} - ${entry.message}${dataStr}\n\n`;
}

/**
 * Rotate log file if needed
 */
async function rotateLogFileIfNeeded(filePath: string): Promise<void> {
  try {
    if (!existsSync(filePath)) return;

    const stats = await stat(filePath);

    if (stats.size >= MAX_LOG_FILE_SIZE) {
      // Rename current file with timestamp
      const timestamp = Date.now();
      const dir = path.dirname(filePath);
      const filename = path.basename(filePath, ".log");
      const rotatedPath = path.join(dir, `${filename}.${timestamp}.log`);

      // Read and write to new file (rename doesn't work across devices)
      const content = await readdir(filePath);
      await writeFile(rotatedPath, content);
      await unlink(filePath);

      // Clean old files
      await cleanOldLogFiles(dir);
    }
  } catch (_e) {
    // Silently fail rotation
  }
}

/**
 * Clean old log files (keep only MAX_LOG_FILES)
 */
async function cleanOldLogFiles(logsDir: string): Promise<void> {
  try {
    const files = await readdir(logsDir);
    const logFiles = files
      .filter((f) => f.endsWith(".log"))
      .map((f) => ({
        name: f,
        path: path.join(logsDir, f),
      }));

    if (logFiles.length <= MAX_LOG_FILES) return;

    // Get file stats
    const filesWithStats = await Promise.all(
      logFiles.map(async (f) => ({
        ...f,
        mtime: (await stat(f.path)).mtime,
      })),
    );

    // Sort by modification time (oldest first)
    filesWithStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

    // Delete oldest files
    const filesToDelete = filesWithStats.slice(
      0,
      filesWithStats.length - MAX_LOG_FILES,
    );
    await Promise.all(filesToDelete.map((f) => unlink(f.path)));
  } catch (_e) {
    // Silently fail cleanup
  }
}

/**
 * Write log entry to file
 */
async function writeLog(entry: LogEntry): Promise<void> {
  try {
    await ensureLogsDir();

    const filePath = getLogFilePath(entry.level);
    const logText = formatLogEntry(entry);

    // Rotate if needed
    await rotateLogFileIfNeeded(filePath);

    // Append to log file
    await appendFile(filePath, logText);
  } catch (error) {
    // Silently fail - don't throw errors in logger
    console.error("Failed to write log:", error);
  }
}

/**
 * Server Logger API
 */
export const serverLogger = {
  debug(message: string, data?: any): void {
    const sanitized = data ? redactPii(data) : undefined;
    console.debug(`[DEBUG] ${message}`, sanitized);
    // Don't write debug logs to files (too noisy)
  },

  info(message: string, data?: any): void {
    const sanitized = data ? redactPii(data) : undefined;
    const entry: LogEntry = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      data: sanitized,
    };
    console.info(`[INFO] ${message}`, sanitized);
    writeLog(entry).catch(() => {}); // Fire and forget
  },

  warn(message: string, data?: any): void {
    const sanitized = data ? redactPii(data) : undefined;
    const entry: LogEntry = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      data: sanitized,
    };
    console.warn(`[WARN] ${message}`, sanitized);
    writeLog(entry).catch(() => {}); // Fire and forget
  },

  error(message: string, data?: any): void {
    const sanitized = data ? redactPii(data) : undefined;
    const entry: LogEntry = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      data: sanitized,
    };
    console.error(`[ERROR] ${message}`, sanitized);
    writeLog(entry).catch(() => {}); // Fire and forget
  },
};
