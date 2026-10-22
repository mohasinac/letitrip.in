// NOT "use client" — typed REST wrappers for support ticket routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ENDPOINTS } from "@mohasinac/appkit/client";
// "@/constants/api", never the "@/constants" barrel — see user-client.ts.
import { API_ROUTES } from "@/constants/api";

import type { JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

export function getSupportTickets(): Promise<Response> {
  return fetch(`${API_ENDPOINTS.SUPPORT.TICKETS}?pageSize=50`, { credentials: CREDS });
}

export function getSupportTicket(id: string): Promise<Response> {
  return fetch(API_ENDPOINTS.SUPPORT.TICKET_BY_ID(id), { credentials: CREDS });
}

export function createSupportTicket(body: JsonBody): Promise<Response> {
  return fetch(API_ENDPOINTS.SUPPORT.TICKETS, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

export function getSupportTicketMessages(id: string, body: JsonBody): Promise<Response> {
  return fetch(API_ENDPOINTS.SUPPORT.TICKET_MESSAGES(id), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

// ── Grievance intake ─────────────────────────────────────────────────────────
//
// Lives here rather than in a client of its own: a grievance is the escalation
// path for a support matter, and the route it posts to is the same kind of
// public intake. Raw `Response` out, because the form shows the server's own
// refusal text on a 4xx.

export function fileGrievance(body: {
  subject: string;
  detail: string;
  orderId?: string;
  disputedAmount?: number;
}): Promise<Response> {
  return fetch(API_ROUTES.GRIEVANCE, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}
