"use client";

/**
 * GrievanceForm — the intake the grievance page never had.
 *
 * ## What was there before
 *
 * Prose and a `mailto:`. Nothing recorded a grievance, timestamped it, or
 * started a clock, so "how long do complaints take" had no answerable form —
 * which is the one thing a grievance regime requires evidence of (D18).
 *
 * ## 🛑 It records a clock and PUBLISHES no promise
 *
 * `fileGrievanceAction` stamps `acknowledgedAt` synchronously and computes
 * `dueAt` from configurable periods, and the confirmation shows that date —
 * telling someone when to expect an answer is what an acknowledgement is for.
 *
 * What this component deliberately does NOT do is state a statutory timeline as
 * a published commitment. The periods applicable to this business have not been
 * supplied, and a published timeline we then miss is worse than the present
 * silence. The surrounding page uses `<PendingValue>` for exactly the same
 * reason on the officer's details. So: clock runs, evidence accrues, claim
 * waits.
 *
 * ## Signed in, and the form says so up front
 *
 * A grievance is tied to a person and usually to an order. An anonymous one
 * cannot be acknowledged to anybody, matched to a purchase, or have its
 * resolution delivered. Telling the visitor that before they type is the point
 * — failing at submit after they have written five hundred words about
 * something that already went wrong is the worst possible second failure.
 */

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Alert,
  Button,
  Div,
  Heading,
  Input,
  Row,
  Stack,
  Text,
  Textarea,
  ROUTES,
  useOptionalSession,
} from "@mohasinac/appkit/client";
import { normalizeError } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

const SUBJECT_MIN = 5;
const DETAIL_MIN = 30;

export default function GrievanceForm() {
  /*
   * 🛑 `useOptionalSession`, never `useSession`. This form renders on a PUBLIC
   * policy page, so a provider is not guaranteed — and library code that adjusts
   * for the viewer must not require one (Root Cause #20). No provider fails
   * CLOSED here: the sign-in prompt is shown, which is the safe direction.
   */
  const session = useOptionalSession();
  const user = session?.user ?? null;
  const authResolving = session?.loading ?? false;

  const [subject, setSubject] = useState("");
  const [detail, setDetail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filed, setFiled] = useState<{ ticketId: string; dueAt: string } | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const parsedAmount = amount.trim() === "" ? undefined : Number(amount);
      /*
       * Checked rather than coerced. `Number("")` is 0 and `Number("abc")` is
       * NaN, and either silently reaching the route would record a money figure
       * the complainant never typed — on the one record whose job is to be
       * evidence.
       */
      if (parsedAmount !== undefined && !Number.isFinite(parsedAmount)) {
        throw new Error("The disputed amount needs to be a number, or left empty.");
      }
      const res = await fetch(API_ROUTES.GRIEVANCE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          detail: detail.trim(),
          ...(orderId.trim() ? { orderId: orderId.trim() } : {}),
          ...(parsedAmount !== undefined ? { disputedAmount: parsedAmount } : {}),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? `The grievance was not filed (${res.status})`);
      setFiled(body?.data ?? null);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setBusy(false);
    }
  };

  if (filed) {
    return (
      <Div surface="card" padding="md">
        <Stack gap="sm">
          <Heading level={3}>We have your grievance</Heading>
          <Text size="sm" color="muted">
            Reference <strong>{filed.ticketId}</strong>. We recorded it when you
            submitted it, and we aim to come back to you by{" "}
            <strong>{new Date(filed.dueAt).toLocaleDateString()}</strong>.
          </Text>
          <Text size="xs" color="muted">
            You can follow it in your support tickets.
          </Text>
          <Row gap="sm">
            <Button variant="outline" size="sm" asChild>
              <Link href={String(ROUTES.USER.SUPPORT)}>
                My support tickets
              </Link>
            </Button>
          </Row>
        </Stack>
      </Div>
    );
  }

  /*
   * Three states, not two. `SessionProvider` mounts `initialUser={null}`, so
   * `loading` starts true on every hard load FOR SIGNED-IN USERS TOO — a
   * two-state gate would flash "sign in to continue" at someone who is already
   * signed in, on a page they reached because something had gone wrong
   * (Root Cause #93's three-state rule).
   */
  if (authResolving) {
    return (
      <Div surface="card" padding="md">
        <Text size="sm" color="muted">
          Checking your account…
        </Text>
      </Div>
    );
  }

  if (!user) {
    return (
      <Div surface="card" padding="md">
        <Stack gap="sm">
          <Heading level={3}>Raise a grievance</Heading>
          <Text size="sm" color="muted">
            Please sign in first. A grievance is tied to your account and usually
            to an order, so we can acknowledge it to you, match it to your
            purchase, and send you the outcome — none of which is possible
            anonymously.
          </Text>
          <Row gap="sm">
            <Button variant="primary" size="sm" asChild>
              <Link href={String(ROUTES.AUTH.LOGIN)}>Sign in</Link>
            </Button>
          </Row>
        </Stack>
      </Div>
    );
  }

  const canSubmit =
    subject.trim().length >= SUBJECT_MIN && detail.trim().length >= DETAIL_MIN && !busy;

  return (
    <Div surface="card" padding="md">
      <Stack gap="md">
        <Stack gap="xs">
          <Heading level={3}>Raise a grievance</Heading>
          <Text size="sm" color="muted">
            Use this when something has gone wrong and the usual support route
            has not resolved it. We record it the moment you submit, and you get
            a reference.
          </Text>
        </Stack>

        {error ? (
          <Alert variant="error" title="The grievance was not filed">
            {error}
          </Alert>
        ) : null}

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="A short line summarising the complaint"
          required
        />

        <Stack gap="xs">
          <Textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={6}
            placeholder="What happened, when, what you have already tried, and what you want put right."
          />
          <Text size="xs" color="muted">
            At least {DETAIL_MIN} characters — a complaint with no account of the
            problem cannot be investigated or evidenced.
          </Text>
        </Stack>

        <Row gap="md" wrap>
          <Input
            label="Order number (if it concerns one)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="order-…"
          />
          {/*
            A structured amount rather than prose, so the operator queue can
            sort by what is at stake — a money complaint should not be a
            paragraph somebody has to read to triage.
          */}
          <Input
            label="Amount in dispute (₹, optional)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
          />
        </Row>

        <Row gap="sm">
          <Button variant="primary" isLoading={busy} disabled={!canSubmit} onClick={submit}>
            Submit grievance
          </Button>
        </Row>
      </Stack>
    </Div>
  );
}
