#!/usr/bin/env node
/**
 * audit-tester-plugin-wiring.mjs — strict-zero.
 *
 * Guards the boundary the tester runner rests on.
 *
 * A tester run WIPES the seeded catalog from a live project and re-seeds it. That
 * is only tolerable because the wipe is tiered: real accounts, their Firebase Auth
 * records, their saved addresses and siteSettings (which carries the encrypted live
 * API keys) are PRESERVED, and only the catalog plus the transactional rows pointing
 * at it are destroyed.
 *
 * Nothing in TypeScript enforces that boundary — tester/scripts/lib/collections.mjs
 * is plain JS in a submodule, outside tsc, outside eslint, and outside every other
 * audit (all of which scan `src` and `appkit/src` only). So this is the one check.
 *
 * Rules:
 *   R1  Every collection with seed data is classified into exactly one tier.
 *       Unclassified means preserved, so a NEW collection is safe by default — but
 *       silently un-seeded, which is its own bug. This makes it visible.
 *   R2  The PRESERVE tier still contains the four collections whose loss is
 *       permanent. Removing one is how a run starts deleting real accounts.
 *   R3  Nothing under tester/scripts/ except the session helper touches the auth
 *       endpoints. /api/auth/login, /session and /me share ONE 10-request-per-60s
 *       bucket keyed on IP; a second caller exhausts the budget the run needs.
 *   R4  Time-bound tester fixtures go through tester-window.ts. A hard-coded
 *       duration cannot be shortened, which is what makes "watch an auction end"
 *       untestable in any run shorter than the literal.
 *
 * And part of the six-part case contract — role · startPage · steps ·
 * expectedBehaviour · expectedUiState · endResult.
 *
 * 🛑 READ THIS BEFORE TRUSTING R5. These rules do NOT enforce the whole contract.
 * The per-field presence check, the roles enum, the assertion-opener rejection
 * ("Confirm/Verify/Ensure/should" belongs in expectedUiState, not in a step) and
 * the inputs-when-a-step-enters-data rule all lived in `merge-authored.mjs`, which
 * was deleted 2026-09-06 along with the rest of the authoring scaffolding. They
 * were never ported here. So a case can carry a `steps:` array of pure assertions,
 * no `expectedUiState` and an invented role, and this audit stays green. That is a
 * known, accepted hole — not an oversight to rediscover — and it is why the header
 * says so instead of continuing to claim to be "the durable gate", which is what it
 * said while the checks it was crediting itself with lived in another file:
 *
 *   R5  Every case on a page NOT on the ratchet list HAS A `steps:` ARRAY, inline or
 *       in the authored overlay. Existence only. RATCHET, seeded from a run of this
 *       rule (90 pages), shrink-only.
 *   R6  No mechanical "Open X. Verify Y." scaffold. It reaches 100% while encoding
 *       nothing the label did not already say, turning a visible gap into an
 *       invisible one (Root Cause #83).
 *   R7  Every fixture id cited in a step resolves to a real seed id — the
 *       checklist's stale-`href` failure (Root Cause #32) moved into step bodies,
 *       where no existing audit could see it.
 *   R8  A step asking for input names the literal value. "Enter an amount below the
 *       price" is a different test every run, so two runs cannot be diffed.
 *   R9  startPage is unprefixed and real. A procedure that begins at a dead URL
 *       wastes the tester's first step.
 *  R10  role and startPage are coherent. `buyer` + `/admin/**` can only ever produce
 *       /unauthorized; `guest` + `/user/**` is redirected before the case begins.
 *
 * 🛑 All six were SEEN TO FAIL against deliberate violations before landing (Root
 * Cause #87) — which is how R10 was caught matching nothing: its first form expected
 * the generator's exact line breaks, so both probes passed while violating it.
 *
 * Skips cleanly (exit 0) when tester/ is absent — a fresh clone without
 * --recursive must not fail `npm run check`.
 *
 * Strict-zero, no suppression marker.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TESTER_DIR = resolve(ROOT, "tester");
const violations = [];

if (!existsSync(TESTER_DIR)) {
  console.log("audit-tester-plugin-wiring: tester/ not checked out — skipping.");
  process.exit(0);
}

const read = (p) => readFileSync(p, "utf8");
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ── Load the tier declarations ──────────────────────────────────────────── */

const collectionsPath = resolve(TESTER_DIR, "scripts/lib/collections.mjs");
if (!existsSync(collectionsPath)) {
  violations.push(`R1 missing file: tester/scripts/lib/collections.mjs — the tier boundary is undeclared`);
}

const tiers = { PRESERVE: [], SEED_OWNED: [], DERIVED: [], CASCADE: [] };
if (existsSync(collectionsPath)) {
  const src = stripComments(read(collectionsPath));
  for (const name of ["PRESERVE", "SEED_OWNED", "DERIVED"]) {
    const m = src.match(new RegExp(`export const ${name} = Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\)`));
    if (m) tiers[name] = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }
  const cm = src.match(/export const CASCADE = Object\.freeze\(\[([\s\S]*?)\]\);/);
  if (cm) tiers.CASCADE = [...cm[1].matchAll(/collection:\s*"([^"]+)"/g)].map((x) => x[1]);
}

/* ── R2: the preserve tier must still hold the irreplaceable four ────────── */

const MUST_PRESERVE = ["users", "addresses", "sessions", "siteSettings"];
for (const c of MUST_PRESERVE) {
  if (!tiers.PRESERVE.includes(c)) {
    violations.push(
      `R2 "${c}" is no longer in the PRESERVE tier of tester/scripts/lib/collections.mjs. ` +
        `A run would delete it, and it cannot be rebuilt from seed data.`,
    );
  }
}

/* ── R1: every seeded collection is classified ───────────────────────────── */

/**
 * Derive the collection list from COLLECTION_MAP in appkit/scripts/seed-cli.mjs —
 * the authoritative registry of what the seeder actually writes.
 *
 * 🛑 This rule previously parsed appkit/src/seed/index.ts for `collection: "x"`
 * pairs, which do not exist in that file. It therefore built an EMPTY set and
 * passed unconditionally, while four real collections (carousels, productFeatures,
 * scammerProfiles, conversations) sat unclassified and survived a live clear.
 * An audit that reports OK because it is looking at nothing is worse than no audit
 * (Root Cause #84). Hence the explicit emptiness check below.
 */
const seedCli = resolve(ROOT, "appkit/scripts/seed-cli.mjs");
const seededCollections = new Set();
if (existsSync(seedCli)) {
  const src = stripComments(read(seedCli));
  const block = src.match(/const COLLECTION_MAP\s*=\s*\{([\s\S]*?)\n\};/);
  if (block) for (const m of block[1].matchAll(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s*:/gm)) seededCollections.add(m[1]);
}

if (seededCollections.size === 0) {
  violations.push(
    `R1 could not extract any collection names from appkit/scripts/seed-cli.mjs's COLLECTION_MAP. ` +
      `The rule cannot run, and a rule that silently checks nothing reports OK forever — ` +
      `fix the parser rather than letting this pass.`,
  );
}

const classified = new Set([...tiers.PRESERVE, ...tiers.SEED_OWNED, ...tiers.DERIVED, ...tiers.CASCADE]);
for (const c of seededCollections) {
  if (!classified.has(c)) {
    violations.push(
      `R1 "${c}" has seed data but is not classified in tester/scripts/lib/collections.mjs. ` +
        `Unclassified means PRESERVED, so a run will re-seed nothing for it and leave stale rows. ` +
        `Add it to PRESERVE, SEED_OWNED or CASCADE.`,
    );
  }
}

const overlap = tiers.SEED_OWNED.filter((c) => tiers.PRESERVE.includes(c));
for (const c of overlap) violations.push(`R1 "${c}" is in BOTH PRESERVE and SEED_OWNED — the tiers must be disjoint.`);

/* ── R3: only the session helper may touch the auth endpoints ────────────── */

const AUTH_RE = /\/api\/auth\/(login|session|me)\b/;
const ALLOWED_AUTH_CALLERS = new Set(["fetch-cases.mjs", "record-verdicts.mjs"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".mjs") || entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

for (const file of walk(resolve(TESTER_DIR, "scripts"))) {
  const base = file.split(/[\\/]/).pop();
  if (ALLOWED_AUTH_CALLERS.has(base)) continue;
  const src = stripComments(read(file));
  if (AUTH_RE.test(src)) {
    violations.push(
      `R3 ${file.replace(ROOT, ".")} references an /api/auth/* endpoint. ` +
        `login, session and me share ONE 10-req/60s bucket keyed on IP — only ` +
        `${[...ALLOWED_AUTH_CALLERS].join(" and ")} may call them.`,
    );
  }
}

/* ── R4: time-bound tester fixtures derive from tester-window.ts ─────────── */

const seedDir = resolve(ROOT, "appkit/src/features/tester/seed-data");
const TIME_FIELDS = /(auctionEndDate|drawWindowDurationMinutes|expiresAt|checkoutDeadline|spinWindowEnd)\s*:/;
if (existsSync(seedDir)) {
  for (const name of readdirSync(seedDir)) {
    if (!name.endsWith("-seed-data.ts")) continue;
    const file = resolve(seedDir, name);
    const src = stripComments(read(file));
    if (!TIME_FIELDS.test(src)) continue;
    if (!/from "\.\/tester-window"/.test(src)) {
      violations.push(
        `R4 ${name} sets a time-bound fixture field but does not import ./tester-window. ` +
          `A hard-coded duration cannot be shortened, so the case that watches it close ` +
          `is untestable in any run shorter than the literal.`,
      );
    }
  }
}

/* ── R5–R10: part of the six-part case contract ──────────────────────────────
 *
 * These six rules are now the ONLY mechanical check on an authored case, and they
 * cover the shape of a citation, not the substance of a procedure — see the 🛑 in
 * this file's header for what is deliberately unchecked since `merge-authored.mjs`
 * was deleted. Do not read a green run as "the contract holds".
 *
 * Everything below reads the seed SOURCE — the catalogue plus the authored overlay
 * — never Firestore. Firestore is downstream of the seed and a run wipes it.
 */

const CATALOGUE = resolve(ROOT, "appkit/src/features/tester/seed-data/tester-checklist-seed-data.ts");
const AUTHORED_DIR = resolve(ROOT, "appkit/src/features/tester/seed-data/authored");
const MONEY_FLOWS = resolve(ROOT, "appkit/src/features/tester/seed-data/_money-flows.ts");

/**
 * 🛑 A RATCHET, NOT A BASELINE. This list may only ever SHRINK.
 *
 * Every page here still has cases without the six parts. Removing an entry is the
 * goal; adding one is the thing being blocked. A page NOT listed must be complete,
 * so adding a case to a finished page fails immediately — which is the point.
 *
 * When this empties, delete it and the `has()` guard with it: a ratchet is a
 * migration mechanism, not a tolerated baseline (CLAUDE.md § "a ratchet is not a
 * baseline"). Seeded from a run of this rule, never from a hand-written list —
 * Root Cause #84.
 */
const UNAUTHORED_PAGES = new Set([
  "admin/bug-hunter-rewards",
]);

if (existsSync(CATALOGUE)) {
  /*
   * Comments stripped first.
   *
   * Every generated module opens with a header naming its own page and the exact
   * command that produced it — "…--page buying/product-detail" — so an unstripped
   * scan reports the page's own name as a cited fixture that does not exist. Same
   * shape as the observability audit that counted a commented-out registration as
   * live: a rule reading text it was never meant to judge.
   */
  const authoredSrc = existsSync(AUTHORED_DIR)
    ? stripComments(
        readdirSync(AUTHORED_DIR)
          .filter((f) => f.endsWith(".ts") && f !== "index.ts" && !f.startsWith("_"))
          .map((f) => read(resolve(AUTHORED_DIR, f)))
          .join("\n"),
      )
    : "";
  const inlineSrc = read(CATALOGUE) + (existsSync(MONEY_FLOWS) ? read(MONEY_FLOWS) : "");

  /* R7 — every fixture id an authored step cites must be a real seed id. */
  const seedIds = new Set();
  {
    const walk = (dir) => {
      if (!existsSync(dir)) return;
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = resolve(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (e.name.endsWith(".ts")) {
          const s = read(full);
          for (const m of s.matchAll(/\bid:\s*"([^"]+)"/g)) seedIds.add(m[1]);
          for (const m of s.matchAll(/\bslug:\s*"([^"]+)"/g)) seedIds.add(m[1]);
          // Template-literal families: `auction-…-cycle-${i+1}` can never match a
          // quoted scan, so record the PREFIX and accept any concrete id under it.
          // Inventing -1..-3 here would be the fabricated-value problem itself.
          for (const m of s.matchAll(/\bid:\s*`([^`$]*)\$\{/g)) if (m[1].length > 6) seedIds.add(m[1] + "*");
        }
      }
    };
    walk(resolve(ROOT, "appkit/src/seed"));
    walk(resolve(ROOT, "appkit/src/features/tester/seed-data"));
  }
  const idKnown = (id) =>
    seedIds.has(id) || [...seedIds].some((s) => s.endsWith("*") && id.startsWith(s.slice(0, -1)));

  const FIXTURE_RE =
    /\b(?:product|auction|preorder|prizedraw|classified|digitalcode|live|art|sticker|category|brand|bundle|offer|event|store|coupon|group)-[a-z0-9][a-z0-9-]{4,}/g;

  /*
   * Scan the VALUES, never the keys.
   *
   * The overlay is keyed by `checklist-<group>-<page>-<caseKey>`, and a case key
   * routinely begins with a word that looks like a slug prefix —
   * `product-type-toggles-follow-selection`, `store-tabs-render`. Scanning the raw
   * file made every such key a phantom "cited fixture that does not exist".
   *
   * A first attempt special-cased the handful of shapes the pilot page happened to
   * produce (`product-detail…`), which held for exactly one page and then failed on
   * the next. Removing the key lines outright is the rule that generalises.
   */
  const authoredValues = authoredSrc.replace(/^\s*"checklist-[^"]+":\s*\{\s*$/gm, "");

  /*
   * Distinguish a fixture CITATION from a hyphenated English adjective.
   *
   * "A category-related error message is shown" is prose; `product-detail` is the
   * name of a page. Both match the slug shape, and flagging them sends the author
   * hunting for a fixture that was never cited.
   *
   * A real citation satisfies one of two things:
   *   · it follows a citation character — `/products/product-x`, `(product-x)`,
   *     `"product-x"` — rather than a space; or
   *   · it carries at least TWO segments after its prefix, which every real fixture
   *     in this seed does (`bundle-tester-sandbox`, `store-beyblade-arena`) and
   *     which no adjective does.
   *
   * It fails open: a bare prose mention of a one-segment id escapes. That is the
   * right direction — R7 exists to catch typos, and a false positive costs more
   * than a miss because it teaches the author to route around the gate.
   */
  const unknown = new Set();
  for (const m of authoredValues.matchAll(FIXTURE_RE)) {
    const id = m[0];
    const cited = /[/("'`=]/.test(authoredValues[(m.index ?? 0) - 1] ?? " ");
    const segmentsAfterPrefix = id.split("-").length - 1;
    if (!cited && segmentsAfterPrefix < 2) continue;
    if (!idKnown(id)) unknown.add(id);
  }
  for (const id of [...unknown].sort()) {
    violations.push(
      `R7 authored steps cite "${id}", which is not a seed id. A tester follows it, ` +
        `finds nothing, and reports a bug that is really a typo in the case (Root Cause #32).`,
    );
  }

  /* R6 — the mechanical scaffold, which reaches 100% while encoding nothing. */
  for (const m of authoredSrc.matchAll(/"(Open|Go to|Navigate to)[^"]*\.\s*Verify[^"]*"/gi)) {
    violations.push(`R6 mechanical "Open X. Verify Y." step: ${m[0].slice(0, 70)}`);
  }

  /* R8 — a step asking for input must name the value. */
  const VAGUE = [
    /"[^"]*\benter (an?|some) (amount|value|price|number)[^"]*"/i,
    /"[^"]*\b(pick|choose|select) (a|an|any|some) (category|brand|option|date|product|store)\b[^"]*"/i,
    /"[^"]*\bbid (above|below|over|under) the\b[^"]*"/i,
  ];
  /*
   * A step is only vague if it names NO value at all.
   *
   * "enter an amount that pushes the current bid above ₹5,000 (e.g. 5001)" opens with
   * the vague phrasing and then supplies the literal — which is a perfectly
   * repeatable step, and flagging it is the kind of false positive that teaches an
   * author to route around the gate rather than satisfy it. The digit test is crude
   * but it fails in the safe direction: it can miss a genuinely vague step that
   * happens to contain a number, and never rejects one that supplies its value.
   */
  for (const re of VAGUE) {
    for (const m of authoredSrc.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))) {
      if (/\d/.test(m[0])) continue;
      violations.push(
        `R8 step has no literal value: ${m[0].slice(0, 70)} — an unrepeatable case ` +
          `cannot be diffed between runs, so a regression cannot be spotted.`,
      );
    }
  }

  /* R9 + R10 — startPage must be real, and coherent with role. */
  const allSrc = authoredSrc + inlineSrc;
  for (const m of allSrc.matchAll(/startPage:\s*"([^"]+)"/g)) {
    if (/^\/(en|hi)\//.test(m[1])) violations.push(`R9 startPage "${m[1]}" is locale-prefixed; the tester uses unprefixed paths.`);
  }
  /*
   * Split into entries and read each block's own fields.
   *
   * This started as one regex expecting `role: "x",\n  startPage: "y"` — the exact
   * shape merge-authored.mjs emits — and it silently matched NOTHING when both
   * fields sat on one line. Both R10 probes passed while violating the rule. Since
   * an authored module's header explicitly invites hand edits, a rule that only
   * recognises generated formatting checks the one case that was already safe.
   */
  const entryStarts = [...authoredSrc.matchAll(/"(checklist-[^"]+)":\s*\{/g)];
  const blocks = entryStarts.map((m, i) => ({
    id: m[1],
    body: authoredSrc.slice(m.index ?? 0, i + 1 < entryStarts.length ? entryStarts[i + 1].index : authoredSrc.length),
  }));
  /*
   * 🛑 A case now carries a LIST of affected roles, so this asks whether ANY of them
   * can reach the page — not whether one particular role can.
   *
   * The single-role form of this check went inert the moment the field became
   * `roles`: it matched `role:` and simply `continue`d on every case, reporting
   * clean. That is the third time a rule in this file has silently checked nothing,
   * and it is why each is re-probed after every change rather than merely re-run.
   */
  for (const { body } of blocks) {
    const rolesRaw = body.match(/\broles:\s*\[([^\]]*)\]/)?.[1] ?? "";
    const roles = [...rolesRaw.matchAll(/"(\w+)"/g)].map((m) => m[1]);
    const page = body.match(/\bstartPage:\s*"([^"]+)"/)?.[1];
    if (!roles.length || !page) continue;

    if (page.startsWith("/admin") && !roles.some((r) => r === "admin" || r === "employee")) {
      violations.push(
        `R10 roles [${roles.join(", ")}] with startPage "${page}" — no listed role can reach an admin page, ` +
          `so the case can only ever produce /unauthorized.`,
      );
    }
    // A multi-role case containing a privileged role is fine on a gated page: the
    // guest half of "guest sees nothing, admin sees the row" is the comparison.
    const role = roles.length === 1 ? roles[0] : null;
    if (!role) continue;
    /*
     * A guest on a gated page is usually incoherent — and sometimes the entire point.
     *
     * "A signed-out visitor opening /user/profile is redirected and no uid, email or
     * order data is ever rendered" is a real security invariant, documented in
     * CLAUDE.md, and role `guest` on `/user/profile` is exactly how you express it.
     * The first form of this rule refused that case, which would have deleted one of
     * the more valuable things in the catalogue to satisfy a lint.
     *
     * So the rule now asks what the case is ABOUT: if its expectations describe the
     * refusal, the pairing is deliberate. A case that expects to USE the page while
     * signed out is still incoherent and still fails.
     */
    if (role === "guest" && /^\/(admin|store|user|cart|checkout|wishlist)\b/.test(page)) {
      const aboutRefusal = /redirect|sign in|signin|log ?in|unauthori[sz]ed|not signed in|signed[- ]out/i.test(body);
      if (!aboutRefusal) {
        violations.push(
          `R10 role "guest" with startPage "${page}" — a signed-out visitor is redirected before the case begins, ` +
            `and nothing in the expectations says the redirect IS the case.`,
        );
      }
    }
  }

  /* R5 — the six parts, per page, ratcheted. */
  const pageAnchors = [...inlineSrc.matchAll(/pageKey:\s*"([^"]+)"/g)];
  const groupOf = (idx) => {
    const before = inlineSrc.slice(0, idx);
    const g = [...before.matchAll(/group\(\s*"([^"]+)"/g)].pop();
    return g ? g[1] : "?";
  };
  for (const [i, m] of pageAnchors.entries()) {
    const pageKey = m[1];
    const key = `${groupOf(m.index ?? 0)}/${pageKey}`;
    if (UNAUTHORED_PAGES.has(key)) continue;
    const start = m.index ?? 0;
    const end = i + 1 < pageAnchors.length ? pageAnchors[i + 1].index : inlineSrc.length;
    const caseKeys = [...inlineSrc.slice(start, end).matchAll(/\bkey:\s*"([^"]+)"/g)].map((x) => x[1]);
    const missing = caseKeys.filter((k) => {
      const id = `checklist-${key.replace("/", "-")}-${k}`;
      // Inline-authored cases carry `steps:` beside their own key in the catalogue.
      const inlineHas = new RegExp(`key:\\s*"${k}"[\\s\\S]{0,3000}?steps:\\s*\\[`).test(inlineSrc.slice(start, end));
      return !inlineHas && !authoredSrc.includes(`"${id}"`);
    });
    if (missing.length) {
      violations.push(
        `R5 ${key} is not on the ratchet list but ${missing.length} of its ${caseKeys.length} case(s) ` +
          `have no six-part procedure: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? " …" : ""}`,
      );
    }
  }
}

/* ── R11: the batch must carry the whole authored contract ───────────────────
 *
 * 🛑 THE RULE THAT MAKES THE WORST DEFECT IN THIS PIPELINE UNREPEATABLE.
 *
 * `toBatches()` in fetch-cases.mjs emitted six keys and threw the rest away, so
 * 1,139 hand-authored procedures reached the tester as a label and a sentence.
 * Every other hop was intact — the interface, the document, the repository, the
 * API's `...item` spread all carried them. The last adapter dropped them, and the
 * symptom was a batch that ran and produced verdicts, i.e. it looked like it was
 * working (Root Cause #57).
 *
 * The expected set is DERIVED from `interface AuthoredCase`, which is the contract
 * and is hand-maintained. Adding a field there without carrying it here now fails.
 */
{
  const typesPath = resolve(ROOT, "appkit/src/features/tester/seed-data/authored/_types.ts");
  const fetchPath = resolve(ROOT, "tester/scripts/fetch-cases.mjs");
  const skillPath = resolve(ROOT, "tester/skills/run-tests/SKILL.md");

  if (!existsSync(typesPath) || !existsSync(fetchPath)) {
    violations.push("R11 cannot run — _types.ts or fetch-cases.mjs is missing.");
  } else {
    const typesSrc = readFileSync(typesPath, "utf8");
    const ifaceStart = typesSrc.indexOf("interface AuthoredCase");
    const iface = ifaceStart >= 0 ? typesSrc.slice(ifaceStart, typesSrc.indexOf("\n}", ifaceStart)) : "";
    const fields = [...iface.matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]);

    /*
     * Emptiness check. A regex over another file's formatting is exactly the shape
     * that went inert twice in this file's own history — a parser that extracts
     * nothing reports OK forever, which is worse than no rule at all.
     */
    if (fields.length < 6) {
      violations.push(
        `R11 extracted only ${fields.length} field(s) from AuthoredCase — the parser is broken, ` +
          `not the contract. Fix this rule before trusting it.`,
      );
    } else {
      const fetchSrc = stripComments(readFileSync(fetchPath, "utf8"));
      const s = fetchSrc.indexOf("function toBatches(");
      const body = s >= 0 ? fetchSrc.slice(s, fetchSrc.indexOf("\nfunction ", s + 10)) : "";
      const dropped = fields.filter((f) => !new RegExp(`\\b${f}\\s*:`).test(body));
      if (dropped.length) {
        violations.push(
          `R11 toBatches() does not carry ${dropped.length} authored field(s): ${dropped.join(", ")}. ` +
            `Every one of them is written by hand into 1,100+ cases and reaches the tester ONLY through ` +
            `this function — dropping one makes that work invisible with no other symptom.`,
        );
      }
      /*
       * `alreadyAuthored` was a boolean projection of `steps`, and it is how the
       * array got summarised away in the first place. Its return is the exact
       * regression this rule exists to prevent.
       */
      if (/\balreadyAuthored\b/.test(body)) {
        violations.push(
          "R11 toBatches() emits `alreadyAuthored` again — that boolean is what replaced `steps` " +
            "the first time. Carry the array; compute the boolean at the call site if anything needs it.",
        );
      }
      if (existsSync(skillPath)) {
        const skillSrc = readFileSync(skillPath, "utf8");
        const unread = fields.filter((f) => !skillSrc.includes(f));
        if (unread.length) {
          violations.push(
            `R11 SKILL.md never mentions ${unread.join(", ")} — a field carried into the batch that ` +
              `the tester is never told to read is carried for nothing.`,
          );
        }
      }
    }
  }
}

/* ── R12: one owner for the batch/verdict filename transform ─────────────────
 *
 * The `/` ↔ `__` transform was hand-rolled at three sites that disagreed, and the
 * disagreement WAS the split-page collision: record-verdicts wrote groupKey__pageKey
 * (dropping the `--admin` suffix, so the admin slice overwrote the main one and was
 * re-run forever) while run.mjs built an exact filename that could never match it.
 */
{
  const owner = "tester/scripts/lib/batch-keys.mjs";
  if (!existsSync(resolve(ROOT, owner))) {
    violations.push(`R12 missing ${owner} — the filename transform has no owner.`);
  }
  for (const rel of ["tester/scripts/fetch-cases.mjs", "tester/scripts/run.mjs", "tester/scripts/record-verdicts.mjs"]) {
    const p = resolve(ROOT, rel);
    if (!existsSync(p)) continue;
    const src = stripComments(readFileSync(p, "utf8"));
    if (!/from\s+"\.\/lib\/batch-keys\.mjs"/.test(src)) {
      violations.push(`R12 ${rel} does not import lib/batch-keys.mjs — it must not spell filenames itself.`);
    }
    if (/\$\{[^}]*groupKey[^}]*\}__\$\{[^}]*pageKey[^}]*\}/.test(src)) {
      violations.push(
        `R12 ${rel} builds a filename from groupKey+pageKey. That drops the slice suffix, which is ` +
          `the split-page collision. Use verdictFileName(batch.key).`,
      );
    }
    if (/\.replace(All)?\(\s*"\/"\s*,\s*"__"\s*\)/.test(src)) {
      violations.push(`R12 ${rel} hand-rolls the "/"→"__" transform. Use batchFileName()/keyFromFileName().`);
    }
  }
}

/* ── R13: no report or publish without the completeness gate ─────────────────
 *
 * A report built from part of a run is byte-shaped exactly like a complete one.
 * The gate is the only thing standing between that and a false green, so it must
 * be called BEFORE the write, and the override must keep existing and keep being
 * an override rather than the default.
 */
{
  const p = resolve(ROOT, "tester/scripts/record-verdicts.mjs");
  if (existsSync(p)) {
    const src = stripComments(readFileSync(p, "utf8"));
    for (const fn of ["commandReport", "commandPublish", "commandFinish"]) {
      const s = src.indexOf(`function ${fn}(`);
      if (s < 0) {
        violations.push(`R13 ${fn}() is missing from record-verdicts.mjs.`);
        continue;
      }
      const body = src.slice(s, src.indexOf("\n}", s));
      if (!body.includes("assertScopeComplete(")) {
        violations.push(`R13 ${fn}() does not call assertScopeComplete() — it can produce a deliverable from a partial run.`);
      }
    }
    const gate = src.indexOf("assertScopeComplete(");
    const write = src.indexOf("claude-tester-report.md");
    if (gate < 0 || write < 0 || gate > write) {
      violations.push("R13 assertScopeComplete() must be defined and called before the report is written.");
    }
    if (!src.includes("force-report")) {
      violations.push("R13 the --force-report escape hatch is gone. The gate needs a documented override, or people route around it.");
    }
    if (/const\s+force\s*=\s*true/.test(src)) {
      violations.push("R13 --force-report looks hard-coded on. A forced report is never the default.");
    }
  }
}

/* ── R14: the scope manifest is written before any batch runs ────────────────
 *
 * A manifest written at the end describes what happened, not what was asked for —
 * and the gate then cannot detect the one thing it exists to detect.
 */
{
  const p = resolve(ROOT, "tester/scripts/run.mjs");
  if (existsSync(p)) {
    const src = stripComments(readFileSync(p, "utf8"));
    const writeScope = src.indexOf("writeScope()");
    const loop = src.indexOf("for (const [i, batchName] of pending.entries())");
    if (writeScope < 0) violations.push("R14 run.mjs never writes scope.json — the completeness gate has nothing to check against.");
    else if (loop >= 0 && writeScope > loop) {
      violations.push("R14 scope.json is written after the batch loop. It must record what was ASKED FOR, before anything runs.");
    }
  }
}

/* ── R15: the control answers are never printed ──────────────────────────────
 *
 * checkControls used to push `expected "yes", got "no"` and print it. The tester
 * runs record-verdicts itself, so it read the expected answer off the failure
 * message, flipped its verdict and re-ran — clearing its own quarantine. The
 * anti-rubber-stamp mechanism was defeated by a helpful error message.
 */
{
  const p = resolve(ROOT, "tester/scripts/record-verdicts.mjs");
  if (existsSync(p)) {
    const src = stripComments(readFileSync(p, "utf8"));
    const s = src.indexOf("function checkControls(");
    if (s < 0) violations.push("R15 checkControls() is missing.");
    else {
      const body = src.slice(s, src.indexOf("\n}", s));
      if (/wrong\.push\([^)]*expected\.get\(/.test(body) || /\$\{expected\.get\(/.test(body)) {
        violations.push(
          "R15 checkControls() puts the EXPECTED answer into its return value. The tester reads that " +
            "output and can flip the control to make its own command succeed. Return ids only.",
        );
      }
    }
    for (const m of src.matchAll(/console\.(?:log|error|warn)\(([^;]*)\)/g)) {
      if (/expected\.get\(|controlExpectations\(/.test(m[1])) {
        violations.push("R15 a console call interpolates a control expectation — that leaks the answer to the tester.");
      }
    }
  }
}

/* ── Report ──────────────────────────────────────────────────────────────── */

if (violations.length > 0) {
  console.error(`\naudit-tester-plugin-wiring: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  ✗ ${v}`);
  console.error("");
  process.exit(1);
}

console.log(
  `audit-tester-plugin-wiring: OK — ${tiers.PRESERVE.length} preserved, ` +
    `${tiers.SEED_OWNED.length} seed-owned, ${tiers.DERIVED.length} derived, ${tiers.CASCADE.length} cascade.`,
);
process.exit(0);
