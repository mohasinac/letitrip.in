// NOT "use client" — typed REST wrapper for the report submission route.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ENDPOINTS } from "@mohasinac/appkit";

import type { JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

export function submitReport(body: JsonBody): Promise<Response> {
  return fetch(API_ENDPOINTS.REPORTS.SUBMIT, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}
