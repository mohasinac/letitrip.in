// NOT "use client" — typed REST wrappers for item-request routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ROUTES } from "@/constants/api";

import type { JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

export function getItemRequests(): Promise<Response> {
  return fetch(API_ROUTES.ITEM_REQUESTS.LIST, { credentials: CREDS });
}

export function getItemRequest(id: string): Promise<Response> {
  return fetch(API_ROUTES.ITEM_REQUESTS.BY_ID(id), { credentials: CREDS });
}

export function createItemRequest(body: JsonBody): Promise<Response> {
  return fetch(API_ROUTES.ITEM_REQUESTS.LIST, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

export function replyToItemRequest(id: string, body: JsonBody): Promise<Response> {
  return fetch(API_ROUTES.ITEM_REQUESTS.REPLIES(id), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}
