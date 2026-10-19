#!/usr/bin/env node
/**
 * audit-undefined-css-vars — a `var(--x)` with no fallback must resolve.
 *
 * THE BUG THIS EXISTS FOR: CSS treats an unresolvable `var()` that carries no
 * fallback as invalid-at-computed-value-time, so the browser drops THE WHOLE
 * DECLARATION. Nothing errors, nothing warns, no build step notices, and the
 * component renders with no background, no border, no colour — exactly as if
 * the rule had never been written.
 *
 * Found 2026-10-19 while promoting three orphan homepage components into real
 * section types. Between them `TestimonialsCarousel`, `PromoGrid` and
 * `HowItWorksSection` read TEN vars from some earlier, abandoned design
 * system — `--section-bg`, `--card-bg`, `--card-border`, `--section-border`,
 * `--section-title-color`, `--text-secondary`, `--color-red`,
 * `--dark-section-alt`, `--dark-section-card`, `--font-bangers` — of which
 * exactly ONE (`--color-yellow`) was real. Seven of the dead ones had no
 * fallback. All three components were barrel-exported public API the whole
 * time; had anyone mounted one, the reviewer would have gone looking for a
 * layout bug.
 *
 * ## Why "no fallback" is the discriminator, not "undefined"
 *
 * `var(--x,4rem)` is CORRECT whether or not `--x` exists — that is what a
 * fallback is for, and this codebase uses it deliberately for the runtime
 * tier (`var(--header-height,4rem)`). Flagging every undefined name would
 * therefore punish the right pattern and bury the real findings. Only
 * `var(--x)` bare is a silent total failure.
 *
 * ## Definitions are DISCOVERED, never listed here
 *
 * A var counts as defined if it appears as `--x:` in any `.css` under the
 * scanned roots, OR is written at runtime via `setProperty("--x", …)`.
 * Root Cause #106: an exemption list is a claim nobody checks. The runtime
 * tier (`--header-height`, `--bottom-nav-height`, `--bottom-chrome-height`,
 * `--keyboard-inset-height`, `--top-chrome-height`) is found by reading the
 * code that writes it, so adding a sixth writer needs no edit here.
 *
 * `--tw-*` is skipped: Tailwind generates those into its own output at build
 * time, so they are never declared in our source.
 *
 * Strict-zero. No suppression marker — `audit-no-suppression-comments` bans
 * new ones, and there is no irreducible case: either add the token, or add a
 * fallback, or use a primitive variant.
 *
 * Verified by negative control: run against the pre-fix component out of git
 * (`git -C appkit show <sha>:<path>`) and it reports the seven.
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/**
 * 🛑 Only GIT-TRACKED files, and that is load-bearing rather than tidy.
 *
 * `src/styles/globals.compiled.css` is a gitignored BUILD ARTEFACT — a single
 * minified line in which the minifier's own `--a` / `--b` scratch variables
 * and a doc placeholder (`--appkit-text-N`) look exactly like real findings.
 * It contributed 8 of the first run's 169 and every one was noise. Tracking
 * status is the honest discriminator for "did a human write this", and it
 * needs no skip-list to maintain.
 */
function trackedFiles() {
  const out = [];
  for (const repo of [ROOT, join(ROOT, "appkit")]) {
    if (!existsSync(join(repo, ".git"))) continue;
    const listed = execFileSync("git", ["-C", repo, "ls-files", "src"], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    })
      .split("\n")
      .filter((p) => /\.(tsx?|css)$/.test(p));
    for (const p of listed) out.push(join(repo, p));
  }
  return out;
}

/** Comments are stripped so a docstring NAMING a dead var is not a usage. */
function stripComments(src, isCss) {
  const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, "");
  // A CSS file has no `//` comments; stripping them there would eat `https://`.
  return isCss ? noBlock : noBlock.replace(/\/\/[^\n]*/g, "");
}

const files = trackedFiles();

// ── Pass 1: every definition we can discover ────────────────────────────────
const defined = new Set();
for (const file of files) {
  const isCss = file.endsWith(".css");
  const src = readFileSync(file, "utf8");
  if (isCss) {
    for (const m of src.matchAll(/(--[a-z0-9-]+)\s*:/gi)) defined.add(m[1]);
  } else {
    // Runtime tier: document.documentElement.style.setProperty("--x", …)
    for (const m of src.matchAll(/setProperty\(\s*["'](--[a-z0-9-]+)["']/gi)) {
      defined.add(m[1]);
    }
    // A TS object literal may also carry CSS custom properties as keys
    // (`style={{ "--glow-color": c }}`) — that is a real definition.
    for (const m of src.matchAll(/["'](--[a-z0-9-]+)["']\s*:/gi)) defined.add(m[1]);
    /*
     * next/font declares its own custom property and injects it on <html>:
     *   const body = Inter({ variable: "--font-body" })
     * So `--font-body` / `--font-display` / `--font-editorial` /
     * `--font-cursive` ARE defined — by the font loader, at runtime, in a
     * place no stylesheet mentions. Discovering them here rather than
     * listing them means a fifth font needs no edit to this audit.
     */
    for (const m of src.matchAll(/variable:\s*["'](--[a-z0-9-]+)["']/gi)) {
      defined.add(m[1]);
    }
  }
}

// ── Pass 2: bare var(--x) usages with no fallback ───────────────────────────
const violations = [];
for (const file of files) {
  const isCss = file.endsWith(".css");
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (rel.includes("audit-undefined-css-vars")) continue;
  const lines = stripComments(readFileSync(file, "utf8"), isCss).split("\n");
  lines.forEach((line, i) => {
    // `var(--x)` only. `var(--x,` has a fallback and is always safe.
    for (const m of line.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/gi)) {
      const name = m[1];
      if (name.startsWith("--tw-")) continue;
      if (defined.has(name)) continue;
      violations.push({ file: rel, line: i + 1, name, snippet: line.trim().slice(0, 110) });
    }
  });
}

/**
 * 🛑 A RATCHET, not a baseline — and SEEDED FROM A RUN OF THIS RULE, never
 * from the grep used while designing it (CLAUDE.md Root Cause #84: the
 * hand-written grep that preceded `listing-delegation` found 45 routes where
 * the audit found 61; the first hand-written version of THIS check found 10
 * names where the rule found 23).
 *
 * Each entry is a CAP. A name absent from this map is blocked outright, and a
 * name appearing more often than its cap is blocked — so the next undefined
 * var cannot land, while the known backlog stays named and visible instead of
 * tolerated as an opaque total. Lowering a number is the goal; raising one is
 * the thing being refused.
 *
 * ## Why a ratchet and not strict-zero
 *
 * 146 live sites at seeding, and every one needs a DECISION rather than a
 * rewrite: `--border-ink` and `--surface-warm` have to become *some* real
 * token, and which one is a design call that cannot be derived from the
 * source. Registering strict-zero would have broken `npm run check` for every
 * concurrent session on day one.
 *
 * ## The backlog is extremely concentrated — fix it there first
 *
 *   CharacterHotspotForm.tsx   77   ← 53% of everything, one file
 *   CharacterHotspot.tsx       10   ← same feature, same dead design system
 *   …36 further files           59   ← mostly 1–2 each
 *
 * Those two carry the same abandoned vocabulary (`--border-ink`,
 * `--color-black`, `--surface-elevated`, `--surface-warm`) as the three orphan
 * homepage components fixed 2026-10-19, which is where this audit came from.
 *
 * ## Two findings worth keeping even if the rest is never touched
 *
 *   `--appkit-space-0`  (19)  there is no space-0 token — the scale starts at
 *                             `--appkit-space-0-5`. Every `p-[var(…-space-0)]`
 *                             drops its padding declaration entirely; the fix
 *                             is the literal `p-0`.
 *   `--card-shadow`     (1)   `SHADOW_MAP.card` is `shadow-[var(--card-shadow)]`
 *                             and nothing defines it, so the `shadow="card"`
 *                             variant has never painted a shadow.
 */
const KNOWN_UNDEFINED = {
  "--border-ink": 27,
  "--color-black": 26,
  "--appkit-space-0": 19,
  "--surface-elevated": 14,
  "--appkit-color-surface-muted": 14,
  "--color-muted": 9,
  "--appkit-color-text-secondary": 8,
  "--surface-warm": 4,
  "--appkit-color-text-primary": 3,
  "--color-primary": 3,
  "--appkit-color-surface-secondary": 3,
  "--color-blue-500": 2,
  "--color-red": 2,
  "--dark-section-muted": 2,
  "--dark-section-bg": 2,
  /*
   * ── The camelCase cluster, all in `appkit/src/configs/tailwind.ts` ───────
   * Tailwind colour ALIASES pointing at camelCase properties that tokens.css
   * never declares (it is kebab-case throughout). So `bg-surface-muted`,
   * `text-on-surface`, `text-link` and friends emit a `var()` that resolves
   * to nothing, and the declaration is dropped — the class exists, compiles,
   * and paints nothing. These are one-line fixes once someone confirms the
   * intended kebab target for each; I did not guess them.
   */
  "--appkit-color-surfaceMuted": 1,
  "--appkit-color-surfaceElevated": 1,
  "--appkit-color-onSurface": 1,
  "--appkit-color-onSurfaceMuted": 1,
  "--appkit-color-borderStrong": 1,
  "--appkit-color-textPrimary": 1,
  "--appkit-color-textSecondary": 1,
  "--appkit-color-textTertiary": 1,
  "--appkit-color-textDisabled": 1,
  "--appkit-color-textInverse": 1,
  "--appkit-color-linkHover": 1,
  "--appkit-color-divider": 1,
  "--appkit-color-link": 1,
  "--dark-section-deep": 1,
  "--appkit-color-surface-alt": 1,
  "--appkit-color-secondary-text": 1,
  "--appkit-color-border-strong": 1,
  "--color-secondary": 1,
  "--card-shadow": 1,
};

console.log(
  `audit-undefined-css-vars: scanned ${files.length} files, ${defined.size} defined custom properties`,
);

const byName = new Map();
for (const v of violations) {
  if (!byName.has(v.name)) byName.set(v.name, []);
  byName.get(v.name).push(v);
}

/*
 * 🛑 `EMIT_SEED=1 node scripts/audit-undefined-css-vars.mjs` prints the
 * KNOWN_UNDEFINED literal from a real run of this rule, to paste above.
 *
 * This exists because hand-transcribing the seed got it WRONG: the first
 * attempt collected names with a case-SENSITIVE `grep -oE '--[a-z0-9-]+'`
 * while the matcher below is case-INSENSITIVE, so every camelCase name
 * (`--appkit-color-surfaceMuted`) was silently truncated at the first capital
 * to `--appkit-color-surface` — which IS defined, so it vanished from the
 * list, and the "clean tree" control then failed on names the seed should
 * have contained. Root Cause #84, self-inflicted: a measurement narrower
 * than the rule it feeds. Never type this map by hand.
 */
if (process.env.EMIT_SEED) {
  const names = [...byName.entries()].sort((a, b) => b[1].length - a[1].length);
  console.log("const KNOWN_UNDEFINED = {");
  for (const [name, hits] of names) console.log(`  "${name}": ${hits.length},`);
  console.log("};");
  process.exit(0);
}

const blocking = [];
const improved = [];
for (const [name, hits] of byName) {
  const cap = KNOWN_UNDEFINED[name];
  if (cap === undefined) {
    blocking.push({ name, hits, reason: "NEW undefined custom property" });
  } else if (hits.length > cap) {
    blocking.push({
      name,
      hits,
      reason: `${hits.length} uses, ratchet allows ${cap}`,
    });
  } else if (hits.length < cap) {
    improved.push({ name, now: hits.length, cap });
  }
}
for (const name of Object.keys(KNOWN_UNDEFINED)) {
  if (!byName.has(name)) improved.push({ name, now: 0, cap: KNOWN_UNDEFINED[name] });
}

if (improved.length > 0) {
  console.log(
    `\n  ${improved.length} ratchet entr${improved.length === 1 ? "y has" : "ies have"} improved — TIGHTEN the cap in this script:`,
  );
  for (const i of improved) {
    console.log(`    ${i.name}: ${i.cap} → ${i.now}${i.now === 0 ? "  (remove the entry)" : ""}`);
  }
}

if (blocking.length > 0) {
  console.error(
    `\n[audit-undefined-css-vars] FAIL: ${blocking.length} custom propert${blocking.length === 1 ? "y" : "ies"} resolve to nothing.\n`,
  );
  for (const b of blocking) {
    console.error(`  ${b.name} — ${b.reason}`);
    for (const h of b.hits.slice(0, 6)) {
      console.error(`      ${h.file}:${h.line}`);
      console.error(`        ${h.snippet}`);
    }
    if (b.hits.length > 6) console.error(`      … and ${b.hits.length - 6} more.`);
  }
  console.error(
    `\n  A bare var() with no fallback and no definition makes the browser drop the\n` +
      `  ENTIRE declaration — silently, with no error anywhere. Fix one of three ways:\n` +
      `    • define the token in appkit/src/tokens/tokens.css (if it should be themed), or\n` +
      `    • give it a fallback: var(--x, <literal>)  (right for the runtime tier), or\n` +
      `    • use the primitive's variant prop instead of a raw className (preferred).\n` +
      `\n  Do NOT add it to KNOWN_UNDEFINED — that map may only shrink.\n`,
  );
  process.exit(1);
}

console.log(
  `audit-undefined-css-vars: clean ✓ (${violations.length} known, ratcheted; no new undefined properties)`,
);
process.exit(0);
