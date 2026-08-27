#!/usr/bin/env node
/**
 * audit-seo-canonical-host — strict-zero.
 *
 * There must be exactly ONE definition of the canonical host, and every SEO
 * surface must resolve to it.
 *
 * WHY THIS BUG CLASS IS SILENT: nothing errors when two files disagree about
 * the site's own hostname. Every page still renders, every check still passes,
 * and the only symptom is that Google slowly stops indexing you.
 *
 * What actually happened (2026-08): `appkit.config.js` hardcoded the apex
 * `https://letitrip.in` while `src/constants/seo.server.ts` read
 * `NEXT_PUBLIC_APP_URL || NEXT_PUBLIC_SITE_URL || <apex>` — and a comment in the
 * first claimed the two were "kept in sync". They were not. Once the Vercel env
 * was pointed at the www host, the env-driven path (page canonicals, og:url,
 * JSON-LD) said www and the hardcoded path (robots.txt Host/Sitemap, every
 * sitemap <loc>, root metadataBase) still said apex.
 *
 * Result: all 182 sitemap URLs pointed at a host that 307-redirected, the
 * destination declared a canonical on a host present in no sitemap, and the
 * site fell out of Google. Zero errors, zero failing tests.
 *
 * RULES
 *   HOST_DISAGREEMENT      two owners resolve the canonical host differently
 *   HARDCODED_HOST_LITERAL a bare site-host URL literal outside the one owner
 *   UNSAFE_ENV_FALLBACK    an SEO surface reads the host from raw env with a
 *                          placeholder-ish fallback ("" / "App" / localhost)
 *   REGISTRY_STALE         a registered file or symbol no longer exists
 *
 * No suppression marker — scripts/audit-no-suppression-comments.mjs is
 * strict-zero and forbids adding new ones. The escape hatch is the registry
 * below, which is source-visible and reviewable.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * THE one owner of the canonical host. Everything else must derive from it.
 */
const HOST_OWNER = {
  file: "appkit.config.js",
  // Must read the env var, with a single absolute https fallback.
  pattern: /siteUrl:\s*process\.env\.NEXT_PUBLIC_SITE_URL\s*\|\|\s*"(https:\/\/[^"]+)"/,
};

/**
 * Files that must NOT define their own host. Each names the symbol it should
 * derive from instead.
 */
const DERIVED_SURFACES = [
  {
    file: "src/constants/seo.server.ts",
    mustContain: "SEO_CONFIG.siteUrl",
    reason:
      "LETITRIP_SEO.siteUrl feeds every page canonical, og:url and the metadata generators",
  },
  {
    file: "src/constants/seo.ts",
    mustContain: "s.siteUrl",
    reason: "SEO_CONFIG surfaces appkit.config.js's value to the app",
  },
];

/**
 * Files whose host value reaches robots.txt / sitemap.xml / metadataBase.
 * These must reference SEO_CONFIG.siteUrl and never a literal.
 */
const SEO_ROUTE_FILES = [
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/layout.tsx",
];

/** A bare host literal for this site, anywhere it should not appear. */
const HOST_LITERAL = /["'`]https?:\/\/(www\.)?letitrip\.in[^"'`]*["'`]/g;

/** Placeholder-ish fallbacks that render a valid-looking but wrong entity. */
const UNSAFE_FALLBACKS = [
  { pattern: /NEXT_PUBLIC_SITE_URL\s*\?\?\s*""/, label: 'NEXT_PUBLIC_SITE_URL ?? ""' },
  { pattern: /NEXT_PUBLIC_SITE_NAME\s*\?\?\s*"App"/, label: 'NEXT_PUBLIC_SITE_NAME ?? "App"' },
  { pattern: /NEXT_PUBLIC_SITE_URL\s*\|\|\s*"http:\/\/localhost/, label: "localhost fallback" },
];

/**
 * Files allowed to contain a host literal, with the reason. Anything else that
 * hardcodes the host is a second owner waiting to drift.
 */
const LITERAL_ALLOWED = new Map([
  ["appkit.config.js", "the one owner — this IS the definition"],
  ["scripts/audit-seo-canonical-host.mjs", "this audit's own patterns"],
  ["scripts/deploy.mjs", "post-deploy smoke origin, asserted against the owner"],
]);

const rel = (f) => relative(ROOT, f).split(sep).join("/");
const read = (relPath) => {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) return null;
  return readFileSync(full, "utf8");
};

function main() {
  const violations = [];
  let checked = 0;

  // ── Resolve the one owner ────────────────────────────────────────────────
  const ownerSrc = read(HOST_OWNER.file);
  if (ownerSrc === null) {
    violations.push({
      rule: "REGISTRY_STALE",
      where: HOST_OWNER.file,
      msg: `host owner file is missing — update HOST_OWNER in ${rel(fileURLToPath(import.meta.url))}`,
    });
    report(violations, checked);
    return;
  }
  const ownerMatch = HOST_OWNER.pattern.exec(stripComments(ownerSrc));
  if (!ownerMatch) {
    violations.push({
      rule: "HOST_DISAGREEMENT",
      where: HOST_OWNER.file,
      msg:
        "seo.siteUrl must be `process.env.NEXT_PUBLIC_SITE_URL || \"https://<host>\"` — " +
        "one env-driven definition with one absolute fallback. A bare literal here " +
        "is what drifted from src/constants/seo.server.ts and de-indexed the site.",
    });
    report(violations, checked);
    return;
  }
  const canonicalHost = ownerMatch[1].replace(/\/+$/, "");
  checked++;

  if (/\/$/.test(ownerMatch[1])) {
    violations.push({
      rule: "HOST_DISAGREEMENT",
      where: HOST_OWNER.file,
      msg: `canonical host must not have a trailing slash — got "${ownerMatch[1]}"`,
    });
  }

  // ── Derived surfaces must not redefine it ────────────────────────────────
  for (const surface of DERIVED_SURFACES) {
    const src = read(surface.file);
    if (src === null) {
      violations.push({
        rule: "REGISTRY_STALE",
        where: surface.file,
        msg: "registered file no longer exists — update DERIVED_SURFACES in this script",
      });
      continue;
    }
    checked++;
    const code = stripComments(src);
    if (!code.includes(surface.mustContain)) {
      violations.push({
        rule: "HOST_DISAGREEMENT",
        where: surface.file,
        msg: `must derive the host via \`${surface.mustContain}\` (${surface.reason}). Do not reintroduce a local env chain or literal.`,
      });
    }
    for (const { pattern, label } of UNSAFE_FALLBACKS) {
      if (pattern.test(code)) {
        violations.push({
          rule: "UNSAFE_ENV_FALLBACK",
          where: surface.file,
          msg: `\`${label}\` renders a valid-looking but wrong value instead of failing visibly.`,
        });
      }
    }
  }

  // ── robots / sitemap / root layout must reference the shared symbol ──────
  for (const file of SEO_ROUTE_FILES) {
    const src = read(file);
    if (src === null) {
      violations.push({
        rule: "REGISTRY_STALE",
        where: file,
        msg: "registered file no longer exists — update SEO_ROUTE_FILES in this script",
      });
      continue;
    }
    checked++;
    const code = stripComments(src);
    if (!code.includes("SEO_CONFIG")) {
      violations.push({
        rule: "HOST_DISAGREEMENT",
        where: file,
        msg:
          "must take its host from SEO_CONFIG. robots.txt `Host:`/`Sitemap:`, every " +
          "sitemap <loc> and root metadataBase all derive from this — a second source " +
          "here is exactly the split that de-indexed the site.",
      });
    }
  }

  // ── No stray host literals ───────────────────────────────────────────────
  for (const file of [HOST_OWNER.file, ...DERIVED_SURFACES.map((d) => d.file), ...SEO_ROUTE_FILES]) {
    if (LITERAL_ALLOWED.has(file)) continue;
    const src = read(file);
    if (src === null) continue;
    const code = stripComments(src);
    const found = code.match(HOST_LITERAL);
    if (found) {
      violations.push({
        rule: "HARDCODED_HOST_LITERAL",
        where: file,
        msg: `hardcodes ${found[0]} — derive from SEO_CONFIG.siteUrl instead. Two owners of one value is the bug.`,
      });
    }
  }

  report(violations, checked, canonicalHost);
}

function report(violations, checked, host) {
  if (violations.length === 0) {
    console.log(
      `audit-seo-canonical-host: clean ✓ (${checked} host source(s) checked, canonical = ${host})`,
    );
    process.exit(0);
  }
  console.error(`audit-seo-canonical-host: ${violations.length} violation(s) found.\n`);
  console.error(
    "The canonical host must have exactly one definition (appkit.config.js `seo.siteUrl`),\n" +
      "and robots.txt, sitemap.xml, metadataBase and every page canonical must derive from it.\n" +
      "When two files disagree, the sitemap advertises URLs on a host that redirects — which\n" +
      "is silent, and is what removed this site from Google in August 2026.\n",
  );
  for (const v of violations) console.error(`  [${v.rule}] ${v.where}: ${v.msg}`);
  process.exit(1);
}

main();
