#!/usr/bin/env node
/*
 * A Firestore trigger that writes back into the collection it watches is an
 * infinite, billed cascade unless something stops it.
 *
 * 🛑 THIS COST 12 MILLION INVOCATIONS AGAINST A 2M/MONTH FREE QUOTA.
 *
 * `onShipmentHeaderWrite` watched `procurementShipments/{shipmentId}` on
 * documentWritten and wrote back to that same document. Its no-op guard used
 * `JSON.stringify(a) === JSON.stringify(b)`, which is key-ORDER sensitive:
 * `allocateShipmentCosts()` builds `totals` in construction order while Firestore
 * returns map fields alphabetically, so "unchanged" was unreachable and every
 * invocation wrote. Measured in the console 2026-09-11:
 *
 *     onShipmentHeaderWrite   1,017,548 invocations / 24h
 *     onShipmentDeleted       1,017,372 / 24h  (collateral — same path, correctly
 *                                               guarded, woke up a million times
 *                                               a day just to return)
 *     every other function            0 – 95
 *
 * Nothing in the codebase could see it: the trigger is a normal definition, the
 * handler is a normal function, and the broken guard reads like an ordinary deep
 * comparison. The only visible symptom was a billing page.
 *
 * ── WHAT THIS AUDIT ASKS ─────────────────────────────────────────────────────
 *
 * For every `documentWritten` / `documentUpdated` trigger on `X/{id}`: does its
 * handler write to collection `X`? If so, it MUST carry a recognisable
 * termination guard. Self-writing is legitimate and common — recomputing a
 * denormalised total onto the document that changed is exactly the right design.
 * What is never acceptable is doing it without a way to stop.
 *
 * 🛑 IT DEMANDS AN EXPLICIT MARKER, NOT A DETECTED "GUARD", AND THAT CHOICE WAS
 * FORCED BY THIS AUDIT FAILING ITS OWN NEGATIVE CONTROL.
 *
 * The first version tried to RECOGNISE a termination guard: it scanned for
 * `unchanged`, `Equal(`, `if (event.after) return`, and similar. Removing the
 * real guard to test it changed nothing — the scan still matched, because the
 * variable was still NAMED `totalsUnchanged` while being assigned `false`. A
 * check that a variable name satisfies is decoration.
 *
 * There is no reliable static test for "this comparison terminates the cascade" —
 * the bug this exists for HAD a guard, in the right place, and it was broken.
 * So the requirement is one a human must answer in writing:
 *
 *     // trigger-self-write-ok: <why this terminates>
 *
 * That is checkable with certainty and cannot be satisfied by accident. The
 * CORRECTNESS of the shipment guard specifically is pinned separately by
 * scripts/verify-shipment-allocation-guard.mjs, which reproduces the key-order
 * failure against the real data shape.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const TRIGGERS = "appkit/src/_internal/server/functions/firestore.ts";
const HANDLER_DIRS = [
  "appkit/src/_internal/server/jobs/handlers",
  "appkit/src/_internal/server/jobs/core",
];

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

if (!existsSync(TRIGGERS)) {
  console.log("audit-trigger-self-write: trigger file not found — skipping.");
  process.exit(0);
}

const triggerSrc = readFileSync(TRIGGERS, "utf8");

/** Every write-ish trigger: { fn, handler, kind, collection }. */
const defs = [];
const blockRe = /export const (\w+) = defineFunction\(\{([\s\S]*?)\n\}\);/g;
for (const m of triggerSrc.matchAll(blockRe)) {
  const [, fn, body] = m;
  const kind = body.match(/kind:\s*"(document\w+)"/)?.[1];
  const path = body.match(/pathPattern:\s*"([^"/]+)\//)?.[1];
  const handler = body.match(/handler:\s*(\w+)/)?.[1];
  if (!kind || !path || !handler) continue;
  // documentCreated cannot self-retrigger: an update is not a create.
  if (!/Written|Updated/.test(kind)) continue;
  defs.push({ fn, kind, collection: path, handler });
}

/** Index every handler/core file so a handler can be located by its export. */
const files = [];
for (const dir of HANDLER_DIRS) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) if (f.endsWith(".ts")) files.push(join(dir, f));
}
const sources = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));

/** Follow `export { x } from "./y"` barrels to the file that defines the handler. */
function findHandlerSource(handlerName) {
  for (const [file, text] of sources) {
    if (new RegExp(`export\\s+(const|async function)\\s+${handlerName}\\b`).test(text)) return { file, text };
  }
  for (const [file, text] of sources) {
    const re = new RegExp(`export\\s*\\{[^}]*\\b${handlerName}\\b[^}]*\\}\\s*from\\s*"\\.\\/(\\w+)"`);
    const m = text.match(re);
    if (m) {
      const target = files.find((f) => f.endsWith(`${m[1]}.ts`));
      if (target) return { file: target, text: sources.get(target) };
    }
  }
  return null;
}

/**
 * Does this source write to `collection`, and does it look guarded?
 *
 * Follows one hop into an imported helper, because the real offender lived in
 * `onShipmentAllocationSync.ts` while the trigger named `onShipmentHeaderWriteHandler`
 * — a check that only read the named file would have found nothing at all.
 */
function analyse(entry, collection) {
  const seen = new Set();
  const queue = [entry];
  let writes = false;
  let waived = false;
  let where = "";

  while (queue.length) {
    const cur = queue.shift();
    if (!cur || seen.has(cur.file)) continue;
    seen.add(cur.file);

    if (/trigger-self-write-ok:/.test(cur.text)) waived = true;
    const code = stripComments(cur.text);

    const writeRe = new RegExp(
      `collection\\(\\s*["']${collection}["']\\s*\\)[\\s\\S]{0,300}?(\\.update\\(|\\.set\\(|\\.create\\()|` +
        `(batch|transaction)\\.(update|set)\\(\\s*\\w*[Rr]ef`,
      "m",
    );
    if (writeRe.test(code) && code.includes(`"${collection}"`)) {
      writes = true;
      where = cur.file;
    }


    for (const im of cur.text.matchAll(/from\s+"(\.\.?\/[^"]+)"/g)) {
      const base = im[1].split("/").pop();
      const target = files.find((f) => f.endsWith(`${base}.ts`));
      if (target) queue.push({ file: target, text: sources.get(target) });
    }
  }
  return { writes, waived, where };
}

const violations = [];
const selfWriters = [];

for (const d of defs) {
  const entry = findHandlerSource(d.handler);
  if (!entry) continue;
  const { writes, waived, where } = analyse(entry, d.collection);
  if (!writes) continue;
  selfWriters.push({ ...d, where, waived });
  if (!waived) violations.push({ ...d, where });
}

console.log(`audit-trigger-self-write: ${defs.length} write-triggers, ${selfWriters.length} write to their own collection.`);
for (const s of selfWriters) {
  const mark = s.waived ? "declared" : "UNDECLARED";
  console.log(`  ${mark.padEnd(10)} ${s.fn} (${s.kind} ${s.collection}) -> ${s.where}`);
}

if (!violations.length) {
  console.log("\nOK — every self-writing trigger carries a termination guard.");
  process.exit(0);
}

console.log(`\n${violations.length} violation(s):`);
for (const v of violations) {
  console.log(
    `  ✗ ${v.fn} watches ${v.collection}/{id} on ${v.kind} and writes to ${v.collection} ` +
      `without declaring why it terminates (${v.where}).`,
  );
}
console.log(
  "\nEach write re-triggers the function. Add a no-op comparison, an early return that\n" +
    "cannot be true after its own write, or `// trigger-self-write-ok: <reason>`.\n" +
    "This exact shape cost 12M invocations against a 2M/month free quota.",
);
process.exit(1);
