// NOT "use client" — a typed REST wrapper for the authenticity checker route.
// Imported from a "use client" component; audit-direct-fetch-ui ignores /lib/api/.
//
// 🛑 The fetch lives here rather than in the component for a reason beyond the
// audit: `AuthenticityCheckerClient` renders a <Form>, and a raw fetch inside a
// form-rendering file is what `audit-form-mutation-hook` blocks — the shape it
// exists to prevent is a submit handler that talks to the network directly and
// therefore has no shared error, loading or toast handling.

import { API_ROUTES } from "@/constants";
import type { AuthenticityAssessment, AuthenticityRequest } from "@/features/authenticity/types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

/** What the route returns on success. */
interface AuthenticityEnvelope {
  readonly data?: AuthenticityAssessment;
}

/**
 * Run one assessment.
 *
 * 🛑 Throws on a non-2xx rather than returning a partial result. The caller
 * renders one flat sentence and never the server's own message: Rule #9 records
 * that `?? error` printed server internals to a user, and once rendered a Node
 * stack trace inside a modal.
 *
 * 🛑 `credentials: "include"` is load-bearing — the route is `auth: true`, and
 * without the session cookie every lookup would 401 while looking like a server
 * fault to the person using it.
 */
export async function runAuthenticityCheck(
  body: AuthenticityRequest,
  signal?: AbortSignal,
): Promise<AuthenticityAssessment> {
  const res = await fetch(API_ROUTES.TOOLS.AUTHENTICITY, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(body),
    signal,
  });

  const json = (await res.json().catch(() => ({}))) as AuthenticityEnvelope;
  if (!res.ok || !json.data) {
    throw new Error(`authenticity check failed (${res.status})`);
  }
  return json.data;
}
