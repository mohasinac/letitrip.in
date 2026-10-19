"use client";
import React, { useCallback, useState } from "react";
import { normalizeError, useSession, ROUTES } from "@mohasinac/appkit/client";
import {
  Badge,
  Button,
  Div,
  FieldCheckbox,
  FieldInput,
  Form,
  Heading,
  Icon,
  Row,
  Span,
  Stack,
  Text,
  TextLink,
} from "@mohasinac/appkit/ui";
import { runAuthenticityCheck } from "@/lib/api/authenticity-client";
import { HELP_AUTHENTICITY_PATH } from "@/constants";
import type { AssessmentSignal, AuthenticityAssessment, AuthenticityRequest } from "../types";
import { KNOWLEDGE_BASE_SIZES, AFTERMARKET_FRAMING_NOTE } from "../engine";

/**
 * The authenticity checker UI.
 *
 * 🛑 The whole design rule for this screen: it must be impossible to mistake a
 * signal for a verdict. So the verdict line is one sentence, the caveat sits
 * directly under it in the same block (never collapsed, never behind a
 * disclosure), and every signal carries its own confidence chip. A user who
 * reads only the top two lines must come away with the right impression.
 */

const VERDICT_PRESENTATION: Record<
  AuthenticityAssessment["verdict"],
  { readonly tone: "success" | "warning" | "danger" | "info" | "secondary"; readonly label: string }
> = {
  "consistent-with-original": { tone: "success", label: "Consistent with an original" },
  inconclusive: { tone: "info", label: "Inconclusive" },
  "discrepancy-found": { tone: "warning", label: "Discrepancy found" },
  "likely-reproduction": { tone: "danger", label: "Likely reproduction" },
  "needs-input": { tone: "secondary", label: "Need a bit more" },
};

const CONFIDENCE_LABEL: Record<AssessmentSignal["confidence"], string> = {
  verified: "verified",
  reported: "reported",
  disputed: "disputed",
};

const DIRECTION_ICON: Record<AssessmentSignal["direction"], "verify" | "report" | "help"> = {
  "supports-original": "verify",
  concern: "report",
  neutral: "help",
};

interface FormState {
  name: string;
  code: string;
  marque: string;
  randomBooster: boolean;
}

const EMPTY: FormState = { name: "", code: "", marque: "", randomBooster: false };

export function AuthenticityCheckerClient() {
  const { user, loading } = useSession();
  const [values, setValues] = useState<FormState>(EMPTY);
  const [result, setResult] = useState<AuthenticityAssessment | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const run = useCallback(
    async (extra: Partial<AuthenticityRequest> = {}) => {
      setIsPending(true);
      setRequestError(null);
      try {
        const payload: AuthenticityRequest = {
          ...(values.name ? { name: values.name } : {}),
          ...(values.code ? { code: values.code } : {}),
          ...(values.marque ? { marque: values.marque } : {}),
          ...(values.randomBooster ? { randomBooster: true } : {}),
          ...extra,
        };
        /*
         * 🛑 The server's own message is never rendered. Rule #9's note on this:
         * `?? error` printed server internals to the user, and once rendered a
         * Node stack trace inside a modal. The wrapper throws; we say one flat
         * sentence.
         */
        setResult(await runAuthenticityCheck(payload));
      } catch (err) {
        const normalised = normalizeError(err);
        setRequestError(
          normalised.kind === "network"
            ? "Looks like the connection dropped. Try again."
            : "Could not run the check just now. Try again in a moment.",
        );
      } finally {
        setIsPending(false);
      }
    },
    [values],
  );

  /*
   * 🛑 THREE states, not two. `SessionProvider` mounts `initialUser={null}`
   * because the root locale layout must stay static (Root Cause #82), so
   * `loading` starts true on every hard load FOR SIGNED-IN USERS TOO. A
   * two-state gate flashes "sign in to use this" at someone who is already
   * signed in, on every page load — exactly the bug Root Cause #93 records.
   */
  if (loading) {
    return (
      <Stack gap="xs" padding="card" rounded="lg" surface="card" border="subtle">
        <Text color="muted">Checking your session…</Text>
      </Stack>
    );
  }

  if (!user?.uid) {
    return (
      <Stack gap="md" padding="card" rounded="lg" surface="card" border="subtle">
        <Heading level={2} size="lg">
          Sign in to run a lookup
        </Heading>
        <Text color="muted">
          The checker can tell you that an item matches a production batch
          collectors record as a midfake, and that is not a sentence worth handing
          to anyone who asks — an account keeps the lookup attached to a person and
          reachable through support if it gets something wrong.
        </Text>
        <Row gap="sm">
          <TextLink href={String(ROUTES.AUTH.LOGIN)}>Sign in</TextLink>
          <Text color="muted">·</Text>
          <TextLink href={String(ROUTES.AUTH.REGISTER)}>Create an account</TextLink>
        </Row>
        <Text size="sm" color="muted">
          Everything below this box is free and needs no account — the generation
          table, the box-code explanation and the checks that apply regardless. So
          is <TextLink href={HELP_AUTHENTICITY_PATH}>is my Beyblade original?</TextLink>,
          which explains what the words mean.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" className="min-w-0">
          {/*
            * audit-form-sectionised-ok: this is a QUERY form, not an editor. It
            * persists nothing, has no draft, no publish step and no entity
            * behind it — the four controls are one question asked four ways,
            * and there is nothing to collapse into schema-derived sections.
            * The audit's own header exempts "search and filter inputs built
            * from FieldInput" for exactly this reason; it catches this file
            * only because the control count (4) crosses its editor threshold
            * while it also owns a submit.
            */}
          <Form
            spacing="md"
            onSubmit={(e) => {
              e.preventDefault();
              void run();
            }}
          >
            <FieldInput
              name="name"
              label="Model name"
              placeholder="Storm Pegasus, Dran Sword, Valtryek…"
              value={values.name}
              onChange={(v: string) => setValues((s) => ({ ...s, name: v }))}
            />
            <FieldInput
              name="code"
              label="Code on the box"
              placeholder="BB-105, B-174, BX-34 — or a date code like A0813"
              value={values.code}
              onChange={(v: string) => setValues((s) => ({ ...s, code: v }))}
            />
            <FieldInput
              name="marque"
              label="Brand printed on the box"
              placeholder="Takara Tomy, Hasbro, Funskool…"
              value={values.marque}
              onChange={(v: string) => setValues((s) => ({ ...s, marque: v }))}
            />
            <FieldCheckbox
              name="randomBooster"
              label="This came in a Random Booster or a multi-pack"
              checked={values.randomBooster}
              onChange={(v: boolean) => setValues((s) => ({ ...s, randomBooster: v }))}
            />
            <Row gap="sm" align="center">
              <Button type="submit" isLoading={isPending}>
                Check it
              </Button>
              {result || requestError ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setValues(EMPTY);
                    setResult(null);
                    setRequestError(null);
                  }}
                >
                  Start over
                </Button>
              ) : null}
            </Row>
          </Form>

          {requestError ? (
            <Stack gap="xs" padding="card" rounded="lg" surface="warning-surface">
              <Text color="warning">{requestError}</Text>
            </Stack>
          ) : null}

          {result ? <AssessmentPanel result={result} onAnswer={run} isPending={isPending} /> : null}

          <Stack gap="xs" padding="card" rounded="lg" surface="muted" border="subtle">
            <Text size="sm" weight="semibold">
              What this tool actually knows
            </Text>
            <Text size="sm" color="muted">
              {KNOWLEDGE_BASE_SIZES.canonicalBeys} canonical releases across{" "}
              {KNOWLEDGE_BASE_SIZES.generations} generations,{" "}
              {KNOWLEDGE_BASE_SIZES.originalCodes} Metal-series box codes recorded on
              genuine boxes, {KNOWLEDGE_BASE_SIZES.midfakeCodes} midfake batch codes,
              and about forty named unlicensed producers. It knows nothing about the
              specific item in your hands, which is why every answer ends in physical
              checks only you can do.
            </Text>
            <Text size="sm" color="muted">
              {AFTERMARKET_FRAMING_NOTE}
            </Text>
          </Stack>
    </Stack>
  );
}

function AssessmentPanel({
  result,
  onAnswer,
  isPending,
}: {
  result: AuthenticityAssessment;
  onAnswer: (extra: Partial<AuthenticityRequest>) => void | Promise<void>;
  isPending: boolean;
}) {
  const presentation = VERDICT_PRESENTATION[result.verdict];

  return (
    <Stack gap="md" className="min-w-0">
      {/* The verdict block. Headline and caveat are one unit on purpose. */}
      <Stack gap="sm" padding="card" rounded="lg" surface="card" border="subtle">
        <Row gap="sm" align="center" className="min-w-0">
          <Badge variant={presentation.tone}>{presentation.label}</Badge>
          {result.generation ? (
            <Text size="sm" color="muted">
              {result.generationSource === "supplied" ? "you told me: " : "read as: "}
              {result.generation}
            </Text>
          ) : null}
        </Row>
        <Heading level={2} size="lg">
          {result.headline}
        </Heading>
        <Text color="muted">{result.caveat}</Text>
      </Stack>

      {result.safetyNote ? (
        <Stack gap="xs" padding="card" rounded="lg" surface="danger-surface">
          <Text weight="semibold" color="error">
            Safety
          </Text>
          <Text color="error">{result.safetyNote}</Text>
        </Stack>
      ) : null}

      {result.question ? (
        <Stack gap="sm" padding="card" rounded="lg" surface="info-surface">
          <Text weight="semibold">{result.question.question}</Text>
          <Text size="sm" color="muted">
            {result.question.why}
          </Text>
          <Stack gap="xs">
            {result.question.options.map((opt) => (
              <Button
                key={opt.value}
                variant="secondary"
                isLoading={isPending}
                onClick={() =>
                  void onAnswer(
                    result.question!.field === "generation"
                      ? { generation: opt.value as AuthenticityRequest["generation"] }
                      : { modelSlug: opt.value },
                  )
                }
              >
                {opt.label} — {opt.hint}
              </Button>
            ))}
          </Stack>
        </Stack>
      ) : null}

      {result.dateCode?.wellFormed && result.dateCode.readings.length > 0 ? (
        <Stack gap="xs" padding="card" rounded="lg" surface="muted" border="subtle">
          <Text weight="semibold">Reading {result.dateCode.normalised}</Text>
          {result.dateCode.readings.map((r) => (
            <Text key={r.interpretation} size="sm" color="muted">
              {r.label} → <Span weight="semibold">{r.value}</Span>
            </Text>
          ))}
          <Text size="sm" color="muted">
            Both readings circulate in the community and Takara Tomy has published
            neither, so treat the date as indicative rather than as a fact about the
            item.
          </Text>
        </Stack>
      ) : null}

      {/*
        🛑 A "did you mean", NOT a finding.

        It is rendered in a NEUTRAL surface, outside "What I checked", and it
        does not appear in `result.signals` — because a near-miss code is
        ambiguous between a typo and a batch that mimics a real code, and
        this tool's third rule is that a false accusation against a real
        seller is worse than a missed one. An ambiguous signal must not
        become one.

        The verdict is unchanged by this block's existence: an unmatched code
        is still `neutral` + `inconclusive`, and the copy still says "not
        recorded", not "fake". New genuine codes turn up regularly, and
        counterfeiters use real codes anyway — a code's absence proves
        nothing in either direction.
      */}
      {result.dateCode && result.dateCode.nearMisses.length > 0 ? (
        <Stack gap="xs" padding="card" rounded="lg" surface="muted" border="subtle">
          <Text size="sm" color="muted">
            {result.dateCode.normalised} is not in either table. Did you mean{" "}
            <Span weight="semibold">{result.dateCode.nearMisses.join(" or ")}</Span>? Codes
            are easy to transpose — check the box again if one of those looks right.
          </Text>
          <Text size="sm" color="muted">
            If the code really is {result.dateCode.normalised}, that is not a problem on its
            own: the tables are a community record, not a complete list, and new genuine
            codes appear all the time.
          </Text>
        </Stack>
      ) : null}

      {result.signals.length > 0 ? (
        <Stack gap="sm" className="min-w-0">
          <Heading level={3} size="lg">
            What I checked
          </Heading>
          {result.signals.map((s) => (
            <Stack key={s.id} gap="xs" padding="card-tight" rounded="lg" surface="card" border="subtle">
              <Row gap="sm" align="center" className="min-w-0">
                <Icon
                  name={DIRECTION_ICON[s.direction]}
                  size="md"
                  tone={
                    s.direction === "concern"
                      ? "error"
                      : s.direction === "supports-original"
                        ? "success"
                        : "muted"
                  }
                />
                <Text weight="semibold" className="min-w-0">
                  {s.label}
                </Text>
                <Badge variant="secondary">{CONFIDENCE_LABEL[s.confidence]}</Badge>
              </Row>
              <Text size="sm" color="muted">
                {s.detail}
              </Text>
            </Stack>
          ))}
        </Stack>
      ) : null}

      {result.manualChecks.length > 0 ? (
        <Stack gap="sm" className="min-w-0">
          <Heading level={3} size="lg">
            Check these yourself — conclusive ones first
          </Heading>
          {result.manualChecks.map((c) => (
            <Stack key={c.id} gap="xs" padding="card-tight" rounded="lg" surface="card" border="subtle">
              <Row gap="sm" align="center" className="min-w-0">
                <Text weight="semibold" className="min-w-0">
                  {c.label}
                </Text>
                {c.decisive ? <Badge variant="warning">decisive</Badge> : null}
              </Row>
              <Text size="sm" color="muted">
                {c.detail}
              </Text>
            </Stack>
          ))}
        </Stack>
      ) : null}

      {result.related.length > 0 ? (
        <Stack gap="xs" padding="card" rounded="lg" surface="muted" border="subtle">
          <Text weight="semibold">Next</Text>
          {result.related.map((r) => (
            <TextLink key={r.href} href={r.href}>
              {r.label}
            </TextLink>
          ))}
        </Stack>
      ) : null}

      {result.suggestedListingAuthenticity ? (
        <Div padding="card" rounded="lg" surface="muted" border="subtle">
          <Text size="sm" color="muted">
            Selling this? Based on the above, the honest value for a listing&apos;s
            authenticity field is{" "}
            <Span weight="semibold">{result.suggestedListingAuthenticity}</Span>. Buyers
            here see that on the listing, and &quot;unverified&quot; is a legitimate,
            non-penalised answer — it means nobody has confirmed it either way.
          </Text>
        </Div>
      ) : null}
    </Stack>
  );
}
