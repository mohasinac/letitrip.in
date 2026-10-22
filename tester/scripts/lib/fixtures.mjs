/*
 * Per-batch fixtures: created immediately before a batch, deleted immediately
 * after it. No windows, no timers, no waiting.
 *
 * 🛑 WHY THIS REPLACES THE WINDOW MECHANISM RATHER THAN SITTING BESIDE IT.
 *
 * `TESTER_WINDOW_MINUTES` is a bet that the whole run finishes before the clock
 * does, and that bet has already lost: 29 cases blocked on fixtures that expired
 * 80 minutes into a 45-hour run. A bigger window only moves the cliff further
 * out — it does not remove it, because the run length is not known in advance.
 *
 * A batch lasts ~15 minutes. If the state a batch needs is created at the moment
 * the batch starts, nothing it depends on can age out while it runs. That is the
 * entire idea.
 *
 * **Dates are absolute and are never waited on.** A case needing a live auction
 * gets `endsAt: now + 2h`; a case needing an ended one gets `now - 1h`, already
 * closed. Both are true the instant the batch begins. The tester never watches a
 * countdown — the state it needs already exists.
 *
 * 🛑 IDS CARRY THE WORKER SLOT, AND THAT IS WHAT MAKES 5 WORKERS SAFE.
 *
 * `auction-{{w}}-live` becomes `auction-w3-live`. Without it two workers seeding
 * the same page would write the same document ids, and the collision would look
 * like a product bug — a listing mutating under a tester who did nothing. The
 * same substitution runs over the case text handed to the tester, so a case can
 * cite a literal id and stay worker-safe.
 *
 * SCOPE: only what rots or mutates. Products, categories, stores, blog posts and
 * FAQs do not expire and stay in the once-per-run seed. This covers auctions,
 * bids, offers, prize draws, lottery configs, carts and orders — plus a few
 * deliberately-unusual rows (a draft product, an untokenised product) that the
 * ordinary seed has no reason to contain.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/** `{{w}}` -> the worker slot, everywhere it appears in a string or nested value. */
export function substituteWorker(value, slot) {
  if (typeof value === "string") return value.split("{{w}}").join(slot);
  if (Array.isArray(value)) return value.map((v) => substituteWorker(v, slot));
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[substituteWorker(k, slot)] = substituteWorker(v, slot);
    return out;
  }
  return value;
}

/**
 * Resolve a fixture manifest for a batch key, e.g. "selling/product-upload-details".
 * Returns [] when the page has no manifest — most pages do not need one.
 */
export async function loadManifest(repoRoot, batchKey) {
  // Strip the identity/chunk suffixes: "buying/cart--guest--p2" -> "buying/cart".
  const base = String(batchKey).split("--")[0];
  const file = base.replace("/", "__");
  const path = resolve(repoRoot, "appkit/src/features/tester/seed-data/fixtures", `${file}.mjs`);
  if (!existsSync(path)) return [];
  const mod = await import(`file://${path}`);
  return Array.isArray(mod.fixtures) ? mod.fixtures : [];
}

/**
 * Offsets computed at SEED time, so a fixture is in the state its case needs the
 * instant the batch starts.
 *
 * Deliberately NOT `windowOffset()` from tester-window.ts: that helper divides a
 * shared window, which is the mechanism being replaced. These are plain absolute
 * offsets from now, and audit R4 is inverted for this directory to require it.
 */
export const at = {
  hoursFromNow: (h) => new Date(Date.now() + h * 3600_000),
  hoursAgo: (h) => new Date(Date.now() - h * 3600_000),
  minutesFromNow: (m) => new Date(Date.now() + m * 60_000),
  minutesAgo: (m) => new Date(Date.now() - m * 60_000),
};

/**
 * Create every fixture the batch declares.
 *
 * Returns the list of {collection, id} actually written, so teardown removes
 * exactly what was created rather than re-deriving it — a manifest that changed
 * between seed and teardown would otherwise leak the difference.
 */
export async function seedFixtures(db, manifest, slot) {
  const written = [];
  for (const spec of manifest) {
    const id = substituteWorker(spec.id, slot);
    const data = substituteWorker(typeof spec.data === "function" ? spec.data() : spec.data, slot);
    await db.collection(spec.collection).doc(id).set(data);
    written.push({ collection: spec.collection, id });
  }
  return written;
}

/**
 * Remove what `seedFixtures` created.
 *
 * 🛑 CALLED EVEN WHEN THE BATCH FAILS. A retry that inherits half-mutated state
 * from the attempt before it tests something nobody described, and the resulting
 * verdict is worse than no verdict because it looks legitimate. Failures are
 * swallowed per-document: one undeletable row must not strand the other nine.
 */
export async function teardownFixtures(db, written) {
  const failed = [];
  for (const { collection, id } of written) {
    try {
      await db.collection(collection).doc(id).delete();
    } catch (err) {
      failed.push(`${collection}/${id}: ${err?.message ?? err}`);
    }
  }
  return failed;
}

/** Rewrite `{{w}}` inside the batch file the tester reads. */
export function substituteBatchText(batch, slot) {
  return substituteWorker(batch, slot);
}
