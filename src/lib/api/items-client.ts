// NOT "use client" — typed REST wrappers for item-request routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import type { JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

export function getItemRequests(): Promise<Response> {
  return fetch("/api/item-requests", { credentials: CREDS });
}

export function getItemRequest(id: string): Promise<Response> {
  return fetch(`/api/item-requests/${id}`, { credentials: CREDS });
}

export function createItemRequest(body: JsonBody): Promise<Response> {
  return fetch("/api/item-requests", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

export function replyToItemRequest(id: string, body: JsonBody): Promise<Response> {
  return fetch(`/api/item-requests/${id}/replies`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}
