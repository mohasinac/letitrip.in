// NOT "use client" — typed REST wrappers for event participation routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ENDPOINTS } from "@mohasinac/appkit/client";

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
  return fetch(API_ENDPOINTS.EVENTS.SPIN(eventId), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
  });
}

// ── Likes ───────────────────────────────────────────────────────────────────

/** Toggle the signed-in viewer's like. The session cookie is the identity. */
export function toggleEventLike(eventId: string): Promise<Response> {
  return fetch(API_ENDPOINTS.EVENTS.LIKES(eventId), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
  });
}

/** One page of "who liked this", for the rail's View-all modal. */
export function fetchEventLikers(eventId: string, offset: number): Promise<Response> {
  return fetch(API_ENDPOINTS.EVENTS.LIKERS(eventId, offset), {
    credentials: CREDS,
  });
}
