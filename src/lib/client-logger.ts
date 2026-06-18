"use client";

const isDev = process.env.NODE_ENV === "development";

export function clientWarn(job: string, message: string) {
  if (isDev) console.warn(`[${job}] ${message}`);
}

export function clientError(job: string, message: string, error?: unknown) {
  if (isDev) console.error(`[${job}] ${message}`, error ?? "");
}
