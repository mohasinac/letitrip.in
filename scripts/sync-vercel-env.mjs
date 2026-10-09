#!/usr/bin/env node
/**
 * Push selected `.env.local` values into the Vercel project environment.
 *
 * ## Why this exists as a script
 *
 * Three traps, all documented in CLAUDE.md § "Secrets & Runtime Env Parity",
 * and all of which have cost real time on this project:
 *
 *  1. **`vercel env add` silently stores an EMPTY value** when fed via stdin on
 *     this machine — in Git Bash and PowerShell, piped and redirected — while
 *     still printing "Added Environment Variable". The REST API is the only
 *     reliable writer.
 *  2. **`vercel env pull` returns `""` for any var whose type is `sensitive`**,
 *     so a readback proves nothing about what is stored. This script therefore
 *     uses `type: "encrypted"` (equally encrypted at rest, but readable back)
 *     and confirms a non-empty value from the POST response body itself.
 *  3. **An env change does nothing to the running deployment.** It applies on
 *     the NEXT build. Syncing is not deploying.
 *
 * ## Usage
 *
 *   node scripts/sync-vercel-env.mjs --dry-run     # show what would change
 *   node scripts/sync-vercel-env.mjs               # create/update
 *
 * Requires a valid Vercel CLI session (`vercel whoami` — it refreshes silently
 * if the 8-hour access token has expired but the refresh token is still good).
 *
 * 🛑 While the team is over its usage limits, Vercel refuses every write with
 * `resource_creation_blocked` ("Your Team exceeded our fair use limits"). Reads
 * still return 200, so a GET succeeding is NOT evidence that a write will. That
 * is a real state this project has been in; re-run once the billing cycle rolls.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");

/**
 * Vars this script owns. Deliberately an explicit list, not "everything in
 * .env.local" — that file holds Firebase admin private keys and PII encryption
 * material which have no business in a Vercel env var unless someone decided so
 * on purpose.
 */
const SYNC_KEYS = [
  // Required by POST /api/cache/revalidate, which returns 503 without it. That
  // route is the only thing that drops stale ISR entries, so an unset value
  // means every invalidation silently fails and the 3600s detail-route TTLs
  // become the sole freshness mechanism.
  "CACHE_REVALIDATION_SECRET",
];

/**
 * Values that are NOT in `.env.local` because nothing in the Next app reads
 * them, but that the deployed app or its callers still need.
 */
const LITERALS = {
  // The origin Cloud Functions POST their revalidation requests to. Also set in
  // functions/.env.<projectId>; mirrored here so a future Next-side caller can
  // use it without re-deriving the canonical host (Root Cause #81 — one owner).
  APP_ORIGIN: "https://www.letitrip.in",
};

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "").replace(/\r$/, "");
  }
  return out;
}

function readToken() {
  const p = join(process.env.APPDATA ?? "", "xdg.data/com.vercel.cli/auth.json");
  if (!existsSync(p)) die("No Vercel CLI session found. Run: vercel login");
  const j = JSON.parse(readFileSync(p, "utf8"));
  if (j.expiresAt && Date.now() > j.expiresAt * 1000) {
    die("Vercel token expired. Run `vercel whoami` to refresh, or `vercel login`.");
  }
  return j.token;
}

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

const project = JSON.parse(readFileSync(join(REPO, ".vercel/project.json"), "utf8"));
const env = parseEnvFile(join(REPO, ".env.local"));
const token = readToken();
const base = `https://api.vercel.com`;
const q = `teamId=${project.orgId}`;

const desired = {};
for (const k of SYNC_KEYS) {
  if (!env[k]) die(`${k} is missing from .env.local — nothing to sync.`);
  desired[k] = env[k];
}
Object.assign(desired, LITERALS);

const listRes = await fetch(`${base}/v9/projects/${project.projectId}/env?${q}`, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!listRes.ok) die(`Could not list existing env (HTTP ${listRes.status}).`);
const existing = (await listRes.json()).envs ?? [];

let created = 0;
let updated = 0;
let failed = 0;

for (const [key, value] of Object.entries(desired)) {
  const prior = existing.filter((e) => e.key === key);
  const verb = prior.length ? "update" : "create";

  if (DRY) {
    console.log(`  [dry-run] would ${verb} ${key} (${value.length} chars)`);
    continue;
  }

  // Replace rather than patch: a key can exist on a subset of targets, and
  // reconciling that in place is more failure modes than deleting and writing.
  for (const p of prior) {
    await fetch(`${base}/v9/projects/${project.projectId}/env/${p.id}?${q}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  const res = await fetch(`${base}/v10/projects/${project.projectId}/env?${q}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      key,
      value,
      type: "encrypted",
      target: ["production", "preview", "development"],
    }),
  });
  const body = await res.json();

  if (body.error) {
    failed += 1;
    console.error(`  ✗ ${key}: ${body.error.code} — ${body.error.message}`);
    if (body.error.code === "resource_creation_blocked") {
      console.error(
        `    The team is over its usage limits, so Vercel refuses writes.\n` +
          `    Reads still return 200 — that is not evidence a write will work.\n` +
          `    Re-run after the billing cycle resets.`,
      );
    }
    continue;
  }

  const c = body.created ?? body;
  // The whole point of the REST path: prove a NON-EMPTY value landed, without
  // printing the secret.
  if (!c.value) {
    failed += 1;
    console.error(`  ✗ ${key}: stored EMPTY — the documented vercel-env trap`);
    continue;
  }
  if (verb === "create") created += 1;
  else updated += 1;
  console.log(
    `  ✓ ${key}: ${verb}d  type=${c.type}  targets=${(c.target ?? []).join("/")}  <${String(c.value).length} chars>`,
  );
}

console.log(
  `\n${DRY ? "dry-run" : `created ${created}, updated ${updated}, failed ${failed}`}` +
    `\n🛑 An env change applies on the NEXT build — syncing is not deploying.\n`,
);
process.exit(failed > 0 ? 1 : 0);
