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

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
/** `npm run env:business` — prompt for and sync the statutory identity vars. */
const BUSINESS = process.argv.includes("--business");
/**
 * `npm run env:business:template` — write every BUSINESS_* key to .env.local
 * with an EMPTY value and a one-line comment, then stop. No prompts, no
 * Vercel call.
 *
 * 🛑 This exists because the prompt flow alone leaves the file EMPTY. It skips
 * a key you press Enter past, which is the right behaviour for "not decided
 * yet" — but it meant `.env.local` never showed the 21 variables at all, so
 * there was nothing to fill in by hand and no way to discover what was
 * expected short of reading this script. A fillable template is the thing
 * most people actually want; the prompts are for topping it up later.
 */
const TEMPLATE = process.argv.includes("--template");
/**
 * `--no-prompt` — skip the questions and sync whatever `.env.local` already
 * holds.
 *
 * 🛑 Needed because `readline.question()` cannot run in a non-interactive
 * shell: it never resolves, and Node reports "Detected unsettled top-level
 * await" rather than failing cleanly. That makes the prompt flow unusable
 * from CI, from a hook, or from any automated caller — and syncing values
 * that are ALREADY in the file is the common case once the template has been
 * filled in by hand.
 */
const NO_PROMPT = process.argv.includes("--no-prompt");

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

/**
 * ── `--business`: the statutory identity vars ────────────────────────────
 *
 * These override the defaults in `appkit.config.js` → `business`, which is the
 * ONE owner of the legal entity's identity. A blank value here is not an
 * error: the config falls back to `null`, which renders as a visible
 * `[to be confirmed]` marker rather than an empty gap, so this script is
 * re-runnable as each value is decided.
 *
 * 🛑 NOT added to `REQUIRED_VARS` in scripts/audit-env-alignment.mjs. That list
 * asserts present-AND-non-empty AND read via `process.env.X` somewhere, so an
 * intentionally-blank var fails it immediately — which is exactly how
 * `COMPANY_ADDRESS` would fail today. The audit reports them warn-only instead.
 *
 * 🛑 `runtimes` deliberately omits "functions" for every one of these. Nothing
 * under `functions/` reads a BUSINESS_* var — the invoice PDF takes its
 * supplier block from the order snapshot — and writing an unread var into
 * `functions/.env.<projectId>` manufactures exactly the dead-variable problem
 * `COMPANY_ADDRESS` already is. Add "functions" to a row the day something
 * there reads it, not before.
 */
const BUSINESS_VARS = [
  { key: "BUSINESS_GSTIN", what: "15-character GSTIN (printed on every invoice)" },
  { key: "BUSINESS_UDYAM_NUMBER", what: "Udyam / MSME registration number" },
  { key: "BUSINESS_SUPPORT_EMAIL", what: "Public support email" },
  { key: "BUSINESS_SUPPORT_PHONE", what: "Public support phone" },
  { key: "BUSINESS_WHATSAPP_NUMBER", what: "WhatsApp number, digits + country code" },
  { key: "BUSINESS_SUPPORT_HOURS", what: 'Support hours, e.g. "Mon-Sat, 10:00-19:00 IST"' },
  { key: "BUSINESS_GRIEVANCE_NAME", what: "Grievance officer name (legally required)" },
  { key: "BUSINESS_GRIEVANCE_DESIGNATION", what: "Grievance officer designation" },
  { key: "BUSINESS_GRIEVANCE_EMAIL", what: "Grievance officer email" },
  { key: "BUSINESS_GRIEVANCE_PHONE", what: "Grievance officer phone" },
  { key: "BUSINESS_PROCESSING_TIME", what: 'Order processing time, e.g. "1-2 business days"' },
  { key: "BUSINESS_DELIVERY_ESTIMATE", what: 'Delivery estimate, e.g. "5-7 business days"' },
  { key: "BUSINESS_SHIPPING_CHARGES", what: "Shipping charges / free-shipping threshold" },
  { key: "BUSINESS_CANCELLATION_WINDOW", what: "Cancellation window" },
  { key: "BUSINESS_RETURN_WINDOW", what: "Return window" },
  { key: "BUSINESS_REFUND_TIMELINE", what: "Refund processing timeline" },
  { key: "BUSINESS_BANK_NAME", what: "Bank name (Slice)" },
  { key: "BUSINESS_BANK_ACCOUNT_NAME", what: "Bank account holder name" },
  { key: "BUSINESS_BANK_ACCOUNT_BRANCH_NAME", what: "Bank home branch, e.g. \"Koramangala, Bangalore\"" },
  { key: "BUSINESS_BANK_ACCOUNT_NUMBER", what: "Bank account number", secret: true },
  { key: "BUSINESS_BANK_IFSC", what: "Bank IFSC code" },
  { key: "BUSINESS_UPI_VPA", what: 'UPI VPA buyers pay into, e.g. "name@bank"' },
];

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

/*
 * 🛑 TWO credential files exist and only one is live. CLI 64.x writes
 * `%APPDATA%/com.vercel.cli/Data/auth.json`; the older
 * `%APPDATA%/xdg.data/com.vercel.cli/auth.json` is still on disk, still parses,
 * and holds an EXPIRED token — measured on this machine 2026-10-19:
 *
 *   xdg.data/com.vercel.cli/auth.json   expiresAt 2026-10-17  EXPIRED
 *   com.vercel.cli/Data/auth.json       expiresAt 2026-10-19  valid
 *
 * Reading the stale one yields `{"error":{"code":"forbidden","invalidToken":true}}`,
 * which reads as "this token lacks scope" rather than "you opened the wrong
 * file" — and `vercel whoami` refreshes only the live store, so re-running it
 * changes nothing while you are still pointed at the old path. This function
 * used to read the stale path exclusively.
 *
 * Newest valid token wins, and an expired one is reported with its path so the
 * next person does not have to rediscover which file they are looking at.
 *
 * 🛑 `expiresAt` is in SECONDS. `new Date(expiresAt)` prints 1970 and looks
 * like corrupt data.
 */
function readToken() {
  const candidates = [
    join(process.env.APPDATA ?? "", "com.vercel.cli/Data/auth.json"),
    join(process.env.APPDATA ?? "", "xdg.data/com.vercel.cli/auth.json"),
  ];

  const seen = [];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    let j;
    try {
      j = JSON.parse(readFileSync(p, "utf8"));
    } catch {
      seen.push(`${p} (unparseable)`);
      continue;
    }
    if (!j.token) {
      seen.push(`${p} (no token)`);
      continue;
    }
    if (j.expiresAt && Date.now() > j.expiresAt * 1000) {
      seen.push(`${p} (expired ${new Date(j.expiresAt * 1000).toISOString()})`);
      continue;
    }
    return j.token;
  }

  die(
    "No valid Vercel CLI session found. Run `vercel whoami` to refresh, or `vercel login`." +
      (seen.length ? `\n  Checked:\n    ${seen.join("\n    ")}` : ""),
  );
}

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

/**
 * Set `key` in a .env file, in place, idempotently.
 *
 * 🛑 Writes the value BARE — no surrounding quotes. `COMPANY_ADDRESS` and
 * `WAREHOUSE_ADDRESS` in this very file are stored as `"\"503 Darusslam…\""`,
 * i.e. the quote characters are part of the value, and `WAREHOUSE_ADDRESS` is
 * live in the returns destination — so the returns address renders with stray
 * quotes today. Re-quoting here would keep manufacturing that.
 *
 * Replaces an existing assignment where one exists rather than appending, so
 * re-running never leaves two assignments of the same key (the last would win
 * silently, and the file would stop being readable as a statement of intent).
 * Comments and blank lines are preserved untouched.
 */
function setEnvVar(path, key, value) {
  const line = `${key}=${value}`;
  if (!existsSync(path)) {
    writeFileSync(path, `${line}\n`, "utf8");
    return "created-file";
  }

  const src = readFileSync(path, "utf8");
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  const lines = src.split(/\r?\n/);
  const re = new RegExp(`^\\s*${key}\\s*=`);

  let found = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (!re.test(lines[i])) continue;
    if (found) {
      // A duplicate assignment already existed. Blank it rather than leaving a
      // shadowed line that disagrees with the live one.
      lines[i] = "";
      continue;
    }
    if (lines[i] === line) {
      found = true;
      continue;
    }
    lines[i] = line;
    found = true;
  }

  if (!found) {
    if (lines.length && lines[lines.length - 1] !== "") lines.push("");
    lines.push(line);
    lines.push("");
  }

  writeFileSync(path, lines.join(eol).replace(/(\r?\n)+$/, eol), "utf8");
  return found ? "updated" : "appended";
}

/*
 * --template: write the keys and stop. Runs BEFORE the Vercel project is
 * loaded or a token is read, so it works with no network and no CLI session —
 * it only touches .env.local.
 */
if (TEMPLATE) {
  const ENV_LOCAL_PATH = join(REPO, ".env.local");
  const existing = parseEnvFile(ENV_LOCAL_PATH);
  let wrote = 0;
  let kept = 0;

  for (const { key, what, secret } of BUSINESS_VARS) {
    if (existing[key]) {
      // 🛑 Never overwrite a value that is already there. A template run must
      // be safe to repeat — the whole point is topping up a partly-filled
      // file, and clobbering a real GSTIN to write "" would be the worst
      // possible behaviour for a command people will re-run without thinking.
      kept += 1;
      continue;
    }
    setEnvVar(ENV_LOCAL_PATH, key, "");
    wrote += 1;
    console.log(`  + ${key.padEnd(32)} ${secret ? "(secret) " : ""}${what}`);
  }

  console.log(
    `\n${wrote} key(s) written empty, ${kept} existing value(s) left untouched.` +
      `\n\nFill them in ${ENV_LOCAL_PATH}, then run:` +
      `\n  npm run env:business      # pushes the non-empty ones to Vercel` +
      `\n\n🛑 A key left empty is NOT a failure — it renders as a visible` +
      `\n   "[to be confirmed]" marker rather than inventing a value. But every` +
      `\n   one must be filled before submitting to PhonePe.`,
  );
  process.exit(0);
}

const project = JSON.parse(readFileSync(join(REPO, ".vercel/project.json"), "utf8"));
const ENV_LOCAL = join(REPO, ".env.local");
let env = parseEnvFile(ENV_LOCAL);

// ── --business: prompt, then write locally, before touching Vercel ──────────
if (BUSINESS && !NO_PROMPT) {
  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log(
    "\nBusiness identity — press Enter to leave a value unset.\n" +
      "An unset value renders as a visible [to be confirmed] marker on the page;\n" +
      "nothing is invented. Re-run this any time to fill more in.\n" +
      "🛑 All of them must be set before submitting to PhonePe.\n",
  );

  for (const { key, what, secret } of BUSINESS_VARS) {
    const current = env[key] ?? "";
    const shown = current ? (secret ? `set (${current.length} chars)` : current) : "unset";
    const answer = (await rl.question(`  ${key}\n    ${what}\n    current: ${shown}\n    > `)).trim();
    if (!answer) continue;
    const action = setEnvVar(ENV_LOCAL, key, answer);
    console.log(`    ✓ ${action} in .env.local`);
  }
  rl.close();

  // Re-read: the prompts just changed the file under us.
  env = parseEnvFile(ENV_LOCAL);

  // Keep .env.example documenting the names, with EMPTY values — it is
  // committed, and these are deployment-specific.
  const EXAMPLE = join(REPO, ".env.example");
  for (const { key } of BUSINESS_VARS) {
    if (!(key in parseEnvFile(EXAMPLE))) setEnvVar(EXAMPLE, key, "");
  }
}

const token = readToken();
const base = `https://api.vercel.com`;
const q = `teamId=${project.orgId}`;

const desired = {};
for (const k of SYNC_KEYS) {
  if (!env[k]) die(`${k} is missing from .env.local — nothing to sync.`);
  desired[k] = env[k];
}
Object.assign(desired, LITERALS);

if (BUSINESS) {
  for (const { key } of BUSINESS_VARS) {
    // Only push what is actually set. Pushing an empty string would store an
    // empty var on Vercel, which is indistinguishable from the trap this
    // script exists to detect ("stored EMPTY") and would make the readback
    // check meaningless for every blank field.
    if (env[key]) desired[key] = env[key];
  }
}

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
  `\n${DRY ? "dry-run" : `created ${created}, updated ${updated}, failed ${failed}`}`,
);

/*
 * ── Parity table ─────────────────────────────────────────────────────────
 *
 * The deliverable of `--business`. `.env.local`, Vercel and
 * `functions/.env.<projectId>` are three INDEPENDENT stores (CLAUDE.md
 * § "Secrets & Runtime Env Parity"), and the failure they produce is silent:
 * a value present locally and absent on Vercel works on every machine where
 * anyone would notice and fails only in production.
 *
 * Re-listed from the API rather than from the POST responses above, so the
 * table reports what Vercel actually HOLDS rather than what this run believed
 * it sent.
 */
if (BUSINESS && !DRY) {
  const after = await fetch(`${base}/v9/projects/${project.projectId}/env?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const remote = after.ok ? ((await after.json()).envs ?? []) : [];
  const remoteKeys = new Set(remote.map((e) => e.key));
  const local = parseEnvFile(ENV_LOCAL);

  const mark = (ok) => (ok ? "yes" : " — ");
  console.log("\n  var                              .env.local  vercel  functions");
  console.log("  " + "-".repeat(68));
  let pending = 0;
  for (const { key } of BUSINESS_VARS) {
    const hasLocal = Boolean(local[key]);
    if (!hasLocal) pending += 1;
    console.log(
      `  ${key.padEnd(32)} ${mark(hasLocal).padEnd(11)} ${mark(remoteKeys.has(key)).padEnd(7)} n/a`,
    );
  }
  console.log(
    "\n  functions is n/a by design: nothing under functions/ reads a BUSINESS_*\n" +
      "  var, and writing an unread one there is how COMPANY_ADDRESS became dead.",
  );
  if (pending > 0) {
    console.log(
      `\n🛑 ${pending} field(s) still unset. Each renders as [to be confirmed] on a\n` +
        "   statutory disclosure page. They must ALL be set before submitting to\n" +
        "   PhonePe — a reviewer who sees that marker will reject the application.",
    );
  } else {
    console.log("\n✓ every business field is set.");
  }
}

console.log(`\n🛑 An env change applies on the NEXT build — syncing is not deploying.\n`);
process.exit(failed > 0 ? 1 : 0);
