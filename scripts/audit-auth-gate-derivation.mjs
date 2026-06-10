#!/usr/bin/env node
/**
 * audit-auth-gate-derivation.mjs — `requireLogin` derived from UX flags.
 *
 * Login gating must be derived from explicit auth fields on the event/post/
 * resource document (e.g. `surveyConfig.requireLogin`), never from
 * UX-affordance booleans like `hasLeaderboard`, `hasComments`, or
 * `hasShareButton`. Coupling auth to UX affordances means turning on a
 * feature (leaderboard, comments) silently locks the page behind a login
 * wall — which is exactly what users reported on event detail pages.
 *
 * Root cause this prevents:
 *   EventParticipateClient computed
 *     requireLogin = … || hasLeaderboard
 *   Any event with a leaderboard forced a login wall, even sale / offer /
 *   raffle events that were configured for anonymous participation. Removed
 *   the hasLeaderboard clause; login gating now derives only from
 *   per-type auth config.
 *
 * Correct:
 *   const requireLogin =
 *     (isSurvey && surveyConfig?.requireLogin !== false) ||
 *     (event.type === "poll" && pollConfig?.requireLogin === true);
 *
 * Wrong:
 *   const requireLogin = … || hasLeaderboard;
 *   const requireLogin = … || hasComments;
 *
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SEARCH_DIRS = [
  join(ROOT, "src"),
  join(ROOT, "appkit", "src"),
];

// `requireLogin` (or `requiresAuth` / `loginRequired`) assignment whose RHS
// contains `has[A-Z]…` as one of the disjuncts. Multi-line aware.
const VIOLATION_RE = /(?:requireLogin|requiresAuth|loginRequired)\s*=\s*[\s\S]{0,400}\|\|\s*has[A-Z][a-zA-Z]+/g;

function listFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === ".next") continue;
      out.push(...listFiles(full));
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      if (full.includes("__tests__")) continue;
      out.push(full);
    }
  }
  return out;
}

const violations = [];

for (const dir of SEARCH_DIRS) {
  try {
    statSync(dir);
  } catch {
    continue;
  }
  for (const file of listFiles(dir)) {
    const src = readFileSync(file, "utf8");
    VIOLATION_RE.lastIndex = 0;
    let m;
    while ((m = VIOLATION_RE.exec(src)) !== null) {
      // Allowlist: explicit marker on the assignment line.
      const idx = m.index;
      const window = src.slice(Math.max(0, idx - 100), Math.min(src.length, idx + m[0].length + 100));
      if (window.includes("audit-auth-gate-ok")) continue;
      const line = src.slice(0, idx).split("\n").length;
      violations.push({ file: relative(ROOT, file), line });
    }
  }
}

if (violations.length === 0) {
  console.log("✓ audit-auth-gate-derivation — login gates do not derive from UX-affordance flags.");
  process.exit(0);
}

console.error(`\n✗ audit-auth-gate-derivation — ${violations.length} violation(s) found:`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
}
console.error(`\nLogin gating must derive from explicit auth fields (e.g. surveyConfig.requireLogin),`);
console.error(`not from UX flags like hasLeaderboard / hasComments / hasShareButton.`);
console.error(`If you really intend this, annotate the line with \`// audit-auth-gate-ok: <reason>\`.\n`);
process.exit(1);
