// NOT "use client" — typed REST wrappers for support ticket routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import type { JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

export function getSupportTickets(): Promise<Response> {
  return fetch("/api/support/tickets?pageSize=50", { credentials: CREDS });
}

export function getSupportTicket(id: string): Promise<Response> {
  return fetch(`/api/support/tickets/${id}`, { credentials: CREDS });
}

export function createSupportTicket(body: JsonBody): Promise<Response> {
  return fetch("/api/support/tickets", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

export function getSupportTicketMessages(id: string, body: JsonBody): Promise<Response> {
  return fetch(`/api/support/tickets/${id}/messages`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}
