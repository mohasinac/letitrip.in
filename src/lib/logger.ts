import fs from "node:fs";
import { normalizeError } from "@mohasinac/appkit";
import path from "node:path";
import type { JsonValue } from "@mohasinac/appkit";

const isDev = process.env.NODE_ENV === "development";
const logDir = path.join(process.cwd(), "logs");
const logFile = path.join(logDir, "app.log");

function writeToFile(entry: string) {
  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, entry + "\n", "utf8");
  } catch (_err) {
    void normalizeError(_err); // file write failure must not crash the server — logging is best-effort
  }
}

function emit(
  severity: "INFO" | "WARNING" | "ERROR",
  job: string,
  message: string,
  data?: Record<string, JsonValue>,
) {
  const entry = JSON.stringify({
    severity,
    message: `[${job}] ${message}`,
    timestamp: new Date().toISOString(),
    ...(data ?? {}),
  });

  if (isDev) {
    writeToFile(entry);
  } else {
    // Structured JSON on stdout — collected by Firebase App Hosting / Cloud Logging
    process.stdout.write(entry + "\n");
  }
}

export function logInfo(
  job: string,
  message: string,
  data?: Record<string, JsonValue>,
) {
  emit("INFO", job, message, data);
}

export function logWarn(
  job: string,
  message: string,
  data?: Record<string, JsonValue>,
) {
  emit("WARNING", job, message, data);
}

export function logError(
  job: string,
  message: string,
  error: unknown,
  data?: Record<string, JsonValue>,
) {
  emit("ERROR", job, message, {
    error: error instanceof Error ? error.message : String(error),
    ...(data ?? {}),
  });
}
