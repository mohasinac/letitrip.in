"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { normalizeError } from "@mohasinac/appkit/client";
import {
  Badge,
  Button,
  Details,
  Div,
  FieldInput,
  FieldSelect,
  Form,
  Heading,
  Icon,
  Label,
  PaginatedSelect,
  Row,
  Span,
  Stack,
  Summary,
  Text,
  TextLink,
} from "@mohasinac/appkit/ui";
import { EntityTypeahead } from "@mohasinac/appkit/features/search/components/EntityTypeahead";
import { useSiteSettings } from "@mohasinac/appkit/client";
import type { PublicSiteSettings } from "@mohasinac/appkit/client";
import { runAuthenticityCheck } from "@/lib/api/authenticity-client";
import { HELP_AUTHENTICITY_PATH } from "@/constants";
import type { AssessmentSignal, AuthenticityAssessment, AuthenticityRequest, GenerationId } from "../types";
/*
 * 🛑 Three deep imports, no barrel, and specifically NOT `../engine`.
 *
 * `KNOWLEDGE_BASE_SIZES` used to come from the engine, which pulled the engine,
 * the 495-row code table and the 220-row canonical index into this client
 * bundle for the sake of four integers in the panel at the bottom. The counts
 * are generated into their own dependency-free module for exactly this reason;
 * `AFTERMARKET_FRAMING_NOTE` and `GENERATIONS` come from the modules that
 * define them (Root Cause #18).
 */
import { KNOWLEDGE_BASE_SIZES } from "../data/knowledge-sizes.generated";
import { AFTERMARKET_FRAMING_NOTE } from "../data/marques";
import { GENERATIONS } from "../data/generations";
/*
 * 🛑 `model-options.generated`, NOT `canonical-index.generated` and NOT the
 * engine. Same reasoning as the three imports above, one step further: the
 * picker needs 221 slugs, labels and search blobs — it does not need the
 * aliases-as-data, the 517-row code table, or the 700 box codes in
 * `model-codes.generated`. The generator emits the small one for this file
 * alone.
 */
import { MODEL_OPTIONS } from "../data/model-options.generated";

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

/**
 * 🛑 `generation` DEFAULTS TO METAL FIGHT, and the default is doing real work
 * rather than saving a click.
 *
 * Everything this tool knows that it does not also know about every other
 * generation is Metal-series: 495 recorded box codes, 18 midfake codes and the
 * 4 the sources contradict each other about all come from Metal Fight / Zero-G
 * boxes, and no box-code decoding has ever been established for Burst or
 * Beyblade X. Opening on "pick a generation" made the commonest question —
 * "what does this code on my Metal Fight box mean" — cost a selection before
 * the tool would say anything at all.
 *
 * The cost of a pre-set default is that it can be wrong, silently, for a Burst
 * buyer. That is covered in the engine rather than here: a supplied generation
 * still wins, but a code or a name implying a different one now raises a
 * `generation-mismatch` signal naming both. A default that cannot be
 * questioned is the thing to avoid, not a default.
 */
const DEFAULT_GENERATION: GenerationId = "mfb";

/**
 * "" means "not stated", which is NOT the same as "no".
 *
 * The old control was a checkbox, so the only two expressible answers were
 * "yes, Random Booster" and silence — and silence was read as a firm "no",
 * which is what makes a name/code mismatch into a `concern`. A buyer who has
 * not got the box in front of them could not say so. Three options, defaulting
 * to the honest one, and `undefined` reaches the engine exactly as the
 * unchecked box used to, so nothing about the existing verdict path changes.
 */
const SOLD_AS_OPTIONS = [
  { value: "", label: "Not sure / not stated" },
  { value: "single", label: "On its own — a Starter or a Booster" },
  { value: "random-booster", label: "In a Random Booster or a multi-pack" },
];

/*
 * 🛑 `PaginatedSelect`, not `FieldSelect`, and only because of the count: the
 * UI Primitive Rules put every selection of more than five options on the
 * searchable primitive, and there are six generations plus "not sure". The
 * three-option control below stays on `FieldSelect` for the same reason.
 */
const GENERATION_OPTIONS = [
  ...GENERATIONS.map((g) => ({ value: g.id as string, label: `${g.label} — ${g.years}` })),
  { value: "", label: "Not sure / something else" },
];

/**
 * The picker's options, filtered locally.
 *
 * 🛑 `loadOptions` rather than the static `options` prop, and there is no
 * network behind it. `PaginatedSelect`'s static filter is
 * `label.toLowerCase().includes(query)` — label only — and the labels here are
 * canonical Takara Tomy names. A buyer typing "Pegasis" (Takara Tomy's own
 * romanisation), "L-Drago Destroy" (the TT name for what Hasbro calls
 * Destructor), or a Japanese name off the box would match NONE of them. The
 * search blob carries every alias the corpus holds, so filtering goes through
 * here instead; `loadOptions` is simply the only prop that lets a caller
 * decide what "matches" means.
 */
const MODEL_PAGE = 20;

function loadModelOptions(query: string, page: number) {
  const q = query.trim().toLowerCase();
  const matched = q
    ? MODEL_OPTIONS.filter((m) => m.search.includes(q) || m.label.toLowerCase().includes(q))
    : MODEL_OPTIONS;
  /*
   * Beys we actually hold box codes for first — 38 of 221, and they are the
   * only picks that unlock the code check. Alphabetical within each group, so
   * the list is still predictable to scan.
   */
  const ranked = [...matched].sort(
    (a, b) => Number(b.recordedCodes > 0) - Number(a.recordedCodes > 0) || a.label.localeCompare(b.label),
  );
  const start = (page - 1) * MODEL_PAGE;
  const slice = ranked.slice(start, start + MODEL_PAGE);
  return Promise.resolve({
    items: slice.map((m) => ({
      value: m.slug,
      label: m.recordedCodes > 0 ? `${m.label}  ·  ${m.recordedCodes} box codes on file` : m.label,
    })),
    hasMore: start + MODEL_PAGE < ranked.length,
    nextPage: page + 1,
  });
}

const MODEL_BY_SLUG = new Map(MODEL_OPTIONS.map((m) => [m.slug, m]));

interface FormState {
  /** The canonical slug the user PICKED. Empty when they have not picked. */
  modelSlug: string;
  name: string;
  code: string;
  marque: string;
  generation: string;
  soldAs: string;
}

const EMPTY: FormState = {
  modelSlug: "",
  name: "",
  code: "",
  marque: "",
  generation: DEFAULT_GENERATION,
  soldAs: "",
};

export function AuthenticityCheckerClient() {
  // `!== false` — default ON, matching every other consumer of this flag.
  const { data: settings } = useSiteSettings<PublicSiteSettings>();
  const searchIndexEnabled = settings?.search?.indexEnabled !== false;
  const [values, setValues] = useState<FormState>(EMPTY);
  /*
   * A confirmation line, nothing more. `values.name` is NEVER overwritten by
   * a pick — see `EntityTypeahead`'s `fillOnPick` 🛑 for why — so this exists
   * purely to tell the user "yes, we have a record of something close to
   * what you typed" without touching the string the engine will analyse.
   */
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [result, setResult] = useState<AuthenticityAssessment | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const run = useCallback(
    async (extra: Partial<AuthenticityRequest> = {}) => {
      setIsPending(true);
      setRequestError(null);
      try {
        const payload: AuthenticityRequest = {
          ...(values.modelSlug ? { modelSlug: values.modelSlug } : {}),
          ...(values.name ? { name: values.name } : {}),
          ...(values.code ? { code: values.code } : {}),
          ...(values.marque ? { marque: values.marque } : {}),
          ...(values.generation ? { generation: values.generation as GenerationId } : {}),
          /*
           * Only the affirmative answer is sent. "single" and "not sure" both
           * mean "do not apply the Random Booster exception", and the request
           * schema is `.strict()` — a `randomBooster: false` would be accurate
           * but would also assert that the user said no, when one of the two
           * cases is that they did not say.
           */
          ...(values.soldAs === "random-booster" ? { randomBooster: true } : {}),
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
   * Answering a clarifying question WRITES THE ANSWER BACK into form state as
   * well as re-running. Without that, picking "Lightning L-Drago 100HF" from
   * the "which one?" question answers it exactly once: the user then types the
   * box code, presses Check it, and the pick is gone because it only ever
   * existed in a one-shot payload. The question is a shortcut into the same
   * fields the form owns, not a parallel state.
   */
  const answer = useCallback(
    (extra: Partial<AuthenticityRequest>) => {
      setValues((s) => ({
        ...s,
        ...(extra.modelSlug ? { modelSlug: extra.modelSlug } : {}),
        ...(extra.generation ? { generation: extra.generation } : {}),
      }));
      return run(extra);
    },
    [run],
  );

  /*
   * Scroll the answer into view.
   *
   * On a phone the form is taller than the viewport, so the verdict rendered
   * below the fold and pressing "Check it" looked like it had done nothing —
   * the one moment this tool must not be ambiguous. Keyed on `result`, so it
   * fires on every fresh assessment including the re-runs a clarifying question
   * triggers, and `start` rather than `center` so the badge and headline land
   * at the top of the screen instead of the middle.
   */
  const resultRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!result) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  /*
   * 🛑 NO SESSION READ, NO GATE — and the gate that used to be here is worth
   * recording, because the argument for it was not silly.
   *
   * It read: this tool can say "this matches a batch collectors record as a
   * midfake", and an account keeps that sentence attached to a person and
   * reachable through support. What it actually did was ask a buyer standing
   * in a shop, about to hand over money, to create an account first — on the
   * one surface on this site whose entire job is to be consulted at that
   * moment. The person most in need of it is the person least likely to have
   * an account, and the engine does zero I/O, so there was never a cost
   * argument underneath it either.
   *
   * What replaces it is not nothing: the output is hedged by construction (no
   * verdict above `likely-reproduction`, every claim about a batch or a brand
   * rather than a seller), and `/tools/sticker-tracer` — which WRITES — keeps
   * its guard.
   */
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
            {/*
              * 🛑 THE PICKER IS THE PRIMARY INPUT, and that is a reversal.
              *
              * The form used to open on a free-text "Model name" field, which
              * put the burden of spelling a Takara Tomy release correctly on a
              * buyer who, by construction, is holding a box they are not sure
              * about. Typing "l drago" then produced "Nothing contradicts it,
              * and nothing confirms it either" — while the tool held 33
              * recorded box codes for Lightning L-Drago, 35 for Meteo and 27
              * for Destructor, and never said so.
              *
              * Picking from the taxonomy resolves exactly one bey, which is
              * what unlocks the per-model code list. The typed field still
              * exists, below, for the case it was built for.
              */}
            <Div className="appkit-form-field">
              <Label htmlFor="field-model">Which bey is it?</Label>
              <PaginatedSelect
                loadOptions={loadModelOptions}
                value={values.modelSlug}
                ariaLabel="Which bey is it?"
                placeholder="Search 221 releases — Lightning L-Drago, Storm Pegasus, Dran Sword…"
                searchPlaceholder="Type any part of the name, or a code like BB-43"
                onChange={(v) => setValues((s) => ({ ...s, modelSlug: v ?? "" }))}
              />
              <Text size="sm" color="muted">
                {values.modelSlug && MODEL_BY_SLUG.get(values.modelSlug)?.recordedCodes
                  ? `${MODEL_BY_SLUG.get(values.modelSlug)?.recordedCodes} box codes are on file for this one — add the code from your box below and I can check it against them.`
                  : "Search by Takara Tomy or Hasbro name, Japanese name, or product code. Not sure? Leave it and fill in whatever you can below."}
              </Text>
            </Div>
            <FieldInput
              name="code"
              label="Code on the box"
              placeholder="BB-105, B-174, BX-34 — or a date code like A0813"
              hint="A letter and four digits (A0813) is the box date code, which is the one I can check against the tables. BB-105 is the product code."
              value={values.code}
              onChange={(v: string) => setValues((s) => ({ ...s, code: v }))}
            />

            {/*
              * Everything below is optional and folded away. Four more fields
              * in front of someone who wants one answer is the "why is this
              * difficult" complaint, and each of these only sharpens an answer
              * the two fields above already produce.
              */}
            <Details tone="card" padding="md" rounded="lg">
              <Summary>More details — brand, generation, the name as printed</Summary>
              <Stack gap="md" className="min-w-0">
                <Div className="appkit-form-field">
                  <Label htmlFor="field-name">The name printed on the box</Label>
                  {/*
                    * 🛑 `fillOnPick={false}` — not an oversight, the entire
                    * point of wiring this component here. Picking "Storm
                    * Pegasus" must NOT replace what the engine analyses: its
                    * fuzzy match against a typed "Pegasis" is what fires the
                    * trademark-evasion signal, and an exact match against the
                    * canonical name would never trip it. See the matcher's own
                    * header — its alias table is built FROM a counterfeit
                    * seller's spellings, which is exactly backwards for this
                    * tool's purpose.
                    *
                    * 🛑 And this is why the picker above did NOT replace this
                    * field. A pick says which bey it is meant to be; this says
                    * what the box actually claims. When those disagree, the
                    * disagreement is the finding — collapsing them into one
                    * control would delete it.
                    */}
                  <EntityTypeahead
                    types={["model"]}
                    indexEnabled={searchIndexEnabled}
                    label="The name printed on the box"
                    placeholder="Type it exactly as printed — misspellings matter here"
                    value={values.name}
                    onChange={(v) => {
                      setValues((s) => ({ ...s, name: v }));
                      setMatchedName(null);
                    }}
                    fillOnPick={false}
                    onPick={(pick) => setMatchedName(pick.title)}
                  />
                  {matchedName && matchedName !== values.name && (
                    <Text size="xs" color="muted">
                      We have a record close to this: {matchedName}. The check
                      below still runs on exactly what you typed.
                    </Text>
                  )}
                  <Text size="sm" color="muted">
                    Only worth filling in if the box spelling looks off. Systematic
                    misspellings of real names are a documented trademark-evasion
                    tactic, so this field is checked for that — and the picker above
                    deliberately is not.
                  </Text>
                </Div>
                <FieldInput
                  name="marque"
                  label="Brand printed on the box"
                  placeholder="Takara Tomy, Hasbro, Funskool…"
                  value={values.marque}
                  onChange={(v: string) => setValues((s) => ({ ...s, marque: v }))}
                />
                <Div className="appkit-form-field">
                  <Label htmlFor="field-generation">Generation</Label>
                  <PaginatedSelect
                    options={GENERATION_OPTIONS}
                    value={values.generation}
                    ariaLabel="Generation"
                    placeholder="Not sure / something else"
                    onChange={(v) => setValues((s) => ({ ...s, generation: v ?? "" }))}
                  />
                  <Text size="sm" color="muted">
                    Pre-set to Metal Fight, which is where every recorded box code
                    lives. Change it if the box in front of you is a different
                    generation — the checks are completely different, and a Burst bey
                    graded against the Metal Fight list is a wrong answer delivered
                    confidently.
                  </Text>
                </Div>
                <FieldSelect
                  name="soldAs"
                  label="How it was sold"
                  options={SOLD_AS_OPTIONS}
                  value={values.soldAs}
                  hint="A Random Booster box carries the booster's own code, not the code of the bey inside, so a mismatch there is expected rather than a problem."
                  onChange={(v: string) => setValues((s) => ({ ...s, soldAs: v }))}
                />
              </Stack>
            </Details>

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
                    setMatchedName(null);
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

          <Div ref={resultRef} />
          {result ? <AssessmentPanel result={result} onAnswer={answer} isPending={isPending} /> : null}

          <Stack gap="xs" padding="card" rounded="lg" surface="muted" border="subtle">
            <Text size="sm" weight="semibold">
              What this tool actually knows
            </Text>
            <Text size="sm" color="muted">
              {KNOWLEDGE_BASE_SIZES.canonicalBeys} canonical releases across{" "}
              {GENERATIONS.length} generations, and{" "}
              {KNOWLEDGE_BASE_SIZES.originalCodes} Metal-series box codes recorded on
              genuine boxes — across {KNOWLEDGE_BASE_SIZES.modelsWithCodeHistory} models
              and {KNOWLEDGE_BASE_SIZES.regions} regions, so a Korean Sonokong or a
              Middle-East New Boy batch is recorded as itself rather than as a
              mystery. Plus {KNOWLEDGE_BASE_SIZES.midfakeCodes} midfake batch codes and
              about forty named unlicensed producers.
            </Text>
            <Text size="sm" color="muted">
              🛑 And {KNOWLEDGE_BASE_SIZES.contestedCodes} codes that two of those
              sources flatly disagree about — one records them on genuine boxes, the
              other on a midfake batch. Those are reported as the disagreement they
              are rather than resolved, because guessing would either accuse the
              holder of a real box or reassure the holder of a fake. It knows nothing
              at all about the specific item in your hands, which is why every answer
              ends in physical checks only you can do.
            </Text>
            <Text size="sm" color="muted">
              {AFTERMARKET_FRAMING_NOTE}
            </Text>
            <Text size="sm" color="muted">
              If the words are the confusing part —{" "}
              <TextLink href={HELP_AUTHENTICITY_PATH}>is my Beyblade original?</TextLink>{" "}
              explains what original, reproduction, midfake and unlicensed each mean
              before you grade anything.
            </Text>
          </Stack>
    </Stack>
  );
}

/**
 * The box codes recorded against this exact bey.
 *
 * 🛑 This block is the answer to the complaint that started the rework —
 * asking about L-Drago and being told "nothing contradicts it, and nothing
 * confirms it either" while the tables held 95 codes across the three L-Drago
 * releases and the tool had no way to say so.
 *
 * 🛑 Every sentence here has to defend against the reading "my code is not in
 * the list, so it is fake". It is not: 38 of 221 canonical beys have any
 * recorded code at all, and the tables record boxes collectors photographed
 * rather than boxes that were manufactured. The copy says that where a user
 * will actually read it, not only in the collapsed working-out.
 */
function ModelCodePanel({
  model,
  supplied,
}: {
  model: NonNullable<AuthenticityAssessment["modelCodes"]>;
  supplied: string | null;
}) {
  const { originalCodes, midfakeCodes, contestedCodes } = model;
  if (originalCodes.length === 0 && midfakeCodes.length === 0 && contestedCodes.length === 0) {
    return null;
  }

  const CodeList = ({ codes, tone }: { codes: readonly string[]; tone: "default" | "danger" | "warning" }) => (
    <Row gap="xs" wrap className="min-w-0">
      {codes.map((c) => (
        <Badge
          key={c}
          variant={
            // The code the user actually gave is marked, so the list is
            // scannable rather than something to read end to end.
            supplied === c ? "primary" : tone === "danger" ? "danger" : tone === "warning" ? "warning" : "secondary"
          }
        >
          {c}
        </Badge>
      ))}
    </Row>
  );

  return (
    <Stack gap="sm" padding="card" rounded="lg" surface="card" border="subtle">
      <Text weight="semibold">
        Box codes recorded for {model.name}
        {model.retailCode ? ` (${model.retailCode})` : ""}
      </Text>

      {originalCodes.length > 0 ? (
        <Stack gap="xs" className="min-w-0">
          <Text size="sm" color="muted">
            {originalCodes.length} recorded on boxes collectors judged genuine:
          </Text>
          <CodeList codes={originalCodes} tone="default" />
        </Stack>
      ) : null}

      {contestedCodes.length > 0 ? (
        <Stack gap="xs" className="min-w-0">
          <Text size="sm" color="muted">
            {contestedCodes.length} the sources flatly disagree about — one records
            it as genuine, another as a midfake batch. Neither reading is quoted on
            its own here, because being wrong costs you money in both directions:
          </Text>
          <CodeList codes={contestedCodes} tone="warning" />
        </Stack>
      ) : null}

      {midfakeCodes.length > 0 ? (
        <Stack gap="xs" className="min-w-0">
          <Text size="sm" color="muted">
            {midfakeCodes.length} recorded on a midfake batch of this bey — a
            statement about a production run, not about whoever is selling it:
          </Text>
          <CodeList codes={midfakeCodes} tone="danger" />
        </Stack>
      ) : null}

      <Text size="sm" color="muted">
        🛑 A code missing from this list means unrecorded, not fake. These tables
        are what collectors photographed, never a manufacturing record, and new
        genuine codes turn up regularly — and counterfeiters print real codes
        anyway. Use it to recognise a code, never to convict one.
      </Text>
      <TextLink href={`/categories/${model.categoryId}`}>
        Everything we hold on {model.name}
      </TextLink>
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

      {result.modelCodes ? <ModelCodePanel model={result.modelCodes} supplied={result.dateCode?.normalised ?? null} /> : null}

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

      {/*
        🛑 THE WORKING-OUT IS FOLDED AWAY, and the verdict block above is not.
        Every signal here is honest and some are genuinely interesting, but
        eleven of them stacked under the answer is a wall of reasoning between
        a buyer and the thing they asked for — the reported complaint, in the
        reporter's own words: "end users just verdict is fine".

        It is COLLAPSED rather than removed, because "why should I believe
        this" has to stay answerable in one tap for a tool whose whole posture
        is that it is hedged and says where every claim comes from. A concern
        forces it open: the one case where the reasoning IS the answer is the
        case where something is wrong, and a user who never expands it must
        not be the user who never learns that.
      */}
      {result.signals.length > 0 ? (
        <Details
          tone="card"
          padding="md"
          rounded="lg"
          defaultOpen={result.signals.some((s) => s.direction === "concern")}
        >
          <Summary>
            How I got there — {result.signals.length}{" "}
            {result.signals.length === 1 ? "check" : "checks"}
          </Summary>
          <Stack gap="sm" className="min-w-0">
            {result.signals.map((s) => (
              <Stack key={s.id} gap="xs" padding="card-tight" rounded="lg" surface="muted" border="subtle">
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
        </Details>
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
