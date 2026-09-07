#!/usr/bin/env node
/**
 * audit-unguarded-send.mjs
 *
 * Nothing may leave the building unmetered.
 *
 * WHY
 *   Resend's free tier is 100 emails/day and this codebase had three ways to
 *   spend all of it in one go: `auctionSettlement` mailed every losing bidder
 *   (up to 50 in PARALLEL per auction, with all expired auctions settling
 *   concurrently), `onScamReportCreate` fanned out one send per employee up to
 *   100, and `bid_outbid` fired on every bid. There was no kill switch, and the
 *   only rate limiter in the repo is a per-lambda in-memory Map that resets on
 *   cold start — useless for a quota.
 *
 *   The fix has two halves. `EMAIL_ELIGIBLE_TYPES` decides which notification
 *   types may email at all, and `guardSend` applies the kill switch and the
 *   daily ceiling. This audit exists because both halves are bypassable by
 *   writing one plausible-looking line.
 *
 * THE FOUR RULES
 *   R1  No raw Resend send outside the provider that owns it. `sendEmail` and
 *       `sendNotification` both funnel through `createResendProvider`; a third
 *       caller constructing its own would be unguarded and invisible.
 *   R2  A file that calls a WhatsApp sender must also call `guardSend`.
 *       WhatsApp is the one channel where the guard is NOT enforced by a
 *       required parameter — `features/whatsapp-bot/helpers/whatsapp.ts` is
 *       re-exported from `appkit/src/index.ts`, and importing `guardSend`
 *       there would pull `firebase-admin` into the main entry's graph, i.e.
 *       the Turbopack client-bundle trap (Root Cause #6/#24). So the senders
 *       stay pure and this rule covers what the type system cannot.
 *   R3  `EMAIL_ELIGIBLE_TYPES` covers the whole `NotificationType` union.
 *       TypeScript already enforces this via `Record<NotificationType, …>`,
 *       but only while the annotation survives — someone widening it to
 *       `Record<string, boolean>` would silently reopen every type.
 *   R4  No `Promise.all` / `Promise.allSettled` wrapping a send. This is the
 *       condition that would break the UNSHARDED daily counter: Firestore
 *       sustains ~1 write/sec on one document, so a concurrent fan-out would
 *       contend and stall. Every remaining sender loops sequentially, and the
 *       moment one does not, the counter needs sharding BEFORE that merges.
 *
 * Strict-zero. Suppression marker `// audit-unguarded-send-ok: <reason>` on the
 * offending line or the line above — reserved for genuinely irreducible cases,
 * not for quietening a real finding (CLAUDE.md Rule #22).
 *
 * Exits 0 when clean, 1 otherwise.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_ROOTS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

/** The provider that legitimately owns the Resend SDK call. */
const RESEND_PROVIDER_FILE = join("appkit", "src", "providers", "email-resend", "provider.ts");

/**
 * Files allowed to construct a Resend provider. `email.tsx` builds one as the
 * documented Functions-runtime fallback when `getProviders()` has no registry,
 * and `notification-actions.ts` builds its own because it deliberately does not
 * route through `sendEmail`. Both call `guardSend` themselves.
 */
const RESEND_CONSTRUCTOR_ALLOWED = [
  RESEND_PROVIDER_FILE,
  join("appkit", "src", "features", "contact", "email.tsx"),
  join("appkit", "src", "features", "admin", "actions", "notification-actions.ts"),
];

const WHATSAPP_SENDERS = [
  "sendWhatsAppBusinessMessage",
  "sendWhatsAppTemplateMessage",
];

/** Where the senders are DEFINED / re-exported — calling them is the concern, not declaring them. */
const WHATSAPP_DEFINITION_FILES = [
  join("appkit", "src", "features", "whatsapp-bot", "helpers", "whatsapp.ts"),
  join("appkit", "src", "features", "whatsapp-bot", "server.ts"),
  join("appkit", "src", "features", "whatsapp-bot", "index.ts"),
];

const SEND_CALL_TOKENS = [
  "sendEmail(",
  "sendNotification(",
  "sendWhatsAppBusinessMessage(",
  "sendWhatsAppTemplateMessage(",
];

const SUPPRESSION = "audit-unguarded-send-ok";

const findings = [];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === ".next") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    // `.d.ts` files DECLARE these symbols; they cannot call them. Scanning them
    // flagged `src/types/appkit-provider-shims.d.ts` for "constructing" a Resend
    // provider it merely types.
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

/**
 * Strip comments before matching.
 *
 * Not optional: this file's own header names every token it looks for, and an
 * audit that flags its own documentation is an audit people learn to ignore.
 * The same omission made `audit-observability-registration` pass for the exact
 * state it exists to catch (Root Cause #87).
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, p1) => p1);
}

/**
 * The marker may be on the offending line, or anywhere in the CONTIGUOUS
 * comment block immediately above it.
 *
 * Checking only `idx - 1` was wrong and produced a false failure the first time
 * it mattered: a real waiver needs a paragraph of reasoning, so the marker ends
 * up on the first line of a block eight or nine lines tall. An audit that only
 * accepts a one-line excuse is an audit that pushes people toward one-line
 * excuses. Walks upward through comment/blank lines and stops at the first line
 * of code, so it can never reach into an unrelated block.
 */
function isSuppressed(lines, idx) {
  if ((lines[idx] ?? "").includes(SUPPRESSION)) return true;
  for (let i = idx - 1; i >= 0; i--) {
    const line = (lines[i] ?? "").trim();
    const isCommentOrBlank =
      line === "" || line.startsWith("//") || line.startsWith("*") ||
      line.startsWith("/*") || line.startsWith("*/");
    if (!isCommentOrBlank) return false;
    if (line.includes(SUPPRESSION)) return true;
  }
  return false;
}

const files = SCAN_ROOTS.flatMap((r) => walk(r));

for (const file of files) {
  const rel = relative(ROOT, file);
  const raw = readFileSync(file, "utf8");
  const src = stripComments(raw);
  const rawLines = raw.split("\n");
  const lines = src.split("\n");

  // ── R1: raw Resend usage outside the provider ───────────────────────────
  if (rel !== RESEND_PROVIDER_FILE) {
    lines.forEach((line, i) => {
      if (/\.emails\.send\s*\(/.test(line) && !isSuppressed(rawLines, i)) {
        findings.push({
          rule: "RAW_RESEND_SEND",
          file: rel,
          line: i + 1,
          msg: "calls resend.emails.send directly — every send must go through sendEmail()/sendNotification(), which apply guardSend",
        });
      }
    });
  }
  if (!RESEND_CONSTRUCTOR_ALLOWED.includes(rel)) {
    lines.forEach((line, i) => {
      if (/createResendProvider\s*\(/.test(line) && !isSuppressed(rawLines, i)) {
        findings.push({
          rule: "RAW_RESEND_PROVIDER",
          file: rel,
          line: i + 1,
          msg: "constructs its own Resend provider — that bypasses the guard; call sendEmail(opts, guard) instead",
        });
      }
    });
  }

  // ── R2: WhatsApp sender call without a guardSend in the same file ───────
  if (!WHATSAPP_DEFINITION_FILES.includes(rel)) {
    const callsWhatsApp = WHATSAPP_SENDERS.some((s) =>
      new RegExp(`\\b${s}\\s*\\(`).test(src),
    );
    if (callsWhatsApp && !/\bguardSend\s*\(/.test(src)) {
      const idx = lines.findIndex((l) =>
        WHATSAPP_SENDERS.some((s) => new RegExp(`\\b${s}\\s*\\(`).test(l)),
      );
      if (!isSuppressed(rawLines, idx)) {
        findings.push({
          rule: "UNGUARDED_WHATSAPP_SEND",
          file: rel,
          line: idx + 1,
          msg: "sends WhatsApp without calling guardSend() — the sender is pure by design (Root Cause #6/#24), so the call site must guard",
        });
      }
    }
  }

  // ── R4: concurrent fan-out over a send ──────────────────────────────────
  // Matches `Promise.all(` / `Promise.allSettled(` and looks ahead a few lines
  // for a send token, which covers the common `.map(x => send…)` shape without
  // needing a parser.
  lines.forEach((line, i) => {
    if (!/Promise\.(all|allSettled)\s*\(/.test(line)) return;
    const window = lines.slice(i, i + 8).join("\n");
    if (!SEND_CALL_TOKENS.some((t) => window.includes(t))) return;
    if (isSuppressed(rawLines, i)) return;
    findings.push({
      rule: "CONCURRENT_SEND_FANOUT",
      file: rel,
      line: i + 1,
      msg: "fans out sends concurrently — the daily budget counter is a SINGLE unsharded document and will contend; loop sequentially, or shard messageBudget first",
    });
  });
}

// ── R3: the eligibility map still covers the whole union ──────────────────
const UNION_FILE = join(ROOT, "appkit", "src", "features", "admin", "schemas", "firestore.ts");
const MAP_FILE = join(
  ROOT, "appkit", "src", "_internal", "shared", "features", "notifications", "email-eligibility.ts",
);

if (existsSync(UNION_FILE) && existsSync(MAP_FILE)) {
  const unionSrc = readFileSync(UNION_FILE, "utf8");
  const mapRaw = readFileSync(MAP_FILE, "utf8");
  const mapSrc = stripComments(mapRaw);

  const unionBlock = unionSrc.match(
    /export const NOTIFICATION_TYPE_VALUES\s*=\s*\[([\s\S]*?)\]\s*as const/,
  );
  if (!unionBlock) {
    findings.push({
      rule: "UNION_UNREADABLE",
      file: relative(ROOT, UNION_FILE),
      line: 1,
      msg: "could not parse NOTIFICATION_TYPE_VALUES — this audit cannot verify eligibility coverage",
    });
  } else {
    const types = [...unionBlock[1].matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);

    if (!/Record<NotificationType,\s*boolean>/.test(mapSrc)) {
      findings.push({
        rule: "ELIGIBILITY_NOT_UNION_TYPED",
        file: relative(ROOT, MAP_FILE),
        line: 1,
        msg: "EMAIL_ELIGIBLE_TYPES is no longer annotated Record<NotificationType, boolean> — a new notification type would become email-enabled silently",
      });
    }

    const missing = types.filter((t) => !new RegExp(`\\b${t}\\s*:`).test(mapSrc));
    for (const t of missing) {
      findings.push({
        rule: "ELIGIBILITY_MISSING_TYPE",
        file: relative(ROOT, MAP_FILE),
        line: 1,
        msg: `notification type "${t}" has no entry in EMAIL_ELIGIBLE_TYPES — decide whether it may email`,
      });
    }
  }
}

if (findings.length > 0) {
  console.error(`audit-unguarded-send: ${findings.length} violation(s)\n`);
  for (const f of findings) {
    console.error(`  [${f.rule}] ${f.file}:${f.line}`);
    console.error(`      ${f.msg}\n`);
  }
  console.error(
    "Every outbound message must pass guardSend(). See CLAUDE.md § Notification Email Eligibility & Send Budget.",
  );
  process.exit(1);
}

console.log(
  `audit-unguarded-send: clean ✓ (${files.length} file(s) scanned)`,
);
