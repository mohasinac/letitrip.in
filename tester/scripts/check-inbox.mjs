#!/usr/bin/env node
/*
 * CLI over `lib/inbox.mjs`, so a tester working a batch can actually answer an
 * email case.
 *
 * 🛑 WHY THIS EXISTS
 *
 * Nineteen checklist cases carried `requiresHumanChannel: true` — thirteen of
 * them for "real email inbox" — and were answered `null` in every run, for the
 * life of the catalogue. That was correct given the tools: a tester drives a
 * browser, and there was no way to reach a mailbox from one.
 *
 * But the capability was already here. `lib/inbox.mjs` is a working IMAP client
 * and `tester/.env` already holds `TESTER_EMAIL_ID` / `TESTER_EMAIL_APP_PWD`.
 * What was missing is the two lines that make it callable from a batch. Thirteen
 * permanently-unanswerable cases become ordinary ones.
 *
 * 🛑 `--since` IS REQUIRED, AND THAT IS THE WHOLE CORRECTNESS ARGUMENT
 *
 * The mailbox is shared across every case in every run. "Newest matching
 * message" will cheerfully return one an earlier case left behind, which reads
 * as a pass for an email the action under test never sent. Capture the
 * timestamp BEFORE performing the action, pass it here, and a stale message
 * cannot be mistaken for a fresh one.
 *
 * 🛑 ABSENCE IS A FIRST-CLASS ANSWER
 *
 * Six of the cases assert an email should NOT arrive — a kill switch honoured,
 * an opt-out respected, losing bidders left alone. Over IMAP alone "nothing
 * arrived" is unprovable: you wait and hope, and a slow inbox is
 * indistinguishable from a working suppression. `--expect-none` waits the full
 * window and succeeds only on silence, so the absence cases get a real verdict
 * rather than a shrug.
 *
 * USAGE
 *   node tester/scripts/check-inbox.mjs --since <epochMs> [--subject <text>]
 *        [--to <text>] [--timeout <ms>] [--expect-none]
 *
 * EXIT CODES
 *   0  the expectation held  (message found, or silence when --expect-none)
 *   1  the expectation failed
 *   2  could not check at all — missing credentials, IMAP unreachable
 *
 * Exit 2 is deliberately distinct: "the email did not arrive" and "I could not
 * look" must not collapse into one answer, because the first is a `no` and the
 * second is a `null`.
 */

import { findMessage, assertNoMessage } from "./lib/inbox.mjs";
import { loadEnvLocal } from "./lib/firestore.mjs";

loadEnvLocal();

function flag(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const sinceRaw = flag("since");
const since = Number(sinceRaw);
if (!Number.isFinite(since)) {
  console.error(
    "✗ --since <epochMs> is required.\n" +
      "  Capture it BEFORE the action under test:  node -e \"console.log(Date.now())\"\n" +
      "  Without it, a message left by an earlier case can be mistaken for this one's.",
  );
  process.exit(2);
}

const opts = {
  sinceMs: since,
  timeoutMs: Number(flag("timeout", "60000")),
};
const subject = flag("subject");
const to = flag("to");
if (typeof subject === "string") opts.subjectContains = subject;
if (typeof to === "string") opts.toContains = to;

const expectNone = flag("expect-none") === true;

try {
  if (expectNone) {
    // Returns { absent, waitedMs, found? } — an OBJECT, which is always truthy.
    // Testing it directly would report every run as silent, including the ones
    // where the email did arrive.
    const result = await assertNoMessage(opts);
    if (result.absent) {
      console.log(`✓ no matching message in ${result.waitedMs}ms — suppression held`);
      process.exit(0);
    }
    console.error(
      `✗ a matching message ARRIVED, and this case asserts none should: "${result.found?.subject ?? "(no subject)"}"`,
    );
    process.exit(1);
  }

  const msg = await findMessage(opts);
  if (!msg) {
    console.error(
      `✗ no matching message within ${opts.timeoutMs}ms` +
        (opts.subjectContains ? ` (subject contains "${opts.subjectContains}")` : ""),
    );
    process.exit(1);
  }
  console.log(
    JSON.stringify(
      { subject: msg.subject, from: msg.from, to: msg.to, date: msg.date },
      null,
      2,
    ),
  );
  process.exit(0);
} catch (err) {
  // Could not look, which is NOT the same as "it did not arrive" — exit 2 so a
  // batch records `null` with a reason rather than a false `no`.
  console.error(`✗ could not check the inbox: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(2);
}
