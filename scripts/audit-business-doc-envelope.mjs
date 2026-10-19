#!/usr/bin/env node
/**
 * Keeps the TWO implementations of the `enc:v1:` binary envelope identical.
 *
 * ── Why two implementations exist ─────────────────────────────────────────
 *
 *   appkit/src/security/settings-encryption.ts   encryptBuffer / decryptBuffer
 *   scripts/lib/business-doc-crypto.mjs          the same, for Node scripts
 *
 * The script copy is not laziness. `appkit/dist` is `"type": "module"` with
 * EXTENSIONLESS relative imports, so a pure-ESM `.mjs` cannot import the real
 * one — measured: `Cannot find module .../dist/security/pii-mask`. `require()`
 * fails for the same reason, and shimming far enough to load the barrel means
 * providing both `globalThis.require` and `globalThis.module` (Root Cause #24).
 *
 * ── What breaks if they drift ─────────────────────────────────────────────
 *
 * The uploader writes with one and `GET /api/admin/business-documents/[id]`
 * reads with the other. A changed IV length, tag length, prefix or algorithm
 * on either side makes every already-uploaded document PERMANENTLY
 * unreadable — AES-GCM authenticates, so a mismatched envelope does not
 * degrade, it throws. And it throws at DOWNLOAD time, long after the upload
 * reported success, on documents whose only other copy may have been deleted
 * from the staging folder.
 *
 * ── Why a static constant check and not a round-trip ──────────────────────
 *
 * A round-trip would be the stronger test and is not reachable: this audit
 * cannot import the appkit implementation for exactly the reason the second
 * implementation exists. So it reads the appkit SOURCE and compares the four
 * constants that define the wire format, and separately round-trips the script
 * copy against itself to prove that copy is at least internally coherent.
 *
 * 🛑 Verified by negative control: changing IV_BYTES to 16 in either file, and
 * changing the prefix in either file, each fail this audit.
 *
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const APPKIT_SRC = path.join(ROOT, "appkit/src/security/settings-encryption.ts");
const SCRIPT_LIB = path.join(ROOT, "scripts/lib/business-doc-crypto.mjs");

const violations = [];
function fail(rule, message) {
  violations.push({ rule, message });
}

if (!fs.existsSync(APPKIT_SRC)) {
  fail("MISSING_SOURCE", `appkit source not found at ${path.relative(ROOT, APPKIT_SRC)}`);
} else if (!fs.existsSync(SCRIPT_LIB)) {
  fail("MISSING_SOURCE", `script lib not found at ${path.relative(ROOT, SCRIPT_LIB)}`);
} else {
  const appkit = fs.readFileSync(APPKIT_SRC, "utf8");
  const script = fs.readFileSync(SCRIPT_LIB, "utf8");

  /*
   * Each constant is read from BOTH files with its own pattern, because the
   * two are written in different languages and styles. A value that cannot be
   * found is reported as unresolved rather than skipped — an audit that goes
   * quiet because its regex stopped matching is worse than no audit (Root
   * Cause #84), and this file's whole job is to notice a change.
   */
  const probes = [
    {
      name: "ALGORITHM",
      appkit: /ALGORITHM\s*=\s*"([^"]+)"/,
      script: /ALGORITHM\s*=\s*"([^"]+)"/,
    },
    {
      name: "IV_BYTES",
      appkit: /IV_BYTES\s*=\s*(\d+)/,
      script: /IV_BYTES\s*=\s*(\d+)/,
    },
    {
      name: "TAG_BYTES",
      appkit: /TAG_BYTES\s*=\s*(\d+)/,
      script: /TAG_BYTES\s*=\s*(\d+)/,
    },
    {
      /*
       * appkit builds the binary prefix from ENC_PREFIX, which is imported
       * from ./pii-mask — ONE declaration shared with the PII system, which
       * is the right design and means the literal is not in this file. So the
       * appkit side is resolved from pii-mask.ts and the script side from its
       * own literal.
       */
      name: "PREFIX",
      appkit: null,
      script: /PREFIX\s*=\s*"([^"]+)"/,
    },
  ];

  for (const probe of probes) {
    let appkitValue;
    if (probe.name === "PREFIX") {
      const maskPath = path.join(ROOT, "appkit/src/security/pii-mask.ts");
      if (!fs.existsSync(maskPath)) {
        fail("UNRESOLVED", "appkit/src/security/pii-mask.ts not found — cannot resolve ENC_PREFIX");
        continue;
      }
      const m = fs.readFileSync(maskPath, "utf8").match(/ENC_PREFIX\s*=\s*"([^"]+)"/);
      appkitValue = m?.[1];
    } else {
      appkitValue = appkit.match(probe.appkit)?.[1];
    }

    const scriptValue = script.match(probe.script)?.[1];

    if (appkitValue === undefined) {
      fail("UNRESOLVED", `${probe.name}: could not read a value from the appkit source`);
      continue;
    }
    if (scriptValue === undefined) {
      fail("UNRESOLVED", `${probe.name}: could not read a value from scripts/lib/business-doc-crypto.mjs`);
      continue;
    }
    if (appkitValue !== scriptValue) {
      fail(
        "ENVELOPE_DRIFT",
        `${probe.name} differs — appkit has "${appkitValue}", script has "${scriptValue}". ` +
          "Every already-uploaded business document becomes undecryptable.",
      );
    }
  }

  // The appkit side must still assemble the prefix as ASCII bytes. If that
  // changed to, say, utf16 the constants would still match and the wire format
  // would not.
  if (!/Buffer\.from\(PREFIX,\s*"ascii"\)/.test(appkit)) {
    fail(
      "ENVELOPE_DRIFT",
      'appkit no longer builds its binary prefix with Buffer.from(PREFIX, "ascii")',
    );
  }
}

// Round-trip the script copy against itself — proves it is at least coherent,
// and catches a typo in the subarray offsets that the constant check cannot.
try {
  const lib = await import(pathToFileURL(SCRIPT_LIB).href);
  const prev = process.env.SETTINGS_ENCRYPTION_KEY;
  process.env.SETTINGS_ENCRYPTION_KEY = "0".repeat(64);
  const sample = Buffer.from("business-document round-trip probe");
  const out = lib.decryptBuffer(lib.encryptBuffer(sample));
  if (prev === undefined) delete process.env.SETTINGS_ENCRYPTION_KEY;
  else process.env.SETTINGS_ENCRYPTION_KEY = prev;

  if (!out.equals(sample)) {
    fail("ROUNDTRIP", "scripts/lib/business-doc-crypto.mjs does not round-trip its own output");
  }
} catch (err) {
  fail("ROUNDTRIP", `round-trip threw: ${err?.message ?? err}`);
}

if (violations.length > 0) {
  console.error(`✗ business-doc-envelope: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  [${v.rule}] ${v.message}`);
  process.exit(1);
}

console.log("✓ business-doc-envelope: appkit and script envelopes agree");
