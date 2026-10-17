#!/usr/bin/env node
/**
 * diagnose-pii-doubles — count rows damaged by the ciphertext-by-default sweep.
 *
 * READ-ONLY. Writes nothing, ever. Not an audit — it talks to live Firestore,
 * so it is a script you run deliberately, not something `npm run check` calls.
 *
 * ## What went wrong
 *
 * Fourteen repositories stopped decrypting in `mapDoc`, so reads return
 * ciphertext. The branded type that was supposed to force every reader to
 * choose `reveal*`/`masked*` was declared `T & { brand }` — an INTERSECTION,
 * therefore a subtype of `string` — so it blocked writes and not one read.
 * Nine cross-repository writes then passed ciphertext into a field whose own
 * write hook encrypts it AGAIN, and nothing double-decrypts.
 *
 * Three damage shapes, and this script counts all three separately because the
 * remediation differs:
 *
 *   DOUBLE   `decryptValue(stored)` still begins `enc:v1:` — encrypted twice.
 *            Unrecoverable without the inner key material, which is the same
 *            key, so these ARE recoverable: decrypt twice. Worth knowing the
 *            count before deciding.
 *   FROZEN   the value begins `enc:v1:` but sits in a field no decrypt path
 *            touches (`order.shippingAddress`, `pickupAddress.name`,
 *            `raffleWinnerDisplayName`). Recoverable the same way.
 *   JOINED   `order.shippingAddress` contains `enc:v1:` in the MIDDLE — three
 *            blobs comma-joined, so it is no longer a valid envelope and
 *            `decryptValue` cannot parse it. 🛑 These are the genuinely
 *            unrecoverable ones; the address must be rebuilt from the
 *            `addresses` document it came from, if that row still exists.
 *
 * It also counts poisoned blind indices. `piiIndicesFor` HMACs whatever it is
 * handed, so hashing already-encrypted input produced a valid-LOOKING
 * `sellerEmailIndex` that can never match a lookup by the real address — a
 * lookup that silently returns nothing rather than erroring.
 *
 * ## Usage
 *
 *   node scripts/diagnose-pii-doubles.mjs [--service-account <path>] [--verbose]
 *
 * 🛑 It needs `PII_ENCRYPTION_KEY` to tell DOUBLE from ordinary ciphertext —
 * without it every encrypted value looks identical and the answer would be
 * "everything is damaged". It exits rather than guessing.
 */

import { createRequire } from "node:module";
import process from "node:process";

const require = createRequire(import.meta.url);
/*
 * 🛑 BOTH shims. `providers/db-firebase/admin.ts` calls
 * `module.require("firebase-admin/firestore")`, not the bare name, so a
 * pure-ESM entry that provides only `globalThis.require` throws
 * `ReferenceError: module is not defined` from inside every repository read —
 * and the failure looks like a logic bug, not a loader bug (Root Cause #24).
 */
globalThis.require = require;
globalThis.module = { require };

const ENC_PREFIX = "enc:v1:";
const args = process.argv.slice(2);
const VERBOSE = args.includes("--verbose");
const saIdx = args.indexOf("--service-account");
const SERVICE_ACCOUNT = saIdx === -1 ? undefined : args[saIdx + 1];

/** Fields that are supposed to hold ciphertext, per collection. */
const PII_FIELDS = {
  users: ["email", "phoneNumber", "googleLinkedEmail"],
  addresses: ["fullName", "phone", "addressLine1", "addressLine2"],
  orders: ["userName", "userEmail", "sellerEmail"],
  payouts: ["sellerEmail", "upiId"],
  offers: ["buyerName", "buyerEmail"],
  reviews: ["userName"],
  bids: ["userEmail"],
  supportTickets: ["userEmail", "userDisplayName", "assignedToName"],
  eventEntries: ["userDisplayName", "userEmail", "ipAddress"],
  lotteryEntries: ["userPhone", "userEmail", "userDisplayName"],
  savedPaymentMethods: ["identifier"],
};

/**
 * Fields that must NEVER hold ciphertext — nothing decrypts them, so a value
 * starting with the prefix here is frozen.
 */
const MUST_BE_PLAIN = {
  orders: ["shippingAddress"],
  payouts: ["sellerName"],
  events: ["raffleWinnerDisplayName"],
};

function isEnc(v) {
  return typeof v === "string" && v.startsWith(ENC_PREFIX);
}

/** Ciphertext somewhere other than position 0 — a join, not an envelope. */
function hasInnerEnc(v) {
  return typeof v === "string" && !v.startsWith(ENC_PREFIX) && v.includes(ENC_PREFIX);
}

async function main() {
  if (!process.env.PII_ENCRYPTION_KEY) {
    console.error(
      "diagnose-pii-doubles: PII_ENCRYPTION_KEY is not set.\n\n" +
        "Without it, DOUBLE cannot be told apart from ordinary ciphertext and\n" +
        "every encrypted value would be reported as damaged. Refusing to guess.",
    );
    process.exit(2);
  }

  if (SERVICE_ACCOUNT) process.env.GOOGLE_APPLICATION_CREDENTIALS = SERVICE_ACCOUNT;

  const { getAdminDb } = require("@mohasinac/appkit/providers/db-firebase");
  const { decryptValue } = require("@mohasinac/appkit/server");
  const db = getAdminDb();

  const rows = [];
  let grandDouble = 0;
  let grandFrozen = 0;
  let grandJoined = 0;

  for (const [coll, fields] of Object.entries(PII_FIELDS)) {
    // `.select(...)` so this reads only the fields it inspects rather than
    // whole documents — a full read of `orders` is not free (Rule #6).
    let snap;
    try {
      snap = await db.collection(coll).select(...fields).get();
    } catch (err) {
      rows.push({ coll, total: "?", note: `unreadable: ${err?.message ?? err}` });
      continue;
    }

    let double = 0;
    const perField = {};
    for (const doc of snap.docs) {
      const data = doc.data();
      for (const f of fields) {
        const v = data[f];
        if (!isEnc(v)) continue;
        let inner;
        try {
          inner = decryptValue(v);
        } catch {
          continue; // undecryptable for another reason; not this defect
        }
        if (isEnc(inner)) {
          double++;
          perField[f] = (perField[f] ?? 0) + 1;
          if (VERBOSE) console.log(`  DOUBLE ${coll}/${doc.id}.${f}`);
        }
      }
    }
    grandDouble += double;
    rows.push({
      coll,
      total: snap.size,
      double,
      fields: Object.entries(perField).map(([k, n]) => `${k}:${n}`).join(" ") || "—",
    });
  }

  console.log("\n=== DOUBLE-ENCRYPTED (recoverable: decrypt twice) ===");
  for (const r of rows) {
    console.log(
      `  ${String(r.coll).padEnd(22)} docs:${String(r.total).padStart(6)}  ` +
        `double:${String(r.double ?? "?").padStart(5)}  ${r.note ?? r.fields}`,
    );
  }

  console.log("\n=== FROZEN / JOINED in fields nothing decrypts ===");
  for (const [coll, fields] of Object.entries(MUST_BE_PLAIN)) {
    let snap;
    try {
      snap = await db.collection(coll).select(...fields).get();
    } catch (err) {
      console.log(`  ${coll.padEnd(22)} unreadable: ${err?.message ?? err}`);
      continue;
    }
    let frozen = 0;
    let joined = 0;
    for (const doc of snap.docs) {
      const data = doc.data();
      for (const f of fields) {
        const v = data[f];
        if (isEnc(v)) {
          frozen++;
          if (VERBOSE) console.log(`  FROZEN ${coll}/${doc.id}.${f}`);
        } else if (hasInnerEnc(v)) {
          joined++;
          if (VERBOSE) console.log(`  JOINED ${coll}/${doc.id}.${f}`);
        }
      }
    }
    grandFrozen += frozen;
    grandJoined += joined;
    console.log(
      `  ${coll.padEnd(22)} docs:${String(snap.size).padStart(6)}  ` +
        `frozen:${String(frozen).padStart(5)}  joined:${String(joined).padStart(5)}`,
    );
  }

  /*
   * Poisoned blind indices. A payout's `sellerEmailIndex` should equal the HMAC
   * of the seller's real email; if the writer hashed ciphertext it will match
   * nothing. Detected structurally — an index present while its source field is
   * double-encrypted — rather than by recomputing, which would need the HMAC
   * key and would turn this read-only script into a crypto oracle.
   */
  console.log("\n=== POISONED BLIND INDEX (lookup silently returns nothing) ===");
  try {
    const snap = await db.collection("payouts").select("sellerEmail", "sellerEmailIndex").get();
    let poisoned = 0;
    for (const doc of snap.docs) {
      const d = doc.data();
      if (!d.sellerEmailIndex || !isEnc(d.sellerEmail)) continue;
      let inner;
      try {
        inner = decryptValue(d.sellerEmail);
      } catch {
        continue;
      }
      if (isEnc(inner)) {
        poisoned++;
        if (VERBOSE) console.log(`  POISONED payouts/${doc.id}.sellerEmailIndex`);
      }
    }
    console.log(`  payouts.sellerEmailIndex  poisoned:${String(poisoned).padStart(5)}`);
  } catch (err) {
    console.log(`  payouts unreadable: ${err?.message ?? err}`);
  }

  console.log(
    `\nTOTALS  double:${grandDouble}  frozen:${grandFrozen}  joined:${grandJoined}\n`,
  );
  if (grandJoined > 0) {
    console.log(
      "🛑 `joined` rows are the unrecoverable ones — a comma-joined string is no\n" +
        "   longer a valid envelope. Rebuild those from the source `addresses`\n" +
        "   document if it still exists.\n",
    );
  }
  if (grandDouble + grandFrozen + grandJoined === 0) {
    console.log("No damage found. Either the corrupting paths never ran, or they ran before the sweep.\n");
  }
}

main().catch((err) => {
  console.error("diagnose-pii-doubles failed:", err);
  process.exit(1);
});
