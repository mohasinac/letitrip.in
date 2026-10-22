#!/usr/bin/env node
/*
 * Seed the defect ledger with what was already found and deliberately NOT fixed.
 *
 * Usage (from the consumer repo root):
 *   node tester/scripts/seed-defect-ledger.mjs
 *   node tester/scripts/seed-defect-ledger.mjs --list    # show the ledger, write nothing
 *
 * Exit: 0 always unless the ledger is unreadable.
 *
 * 🛑 WHY THESE ARE HERE RATHER THAN FIXED
 *
 * Each was found before the author → sweep → consolidate → fix-once pipeline existed,
 * during exactly the interleaved find-and-fix that the pipeline replaces. Fixing them
 * now would restart that pattern; losing them would waste the finding. They join the
 * Phase C triage alongside whatever the sweep turns up, and are fixed in Phase D with
 * everything else that shares a root cause.
 *
 * Root Cause #4 applies at that point, not now: read the current source and confirm
 * the bug is still present before touching it. Several of these may already have been
 * repaired by an adjacent change, and a stale bug report acted on as fact is its own
 * documented failure here.
 *
 * Idempotent by content — re-running does not duplicate rows.
 */

import { appendLedger, readLedger } from "./lib/ledger.mjs";
import { flag } from "./lib/firestore.mjs";

const REPO_ROOT = process.cwd();

/**
 * Found 2026-09-05 while building the authoring pipeline. `case` is the checklist
 * case that would catch it where one exists, or null where the defect has no case
 * yet — which is itself worth knowing at triage.
 */
const KNOWN = [
  {
    at: "2026-09-05",
    area: "faqs",
    case: null,
    symptom:
      "/faqs search returns 0 results. FAQPageContent runs two useFaqList calls; the count query reports 14 matches for a term while the paginated list query (category + sorts + pagination) returns none, so the page renders empty with a result count above it.",
    evidence: "Observed live; investigation paused mid-diagnosis before the pipeline gate was introduced.",
    severity: "high",
  },
  {
    at: "2026-09-05",
    area: "auctions",
    case: null,
    symptom: "A placed bid does not update the auction page live — the new current bid appears only after a manual reload.",
    evidence: "Seen during the first tester sweep on an auction detail page.",
    severity: "medium",
  },
  {
    at: "2026-09-05",
    area: "auctions",
    case: null,
    symptom: "A rejected bid shows the wrong error message — the text does not describe why the bid was refused.",
    evidence: "Seen during the first tester sweep.",
    severity: "medium",
  },
  {
    at: "2026-09-05",
    area: "auctions",
    case: null,
    symptom: "A valid opening bid on an auction with no bids yet is rejected.",
    evidence: "Seen during the first tester sweep. Blocks the whole bidding flow on a fresh auction, so it likely masks other bidding cases.",
    severity: "high",
  },
  {
    at: "2026-09-05",
    area: "admin-rbac",
    case: null,
    symptom:
      "admin/layout.tsx gates on isAdminUser/isEmployeeUser and never calls isEffectiveAdminUser, despite that helper's docstring naming the layout as one of its two chokepoints. A canTestAdmin account therefore reaches /api/admin/* but is redirected off every /admin page.",
    evidence:
      "Traced while wiring the tester's browsing identity. Worked around by browsing adminOnly batches as the real admin rather than widening the gate — the workaround is in fetch-cases.mjs and would be removed if this is fixed.",
    severity: "medium",
  },
];

if (flag("list") === true) {
  const { entries, malformed } = readLedger(REPO_ROOT, "defects");
  console.log(`${entries.length} defect(s) in the ledger:\n`);
  for (const e of entries) {
    console.log(`  [${e.severity ?? "?"}] ${e.area ?? e.page ?? "?"} — ${String(e.symptom).slice(0, 96)}`);
  }
  if (malformed.length) console.error(`\n⚠ ${malformed.length} unparseable line(s) — recover them by hand.`);
  process.exit(0);
}

const { entries: existing, malformed } = readLedger(REPO_ROOT, "defects");
if (malformed.length) {
  console.error(`⚠ ${malformed.length} unparseable line(s) already in the ledger; leaving them alone.`);
}

// Dedupe on the symptom text: the entries are hand-written, so an id would be one
// more thing to keep in sync, and the symptom is what a reader actually matches on.
const seen = new Set(existing.map((e) => String(e.symptom)));
const fresh = KNOWN.filter((k) => !seen.has(k.symptom));

if (!fresh.length) {
  console.log(`✓ Ledger already holds all ${KNOWN.length} known defect(s) — nothing added.`);
  process.exit(0);
}

for (const row of fresh) {
  const { at, ...rest } = row;
  appendLedger(REPO_ROOT, "defects", rest, { source: "pre-pipeline", at });
}
console.log(`✓ Added ${fresh.length} defect(s) to tester/.tester-runs/defects.jsonl (${existing.length + fresh.length} total).`);
console.log("  These are triaged in Phase C and fixed in Phase D — not now.");
process.exit(0);
