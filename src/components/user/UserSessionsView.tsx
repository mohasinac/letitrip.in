"use client";

/*
 * WHY: `GET /api/user/sessions` and `DELETE /api/user/sessions/[id]` have both
 *      been live with ZERO consumers, while `BuyerAccountGuideView` tells
 *      buyers the page exists — "view all devices signed in at My Account →
 *      Sessions. Sign out unfamiliar devices immediately." There was no such
 *      page. The only sessions surface in the repo was the ADMIN one.
 *
 *      A help doc promising a security control that does not exist is worse
 *      than no doc: someone who suspects their account is compromised goes
 *      looking for it and finds nothing.
 *
 * WHAT: The buyer's own active sessions, with a per-row revoke.
 *
 * ## What is deliberately absent
 *
 * "Sign out everywhere". The guide mentions it, but there is no bulk route —
 * only `DELETE /api/user/sessions/[id]` — and firing N deletes from a loop
 * would be a different thing wearing the same label: partial failure would
 * leave some devices signed in with no way for the user to tell which. It is
 * named as a follow-up rather than faked.
 *
 * @tag domain:account,auth
 * @tag layer:view
 * @tag access:client
 * @tag consumers:/user/sessions
 * @tag sideEffects:network
 */

// audit-detail-affordance-ok: a session row already shows the whole record a
// buyer may see — device, browser, OS, country, when it started, when it was
// last used. The only unrendered fields are `userAgent` and `ip`, both
// PII-encrypted at rest with `revealSession` existing for the ADMIN path
// only. There is nothing behind this row to open; a "view details" would be a
// modal repeating the row back.

import { useCallback, useEffect, useState } from "react";
import {
  ACTIONS,
  Badge,
  Button,
  ConfirmDeleteModal,
  Div,
  Row,
  Span,
  Stack,
  Text,
  normalizeError,
  useToast,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { fetchUserSessions, revokeUserSession } from "@/lib/api/user-client";
import { toUserMessage } from "@mohasinac/appkit/client";

interface SessionRow {
  id: string;
  isActive: boolean;
  createdAt?: string;
  lastActivity?: string;
  expiresAt?: string;
  deviceInfo?: { browser?: string; os?: string; device?: string };
  location?: { country?: string };
}

function describeDevice(s: SessionRow): string {
  const parts = [s.deviceInfo?.browser, s.deviceInfo?.os, s.deviceInfo?.device].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Unknown device";
}

function formatWhen(value: string | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-IN");
}

export function UserSessionsView() {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<SessionRow | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetchUserSessions(API_ROUTES.USER.SESSIONS);
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { data?: { sessions?: SessionRow[] } };
      setSessions(json?.data?.sessions ?? []);
      setFailed(false);
    } catch (err) {
      void normalizeError(err);
      /*
       * A failure is NOT rendered as an empty list. "No other devices are
       * signed in" is a claim about this account's security; "we could not
       * load this" is the truth, and on this page the two must not look
       * alike — the empty state is exactly the reassuring answer.
       */
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revoke = useCallback(async () => {
    if (!revokeTarget) return;
    setRevokingId(revokeTarget.id);
    try {
      const res = await revokeUserSession(API_ROUTES.USER.SESSION_BY_ID(revokeTarget.id));
      if (!res.ok) throw new Error(String(res.status));
      showToast("That device has been signed out.", "success");
      await load();
    } catch (err) {
      const normalized = normalizeError(err);
      showToast(toUserMessage(normalized.code, undefined, { fallback: "Could not sign that device out." }), "error");
    } finally {
      setRevokingId(null);
      setRevokeTarget(null);
    }
  }, [revokeTarget, load, showToast]);

  if (failed) {
    return (
      <Div surface="danger-surface" color="error" padding="inline" rounded="xl" textSize="sm">
        We could not load your sessions. Refresh to try again.
      </Div>
    );
  }

  if (sessions === null) {
    return <Text size="sm" color="muted">Loading your devices…</Text>;
  }

  if (sessions.length === 0) {
    return <Text size="sm" color="muted">No active sessions found.</Text>;
  }

  return (
    <>
      <Stack gap="sm">
        {sessions.map((s) => (
          <Row
            key={s.id}
            surface="card"
            padding="sm"
            rounded="lg"
            align="center"
            justify="between"
            gap="md"
          >
            <Stack gap="none" className="min-w-0">
              <Row gap="sm" align="center" wrap>
                <Text size="sm" weight="medium" color="primary">{describeDevice(s)}</Text>
                <Badge variant={s.isActive ? "active" : "inactive"} size="xs">
                  {s.isActive ? "Active" : "Ended"}
                </Badge>
                {s.location?.country && (
                  <Span size="xs" color="muted">{s.location.country}</Span>
                )}
              </Row>
              <Text size="xs" color="muted">
                Last used {formatWhen(s.lastActivity)} · started {formatWhen(s.createdAt)}
              </Text>
            </Stack>
            {s.isActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={revokingId === s.id}
                aria-label={`${ACTIONS.USER["revoke-session"].ariaLabel}: ${describeDevice(s)}`}
                onClick={() => setRevokeTarget(s)}
              >
                {ACTIONS.USER["revoke-session"].label}
              </Button>
            )}
          </Row>
        ))}
      </Stack>

      {/*
        The IP address is deliberately not shown. It is PII-encrypted at rest
        (`SessionRepository.revealSession` exists for the admin path), and the
        device/browser/country already answer the question this page is for:
        "is one of these not me".
      */}
      {revokeTarget && (
        <ConfirmDeleteModal
          isOpen
          /* Rule #7 — copy from the ActionDef, not written here. */
          title={ACTIONS.USER["revoke-session"].confirmation?.title}
          message={ACTIONS.USER["revoke-session"].confirmation?.body}
          confirmText={ACTIONS.USER["revoke-session"].confirmation?.confirmLabel}
          isDeleting={revokingId === revokeTarget.id}
          onConfirm={() => void revoke()}
          onClose={() => setRevokeTarget(null)}
        />
      )}
    </>
  );
}
