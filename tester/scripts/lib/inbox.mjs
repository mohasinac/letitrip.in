/*
 * Read the harness mailbox over IMAP.
 *
 * 🛑 THIS IS THE SECOND-CHOICE INSTRUMENT. Reach for the email recorder first.
 *
 * `appkit/src/_internal/server/notifications/send-recorder.ts` writes a row for
 * every send DECISION — sent, suppressed (with the rule that stopped it), or
 * failed. That answers ~19 of the 21 email cases instantly and, crucially, makes
 * the six "no email should arrive" cases provable: absence is a query, not a wait.
 *
 * Use THIS module only for the handful of cases that assert real delivery — that
 * Resend actually accepted and Gmail actually received. Nothing else can prove
 * that, and nothing else should be spending ten seconds per assertion to try.
 *
 * Credentials come from `tester/.env` (gitignored), never the consumer's
 * `.env.local`: the app only ever SENDS mail and has no business holding a
 * mailbox password.
 *
 * Usage:
 *   import { findMessage, assertNoMessage } from "./lib/inbox.mjs";
 *   const hit = await findMessage({ subjectContains: "Daily Status", sinceMs: t0 });
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const IMAP_HOST = "imap.gmail.com";
const IMAP_PORT = 993;

/** Load tester/.env without a dotenv dependency. Existing process.env wins. */
function loadTesterEnv(repoRoot = process.cwd()) {
  const p = resolve(repoRoot, "tester", ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
}

/**
 * Open a connection.
 *
 * 🛑 The App Password is stored the way Google DISPLAYS it — four groups of four,
 * 19 characters. The credential is the 16 without spaces, so strip before use or
 * every login fails with AUTHENTICATIONFAILED and looks like a wrong password.
 */
async function connect() {
  loadTesterEnv();
  const user = process.env.TESTER_EMAIL_ID?.trim();
  const pass = process.env.TESTER_EMAIL_APP_PWD?.replace(/\s/g, "");
  if (!user || !pass) {
    throw new Error(
      "inbox: TESTER_EMAIL_ID / TESTER_EMAIL_APP_PWD missing. They live in tester/.env (gitignored).",
    );
  }
  const { ImapFlow } = await import("imapflow");
  const client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    logger: false,
    auth: { user, pass },
  });
  await client.connect();
  return client;
}

/**
 * Find one message matching the filter.
 *
 * 🛑 `sinceMs` is REQUIRED and is not a convenience. Batches run against a shared
 * mailbox, and "the newest message matching X" will happily return one left by an
 * earlier case — a stale match is worse than no match, because it reads as a pass.
 * Capture `Date.now()` BEFORE triggering the action, and pass it here.
 *
 * @param {{subjectContains?: string, toContains?: string, sinceMs: number,
 *          timeoutMs?: number, pollMs?: number}} opts
 * @returns {Promise<{subject: string, from: string, to: string, date: Date,
 *          text: string, html: string} | null>}
 */
export async function findMessage(opts) {
  const { subjectContains, toContains, sinceMs, timeoutMs = 60_000, pollMs = 5_000 } = opts ?? {};
  if (!Number.isFinite(sinceMs)) {
    throw new Error("inbox.findMessage: sinceMs is required — see the note about stale matches.");
  }

  const client = await connect();
  const deadline = Date.now() + timeoutMs;
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      do {
        // `since` is a DATE in IMAP (day granularity), so it narrows the scan but
        // cannot be trusted for minute-level filtering — the internalDate check
        // below is what actually enforces sinceMs.
        const uids = await client.search({ since: new Date(sinceMs - 86_400_000) }, { uid: true });
        for (const uid of (uids ?? []).slice().reverse()) {
          const msg = await client.fetchOne(String(uid), { envelope: true, source: true }, { uid: true });
          if (!msg?.envelope) continue;
          const when = msg.envelope.date ? new Date(msg.envelope.date).getTime() : 0;
          if (when < sinceMs) continue;

          const subject = msg.envelope.subject ?? "";
          const to = (msg.envelope.to ?? []).map((a) => a.address).join(", ");
          if (subjectContains && !subject.toLowerCase().includes(subjectContains.toLowerCase())) continue;
          if (toContains && !to.toLowerCase().includes(toContains.toLowerCase())) continue;

          const raw = String(msg.source ?? "");
          return {
            subject,
            to,
            from: (msg.envelope.from ?? []).map((a) => a.address).join(", "),
            date: new Date(when),
            text: raw,
            html: raw,
          };
        }
        if (Date.now() >= deadline) break;
        await new Promise((r) => setTimeout(r, pollMs));
      } while (Date.now() < deadline);
      return null;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

/**
 * Assert nothing matching arrived within the window.
 *
 * 🛑 Prefer the RECORDER for this. Over IMAP an absence is only ever "nothing
 * within N seconds", which is indistinguishable from a slow inbox — a suppression
 * bug and a delivery delay look identical here. The recorder answers it exactly.
 *
 * Kept because a couple of cases assert real non-delivery end to end.
 *
 * @returns {Promise<{absent: boolean, waitedMs: number, found?: object}>}
 */
export async function assertNoMessage(opts) {
  const waited = opts?.timeoutMs ?? 45_000;
  const found = await findMessage({ ...opts, timeoutMs: waited });
  return found ? { absent: false, waitedMs: waited, found } : { absent: true, waitedMs: waited };
}
