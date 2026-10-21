#!/usr/bin/env node
/**
 * price-observations — record dated price sightings, and roll them into bands.
 *
 * ## Why this exists
 *
 * The price tool's asking-price half used to be a single crawl, summarised to
 * p25/median/p75 per GENERATION and frozen at one date. That shape cannot
 * answer "what is the most common price", "what has it done in the last six
 * months", or "what does THIS bey go for as opposed to its era" — and no
 * amount of relabelling fixes a missing column. `priceObservations` is the row
 * that was missing; this is how rows get in.
 *
 * ## Usage (from the consumer root, d:/proj/letitrip.in)
 *
 *   node scripts/price-observations.mjs add \
 *        --category category-dragoon-ms --amount 6500 --seen 2026-10-18
 *
 *   node scripts/price-observations.mjs import observations.json
 *   node scripts/price-observations.mjs list --category category-dragoon-ms
 *   node scripts/price-observations.mjs rollup [--category <id>] [--dry-run]
 *
 * `import` takes a JSON array of the same fields `add` accepts, which is the
 * shape a crawler should emit.
 *
 * ## 🛑 `--seen` is REQUIRED and is never defaulted to today
 *
 * The whole collection exists so a figure can age. Defaulting the date to the
 * write time would file a back-filled two-year-old crawl inside the six-month
 * window and report stale prices as current — invisibly, because the result is
 * a number either way. A row without a real sighting date is worse than no row.
 *
 * ## 🛑 ONE implementation of the statistic
 *
 * `computeMarketStats` is imported from appkit, never re-derived here. A CLI
 * that computed its own mode would be Root Cause #75's shape exactly — a rule
 * reachable by copy-paste gets copied, and the copy never learns about the
 * branch added later. If this import ever breaks, fix the import; do not
 * inline the arithmetic.
 *
 * Exit: 0 = success, 1 = errors during run, 2 = misconfiguration.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const rawArgs = process.argv.slice(2);
const command = rawArgs[0];

function flag(name, fallback = undefined) {
  const i = rawArgs.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = rawArgs[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const USAGE = `
price-observations — record dated price sightings and roll them into bands.

  add     --category <id> --amount <rupees> --seen <YYYY-MM-DD>
          [--kind ask|sale] [--condition <c>] [--source <key>]
          [--sold-out] [--note "..."]

  import  <file.json>              array of the same fields as \`add\`
  list    --category <id>
  rollup  [--category <id>] [--dry-run]

Global: --service-account <path-to-key.json>
`;

if (!command || command === "--help" || command === "-h") {
  console.log(USAGE);
  process.exit(command ? 0 : 2);
}

// ---------------------------------------------------------------------------
// .env.local loader (same shape as seed-cli.mjs / purge-test-data.mjs)
// ---------------------------------------------------------------------------
const repoRoot = process.cwd();
const envLocalPath = resolve(repoRoot, ".env.local");
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
} else {
  console.warn(`⚠ .env.local not found at ${envLocalPath} — relying on existing process.env`);
}

const SERVICE_ACCOUNT_OVERRIDE =
  typeof flag("service-account") === "string" ? flag("service-account") : null;
const required = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
];
const missing = required.filter((k) => !process.env[k]);
if (!SERVICE_ACCOUNT_OVERRIDE && missing.length > 0) {
  console.error(`✗ Missing required env vars: ${missing.join(", ")}`);
  console.error("  Set them in .env.local or pass --service-account <path-to-key.json>");
  process.exit(2);
}

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");

if (!admin.apps.length) {
  if (SERVICE_ACCOUNT_OVERRIDE) {
    const key = JSON.parse(readFileSync(resolve(repoRoot, SERVICE_ACCOUNT_OVERRIDE), "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(key) });
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID.trim(),
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
        privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").includes("\\n")
          ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n")
          : process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      }),
    });
  }
}
const db = admin.firestore();

/*
 * 🛑 Imported, never re-derived. See the header. The module is pure — no
 * React, no Firestore — so it loads in a bare Node process with no shim.
 */
const { computeMarketStats, MIN_BAND_OBSERVATIONS } = await import(
  "@mohasinac/appkit/features/price-index/market-stats"
);

const OBSERVATIONS = "priceObservations";
const INDEX = "marketPriceIndex";
const KINDS = new Set(["ask", "sale"]);

/**
 * 🛑 A date-only string is parsed as UTC MIDNIGHT, explicitly.
 *
 * `new Date("2026-10-18")` is already UTC per spec, but `new Date("2026/10/18")`
 * and `new Date("Oct 18 2026")` are LOCAL — so accepting loose formats would
 * make a sighting land on a different day depending on the operator's
 * timezone, and the six-month boundary would move with it. One format,
 * validated, or the row is rejected.
 */
function parseSeenAt(raw) {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return null;
  const d = new Date(`${raw.trim()}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  // A sighting in the future is a typo, and it would sit inside every window
  // forever. Rejected rather than clamped — clamping hides the typo.
  if (d.getTime() > Date.now() + 86_400_000) return null;
  return d;
}

function normaliseRow(input, i) {
  const where = i === undefined ? "" : ` (row ${i})`;
  const categoryId = String(input.category ?? input.categoryId ?? "").trim();
  if (!categoryId) return { error: `missing --category${where}` };
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { error: `bad --amount${where}` };
  const seenAt = parseSeenAt(input.seen ?? input.seenAt);
  if (!seenAt) return { error: `--seen must be YYYY-MM-DD and not in the future${where}` };
  const kind = String(input.kind ?? "ask");
  if (!KINDS.has(kind)) return { error: `--kind must be ask|sale${where}` };

  return {
    row: {
      categoryId,
      amount,
      currency: "INR",
      kind,
      seenAt,
      ...(input.condition ? { condition: String(input.condition) } : {}),
      ...(input.soldOut || input["sold-out"] ? { soldOut: true } : {}),
      // Opaque by instruction — never a competitor's name. See the header on
      // `price-observation.repository.ts`.
      sourceKey: String(input.source ?? input.sourceKey ?? "manual"),
      ...(input.note ? { note: String(input.note) } : {}),
      createdAt: new Date(),
    },
  };
}

async function writeRows(rows) {
  let written = 0;
  // 500 is Firestore's write-batch ceiling. An import bigger than that is a
  // normal crawler output, not an edge case.
  for (let i = 0; i < rows.length; i += 500) {
    const batch = db.batch();
    for (const row of rows.slice(i, i + 500)) {
      batch.set(db.collection(OBSERVATIONS).doc(), row);
    }
    await batch.commit();
    written += Math.min(500, rows.length - i);
  }
  return written;
}

/** Firestore `Timestamp` | `Date` | ISO -> `Date` | null. */
function toDate(v) {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (v && typeof v.toDate === "function") return v.toDate();
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

async function cmdAdd() {
  const { row, error } = normaliseRow({
    category: flag("category"),
    amount: flag("amount"),
    seen: flag("seen"),
    kind: flag("kind"),
    condition: flag("condition"),
    source: flag("source"),
    soldOut: flag("sold-out") === true,
    note: flag("note"),
  });
  if (error) {
    console.error(`✗ ${error}`);
    console.log(USAGE);
    process.exit(2);
  }
  await writeRows([row]);
  console.log(
    `✓ recorded ${row.kind} ₹${row.amount} for ${row.categoryId} seen ${row.seenAt.toISOString().slice(0, 10)}`,
  );
  console.log("  run `node scripts/price-observations.mjs rollup` to publish the band");
}

async function cmdImport() {
  const file = rawArgs[1];
  if (!file || file.startsWith("--")) {
    console.error("✗ import needs a file path");
    process.exit(2);
  }
  const parsed = JSON.parse(readFileSync(resolve(repoRoot, file), "utf8"));
  if (!Array.isArray(parsed)) {
    console.error("✗ file must contain a JSON array");
    process.exit(2);
  }
  const rows = [];
  const errors = [];
  parsed.forEach((raw, i) => {
    const { row, error } = normaliseRow(raw, i);
    if (error) errors.push(error);
    else rows.push(row);
  });
  /*
   * 🛑 A bad row FAILS THE IMPORT; it is not skipped with a warning. A
   * partially-applied import leaves a band computed over a subset nobody can
   * identify afterwards, and the obvious fix — re-running it — then
   * double-counts every row that did land.
   */
  if (errors.length > 0) {
    console.error(`✗ ${errors.length} invalid row(s), nothing written:`);
    for (const e of errors.slice(0, 20)) console.error(`   ${e}`);
    process.exit(2);
  }
  const written = await writeRows(rows);
  console.log(`✓ imported ${written} observation(s)`);
}

async function cmdList() {
  const categoryId = flag("category");
  if (typeof categoryId !== "string") {
    console.error("✗ list needs --category <id>");
    process.exit(2);
  }
  const snap = await db
    .collection(OBSERVATIONS)
    .where("categoryId", "==", categoryId)
    .orderBy("seenAt", "desc")
    .limit(100)
    .get();
  if (snap.empty) {
    console.log(`(no observations for ${categoryId})`);
    return;
  }
  for (const doc of snap.docs) {
    const d = doc.data();
    const seen = toDate(d.seenAt);
    console.log(
      `${seen ? seen.toISOString().slice(0, 10) : "????-??-??"}  ${String(d.kind).padEnd(4)}  ₹${String(d.amount).padStart(7)}  ${d.condition ?? "-"}  ${d.sourceKey ?? "-"}`,
    );
  }
  console.log(`\n${snap.size} observation(s) for ${categoryId}`);
}

async function cmdRollup() {
  const only = typeof flag("category") === "string" ? flag("category") : null;
  const dryRun = flag("dry-run") === true;

  /*
   * 🛑 Enumerates the LEAVES that have observations, not the observations —
   * Root Cause #102, where a reconciler built its tally from the events that
   * exist rather than the entities that exist and so could only ever add.
   * A leaf whose rows were all retracted must be visited so its stale band
   * can be cleared.
   */
  let leafIds;
  if (only) {
    leafIds = [only];
  } else {
    const snap = await db.collection(OBSERVATIONS).select("categoryId").limit(20_000).get();
    leafIds = [...new Set(snap.docs.map((d) => d.data().categoryId).filter(Boolean))];
  }

  let written = 0;
  let cleared = 0;
  for (const leafId of leafIds) {
    const snap = await db
      .collection(OBSERVATIONS)
      .where("categoryId", "==", leafId)
      .orderBy("seenAt", "desc")
      .limit(500)
      .get();

    const byKind = {};
    for (const kind of KINDS) {
      const samples = snap.docs
        .map((d) => d.data())
        .filter((d) => (d.kind ?? "ask") === kind)
        .map((d) => ({ amount: Number(d.amount), seenAt: toDate(d.seenAt) }))
        .filter((s) => s.seenAt && Number.isFinite(s.amount) && s.amount > 0);
      const stats = computeMarketStats(samples);
      if (stats) byKind[kind] = stats;
    }

    const ref = db.collection(INDEX).doc(leafId);
    if (Object.keys(byKind).length === 0) {
      if (!dryRun) await ref.delete();
      cleared += 1;
      console.log(`· ${leafId}: below ${MIN_BAND_OBSERVATIONS} observations — band cleared`);
      continue;
    }
    if (!dryRun) {
      await ref.set({ currency: "INR", byKind, computedAt: new Date() }, { merge: false });
    }
    written += 1;
    const ask = byKind.ask;
    if (ask) {
      console.log(
        `✓ ${leafId}: ${ask.mode !== undefined ? `mode ₹${ask.mode} (${ask.modeCount}/${ask.sampleSize})` : `median ₹${ask.median}`}` +
          ` · ₹${ask.low}–₹${ask.high} · ${ask.basedOnRecent ? "last 6 months" : `all time (${ask.windowDays}d)`}`,
      );
    }
  }

  console.log(
    `\n${dryRun ? "[dry run] " : ""}${written} band(s) written, ${cleared} cleared, across ${leafIds.length} leaf/leaves`,
  );
}

const COMMANDS = { add: cmdAdd, import: cmdImport, list: cmdList, rollup: cmdRollup };
const run = COMMANDS[command];
if (!run) {
  console.error(`✗ unknown command: ${command}`);
  console.log(USAGE);
  process.exit(2);
}

try {
  await run();
  process.exit(0);
} catch (err) {
  console.error(`✗ ${err?.message ?? err}`);
  process.exit(1);
}
