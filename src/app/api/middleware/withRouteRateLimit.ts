import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "./ratelimiter";

// Environment-configurable defaults (fallback to hard-coded values)
const DEFAULT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_DEFAULT_MAX || "200", 10);
const DEFAULT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_DEFAULT_WINDOW_MS || "60000", 10);

// Route-specific overrides (can be loaded from env vars)
const INVOICE_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_INVOICE_MAX || "20", 10);
const INVOICE_WINDOW_MS = parseInt(process.env.RATE_LIMIT_INVOICE_WINDOW_MS || "60000", 10);

const RETURNS_MEDIA_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_RETURNS_MEDIA_MAX || "30", 10);
const RETURNS_MEDIA_WINDOW_MS = parseInt(process.env.RATE_LIMIT_RETURNS_MEDIA_WINDOW_MS || "60000", 10);

const SEARCH_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_SEARCH_MAX || "120", 10);
const SEARCH_WINDOW_MS = parseInt(process.env.RATE_LIMIT_SEARCH_WINDOW_MS || "60000", 10);

// Route pattern → config map
// Keep simple string includes/regex matching to avoid heavy parsing.
const routeRateLimitConfig: Array<{
  test: (url: URL) => boolean;
  config: { maxRequests?: number; windowMs?: number; message?: string };
  name: string; // For logging
}> = [
  // Invoice PDFs: heavier work
  {
    name: "invoice-pdf",
    test: (url) => /\/api\/orders\/[^/]+\/invoice$/.test(url.pathname),
    config: { maxRequests: INVOICE_MAX_REQUESTS, windowMs: INVOICE_WINDOW_MS },
  },
  // Returns media (signed URLs): protect both GET and POST
  {
    name: "returns-media",
    test: (url) => /\/api\/returns\/[^/]+\/media$/.test(url.pathname),
    config: { maxRequests: RETURNS_MEDIA_MAX_REQUESTS, windowMs: RETURNS_MEDIA_WINDOW_MS },
  },
  // Search endpoint: can be bursty; keep modest
  {
    name: "search",
    test: (url) => url.pathname === "/api/search",
    config: { maxRequests: SEARCH_MAX_REQUESTS, windowMs: SEARCH_WINDOW_MS },
  },
];

function pickConfig(url: URL): { config: { maxRequests?: number; windowMs?: number; message?: string }, name: string } {
  for (const entry of routeRateLimitConfig) {
    if (entry.test(url)) {
      // Log which rate limit is being applied (debug mode)
      if (process.env.NODE_ENV === "development" || process.env.LOG_RATE_LIMITS === "true") {
        console.log(`[Rate Limit] Applied "${entry.name}" config to ${url.pathname}`, entry.config);
      }
      return { config: entry.config, name: entry.name };
    }
  }
  // Default fallback
  if (process.env.NODE_ENV === "development" || process.env.LOG_RATE_LIMITS === "true") {
    console.log(`[Rate Limit] Applied default config to ${url.pathname}`, { maxRequests: DEFAULT_MAX_REQUESTS, windowMs: DEFAULT_WINDOW_MS });
  }
  return { 
    config: { maxRequests: DEFAULT_MAX_REQUESTS, windowMs: DEFAULT_WINDOW_MS },
    name: "default"
  };
}

export async function withRouteRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  const url = new URL(req.url);
  const { config } = pickConfig(url);
  return withRateLimit(req, handler, config);
}

// Expose config for future dynamic updates (e.g., load from env)
export function getRouteRateLimitEntries() {
  return routeRateLimitConfig;
}
