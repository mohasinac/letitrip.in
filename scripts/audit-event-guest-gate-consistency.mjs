#!/usr/bin/env node
/**
 * audit-event-guest-gate-consistency.mjs — guards the "per-event admin
 * toggle, applied uniformly across every event type" contract for guest
 * (non-logged-in) participation.
 *
 * Root-caused 2026-08-20: before `EventDocument.allowGuestParticipation`
 * existed, `enterEvent()` (`appkit/src/features/events/actions/event-actions.ts`)
 * hardcoded which event types required login on a per-`event.type` literal
 * basis — poll/survey/feedback required it, raffle/spin_wheel accidentally
 * didn't (never listed), with no admin control either way. The fix
 * centralizes the decision behind one flag, but there are structurally TWO
 * places that decide it: `enterEvent()`'s generic path (poll/survey/
 * feedback/raffle), and `runAssignSpinPrize()`
 * (`appkit/src/_internal/server/jobs/core/assignSpinPrize.ts`), which spins
 * don't reach via `enterEvent()` at all (the entry is found-or-created
 * inline in a transaction there instead). If a future change re-introduces
 * a hardcoded per-type literal in either place instead of reading
 * `event.allowGuestParticipation`, the "one flag governs every type"
 * guarantee silently breaks again — exactly like Root Cause Pattern #33/#38
 * (a stored value drifting from what a piece of derived logic assumes) but
 * for this specific flag.
 *
 * Method: no TypeScript compiler in the loop, matching this project's
 * existing regex/text-extraction audit convention (see
 * audit-filter-tab-enums.mjs / audit-selectable-card-navigation.mjs for
 * precedent). Each REGISTRY entry names the statement that makes the
 * guest-gating decision and asserts it references
 * `allowGuestParticipation` — not a hardcoded boolean/event-type literal.
 *
 * Strict zero — any violation blocks.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @typedef {{
 *   name: string,
 *   file: string,
 *   marker: string,
 *   requiredToken: string,
 * }} RegistryEntry
 */

/** @type {RegistryEntry[]} */
const REGISTRY = [
  // enterEvent()'s generic path — covers poll/survey/feedback/raffle (and
  // spin_wheel too, for the pre-entry-creation case where a caller still
  // goes through the entries endpoint).
  {
    name: "enterEvent (poll/survey/feedback/raffle)",
    file: "appkit/src/features/events/actions/event-actions.ts",
    marker: "const requiresLogin =",
    requiredToken: "allowGuestParticipation",
  },
  // runAssignSpinPrize()'s own independent guest check — spins don't call
  // enterEvent() after the transactional find-or-create fix, so this is a
  // second, structurally separate decision point that must stay in sync.
  {
    name: "runAssignSpinPrize (spin_wheel)",
    file: "appkit/src/_internal/server/jobs/core/assignSpinPrize.ts",
    // Narrowed to "!userId && !event." specifically — the file also has an
    // earlier, unrelated `if (!userId && !guestIpHash)` input-validation
    // check ("exactly one of userId/guestIpHash must be set"); a bare
    // "if (!userId &&" marker would ambiguously match that one first
    // (`indexOf` returns the first occurrence). Deliberately does NOT
    // include "allowGuestParticipation" itself, so the `requiredToken`
    // check below is a real assertion, not a tautology.
    marker: "!userId && !event.",
    requiredToken: "allowGuestParticipation",
  },
];

function readSource(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

// Statement boundaries (matching `;` or a closing `}`) are awkward to parse
// generically when a marker can start mid-expression (e.g. inside an `if`
// condition rather than at its `if (` keyword). A fixed-size lookahead
// window from the marker is simpler and sufficient here — this audit only
// asserts "the required token appears near the decision point", not a
// precise AST-level statement span.
const WINDOW = 200;

function checkEntry(entry) {
  const src = readSource(entry.file);
  const markerIdx = src.indexOf(entry.marker);
  if (markerIdx === -1) {
    return [{
      name: entry.name,
      reason: `could not locate "${entry.marker}" in ${entry.file} — audit registry entry is stale, fix REGISTRY in this script`,
    }];
  }
  const window = src.slice(markerIdx, markerIdx + WINDOW);
  if (!window.includes(entry.requiredToken)) {
    return [{
      name: entry.name,
      reason: `guest-gating decision in ${entry.file} no longer references "${entry.requiredToken}" within ${WINDOW} chars of the marker — it must read the single admin-controlled flag, not a hardcoded per-type literal (found: ${window.replace(/\s+/g, " ").trim()})`,
    }];
  }
  return [];
}

function main() {
  const violations = [];
  for (const entry of REGISTRY) {
    violations.push(...checkEntry(entry));
  }

  if (violations.length === 0) {
    console.log(`audit-event-guest-gate-consistency: clean ✓ (${REGISTRY.length} decision point(s) checked)`);
    process.exit(0);
  }

  console.error(`audit-event-guest-gate-consistency: ${violations.length} violation(s) found.\n`);
  console.error("A guest-participation gating decision no longer reads the single");
  console.error("event.allowGuestParticipation flag — this reintroduces the hardcoded");
  console.error("per-event-type drift the flag was built to eliminate.\n");
  for (const v of violations) {
    console.error(`  [${v.name}] ${v.reason}`);
  }
  process.exit(1);
}

main();
