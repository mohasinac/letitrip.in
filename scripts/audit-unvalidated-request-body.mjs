#!/usr/bin/env node
/**
 * audit-unvalidated-request-body — strict-zero, with a shrinking grandfather list.
 *
 * ## Why this exists, and why it is NOT audit-route-schema-registry
 *
 * `audit-route-schema-registry` measures registry ADOPTION: whether a route's
 * verb-and-path key appears in `SCHEMAS.api`. That is an addressing
 * convenience — it lets a route name a schema by key instead of importing it.
 * A route with `schema: someZodSchema` passed directly is perfectly safe and
 * still counts as "unregistered" there, which is why that audit reports 553 of
 * 559 while the application is in fact largely validated.
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
/** Validates it. */
const VALIDATED = /\bschema:\s*\w|\.safeParse\s*\(|\bvalidateRequestBody\s*\(/;

const SUPPRESS = /audit-unvalidated-body-ok:/;

/**
 * Known offenders, measured 2026-08-26. Remove an entry the moment its route
 * validates — never add one.
 */
const GRANDFATHERED = new Set([
  "src/app/api/admin/admin-notifications/[id]/route.ts",
  "src/app/api/admin/item-requests/[id]/route.ts",
  "src/app/api/admin/notifications/bulk/route.ts",
  "src/app/api/admin/orders/[id]/payment-reject-fraud/route.ts",
  "src/app/api/admin/orders/[id]/payment-reupload/route.ts",
  "src/app/api/admin/products/[id]/group/route.ts",
  "src/app/api/admin/products/[id]/group/children/route.ts",
  "src/app/api/admin/users/bulk/route.ts",
  "src/app/api/admin/users/[uid]/soft-ban/route.ts",
  "src/app/api/admin/users/[uid]/soft-ban/[action]/route.ts",
  "src/app/api/auth/event/init/route.ts",
  "src/app/api/cache/revalidate/route.ts",
  "src/app/api/events/[id]/entries/route.ts",
  "src/app/api/events/[id]/lottery-pull/route.ts",
  "src/app/api/item-requests/[id]/replies/route.ts",
  "src/app/api/lottery-entries/[entryId]/flag/route.ts",
  "src/app/api/lottery-entries/[entryId]/reopen-slot/route.ts",
  "src/app/api/media/finalize/route.ts",
  "src/app/api/media/sign/route.ts",
  "src/app/api/orders/[id]/dispute/route.ts",
  "src/app/api/orders/[id]/payment-proof/route.ts",
  "src/app/api/products/[id]/lottery-pull/route.ts",
  "src/app/api/reviews/[id]/route.ts",
  "src/app/api/reviews/[id]/vote/route.ts",
  "src/app/api/store/analytics/alerts/[id]/route.ts",
  "src/app/api/store/analytics/cards/[id]/route.ts",
  "src/app/api/store/orders/bulk-location/route.ts",
  "src/app/api/store/orders/[id]/emi-installment/route.ts",
  "src/app/api/store/orders/[id]/review-buyer/route.ts",
  "src/app/api/store/orders/[id]/ship/route.ts",
  "src/app/api/store/products/bulk-location/route.ts",
  "src/app/api/store/reviews/[id]/contest/route.ts",
  "src/app/api/store/reviews/[id]/feedback/route.ts",
  "src/app/api/user/notification-preferences/route.ts",
]);

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
  const stale = new Set(GRANDFATHERED);
  let checked = 0;

  for (const file of walk(API_ROOT)) {
    const relPath = rel(file);
    const src = readFileSync(file, "utf8");

    const hasWrite = WRITE_VERBS.some((v) => new RegExp(`export const ${v}\\b`).test(src));
    if (!hasWrite) continue;
    if (!BODY_READ.test(src)) continue;

    checked++;
    if (VALIDATED.test(src)) {
      stale.delete(relPath);
      continue;
    }
    if (SUPPRESS.test(src)) {
      stale.delete(relPath);
      continue;
    }
    if (GRANDFATHERED.has(relPath)) {
      stale.delete(relPath);
      continue;
    }
    violations.push(
      `${relPath} :: reads a request body (parseJsonBody / request.json) and never validates it. ` +
        `A \`body as { … }\` cast has ZERO runtime effect — the field can be any type, or absent.`,
    );
  }

  if (stale.size > 0) {
    console.log("[audit-unvalidated-request-body] now validated — remove from GRANDFATHERED:");
    for (const f of stale) console.log(`  ✓ ${f}`);
    console.log("");
  }

  if (violations.length === 0) {
    const left = GRANDFATHERED.size - stale.size;
    console.log(
      `audit-unvalidated-request-body: clean ✓ (${checked} body-reading handler(s); ${left} awaiting migration)`,
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
