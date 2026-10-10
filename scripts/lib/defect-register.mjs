/*
 * The consolidated defect register — five overlapping sources, one keyed table.
 *
 * 🛑 WHY THIS EXISTS: there were FIVE registers and no way to join them.
 *
 *   loop-state.fixQueue      178 raw / 147 distinct case ids
 *   run-3/fixes.jsonl        108 raw /  89
 *   run-4/fixes.jsonl         30 raw /  25
 *   run-3 verdict `no`       203     / 203
 *   run-4 verdict `no`       115     / 115
 *   ── union               634 raw / 365 distinct ──
 *
 * 125 failing case ids appear in NEITHER the fix queue NOR any fixes.jsonl —
 * they exist only as a verdict comment. That is the single biggest reason a
 * register is needed: a quarter of the known defects were readable only by
 * opening 292 individual JSON files.
 *
 * 🛑 TWO FOLDED BUCKETS ARE NOT PRODUCT DEFECTS and must not be fixed as if
 * they were — this is lifted verbatim from test-run-triage.mjs because it is
 * the single most load-bearing sentence in that file:
 *   CASE     a checklist case that cannot be executed as authored (wrong role,
 *            contradictory oracles, a control that does not exist). Fix the
 *            CASE, in appkit/src/features/tester/seed-data/authored/.
 *   FIXTURE  seed data that does not exist, so cases are blocked rather than
 *            failing. Fix the SEED, and the blocked cases become runnable.
 *
 * 🛑 Rule #4 applies to every row. These were measured across batches 1-255 and
 * milestone deploys have shipped fixes since; an entry from batch 20 may already
 * be dead. The launch review measured 6 of 7 happy-path failures already fixed
 * and never re-driven (now recorded in the register's own hand-written zone),
 * and docs/TEST-RUN-3-OUTOFSCOPE.md measured 3 of its first 10 entries WRONG
 * rather than merely unfixed. A fix for a defect that no longer exists is pure
 * risk.
 *
 * @tag domain:tester
 * @tag layer:lib
 * @tag access:node-only
 * @tag consumers:test-run-defects.mjs, test-run-triage.mjs
 * @tag sideEffects:none — pure reads
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { RUNS_DIR, LOOP_STATE_PATH, fixState, isControlId } from "./test-run.mjs";

/** The runs this register spans. Add a run here, not at a call site. */
export const REGISTER_RUNS = ["run-3", "run-4"];

/* ── severity ─────────────────────────────────────────────────────────── */

/**
 * Fold the drifted severity strings into seven buckets.
 *
 * Moved verbatim from test-run-triage.mjs. `severity` drifted from an enum into
 * freeform prose across the run — 60+ distinct values, several of them whole
 * sentences ("HIGH (a consent control that does not consent)") — so it cannot be
 * sorted or grouped, which is the one thing a fix phase needs from it. Folded at
 * READ time; the raw string is never rewritten on disk.
 */
export function foldSeverity(raw) {
  const s = String(raw ?? "").trim();
  if (/^CASE[ _-]?DEFECT/i.test(s)) return "CASE";
  if (/^FIXTURE[ _-]?GAP/i.test(s)) return "FIXTURE";
  if (/^(CRITICAL|HIGH)/i.test(s)) return "high";
  if (/^MEDIUM/i.test(s)) return "medium";
  if (/^LOW/i.test(s)) return "low";
  /* "not a defect - a correction to my own reasoning" and similar */
  if (/not a defect/i.test(s)) return "note";
  return "unclassified";
}

export const SEVERITY_ORDER = ["high", "medium", "low", "FIXTURE", "CASE", "note", "unclassified"];

/** Lower index wins when two sources disagree about one defect's severity. */
function severityRank(sev) {
  const i = SEVERITY_ORDER.indexOf(sev);
  return i < 0 ? SEVERITY_ORDER.length : i;
}

/* ── io ───────────────────────────────────────────────────────────────── */

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function runPath(run, ...parts) {
  return resolve(RUNS_DIR, run, ...parts);
}

/**
 * Every JSONL row, with unparseable lines REPORTED rather than dropped.
 *
 * Same contract as tester/scripts/lib/ledger.mjs's readLedger: "a dropped line
 * is a lost defect, and losing one silently is exactly what the ledger exists to
 * prevent". Re-implemented rather than imported because that module resolves
 * paths against the tester submodule's own root, and this one must read both
 * runs from RUNS_DIR.
 */
function readJsonl(path) {
  if (!existsSync(path)) return { entries: [], malformed: [] };
  const entries = [];
  const malformed = [];
  for (const [i, line] of readFileSync(path, "utf8").split("\n").entries()) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      malformed.push({ path, line: i + 1, text: line.slice(0, 120) });
    }
  }
  return { entries, malformed };
}

/* ── the case universe ────────────────────────────────────────────────── */

/**
 * Every case id both runs know about, with the metadata a register row needs.
 *
 * Built from `batches/`, not from `scope.json`: scope is the list of BATCHES in
 * the run, while the batch files carry the individual cases with their labels,
 * roles and startPages. 1,343 ids across the two runs.
 *
 * 🛑 This is also the membership test that decides which run a fixQueue entry
 * belongs to, since the queue carries no run field.
 */
export function caseUniverse() {
  const universe = new Map();
  for (const run of REGISTER_RUNS) {
    const dir = runPath(run, "batches");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const b = readJson(runPath(run, "batches", f));
      for (const c of b?.cases ?? []) {
        if (!c?.id || isControlId(c.id)) continue;
        const prior = universe.get(c.id);
        const runs = new Set(prior?.runs ?? []);
        runs.add(run);
        universe.set(c.id, {
          id: c.id,
          label: c.label ?? prior?.label ?? null,
          roles: c.roles ?? prior?.roles ?? [],
          groupKey: b?.groupKey ?? prior?.groupKey ?? null,
          pageKey: b?.pageKey ?? prior?.pageKey ?? null,
          batchKey: b?.key ?? prior?.batchKey ?? null,
          requiresHumanChannel: c.requiresHumanChannel ?? prior?.requiresHumanChannel ?? false,
          runs: [...runs],
        });
      }
    }
  }
  return universe;
}

/**
 * Resolve a possibly-abbreviated case id against the universe.
 *
 * 🛑 THROWS on 0 or >1 candidates rather than guessing. Eight ids in the fix
 * queue are written elided (`…-sort-dropdown`, `...-reject-fraud`); seven
 * suffix-match uniquely and one (`...-reject-fraud`) has two candidates, which
 * is why `batch` is accepted as a disambiguator. Picking the first match would
 * silently attribute a defect to the wrong case — and a register that is
 * confidently wrong about which case found a bug is worse than one that admits
 * it cannot tell.
 */
export function resolveCaseId(raw, universe, { batch = null } = {}) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (universe.has(s)) return s;

  /* A full-looking id that simply is not in the universe: surface it, do not
   * invent a match. The caller decides whether that is fatal. */
  const elided = /^[…]|^\.\.\./.test(s);
  if (!elided && s.startsWith("checklist-")) return s;

  const tail = s.replace(/^[…]+/, "").replace(/^\.\.\./, "");
  if (!tail) return null;
  let hits = [...universe.keys()].filter((id) => id.endsWith(tail));

  if (hits.length > 1 && batch != null) {
    const narrowed = hits.filter((id) => {
      const e = universe.get(id);
      return e?.batchKey && String(batch) !== "" && e.batchKey.includes(String(batch));
    });
    if (narrowed.length === 1) hits = narrowed;
  }

  if (hits.length === 1) return hits[0];
  throw new Error(
    `resolveCaseId: ${hits.length} candidates for ${JSON.stringify(s)}` +
      (hits.length ? ` — ${hits.slice(0, 4).join(", ")}` : "") +
      ". Disambiguate with `batch`, or fix the id in loop-state.json.",
  );
}

/* ── the fix queue ────────────────────────────────────────────────────── */

/**
 * The fix queue, from the TOP-LEVEL key.
 *
 * 🛑 test-run-triage.mjs reads `state.state?.fixQueue ?? state.fixQueue`, so it
 * has been triaging the 129-entry copy while the top-level array holds 178.
 * Measured: `state.fixQueue \ fixQueue` is EMPTY and `fixQueue \ state.fixQueue`
 * is 36 — top-level is a strict superset. The milestone flow has therefore been
 * ranking 129 of 178 defects, and the script's own header says "123".
 *
 * The subset relation is asserted rather than assumed, because if it ever
 * inverts this function is silently dropping entries — the exact failure it
 * exists to fix.
 */
export function readFixQueue() {
  const state = readJson(LOOP_STATE_PATH, {}) ?? {};
  const top = Array.isArray(state.fixQueue) ? state.fixQueue : [];
  const nested = Array.isArray(state.state?.fixQueue) ? state.state.fixQueue : [];

  const key = (d) => JSON.stringify([d?.id ?? null, d?.case ?? null, d?.batch ?? null, d?.title ?? null]);
  const topKeys = new Set(top.map(key));
  const orphans = nested.filter((d) => !topKeys.has(key(d)));

  return { queue: top, nested, orphans, state };
}

/**
 * Normalise either fixQueue entry shape.
 *
 * 🛑 THE QUEUE HOLDS TWO SHAPES, and the older one is the majority:
 *   newer (batches ~167+):  { batch, case, title, detail, files, severity }
 *   older (batches 1-166):  { id, foundBy[], batches[], symptom, severity, … }
 * Reading only the newer field names prints "b? (untitled)" for two thirds of
 * the queue — which is what the triage tool did on its first run. The older
 * entries also spread their detail across ~60 ad-hoc keys (symptom, rootCause,
 * consequence, impact, whyItMatters…), so `detail` falls back to `symptom`
 * rather than trying to enumerate the rest.
 *
 * Unlike the triage version this returns ALL resolvable case ids rather than
 * only `foundBy[0]`, because a queue entry naming three cases is one defect
 * found three times and every one of those ids should join the register.
 */
export function normaliseQueueEntry(d, universe, { onError } = {}) {
  const batch = d.batch ?? (Array.isArray(d.batches) ? d.batches[0] : null) ?? null;
  const rawIds = [
    ...(d.case ? [d.case] : []),
    ...(Array.isArray(d.foundBy) ? d.foundBy : []),
  ];

  const caseIds = [];
  for (const raw of rawIds) {
    /* foundBy entries carry trailing prose: "checklist-x (null, not driven)". */
    const cleaned = String(raw).split(/[\s(]/)[0];
    try {
      const id = resolveCaseId(cleaned, universe, { batch });
      if (id && !caseIds.includes(id)) caseIds.push(id);
    } catch (err) {
      onError?.(err, cleaned);
    }
  }

  return {
    batch,
    caseIds,
    severityRaw: d.severity ?? null,
    severity: foldSeverity(d.severity),
    title: String(
      d.title ?? (d.id ? d.id.replace(/-/g, " ") : null) ?? d.case ?? "(untitled)",
    ),
    files: Array.isArray(d.files) ? d.files : [],
    detail: d.detail ?? d.symptom ?? null,
    decision: d.decision ?? null,
    fixed: d.status === "fixed" || d.fixed === true || Boolean(d.fixedAt),
    slug: d.id ?? null,
  };
}

/* ── the merge ────────────────────────────────────────────────────────── */

/**
 * `Root Cause #N` is the only id namespace shared across every document in this
 * repo (CLAUDE.md cites 56 distinct numbers up to #104). Parsed out of existing
 * prose and carried as a column — NEVER minted here, because allocating a new
 * number is a human judgement about whether something recurs.
 */
function rootCauses(...texts) {
  const out = new Set();
  for (const t of texts) {
    for (const m of String(t ?? "").matchAll(/Root Cause #(\d+)/g)) out.add(Number(m[1]));
  }
  return [...out].sort((a, b) => a - b);
}

/**
 * 🛑 THE DEDUP KEY IS `(caseId, run)`, NOT caseId ALONE.
 *
 * 30 case ids failed in BOTH runs, and 212 of run-4's 214 rows are re-drives of
 * run-3 cases. Collapsing on caseId erases "was it still broken on re-drive?",
 * which is the entire purpose of run 4 — and the two rows legitimately carry
 * DIFFERENT verdicts for the same id.
 *
 * Nothing else merges: not title similarity, not shared files, not severity.
 * Two records are the same defect iff they resolve to the same case id in the
 * same run.
 */
function rowKey(caseId, run) {
  return `${run} ${caseId}`;
}

/** A stable synthetic key for a source row whose key is not a checklist id. */
function unkeyedId(raw) {
  const slug = String(raw).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `unkeyed:${slug || "unnamed"}`;
}

/**
 * Fold the ledger's freeform `status` into the states the counter understands.
 *
 * The ledger carries `"✅ resolved"` on 8 rows alongside `fixed`/`pending`,
 * because `status` was hand-authored before `test-run-record-fix.mjs` owned the
 * writes. An unfolded value renders as its own bucket in every grouping and is
 * counted as neither fixed nor open.
 *
 * `defer` is tested FIRST: "deferred-to-milestone" also matches nothing else
 * here, but a future value like "resolved, deferred verification" must not fold
 * to fixed.
 */
function foldStatus(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "open";
  if (/defer/i.test(s)) return "deferred";
  if (/resolved|fixed|done|closed/i.test(s)) return "fixed";
  if (/pending/i.test(s)) return "pending";
  return "open";
}

/**
 * Every defect, keyed and merged. The one function the emitter calls.
 *
 * Field precedence is `fixes.jsonl` > `fixQueue` > verdict comment: the ledger
 * is authored, keyed and newest; the queue has the richest prose; a verdict
 * comment is the raw observation and the only source for 125 of them.
 */
export function collectDefects() {
  const universe = caseUniverse();
  const malformed = [];
  const unresolved = [];
  const rows = new Map();

  const touch = (caseId, run) => {
    const k = rowKey(caseId, run);
    if (!rows.has(k)) {
      const u = universe.get(caseId);
      rows.set(k, {
        caseId,
        run,
        label: u?.label ?? null,
        groupKey: u?.groupKey ?? null,
        pageKey: u?.pageKey ?? null,
        batch: null,
        severity: "unclassified",
        severityRaw: null,
        status: "open",
        title: null,
        detail: null,
        files: [],
        rootCauses: [],
        sources: [],
        inUniverse: Boolean(u),
      });
    }
    return rows.get(k);
  };

  const addSource = (row, s) => {
    if (!row.sources.includes(s)) row.sources.push(s);
  };
  const mergeSeverity = (row, sev, raw) => {
    if (severityRank(sev) < severityRank(row.severity)) {
      row.severity = sev;
      row.severityRaw = raw ?? row.severityRaw;
    }
  };
  const mergeDetail = (row, detail) => {
    const d = detail ? String(detail) : null;
    if (d && (!row.detail || d.length > row.detail.length)) row.detail = d;
  };

  /* ── 1. verdict `no` answers — the widest source, and the only one for 125 ── */
  for (const run of REGISTER_RUNS) {
    const vdir = runPath(run, "verdicts");
    if (!existsSync(vdir)) continue;
    for (const f of readdirSync(vdir)) {
      if (!f.endsWith(".json")) continue;
      const v = readJson(runPath(run, "verdicts", f));
      const answers = Array.isArray(v) ? v : Array.isArray(v?.verdicts) ? v.verdicts : [];
      for (const a of answers) {
        if (!a?.id || isControlId(a.id) || a.answer !== "no") continue;
        const row = touch(a.id, run);
        addSource(row, `verdict:${run}`);
        mergeDetail(row, a.comment);
        if (!row.title) row.title = universe.get(a.id)?.label ?? a.id;
        row.rootCauses = rootCauses(row.detail, a.comment);
      }
    }
  }

  /* ── 2. fixes.jsonl — authored, keyed, highest precedence ── */
  for (const run of REGISTER_RUNS) {
    const { entries, malformed: bad } = readJsonl(runPath(run, "fixes.jsonl"));
    malformed.push(...bad);
    for (const e of entries) {
      const raw = e.caseId ?? e.case ?? null;
      if (!raw) continue;
      let id;
      try {
        id = resolveCaseId(raw, universe);
      } catch (err) {
        /*
         * 🛑 KEEP IT, FLAGGED — never drop a recorded fix.
         *
         * The ledger holds 7 hand-authored keys that are not checklist ids at
         * all: slugs like `faq-category-pages-empty`, and one that is literally
         * the prose "(noticed during buyer-purchase, no case covers it)". Those
         * are real fixes somebody made and recorded. Dropping them because the
         * key does not parse would make the register quietly smaller than the
         * ledger it summarises — the exact failure mode `readLedger` reports
         * malformed lines to avoid.
         */
        unresolved.push({ source: `fixes:${run}`, raw, message: err.message });
        id = unkeyedId(raw);
      }
      if (!id) continue;
      const row = touch(id, run);
      addSource(row, `fixes:${run}`);
      row.inUniverse = universe.has(id);
      mergeSeverity(row, foldSeverity(e.severity), e.severity);
      if (e.title) row.title = String(e.title);
      mergeDetail(row, e.detail ?? e.rootCause ?? e.fix);
      if (Array.isArray(e.files)) row.files = [...new Set([...row.files, ...e.files])];
      /* A ledger row IS a recorded outcome, so it wins over `open`. */
      row.status = e.reverified !== undefined ? fixState(e) : foldStatus(e.status ?? "pending");
      row.rootCauses = rootCauses(row.detail, e.rootCause, e.fix, e.detail);
    }
  }

  /* ── 3. loop-state.fixQueue — richest prose, no run field ── */
  const { queue, orphans } = readFixQueue();
  for (const d of queue) {
    const n = normaliseQueueEntry(d, universe, {
      onError: (err, raw) => unresolved.push({ source: "fixQueue", raw, message: err.message }),
    });

    /*
     * Run attribution — attach to the run that actually OBSERVED the case, and
     * fall back to batch membership only if no run did.
     *
     * 🛑 Measured: plain batch membership emitted 175 PHANTOM rows. Run 4
     * re-drives run 3, so its batch files contain nearly all of run 3's cases —
     * membership therefore says "both runs" for almost every id and the fan-out
     * doubled the register. Worse, it made the both-runs comparison meaningless:
     * it reported 159 ids failing in both runs when the real verdict-level
     * intersection is 30.
     *
     * A queue entry is an observation about a case that was DRIVEN. Attaching
     * it to a run that never drove the case asserts a verdict nobody recorded.
     */
    const targets = n.caseIds.length
      ? n.caseIds.flatMap((id) => {
          const observed = REGISTER_RUNS.filter((run) => rows.has(rowKey(id, run)));
          if (observed.length) return observed.map((run) => ({ id, run }));
          const member = universe.get(id)?.runs ?? [];
          return (member.length ? [member[0]] : [REGISTER_RUNS[0]]).map((run) => ({ id, run }));
        })
      : [];

    if (!targets.length) {
      /* Unkeyed queue entry: keep it, flagged, rather than lose it. */
      const id = `unkeyed:${(n.slug ?? n.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
      const row = touch(id, REGISTER_RUNS[0]);
      addSource(row, "fixQueue:unkeyed");
      row.inUniverse = false;
      row.batch ??= n.batch;
      row.title ||= n.title;
      mergeSeverity(row, n.severity, n.severityRaw);
      mergeDetail(row, n.detail);
      if (n.files.length) row.files = [...new Set([...row.files, ...n.files])];
      if (n.fixed && row.status === "open") row.status = "fixed";
      row.rootCauses = rootCauses(row.detail, n.detail, n.decision);
      continue;
    }

    for (const { id, run } of targets) {
      const row = touch(id, run);
      addSource(row, "fixQueue");
      row.batch ??= n.batch;
      if (!row.title || row.title === id) row.title = n.title;
      mergeSeverity(row, n.severity, n.severityRaw);
      mergeDetail(row, n.detail);
      if (n.files.length) row.files = [...new Set([...row.files, ...n.files])];
      if (n.fixed && row.status === "open") row.status = "fixed";
      if (n.decision) row.decision = n.decision;
      row.rootCauses = rootCauses(row.detail, n.detail, n.decision);
    }
  }

  const all = [...rows.values()];
  return {
    rows: all,
    universe,
    malformed,
    unresolved,
    queueOrphans: orphans,
    census: census(all, universe),
  };
}

/** Per-source counts, for the completeness assertion. */
function census(allRows, universe) {
  const perSource = {};
  for (const r of allRows) {
    for (const s of r.sources) {
      perSource[s] ??= new Set();
      perSource[s].add(r.caseId);
    }
  }
  const bySeverity = {};
  const byStatus = {};
  const byRun = {};
  for (const r of allRows) {
    bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1;
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    byRun[r.run] = (byRun[r.run] ?? 0) + 1;
  }
  const ids = new Set(allRows.map((r) => r.caseId));

  /*
   * 🛑 TWO DIFFERENT "both runs" NUMBERS, and only one of them means what the
   * phrase suggests.
   *
   * `failedInBothRuns` is VERDICT-level: the case was driven in both runs and
   * answered `no` in both. That is the re-drive signal run 4 exists to produce,
   * and it is 30.
   *
   * `rowsInBothRuns` merely counts ids with a row in each run, which also
   * catches an id that has a FIX record in one run and a verdict in the other.
   * It reads as 40 and means something much weaker. Reported separately rather
   * than collapsed, because the first version of this census conflated them and
   * printed 40 under the verdict label.
   */
  const failedIn = (run) =>
    new Set(
      allRows
        .filter((r) => r.run === run && r.sources.includes(`verdict:${run}`))
        .map((r) => r.caseId),
    );
  const f3 = failedIn("run-3");
  const f4 = failedIn("run-4");
  const failedBoth = [...f3].filter((id) => f4.has(id));
  const bothRuns = [...ids].filter(
    (id) => allRows.some((r) => r.caseId === id && r.run === "run-3") &&
            allRows.some((r) => r.caseId === id && r.run === "run-4"),
  );
  return {
    rows: allRows.length,
    distinctCaseIds: ids.size,
    universeSize: universe.size,
    notInUniverse: allRows.filter((r) => !r.inUniverse).length,
    failedInBothRuns: failedBoth.length,
    rowsInBothRuns: bothRuns.length,
    perSource: Object.fromEntries(Object.entries(perSource).map(([k, v]) => [k, v.size])),
    bySeverity,
    byStatus,
    byRun,
  };
}

/** Pipe-escape a markdown table cell. Moved from test-run-table.mjs. */
export function cell(s) {
  /* 🛑 Strip trailing backslashes BEFORE escaping pipes, or an escaped pipe at
   * a cell boundary swallows the delimiter and mangles the row. */
  return String(s ?? "—").replace(/\\+$/, "").replace(/\|/g, "\\|") || "—";
}

/** Files carrying more than one OPEN defect — fix these together. */
export function sharedFiles(rows) {
  const hits = new Map();
  for (const r of rows) {
    if (r.status !== "open") continue;
    for (const f of r.files) {
      if (!hits.has(f)) hits.set(f, []);
      hits.get(f).push(r);
    }
  }
  return [...hits.entries()]
    .filter(([, rs]) => rs.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
}
