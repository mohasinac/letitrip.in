/*
 * The run's scope manifest — what was ASKED FOR, as opposed to what happened.
 *
 * 🛑 WHY THIS IS A MODULE AND WHY IT MERGES.
 *
 * `run.mjs` writes scope.json for the batches THIS invocation will run. That is
 * correct for a single sweep and catastrophic for a phased one: run group 1, then
 * group 2, and group 2's manifest replaces group 1's. The completeness gate then
 * sees only group 2, finds it complete, and writes a report covering 1/14th of the
 * catalogue — the gate defeated, silently, by the mechanism meant to phase it.
 *
 * The fix is BOTH halves and neither alone is enough:
 *
 *   1. PRE-SEED the full sweep's rows before group 1 runs. This arms the gate from
 *      minute one: a death at any point leaves a manifest demanding every batch, so
 *      `--finish` refuses and names the missing ones.
 *
 *   2. MERGE on write, so a per-group invocation physically CANNOT delete rows it
 *      did not run. Without (1), merge alone still fails: a sweep that dies after
 *      group 3 leaves a manifest of only groups 1–3, all recorded, and the gate
 *      reports COMPLETE. That is precisely the false green the gate exists to
 *      refuse, reintroduced by the thing meant to fix it.
 *
 * @see scripts/audit-tester-plugin-wiring.mjs R14 (written before the loop) and
 *      R20 (merges rather than overwrites).
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { keyFromFileName } from "./batch-keys.mjs";

/** One row per batch. `name` is the identity — the same join key the gate uses. */
export function buildScopeRows(batchNames, readBatch) {
  return batchNames.map((name) => {
    const b = readBatch(name);
    return {
      name,
      key: b?.key ?? keyFromFileName(name),
      order: b?.order ?? 0,
      cases: (b?.cases ?? []).length,
      needsAdmin: b?.needsAdmin === true,
      identity: b?.slice ?? (b?.needsAdmin ? "admin" : "main"),
      attempts: 0,
      lastFailure: null,
      lastAttemptAt: null,
    };
  });
}

export function scopePath(runsDir) {
  return resolve(runsDir, "scope.json");
}

export function readScope(runsDir) {
  const p = scopePath(runsDir);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

export function writeScopeFile(runsDir, scope) {
  writeFileSync(scopePath(runsDir), JSON.stringify(scope, null, 2));
}

/**
 * Fold this invocation's rows into whatever is already on disk.
 *
 * 🛑 THE MAP IS SEEDED FROM `existing`, NEVER FROM `incoming`.
 *
 * That one word is the entire difference between merge and overwrite. Seeding
 * from `incoming` produces a manifest containing only this invocation's batches
 * — which is exactly the bug, wearing the name of the fix. R20 asserts the
 * `new Map(existing` spelling for that reason.
 */
export function mergeScope(existing, incoming) {
  if (!existing || !Array.isArray(existing.batches)) return incoming;

  const rows = new Map(existing.batches.map((r) => [r.name, r]));

  for (const row of incoming.batches ?? []) {
    const prior = rows.get(row.name);
    if (!prior) {
      rows.set(row.name, row);
      continue;
    }
    /*
     * Descriptive fields refresh (the batch file may have been re-fetched), but
     * attempt HISTORY is preserved when incoming carries its initial values — a
     * group re-run must not erase what earlier groups recorded. The live loop
     * overwrites these as it goes, so a batch actually being attempted still
     * updates normally.
     */
    const untouched = row.attempts === 0 && row.lastFailure === null;
    rows.set(row.name, {
      ...prior,
      key: row.key,
      order: row.order,
      cases: row.cases,
      needsAdmin: row.needsAdmin,
      identity: row.identity,
      attempts: untouched ? prior.attempts : row.attempts,
      lastFailure: untouched ? prior.lastFailure : row.lastFailure,
      lastAttemptAt: untouched ? prior.lastAttemptAt : row.lastAttemptAt,
    });
  }

  const merged = [...rows.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const coveredAll = merged.every((r) => (incoming.batches ?? []).some((i) => i.name === r.name));

  return {
    ...existing,
    // The SEED's filters win. A per-group invocation must not narrow the sweep's
    // stated scope — the manifest describes the whole run, not this slice of it.
    filters: existing.filters ?? incoming.filters,
    startedAt: existing.startedAt ?? incoming.startedAt,
    baseUrl: existing.baseUrl ?? incoming.baseUrl,
    procedureCoverage: existing.procedureCoverage ?? incoming.procedureCoverage,
    guestOnlyCases: existing.guestOnlyCases ?? incoming.guestOnlyCases,
    retries: incoming.retries ?? existing.retries,
    // Only stamp finished when this invocation covered every row in the merged
    // scope. A header claiming the run finished at group 1's end is a small lie
    // in a document whose whole premise is not lying.
    finishedAt: coveredAll ? incoming.finishedAt ?? existing.finishedAt : existing.finishedAt,
    // Append-only: a later successful group must not erase that an earlier one
    // aborted.
    halts: [...(existing.halts ?? []), ...(incoming.halts ?? [])],
    invocations: [
      ...(existing.invocations ?? []),
      { at: new Date().toISOString(), filters: incoming.filters, retries: incoming.retries, pid: process.pid },
    ],
    groups: existing.groups ?? incoming.groups ?? null,
    batches: merged,
  };
}
