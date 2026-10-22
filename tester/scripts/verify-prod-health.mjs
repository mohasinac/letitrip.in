#!/usr/bin/env node
/*
 * Is production actually answering, or only returning 200?
 *
 * Usage:
 *   node tester/scripts/verify-prod-health.mjs
 *   node tester/scripts/verify-prod-health.mjs --origin https://www.letitrip.in
 *   node tester/scripts/verify-prod-health.mjs --json     # for the Stop hook
 *
 * Exit: 0 healthy · 1 degraded (DO NOT TEST) · 2 could not check
 *
 * 🛑 A RUN AGAINST A DEGRADED BACKEND PRODUCES CONFIDENT, EVIDENCED, WRONG
 * VERDICTS — THE WORST OUTPUT THIS HARNESS CAN MAKE.
 *
 * Measured 2026-09-11, mid-run: the Firestore daily quota was exhausted, and
 * because production reads the same project, the site degraded like this —
 *
 *     /api/site-settings          500  DB_001
 *     /api/products?q=dranzer     200  "total":0
 *     /api/products?q=zzzznope    200  "total":0
 *     /products/<real-slug>       200  but rendering 404 markers
 *
 * Every page still returned 200 and still rendered. A tester pointed at that
 * would have recorded ~1,187 failures, each with a real screenshot and a
 * plausible sentence, and not one of them a product defect — indistinguishable
 * from a catastrophic regression.
 *
 * 🛑 THE NONSENSE CONTROL IS THE LOAD-BEARING CHECK, NOT THE REAL QUERY.
 *
 * A real search term returning rows proves only that the API answered. It is the
 * CONTROL returning ZERO that proves the API is filtering rather than failing
 * open (everything) or failing empty (nothing). If `dranzer` and `zzzznope` come
 * back with the same count, the backend is not working however healthy the status
 * codes look. The deploy checklist already prescribes exactly this pairing; this
 * applies it before a run instead of after a deploy.
 */

import { setTimeout as sleep } from "node:timers/promises";

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d;
};
const JSON_OUT = process.argv.includes("--json");

/*
 * www, and an UNPREFIXED path. The apex 308s to www and `/en/x` 307s to `/x`, so
 * both other spellings pay a redirect on every request (CLAUDE.md, Known TS
 * Patterns). A health check should measure the site, not its redirects.
 */
const ORIGIN = arg("origin", "https://www.letitrip.in").replace(/\/$/, "");
const TIMEOUT_MS = Number(arg("timeout", "25000"));

const REAL_TERM = arg("term", "dranzer");
// Deliberately unpronounceable: it must match no product, ever, in any catalogue.
const CONTROL_TERM = "zzzznope";

async function get(path) {
  const url = `${ORIGIN}${path}`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      // Cache-bust: a cached 200 from before the outage would mask a dead backend
      // entirely. This session already nearly "fixed" working pagination code on
      // the strength of a cached response (X-Vercel-Cache: HIT, Age: 293).
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    const body = await res.text();
    return { ok: true, status: res.status, body, cache: res.headers.get("x-vercel-cache") };
  } catch (err) {
    return { ok: false, status: 0, body: "", error: String(err?.message ?? err) };
  } finally {
    clearTimeout(timer);
  }
}

const totalOf = (body) => {
  const m = String(body).match(/"total"\s*:\s*(\d+)/);
  return m ? Number(m[1]) : null;
};

const problems = [];
const notes = [];

// 1 — an endpoint that reads Firestore on every request and cannot be served
//     from a static cache. This is the one that 500s the instant the quota goes.
const settings = await get("/api/site-settings");
if (!settings.ok) problems.push(`/api/site-settings unreachable: ${settings.error}`);
else if (settings.status !== 200) problems.push(`/api/site-settings returned ${settings.status} (expected 200)`);
else notes.push(`/api/site-settings 200`);

// 2 + 3 — the pair. Run sequentially with a small gap so a per-second rate limit
// is not mistaken for a dead backend.
const real = await get(`/api/products?q=${encodeURIComponent(REAL_TERM)}`);
await sleep(400);
const control = await get(`/api/products?q=${CONTROL_TERM}`);

const realTotal = real.ok ? totalOf(real.body) : null;
const controlTotal = control.ok ? totalOf(control.body) : null;

if (!real.ok || !control.ok) {
  problems.push(`/api/products unreachable: ${real.error ?? control.error}`);
} else if (real.status !== 200 || control.status !== 200) {
  problems.push(`/api/products returned ${real.status}/${control.status} (expected 200/200)`);
} else if (realTotal === null || controlTotal === null) {
  problems.push(`/api/products response carried no "total" field — shape changed, or an error body`);
} else {
  notes.push(`q=${REAL_TERM} -> ${realTotal} · q=${CONTROL_TERM} -> ${controlTotal}`);
  /*
   * The three ways this fails, and why each is fatal rather than interesting:
   *   equal        -> not filtering at all; every filter/search case is a lie
   *   real == 0    -> the catalogue is empty or unreadable; nothing can be tested
   *   control > 0  -> failing open; a "found it" verdict means nothing
   */
  if (realTotal === controlTotal) {
    problems.push(
      `both search terms returned ${realTotal} — the API is NOT filtering. ` +
        `A real term and a nonsense term cannot agree on a healthy backend.`,
    );
  }
  if (realTotal === 0) {
    problems.push(`a known-good term ("${REAL_TERM}") returned 0 products — the catalogue is empty or unreadable`);
  }
  if (controlTotal > 0) {
    problems.push(`the nonsense control ("${CONTROL_TERM}") returned ${controlTotal} — the API is failing open`);
  }
}

const healthy = problems.length === 0;

if (JSON_OUT) {
  console.log(JSON.stringify({ healthy, origin: ORIGIN, problems, notes, checkedAt: new Date().toISOString() }));
  process.exit(healthy ? 0 : 1);
}

console.log(`production health — ${ORIGIN}`);
for (const n of notes) console.log(`  ✓ ${n}`);
if (healthy) {
  console.log("\n✓ backend is answering AND filtering — safe to test");
  process.exit(0);
}
console.log("");
for (const p of problems) console.log(`  ✗ ${p}`);
console.log(
  "\n🛑 DO NOT TEST. Every verdict recorded now would be evidenced and wrong.",
  "\n   Most likely the Firestore daily quota (50,000 reads, resets ~midnight Pacific)",
  "\n   — production reads the same project, so the site degrades with it.",
);
process.exit(1);
