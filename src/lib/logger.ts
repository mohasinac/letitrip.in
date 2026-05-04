import fs from "node:fs";
import path from "node:path";

const isDev = process.env.NODE_ENV === "development";
const logDir = path.join(process.cwd(), "logs");
const logFile = path.join(logDir, "app.log");

function writeToFile(entry: string) {
  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, entry + "\n", "utf8");
  } catch {
    // file write failure must not crash the server
  }
}

function emit(
  severity: "INFO" | "WARNING" | "ERROR",
  job: string,
  message: string,
  data?: Record<string, unknown>,
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
  data?: Record<string, unknown>,
) {
  emit("INFO", job, message, data);
}

export function logWarn(
  job: string,
  message: string,
  data?: Record<string, unknown>,
) {
  emit("WARNING", job, message, data);
}

export function logError(
  job: string,
  message: string,
  error: unknown,
  data?: Record<string, unknown>,
) {
  emit("ERROR", job, message, {
    error: error instanceof Error ? error.message : String(error),
    ...(data ?? {}),
  });
}
