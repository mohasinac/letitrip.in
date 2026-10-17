#!/usr/bin/env node
/**
 * audit-unvalidated-request-body — strict-zero, with a shrinking grandfather list.
 *
 * ## Why this exists — and why it OUTLIVED audit-route-schema-registry
 *
 * 🛑 `audit-route-schema-registry` was RETIRED 2026-10-17, and the contrast is
 * the clearest statement of what this audit is for.
 *
 * That one measured registry ADOPTION: whether a route's verb-and-path key
 * appears in `SCHEMAS.api`. That is an ADDRESSING convenience — it lets a route
 * name a schema by key instead of importing it. A route passing
 * `schema: someZodSchema` directly is perfectly safe and still counted as
 * "unregistered", which is why it reported 576 of 582 while the application was
 * in fact largely validated. Measured at retirement: 6 keys registered, **zero
 * routes passing a key string**, 170 passing a schema identifier. A backlog of
 * 576 against a convention with no adopters is not a backlog.
 *
 * This audit measures the property that actually matters:
 *
 *   **A handler that READS a request body must VALIDATE it.**
 *
 * Reading a body and casting it — `const { productId } = body as { productId?: string }`
 * — is the shape this catches. The cast has zero runtime effect; `productId`
 * can be a number, an object, or absent, and the handler proceeds as though it
 * were the string the cast claims.
 *
 * ## What counts as validated
 *
 * Any of: `createRouteHandler({ schema })`, a `.safeParse(` whose result is
 * used, or `validateRequestBody(`. A handler that never touches the body (a
 * DELETE keyed only on a path param) is not a violation and is not counted.
 *
 * Grandfather list shrinks as routes are migrated — the audit is green from
 * day one, so the NEXT one fails immediately instead of the rule arriving only
 * once the last of the known set is done.
 *
 * Suppression: `// audit-unvalidated-body-ok: <reason>` above the handler.
 * Legitimate for a passthrough that forwards an opaque payload it must not
 * inspect (a webhook relay, say) — not for "the cast documents the shape".
 *
 * Exit 0 — clean.  Exit 1 — a body-reading handler outside the list.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API_ROOT = join(ROOT, "src", "app", "api");
const WRITE_VERBS = ["POST", "PUT", "PATCH", "DELETE"];

/** Reads a body. */
const BODY_READ = /\bparseJsonBody\s*\(|\brequest\.json\s*\(|\breq\.json\s*\(/;
/**
 * Validates it.
 *
 * 🛑 `<something>Schema.parse(` counts, and it did not until 2026-10-17.
 *
 * A thrown `ZodError` is classified by `mapToHttpError` as **400
 * VALIDATION_FAILED with `issues`** — identical to the `safeParse` path from
 * the caller's side (`error-mapping.ts`, the ZodError branch). So `.parse()` is
 * real validation, not an unguarded throw, and omitting it made this audit
 * report routes that were already correct: `/api/user/notification-preferences`
 * declares three Zod schemas and calls `schema.parse(await request.json())`,
 * and was still being counted as unvalidated.
 *
 * Deliberately anchored on an identifier ending in `Schema`/`schema` rather
 * than a bare `.parse(` — otherwise `JSON.parse`, `parseFloat` and every
 * `Number.parseInt` in a handler would satisfy a rule about Zod.
 */
const VALIDATED =
  /\bschema:\s*\w|\.safeParse\s*\(|\bvalidateRequestBody\s*\(|\b\w*[Ss]chema\b[\w.]*\.parse\s*\(/;

const SUPPRESS = /audit-unvalidated-body-ok:/;

/**
 * 🛑 EMPTY, and closed 2026-10-17.
 *
 * All 34 entries were measured against the rule itself and **none** was still
 * a violation: every one either validates through `createRouteHandler({ schema })`
 * or no longer reads a body at all (a route that migrated to `schema:` stops
 * calling `request.json()` itself, so `BODY_READ` no longer matches it).
 *
 * The list reported "19 awaiting migration" right up to that measurement, and
 * the 19 did not exist. `stale` was deleted from on EVERY branch of the loop,
 * so it ended up meaning "this file no longer reads a body" while the message
 * said "now validated", and `left = GRANDFATHERED.size - stale.size` counted
 * every still-body-reading entry as unmigrated even when it validated. Three
 * audits in this repo shared that exact bug; all three are fixed. Root Cause
 * #84 — a measurement narrower than the rule it feeds.
 *
 * A stale entry now BLOCKS, so this set cannot silently rot again. Do not add
 * one: validate the body, or suppress at the handler with a stated reason.
 */
const GRANDFATHERED = new Set([]);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name === "route.ts") out.push(full);
  }
  return out;
}

const rel = (f) => relative(ROOT, f).split("\\").join("/");

function main() {
  try {
    statSync(API_ROOT);
  } catch {
    console.log("audit-unvalidated-request-body: no API directory — skipped");
    process.exit(0);
  }

  const violations = [];
  /*
   * `stale` loses an entry as soon as its file is VISITED, so what remains
   * names a route that no longer reads a body (or no longer exists at all).
   * `nowValidated` is the different, equally stale case: the file still reads a
   * body and the body is now validated. Conflating the two is what made this
   * audit report a backlog of 19 that had already been cleared.
   */
  const stale = new Set(GRANDFATHERED);
  const nowValidated = [];
  let stillUnvalidated = 0;
  let checked = 0;

  for (const file of walk(API_ROOT)) {
    const relPath = rel(file);
    const src = readFileSync(file, "utf8");

    /*
     * 🛑 BOTH export forms. `export const POST = …` was the only one matched,
     * so every route written as `export async function POST(request)` was
     * invisible to an audit whose whole job is finding unvalidated bodies —
     * 14 route files, including `POST /api/auth/session`, which destructured
     * `idToken` straight out of `await request.json()` behind nothing but a
     * truthiness check. On the endpoint that mints the session cookie.
     *
     * Root Cause #84 again, and the fourth instance found in one sweep: the
     * rule read as covering every route and covered 94% of them. Both forms
     * are idiomatic Next.js and nothing in the codebase prefers one, so
     * matching only one was never a deliberate scope.
     */
    const hasWrite = WRITE_VERBS.some((v) =>
      new RegExp(`export\\s+(?:const\\s+${v}\\b|async\\s+function\\s+${v}\\b|function\\s+${v}\\b)`).test(src),
    );
    if (!hasWrite) continue;
    if (!BODY_READ.test(src)) continue;

    checked++;
    const isGrandfathered = GRANDFATHERED.has(relPath);
    if (isGrandfathered) stale.delete(relPath);
    if (VALIDATED.test(src) || SUPPRESS.test(src)) {
      if (isGrandfathered) nowValidated.push(relPath);
      continue;
    }
    if (isGrandfathered) { stillUnvalidated++; continue; }
    violations.push(
      `${relPath} :: reads a request body (parseJsonBody / request.json) and never validates it. ` +
        `A \`body as { … }\` cast has ZERO runtime effect — the field can be any type, or absent.`,
    );
  }

  for (const f of nowValidated)
    violations.push(`${f} :: validates its body now — remove it from GRANDFATHERED in this file`);
  for (const f of stale)
    violations.push(`${f} :: is in GRANDFATHERED but reads no request body — remove the entry`);

  if (violations.length === 0) {
    console.log(
      `audit-unvalidated-request-body: clean ✓ (${checked} body-reading handler(s); ${stillUnvalidated} awaiting migration)`,
    );
    process.exit(0);
  }

  console.error(`\n[audit-unvalidated-request-body] STRICT-ZERO violation(s):\n`);
  for (const v of violations) console.error(`  - ${v}`);
  console.error(
    "\nValidate the body with a Zod schema:\n" +
      "  createRouteHandler<(typeof mySchema)['_output']>({ schema: mySchema, handler })\n\n" +
      "Ownership fields (storeId / sellerId / ownerId / userId) come from the\n" +
      "session, never the body — leave them out of the schema entirely.\n",
  );
  console.error(`Total: ${violations.length}\n`);
  process.exit(1);
}

main();
