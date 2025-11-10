import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "./ratelimiter";

// Route pattern → config map
// Keep simple string includes/regex matching to avoid heavy parsing.
const routeRateLimitConfig: Array<{
  test: (url: URL) => boolean;
  config: { maxRequests?: number; windowMs?: number; message?: string };
}> = [
  // Invoice PDFs: heavier work
  {
    test: (url) => /\/api\/orders\/[^/]+\/invoice$/.test(url.pathname),
    config: { maxRequests: 20, windowMs: 60 * 1000 },
  },
  // Returns media (signed URLs): protect both GET and POST
  {
    test: (url) => /\/api\/returns\/[^/]+\/media$/.test(url.pathname),
    config: { maxRequests: 30, windowMs: 60 * 1000 },
  },
  // Search endpoint: can be bursty; keep modest
  {
    test: (url) => url.pathname === "/api/search",
    config: { maxRequests: 120, windowMs: 60 * 1000 },
  },
];

function pickConfig(url: URL) {
  for (const entry of routeRateLimitConfig) {
    if (entry.test(url)) return entry.config;
  }
  // Default fallback
  return { maxRequests: 200, windowMs: 60 * 1000 };
}

export async function withRouteRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  const url = new URL(req.url);
  const cfg = pickConfig(url);
  return withRateLimit(req, handler, cfg);
}

// Expose config for future dynamic updates (e.g., load from env)
export function getRouteRateLimitEntries() {
  return routeRateLimitConfig;
}
