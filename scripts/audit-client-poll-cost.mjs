#!/usr/bin/env node
/**
 * audit-client-poll-cost — a browser timer is a recurring server bill.
 *
 * WHY THIS EXISTS
 * ---------------
 * On 2026-09-14 the Vercel account was PAUSED mid-cycle for exceeding Hobby
 * limits (Function Invocations 1.1M/1M, Edge Requests 1M/1M, Fluid Active CPU
 * 23h36m/4h). A large, attributable share of that came from two patterns that
 * look completely harmless at the call site:
 *
 *   1. A fast `refetchInterval` on a hook mounted in shared chrome.
 *      `useNotifications` polled every 30s from `TitleBar` — i.e. on EVERY page
 *      — for an unread COUNT. That is 120 invocations/hour, per open tab, per
 *      signed-in user, wall-clock rather than activity-gated, so a tab left
 *      open overnight kept billing until it was closed.
 *
 *   2. A raw `new EventSource` with no sharing.
 *      `/api/realtime/bids/[id]` holds a serverless invocation open for its
 *      full 45s TTL per connection, so a connection is a continuously-billed
 *      function rather than a cheap socket. `useRealtimeBids` opened one per
 *      hook call, and `AuctionDetailPageView` mounts five components that each
 *      call it — so ONE auction page view pinned FIVE concurrent held-open
 *      functions, all pushing byte-identical data.
 *
 * Neither shows up in review as a cost: the diff is one number or one
 * constructor. Both are trivially reintroduced. Hence a rule rather than a
 * comment.
 *
 * RULES
 * -----
 *   R1 POLL_TOO_FAST   — `refetchInterval: <literal>` under MIN_POLL_MS.
 *   R2 RAW_EVENTSOURCE — `new EventSource(` outside the one module allowed to
 *                        own a connection.
 *
 * Only LITERAL intervals are judged. `refetchInterval: someVar` is left alone
 * on purpose — this audit reports what it can prove and never what it guesses
 * (CLAUDE.md, the silent-degrade precedent).
 *
 * SUPPRESSION
 *   // audit-client-poll-ok: <reason>
 * on the same line or the line above. Reserve it for a poll whose cost is
 * genuinely bounded (a short-lived modal, a one-off job-status watch that
 * stops on completion) — NOT for anything mounted in shared chrome.
 */

import { readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { globSync } from "node:fs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * 60s. Not a performance target — a floor below which a timer in shared chrome
 * stops being a UX affordance and becomes a standing charge. Hooks that need
 * to feel live should use `refetchOnWindowFocus` (fires only when someone is
 * actually looking) or the SSE channel, not a faster tick.
 */
const MIN_POLL_MS = 60_000;

/**
 * The single module permitted to construct an EventSource. It owns the
 * ref-counted, URL-keyed channel map that makes N subscribers share one
 * connection. A second constructor anywhere else silently reintroduces the
 * per-component fan-out this audit exists to prevent.
 */
const EVENTSOURCE_OWNER = "appkit/src/features/auctions/hooks/useRealtimeBids.ts";

const SCAN_GLOBS = ["src/**/*.{ts,tsx}", "appkit/src/**/*.{ts,tsx}"];
const SUPPRESSION = /audit-client-poll-ok:/;

/** Blank out comments and string bodies so docs/examples cannot match. */
function strip(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      while (i < n && src[i] !== "\n") { out += " "; i++; }
    } else if (c === "/" && d === "*") {
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += "  "; i += 2;
    } else if (c === '"' || c === "'" || c === "`") {
      const q = c; out += " "; i++;
      while (i < n && src[i] !== q) {
        if (src[i] === "\\") { out += " "; i++; }
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += " "; i++;
    } else {
      out += c; i++;
    }
  }
  return out;
}

function isSuppressed(lines, idx) {
  return (
    SUPPRESSION.test(lines[idx] ?? "") || SUPPRESSION.test(lines[idx - 1] ?? "")
  );
}

const violations = [];
let filesScanned = 0;

for (const pattern of SCAN_GLOBS) {
  for (const abs of globSync(pattern, { cwd: REPO, absolute: true })) {
    const rel = relative(REPO, abs).split(sep).join("/");
    if (rel.includes("node_modules") || rel.includes("/dist/")) continue;

    const raw = readFileSync(abs, "utf8");
    const rawLines = raw.split("\n");
    const code = strip(raw).split("\n");
    filesScanned++;

    for (let i = 0; i < code.length; i++) {
      const line = code[i];

      // R1 — literal refetchInterval below the floor.
      const poll = line.match(/refetchInterval\s*:\s*([0-9_]+)/);
      if (poll) {
        const ms = Number(poll[1].replace(/_/g, ""));
        if (Number.isFinite(ms) && ms > 0 && ms < MIN_POLL_MS && !isSuppressed(rawLines, i)) {
          violations.push({
            rule: "POLL_TOO_FAST",
            file: rel,
            line: i + 1,
            detail:
              `refetchInterval ${ms}ms is below the ${MIN_POLL_MS}ms floor — ` +
              `that is ${Math.round(3_600_000 / ms)} requests/hour per open tab. ` +
              `Prefer a slower interval plus refetchOnWindowFocus: true.`,
          });
        }
      }

      // R2 — an EventSource built outside its owning module.
      if (/new\s+EventSource\s*\(/.test(line) && rel !== EVENTSOURCE_OWNER && !isSuppressed(rawLines, i)) {
        violations.push({
          rule: "RAW_EVENTSOURCE",
          file: rel,
          line: i + 1,
          detail:
            `Each SSE connection pins a held-open serverless function. Subscribe ` +
            `through the shared ref-counted channel in ${EVENTSOURCE_OWNER} ` +
            `instead of constructing a second connection.`,
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log(`audit-client-poll-cost: clean ✓ (${filesScanned} file(s) scanned)`);
  process.exit(0);
}

console.log(`audit-client-poll-cost: ${violations.length} violation(s) found.\n`);
console.log("A browser timer is a recurring server bill. See this script's header.\n");
for (const v of violations) {
  console.log(`  ${v.rule} — ${v.file}:${v.line}`);
  console.log(`    ${v.detail}`);
}
console.log(`\nSuppress a genuinely bounded case with: // audit-client-poll-ok: <reason>`);
process.exit(1);
