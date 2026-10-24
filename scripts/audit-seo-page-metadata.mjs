#!/usr/bin/env node
/**
 * audit-seo-page-metadata — every public page must declare a title, and every
 * public CONTENT DETAIL route must be prerenderable.
 *
 * ## Why this exists
 *
 * `src/app/layout.tsx` has referenced this script by name for a long time and
 * **it did not exist**. Had it existed, it would have caught the single worst
 * SEO defect this project has had.
 *
 * Measured against production 2026-10-24: on `/products/[slug]`,
 * `/brands/[slug]`, `/categories/[slug]`, `/blog/[slug]`, `/beys/[slug]` and
 * `/parts/[c]/[code]` the `<head>` ended at byte 8,180 carrying **no `<title>`,
 * no `og:title` and no `description`** — the real `<title>` sat at byte 563,190,
 * inside `<body>`. Google Search Console: **12 indexed pages against 249 not
 * indexed**, on a 4,773-URL sitemap.
 *
 * The mechanism: Next STREAMS metadata for any route that renders dynamically,
 * and a route renders dynamically unless it can be prerendered. Only three
 * files in the whole app exported `generateStaticParams`, so every content
 * detail route streamed, and a crawler that does not execute JS never saw a
 * title. Nothing in `npm run check` could see it, because every one of those
 * files has a perfectly correct `generateMetadata`.
 *
 * ## The two rules
 *
 * R1 MISSING_TITLE — a public `page.tsx` exports neither `metadata` nor
 *    `generateMetadata`, so it inherits the site default and is a duplicate
 *    title in search results. Pages that deliberately inherit (the homepage)
 *    or that only `redirect()` are exempt, because for them inheriting is the
 *    documented correct answer.
 *
 * R2 UNPRERENDERED_DETAIL — a registered public content detail route does not
 *    export `generateStaticParams`, so its metadata streams into `<body>`.
 *    This is the rule that would have caught the incident.
 *
 * 🛑 R2 is a REGISTRY, not a heuristic. "Any route with a `[param]`" would
 * sweep in `/cart`, `/checkout/[step]`, every `/admin/**` screen and the
 * faceted `[tab]/sort/[sortKey]/page/[page]` families — none of which should
 * be prerendered, several of which legitimately cannot be. A named list is
 * reviewable; a clever pattern here would produce noise and get disabled.
 *
 * Strict-zero. No suppression marker: a public page either declares a title or
 * it does not.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = "src/app/[locale]";

/**
 * Public content detail routes that MUST be prerenderable.
 *
 * Each entry is a page path plus why it matters. Adding a new public detail
 * route means adding it here — which is the point: the decision "should a
 * crawler see this page's title without executing JS" should be made once,
 * explicitly, rather than defaulted into.
 */
const MUST_PRERENDER = [
  { file: `${APP}/products/[slug]/page.tsx`, why: "the commercial pages" },
  { file: `${APP}/brands/[slug]/page.tsx`, why: "28 brand pages" },
  { file: `${APP}/franchise/[slug]/page.tsx`, why: "franchise detail" },
  { file: `${APP}/blog/[slug]/page.tsx`, why: "22 published posts" },
  { file: `${APP}/beys/[slug]/page.tsx`, why: "1,988 model reference pages" },
  { file: `${APP}/parts/[classification]/[code]/page.tsx`, why: "2,488 part reference pages" },
];

/**
 * Pages that correctly declare no title of their own, with the reason.
 *
 * 🛑 Each of these is a DOCUMENTED decision, not an oversight. Inheriting is
 * right for the homepage (the site defaults describe it) and irrelevant for a
 * bare redirect (`redirect()` emits a 307 with no body, so any metadata built
 * there never reaches a browser — CLAUDE.md § Known TS Patterns).
 */
const TITLE_EXEMPT = new Map([
  [`${APP}/page.tsx`, "the homepage inherits the site defaults on purpose"],
]);

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "api"]);

/**
 * Subtrees that are not search results.
 *
 * The first block is signed-in surfaces. The second is routes `robots.ts`
 * DISALLOWS — a page Google is told not to crawl cannot have a duplicate-title
 * problem, so demanding a title there is noise. Keep this in step with
 * `appkit/src/_internal/server/features/seo/robots.ts`.
 */
const PRIVATE_PREFIXES = [
  `${APP}/admin/`,
  `${APP}/store/`,
  `${APP}/user/`,
  `${APP}/auth/`,
  `${APP}/checkout/`,
  `${APP}/cart/`,
  `${APP}/preview/`,
  `${APP}/unauthorized/`,
  // robots.txt Disallow
  `${APP}/wishlist`,
  `${APP}/tools/sticker-tracer`,
  // Signed-in only; no crawler ever reaches these.
  `${APP}/messages`,
];

const rel = (f) => relative(ROOT, f).split(sep).join("/");
const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : null);

/** Comment-stripped, so a commented-out export never counts as present. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function walkPages(dir = APP, out = []) {
  const full = join(ROOT, dir);
  if (!existsSync(full)) return out;
  for (const entry of readdirSync(full, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
    const child = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walkPages(child, out);
    else if (entry.name === "page.tsx") out.push(child);
  }
  return out;
}

const isPrivate = (f) => PRIVATE_PREFIXES.some((p) => f.startsWith(p));

/**
 * Does an ANCESTOR layout declare the metadata this page inherits?
 *
 * 🛑 This is a real, documented mechanism, not a loophole. Next MERGES
 * metadata down the tree, so a child that omits `alternates` keeps the
 * parent's — and `stores/[storeSlug]/layout.tsx` deliberately owns the title
 * and canonical for all fourteen storefront tabs, because tabs are views of
 * ONE page and four competing canonicals would split the section into four
 * URLs, none of which is the one the sitemap advertises.
 *
 * Without this check the rule reported all fourteen as missing a title, which
 * is the louder-than-the-truth failure of Root Cause #84: a correct
 * implementation that the rule cannot see reads exactly like a defect.
 */
function inheritsFromLayout(pageFile) {
  let dir = pageFile.slice(0, pageFile.lastIndexOf("/"));
  /*
   * 🛑 Stops BEFORE the root locale layout, and that bound is the whole rule.
   *
   * `src/app/[locale]/layout.tsx` exports a `generateMetadata` that sets
   * ICONS ONLY. Walking into it made every page on the site look like it
   * inherited a title, R1 went from 28 findings to 0, and the rule was dead
   * while reporting "clean ✓" — the exact shape of Root Cause #84. Verified
   * by negative control: strip the title from a real page and this must fail.
   */
  while (dir.startsWith(APP) && dir !== APP) {
    const layout = read(`${dir}/layout.tsx`);
    if (layout !== null && declaresTitle(stripComments(layout))) return true;
    const cut = dir.lastIndexOf("/");
    if (cut === -1) break;
    dir = dir.slice(0, cut);
  }
  return false;
}
const declaresTitle = (code) =>
  /export\s+(const|async\s+function|function)\s+(metadata|generateMetadata)\b/.test(code);
/** A page whose default export only redirects has no document to title. */
const isBareRedirect = (code) =>
  /\bredirect\s*\(/.test(code) && !/\breturn\s*\(/.test(code) && !/<[A-Z]/.test(code);

function main() {
  const violations = [];
  const pages = walkPages();
  let checked = 0;

  // ── R1: a public page declares a title ───────────────────────────────────
  for (const file of pages) {
    if (isPrivate(file) || TITLE_EXEMPT.has(file)) continue;
    const src = read(file);
    if (src === null) continue;
    const code = stripComments(src);
    checked++;
    if (declaresTitle(code) || isBareRedirect(code) || inheritsFromLayout(file)) continue;
    violations.push({
      rule: "MISSING_TITLE",
      where: file,
      msg:
        "exports neither `metadata` nor `generateMetadata`, so it inherits the site " +
        "default title and competes with every other page that does the same. Add " +
        "`_gm({ title, description, path })` from @/constants/seo.server.",
    });
  }

  // ── R2: a content detail route is prerenderable ──────────────────────────
  for (const { file, why } of MUST_PRERENDER) {
    const src = read(file);
    if (src === null) {
      violations.push({
        rule: "REGISTRY_STALE",
        where: file,
        msg: `registered in MUST_PRERENDER but the file does not exist — update ${rel(fileURLToPath(import.meta.url))}. A stale entry silently stops checking the route it names.`,
      });
      continue;
    }
    checked++;
    if (/export\s+(async\s+)?function\s+generateStaticParams\b/.test(stripComments(src))) continue;
    violations.push({
      rule: "UNPRERENDERED_DETAIL",
      where: file,
      msg:
        `${why} — no \`generateStaticParams\`, so this route renders dynamically and ` +
        "Next STREAMS its metadata into <body>. A crawler that does not execute JS " +
        "sees a <head> with no <title> at all. This is the defect that left 12 pages " +
        "indexed out of 4,773 submitted.",
    });
  }

  if (violations.length === 0) {
    console.log(`audit-seo-page-metadata: clean ✓ (${checked} page(s) checked)`);
    process.exit(0);
  }
  console.error(`audit-seo-page-metadata: ${violations.length} violation(s) found.\n`);
  for (const v of violations) console.error(`  [${v.rule}] ${v.where}: ${v.msg}`);
  process.exit(1);
}

main();
