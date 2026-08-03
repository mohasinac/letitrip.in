// NOT "use client" — typed REST wrappers for event participation routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import type { JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

// ── Event entries ────────────────────────────────────────────────────────────

export function submitEventEntry(
  url: string,
  body: JsonBody,
  signal?: AbortSignal,
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
    signal,
  });
}

// ── Spin wheel ───────────────────────────────────────────────────────────────

export function spinEventWheel(eventId: string): Promise<Response> {
  return fetch(`/api/events/${eventId}/spin`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
  });
}
