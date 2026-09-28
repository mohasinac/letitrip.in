#!/usr/bin/env node
/*
 * Generate the Phase 1 audit ledger from the seed source.
 *
 * 🛑 THE PAGE LIST IS SCRAPED, NEVER TYPED. A ledger typed by hand is a
 * measurement narrower than the thing it measures, and this codebase has paid
 * for that twice: a hand-written grep found 45 routes where the audit found 61,
 * and a coverage sweep enumerated groups from filenames and missed `money-flows`
 * because its file starts with an underscore. Both read as complete.
 *
 * So the ledger is regenerated from `tester-checklist-seed-data.ts` and
 * `_money-flows.ts`, and re-running it after the happy-path group is authored
 * picks that group up automatically.
 *
 * Existing status/notes are PRESERVED across regeneration — the ledger is
 * progress state, and regenerating it must never reset the work it records.
 *
 * Usage:  node scripts/test-run-build-audit-ledger.mjs [--check]
 *   --check  report drift between the ledger and the seed, write nothing
 *
 * @tag domain:tester
 * @tag layer:script
 * @tag access:node-only
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AUDIT_DOC, REPO, flag } from "./lib/test-run.mjs";

const SEED_DIR = resolve(REPO, "appkit/src/features/tester/seed-data");
const CATALOGUE = resolve(SEED_DIR, "tester-checklist-seed-data.ts");
const MONEY = resolve(SEED_DIR, "_money-flows.ts");

/**
 * Walk the source and collect group -> page -> case count.
 *
 * Deliberately a line walk rather than a regex over the whole file: the `admin`
 * group opens as a multi-line `group(\n  "admin",` and a single-line pattern
 * silently skips it — which would drop 21 pages, the largest group, from a
 * ledger that still looked complete.
 */
function scrape(path, forcedGroup = null) {
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf8").split("\n");
  const out = [];
  let group = forcedGroup?.key ?? null;
  let groupLabel = forcedGroup?.label ?? null;
  let page = null;
  let pageLabel = null;
  let inInterface = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    /* Skip type declarations — `key: string;` there is not a case. */
    if (/^\s*(export\s+)?interface\s+\w+/.test(line)) inInterface = true;
    else if (inInterface && /^\}/.test(line)) inInterface = false;
    if (inInterface) continue;

    const g1 = line.match(/\.\.\.group\(\s*"([^"]+)"\s*,\s*"([^"]+)"/);
    if (g1) {
      group = g1[1];
      groupLabel = g1[2];
      continue;
    }
    /*
     * Multi-line opener: `...group(` with the key on the next line. Only the
     * `admin` group is written this way, and it is the LARGEST — 23 pages, 254
     * cases — so a single-line-only pattern drops the biggest group from a
     * ledger that still reads as complete.
     *
     * Its label is a const identifier (`ADMIN_TESTING_GROUP_LABEL`) rather than
     * a literal, so resolve the identifier back to its `const X = "…"` rather
     * than falling back to the group key and displaying "admin" as a title.
     */
    if (/\.\.\.group\(\s*$/.test(line)) {
      const k = lines[i + 1]?.match(/^\s*"([^"]+)"/);
      const raw = lines[i + 2]?.match(/^\s*(?:"([^"]+)"|([A-Z_][A-Z0-9_]*))/);
      if (k) {
        group = k[1];
        groupLabel = raw?.[1] ?? null;
        if (!groupLabel && raw?.[2]) {
          const decl = lines.find((l) => new RegExp(`const ${raw[2]}\\s*=\\s*"`).test(l));
          groupLabel = decl?.match(/=\s*"([^"]+)"/)?.[1] ?? raw[2];
        }
        groupLabel ??= group;
      }
      continue;
    }

    const p = line.match(/pageKey:\s*"([^"]+)"/);
    if (p) {
      page = p[1];
      pageLabel = lines[i + 1]?.match(/pageLabel:\s*"([^"]+)"/)?.[1] ?? page;
      out.push({ group, groupLabel, page, pageLabel, cases: 0 });
      continue;
    }

    /*
     * 🛑 TWO FORMATTING STYLES, AND MATCHING ONLY ONE UNDERCOUNTS BY 40%.
     *
     * The catalogue writes a case either multi-line (`key:` alone on its line,
     * 787 of them) or compact (`{ key: "x", label: "y" }`, 479 more). A
     * `^\s*key:` anchor sees only the first and reported 816 cases against a
     * real 1,266 — a number low enough to look plausible and high enough to
     * matter, which is the worst kind of wrong.
     *
     * The leading `[{,\s]` class is what keeps `pageKey:` and `groupKey:` out:
     * the character before `key:` there is `e`, which the class does not match.
     */
    if (/(?:^|[{,\s])key:\s*"/.test(line) && out.length > 0) out[out.length - 1].cases += 1;
  }
  return out.filter((r) => r.group && r.page);
}

/*
 * MERGE repeated page declarations rather than emitting a row per occurrence.
 *
 * `admin/bug-hunter-rewards` declares `pageKey:` three times — once inside
 * `group()` and twice more on hand-written items that live outside it, because
 * `bugConfirmed` / `version` / `previousVersionId` are not part of `CaseInput`.
 * Emitting a row each time gave 126 "pages" for 124 real ones, and the extra two
 * would have sat at `pending` forever: no amount of auditing can complete a page
 * that does not exist.
 */
function merge(list) {
  const byKey = new Map();
  for (const r of list) {
    const k = `${r.group}/${r.page}`;
    const prev = byKey.get(k);
    if (prev) prev.cases += r.cases;
    else byKey.set(k, { ...r });
  }
  return [...byKey.values()];
}

/**
 * Page sets that live OUTSIDE the catalogue file.
 *
 * 🛑 A `group()` call takes either an inline array or a VARIABLE, and the
 * variable form is invisible to a scrape of the catalogue alone:
 *
 *     ...group("money-flows", "Money Flows (end to end)", moneyFlowsPages)
 *     ...group("happy-path",  "Happy Path (core flows)",  happyPathPages)
 *
 * Special-casing money-flows by name worked until the second such group
 * existed, and then silently dropped it — 6 pages and 41 cases missing from a
 * ledger that still said "124 pages" and looked complete. So resolve the
 * identifier back to the module that exports it instead of naming files here.
 */
function scrapeExternalPageSets() {
  const src = existsSync(CATALOGUE) ? readFileSync(CATALOGUE, "utf8") : "";
  const out = [];
  /* `...group("key", "Label"|CONST, identifier)` — the non-inline third argument. */
  const re = /\.\.\.group\(\s*"([^"]+)"\s*,\s*(?:"([^"]+)"|([A-Z_][A-Za-z0-9_]*))\s*,\s*([a-z][A-Za-z0-9_]*)\s*[,)]/g;
  for (const m of src.matchAll(re)) {
    const [, key, literalLabel, constLabel, identifier] = m;
    let label = literalLabel;
    if (!label && constLabel) {
      label = src.match(new RegExp(`const ${constLabel}\\s*=\\s*"([^"]+)"`))?.[1] ?? key;
    }
    /* `import { happyPathPages } from "./_happy-path"` -> the file to scrape. */
    const imp = src.match(new RegExp(`import\\s*\\{[^}]*\\b${identifier}\\b[^}]*\\}\\s*from\\s*"\\.\\/([^"]+)"`));
    if (!imp) continue;
    const path = resolve(SEED_DIR, `${imp[1]}.ts`);
    if (!existsSync(path)) continue;
    out.push(...scrape(path, { key, label: label ?? key }));
  }
  return out;
}

/*
 * `--set <group/page> [--status <s>] [--note "…"]` — record a page's progress.
 *
 * Both --status and --note are OPTIONAL and omitting either leaves that cell
 * alone. Staging a cross-page lead is a NOTE operation; it must never be able to
 * revert a finished page to pending, which is what a defaulted status did to four
 * of them in one sweep.
 *
 * A flag rather than hand-editing the table, because this is done ~130 times and
 * a hand edit is where a status lands in the Notes column, or on the wrong row,
 * or with the pipe count off — and the ledger then silently stops parsing, which
 * looks exactly like no progress having been made.
 *
 * Writes in place and returns; it deliberately does NOT regenerate, so recording
 * progress can never be the thing that reshuffles the table under you.
 */
const setTarget = flag("set");
if (typeof setTarget === "string") {
  /*
   * `--status` is OPTIONAL: omitting it keeps whatever the page already has.
   *
   * It used to default to "audited", so staging a LEAD on a page had to name a
   * status — and passing `--status pending` to stage one silently REVERTED four
   * already-finished pages in a single sweep on 2026-09-29. A cross-page lead
   * is about the note; it should never be able to undo progress.
   *
   * Same argument as the --note rule below: a field you did not mean to set
   * must not be set for you.
   */
  const statusArg = flag("status");
  const status = typeof statusArg === "string" ? statusArg : null;
  const note = flag("note");
  const VALID = ["pending", "in-flight", "audited", "rewritten"];
  if (status !== null && !VALID.includes(status)) {
    console.error(`✗ --status must be one of: ${VALID.join(", ")}`);
    process.exit(2);
  }
  if (!existsSync(AUDIT_DOC)) {
    console.error(`✗ ${AUDIT_DOC} does not exist — generate it first.`);
    process.exit(2);
  }
  const lines = readFileSync(AUDIT_DOC, "utf8").split("\n");
  let hit = false;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\|\s*`([^`\/]+\/[^`]+)`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|(.*)\|\s*$/);
    if (!m || m[1] !== setTarget) continue;
    /*
     * An EMPTY --note leaves the existing note alone; only a non-empty one
     * replaces it. `--note ""` used to clear the cell, which silently destroyed
     * a lead staged from an earlier page's audit — the exact thing the notes
     * column exists to carry forward. To clear deliberately, pass `--note -`.
     */
    const keptNote =
      typeof note === "string" && note.trim() !== ""
        ? note.trim() === "-"
          ? ""
          : note
        : m[5].trim();
    /*
     * 🛑 WARN WHEN RE-CLAIMING A FINISHED PAGE. Claiming in-flight over an
     * `audited`/`rewritten` row is almost always a mis-pick — the page was done
     * in an earlier sitting and the ledger already says so. It has happened
     * twice (buying/cart, selling/seller-shipping-payouts-setup), and both
     * times the only signal was the done-count failing to advance afterwards,
     * which is easy to read as an off-by-one in my own head rather than as a
     * repeated page.
     *
     * A warning rather than a refusal: re-auditing is sometimes deliberate, and
     * both of those re-runs did find real defects the first pass had missed.
     */
    const priorStatus = m[4].trim();
    if (status === "in-flight" && (priorStatus === "audited" || priorStatus === "rewritten")) {
      console.error(`⚠ ${setTarget} was already ${priorStatus} — re-auditing a finished page.`);
      console.error("  If that is not what you meant, pick a `pending` row instead.");
    }
    const keptStatus = status ?? (priorStatus || "pending");
    lines[i] = `| \`${m[1]}\` |${m[2]}|${m[3]}| ${keptStatus} | ${keptNote} |`;
    hit = true;
    break;
  }
  if (!hit) {
    console.error(`✗ no ledger row for "${setTarget}".`);
    console.error("  Page keys are `group/page`; run with no flags to list them.");
    process.exit(2);
  }
  writeFileSync(AUDIT_DOC, lines.join("\n"), "utf8");
  console.log(`✓ ${setTarget}${status ? ` -> ${status}` : " (status unchanged)"}`);
  process.exit(0);
}

const rows = merge([...scrape(CATALOGUE), ...scrapeExternalPageSets()]);

/* Preserve status + notes from an existing ledger, keyed on group/page. */
const prior = new Map();
if (existsSync(AUDIT_DOC)) {
  for (const line of readFileSync(AUDIT_DOC, "utf8").split("\n")) {
    /*
     * The `/` in the key is load-bearing: without it this also matches the
     * status-legend table (`| `pending` | not yet read… |`), which inflated the
     * prior count by four and made a drift check pass on the wrong arithmetic.
     */
    const m = line.match(/^\|\s*`([^`\/]+)\/([^`]+)`\s*\|[^|]*\|[^|]*\|\s*([^|]*?)\s*\|\s*(.*?)\s*\|\s*$/);
    if (m) prior.set(`${m[1]}/${m[2]}`, { status: m[3].trim(), note: m[4].trim() });
  }
}

const totalCases = rows.reduce((n, r) => n + r.cases, 0);
const groups = new Map();
for (const r of rows) {
  if (!groups.has(r.group)) groups.set(r.group, { label: r.groupLabel, pages: [], cases: 0 });
  const g = groups.get(r.group);
  g.pages.push(r);
  g.cases += r.cases;
}

/*
 * Priority groups lead the ledger, mirroring PRIORITY_GROUPS in
 * appkit/src/features/tester/utils/phases.ts.
 *
 * 🛑 THE AUDIT MUST BE ORDERED LIKE THE RUN. The run tests happy-path first
 * because a half-finished run should have answered "can anyone buy anything"
 * before it answered anything about SEO metadata. An audit ordered differently
 * puts those same pages LAST — so an interrupted Phase 1 hands Phase 2 a
 * priority group whose cases were never checked against source, which is the
 * one combination neither phase's ordering was meant to allow.
 *
 * Kept as a literal rather than imported: this is a .mjs script and phases.ts is
 * TypeScript. audit-tester-plugin-wiring has no rule cross-checking the two, so
 * the comment is the link — if PRIORITY_GROUPS changes, change this.
 */
const PRIORITY_GROUPS = ["happy-path"];
const ordered = new Map();
for (const key of PRIORITY_GROUPS) if (groups.has(key)) ordered.set(key, groups.get(key));
for (const [key, g] of groups) if (!ordered.has(key)) ordered.set(key, g);

if (flag("check") === true) {
  const missing = rows.filter((r) => !prior.has(`${r.group}/${r.page}`));
  const stale = [...prior.keys()].filter((k) => !rows.some((r) => `${r.group}/${r.page}` === k));
  console.log(`seed: ${rows.length} pages · ${totalCases} cases · ${groups.size} groups`);
  console.log(`ledger: ${prior.size} rows`);
  if (missing.length) console.log(`  MISSING from ledger: ${missing.map((r) => `${r.group}/${r.page}`).join(", ")}`);
  if (stale.length) console.log(`  STALE in ledger (page gone from seed): ${stale.join(", ")}`);
  process.exit(missing.length || stale.length ? 1 : 0);
}

const done = rows.filter((r) => {
  const s = prior.get(`${r.group}/${r.page}`)?.status ?? "";
  return s.includes("audited") || s.includes("rewritten");
}).length;

const body = [];
body.push("# Test Run 3 — Phase 1 audit ledger");
body.push("");
body.push("Every case is checked against **current source** before any testing starts —");
body.push("the route under `src/app/[locale]/**`, its view component, its API route. Not the");
body.push("old docs, not this repo's own description of the feature.");
body.push("");
body.push("🛑 **This file is regenerated by `scripts/test-run-build-audit-ledger.mjs`, which");
body.push("scrapes the seed source.** Status and notes are preserved across regeneration.");
body.push("Do not hand-add a page row — add the page to the seed and regenerate, or the");
body.push("ledger will claim coverage the catalogue does not have.");
body.push("");
body.push(`**${done} / ${rows.length} pages** · ${totalCases} cases · ${groups.size} groups`);
body.push("");
body.push("| Status | Meaning |");
body.push("|---|---|");
body.push("| `pending` | not yet read against source |");
body.push("| `audited` | read against source, no change needed |");
body.push("| `rewritten` | read against source, one or more cases corrected |");
body.push("| `in-flight` | being worked right now — a compaction here is visible, not silent |");
body.push("");
body.push("A page is not `audited` until `npm run check` is green. `AuthoredCase` declares");
body.push("its six fields non-optional, so `tsc` is what actually catches a half-rewritten");
body.push("case — the audits do not check per-field presence.");
body.push("");

for (const [key, g] of ordered) {
  body.push(`## ${g.label} \`${key}\` — ${g.pages.length} pages, ${g.cases} cases`);
  body.push("");
  body.push("| Page | Label | Cases | Status | Notes |");
  body.push("|---|---|---|---|---|");
  for (const r of g.pages) {
    const p = prior.get(`${r.group}/${r.page}`);
    body.push(
      `| \`${r.group}/${r.page}\` | ${r.pageLabel} | ${r.cases} | ${p?.status || "pending"} | ${p?.note || ""} |`,
    );
  }
  body.push("");
}

writeFileSync(AUDIT_DOC, body.join("\n"), "utf8");
console.log(`✓ ${AUDIT_DOC}`);
console.log(`  ${rows.length} pages · ${totalCases} cases · ${groups.size} groups · ${done} already done`);
