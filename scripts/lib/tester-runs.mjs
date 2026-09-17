/*
 * Shared reader for tester run data.
 *
 * The three regression-ledger scripts (tester-run-report, tester-traceability,
 * tester-carry-forward) all need the same thing: "give me every non-control
 * verdict for a run, joined to the case that produced it". Writing that three
 * times is how the three drift — so it lives here once.
 *
 * 🛑 A CONTROL IS NEVER A RESULT. Every reader here drops `control-*` ids.
 * They are calibration, not coverage: counting them would inflate the pass rate
 * by ~28% (508 controls against 1,340 real cases in the current catalogue) and
 * make a quarantined batch look like two extra findings.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export const RUNS_DIR = "tester/.tester-runs";

/** yes|no|null → the spec's vocabulary. */
export const PASS = "PASS";
export const FAIL = "FAIL";
export const BLOCKED = "BLOCKED";

export function statusOf(answer) {
  if (answer === "yes") return PASS;
  if (answer === "no") return FAIL;
  return BLOCKED;
}

export const isControl = (id) => String(id).startsWith("control-");

/** Every runId on disk that has a verdicts/ directory, oldest first. */
export function listRuns() {
  if (!existsSync(RUNS_DIR)) return [];
  return readdirSync(RUNS_DIR)
    .filter((d) => /^run-\d+$/.test(d))
    .filter((d) => existsSync(join(RUNS_DIR, d, "verdicts")))
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
}

/**
 * Read one run into a flat list of records.
 *
 * Each record joins the VERDICT (what the tester answered) to the CASE (what
 * was asked). The case body is embedded in the verdict file at store time
 * precisely so this join needs no second read of batches/ — which matters,
 * because batches/ accumulates across runs and would be the wrong source.
 */
export function readRun(runId) {
  const dir = join(RUNS_DIR, runId, "verdicts");
  if (!existsSync(dir)) return { runId, records: [], batches: [], quarantined: [] };

  const records = [];
  const batches = [];
  const quarantined = [];

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    let j;
    try {
      j = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch {
      continue; // a half-written file is not a result
    }
    const batchKey = j.batch?.key ?? file.replace(/\.json$/, "").replace(/__/g, "/");
    batches.push({
      key: batchKey,
      groupKey: j.batch?.groupKey ?? "",
      groupLabel: j.batch?.groupLabel ?? j.batch?.groupKey ?? "",
      pageLabel: j.batch?.pageLabel ?? j.batch?.pageKey ?? "",
      phase: j.batch?.phase ?? null,
      quarantined: !!j.quarantined,
      recordedAt: statSync(join(dir, file)).mtime.toISOString(),
    });
    if (j.quarantined) quarantined.push({ key: batchKey, wrongControls: j.wrongControls ?? [] });

    const caseById = new Map((j.cases ?? []).map((c) => [c.id, c]));
    for (const v of j.verdicts ?? []) {
      if (isControl(v.id)) continue;
      const c = caseById.get(v.id) ?? {};
      records.push({
        id: v.id,
        status: statusOf(v.answer),
        answer: v.answer ?? null,
        comment: v.comment ?? "",
        evidence: v.evidence ?? {},
        label: v.label ?? c.label ?? "",
        href: v.href ?? c.href ?? c.startPage ?? "",
        batchKey,
        groupLabel: j.batch?.groupLabel ?? "",
        pageLabel: j.batch?.pageLabel ?? "",
        quarantined: !!j.quarantined,
        requiresHumanChannel: !!c.requiresHumanChannel,
        humanChannelReason: c.humanChannelReason ?? null,
        expectedBehaviour: c.expectedBehaviour ?? "",
        expectedUiState: c.expectedUiState ?? "",
        steps: c.steps ?? [],
        roles: c.roles ?? [],
      });
    }
  }

  return { runId, records, batches, quarantined };
}

/** id → record, for diffing one run against another. */
export function indexById(records) {
  const m = new Map();
  for (const r of records) m.set(r.id, r);
  return m;
}

export function tally(records) {
  const t = { PASS: 0, FAIL: 0, BLOCKED: 0, total: 0, acceptedException: 0 };
  for (const r of records) {
    t[r.status] += 1;
    t.total += 1;
    if (r.requiresHumanChannel) t.acceptedException += 1;
  }
  return t;
}

/**
 * The spec's ten failure classifications (§9).
 *
 * Only two can be decided mechanically and honestly:
 *   - a case flagged `requiresHumanChannel` IS an accepted exception, by the
 *     decision recorded in the plan;
 *   - a case that passed in the previous run and fails now IS a regression.
 *
 * Everything else needs a human reading the evidence, so it is reported as
 * "Previously existing defect" (the truthful default for a failure carried
 * forward) or "New defect", and the Fix Run is where it gets reclassified.
 * Guessing a category from comment keywords would be the same mistake as the
 * bucket-failures clustering: confident, cheap and frequently wrong.
 */
export const CLASSIFICATION = {
  EXISTING: "Previously existing defect",
  FIXED: "Fixed successfully",
  REGRESSION: "Regression caused by a previous fix",
  NEW: "New defect",
  BLOCKER: "Blocker",
  ENVIRONMENT: "Environment issue",
  DATA: "Data/setup issue",
  DEPENDENCY: "Dependency issue",
  FALSE_POSITIVE: "False positive",
  ACCEPTED: "Accepted exception",
};

export function classify(record, prev) {
  if (record.requiresHumanChannel) return CLASSIFICATION.ACCEPTED;
  if (record.status === BLOCKED) return CLASSIFICATION.BLOCKER;
  if (!prev) return CLASSIFICATION.NEW;
  if (prev.status === PASS) return CLASSIFICATION.REGRESSION;
  return CLASSIFICATION.EXISTING;
}

export const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
