#!/usr/bin/env node
/**
 * Fetch beybladewiki.com's PUBLISHED sitemap and derive a parts/beys roster.
 *
 *   node scripts/fetch-beybladewiki-roster.mjs [--out <dir>] [--offline]
 *
 * ── 🛑 WHAT THIS DOES AND DOES NOT TOUCH ───────────────────────────────────
 *
 * It fetches exactly TWO things, both of which the site publishes for crawlers:
 *
 *   /robots.txt            200 text/plain
 *   /sitemap-index.xml     200 -> /sitemap-0.xml   (24,930 URLs, 3.3 MB)
 *
 * It fetches NO page content, and it must never be made to. Measured
 * 2026-10-20 against the live site:
 *
 *   /toys                  curl, browser UA      -> 403 Cf-Mitigated: challenge
 *   /toys                  real Chromium         -> 403 "Sorry, you have been
 *                                                   blocked"  (Cloudflare WAF,
 *                                                   Ray ID a4d364c74d169e23)
 *   /api.php, /w/api.php                         -> 403 (not MediaWiki)
 *   /wp-json/wp/v2/types                         -> 403
 *
 * So the HTML is behind a WAF block, not a solvable challenge. That is an
 * explicit access control and we do not work around it. The site is a THIRD
 * PARTY — confirmed with the owner of this repo — and its robots.txt sets
 * `Content-Signal: search=yes, ai-input=yes, ai-train=no`.
 *
 * 🛑 robots.txt also names five paths that are Disallowed even to the generic
 * agent. They are recorded in DISALLOWED below so that nobody later "improves"
 * this script by reaching for the JSON that would have been convenient:
 *
 *   /search-index.json           /search-index-competitive.json
 *   /toys/parts/builder/*.json   /tcg/packs/        /toys/rows/
 *
 * ── 🛑 WHY A ROSTER IS WORTH HAVING WITHOUT THE CONTENT ────────────────────
 *
 * Two things fall out of the URL structure alone, and both are things this
 * project was deriving the hard way:
 *
 * 1. A COVERAGE TARGET. 2,567 `toys/part/*` and 2,041 `toys/beyblade/*` pages,
 *    against 771 rows in `partGlossary`. The Beyblade Wiki's own
 *    `Category:Parts` holds 2,261 pages of which ~1,774 are new to us, so
 *    771 + 1,774 ≈ 2,545 — within 1% of the 2,567 here. The roster is
 *    therefore a CHECKLIST that tells us when the wiki-sourced import is
 *    complete, while every FACT still comes from the CC-BY-SA wiki API.
 *
 * 2. AN INDEPENDENT SLOT VOCABULARY. The `toys/parts/{generation}/{slot}`
 *    index pages enumerate 66 distinct slot names bucketed by generation —
 *    a second opinion on `PART_SLOT_VALUES`, which until now had only the
 *    fandom infobox key frequencies to check against. It immediately flags a
 *    whole `spinoffs` family and three MERGED slots
 *    (`disc-integrated-driver`, `ratchet-integrated-bit`,
 *    `ratchet-integrated-blade`) that the schema's own header warned would
 *    exist and that our 59-value union does not hold.
 *
 * Neither use copies their selection or their prose. A slug is a fact about
 * what exists; the roster's VALUE here is as a gap list we close from
 * elsewhere.
 *
 * ── 🛑 SLOT ATTRIBUTION IS DERIVED, AND LABELLED AS SUCH ───────────────────
 *
 * A part slug like `armor-tip-almight` encodes its slot as a prefix, so the
 * slot can be recovered by matching against the vocabulary the index pages
 * give us. That is mechanical but it is INFERENCE, so every row carries
 * `slotSource: "url-prefix"` and the ambiguous ones carry `slot: null` rather
 * than a guess.
 *
 * It must be a LONGEST-prefix match. `armor` and `armor-tip` are both real
 * slots, so a first-match-wins loop files all 70-odd `armor-tip-*` parts under
 * `armor` and the error is invisible — the counts still look plausible.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:network,writes-docs-research
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const HOST = "https://beybladewiki.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** Paths robots.txt Disallows for `User-agent: *`. Never fetch these. */
const DISALLOWED = [
  "/search-index.json",
  "/search-index-competitive.json",
  "/toys/parts/builder/*.json",
  "/tcg/packs/",
  "/toys/rows/",
  "/brand/*.mp4$",
  "/*?q=",
  "/*&q=",
  "/*.ics$",
];

/** Only this subtree is in scope — "stick to toys". */
const SCOPE = "toys/";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const OUT_DIR = path.resolve(
  arg("--out", "docs/research/beybladewiki-roster-2026-10"),
);
const OFFLINE = process.argv.includes("--offline");

async function get(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  return res.text();
}

/** Every `<loc>` in a sitemap, host-stripped. The file has no newlines. */
function locs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) =>
    m[1].replace(`${HOST}/`, "").replace(/\/$/, ""),
  );
}

/**
 * The `toys/parts/{generation}/{slot}` index pages, which are the authority
 * for the slot vocabulary. `toys/parts/{generation}` alone is a generation
 * index and `toys/parts/builder` is the Disallowed builder tool, so both are
 * excluded by requiring exactly four segments.
 */
function slotTaxonomy(urls) {
  const byGeneration = new Map();
  for (const u of urls) {
    const seg = u.split("/");
    if (seg.length !== 4 || seg[0] !== "toys" || seg[1] !== "parts") continue;
    const [, , generation, slot] = seg;
    if (slot === "builder") continue;
    /*
     * 🛑 `part` appears as a slot segment under five generations and is not a
     * slot — it is the overflow/index page for parts the site has not filed.
     * Treating it as one would add a meaningless 67th name and, worse, make it
     * the longest-prefix winner for nothing.
     */
    if (slot === "part") continue;
    if (!byGeneration.has(generation)) byGeneration.set(generation, new Set());
    byGeneration.get(generation).add(slot);
  }
  return byGeneration;
}

/** Longest-prefix slot match. See the header on why first-match is wrong. */
function attributeSlot(slug, slotsByLength) {
  for (const slot of slotsByLength) {
    if (slug === slot || slug.startsWith(`${slot}-`)) {
      return { slot, code: slug === slot ? null : slug.slice(slot.length + 1) };
    }
  }
  return { slot: null, code: null };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rawDir = path.join(OUT_DIR, "raw");
  fs.mkdirSync(rawDir, { recursive: true });

  const robotsPath = path.join(rawDir, "robots.txt");
  const sitemapPath = path.join(rawDir, "sitemap-0.xml");

  let robots;
  let sitemap;

  if (OFFLINE && fs.existsSync(robotsPath) && fs.existsSync(sitemapPath)) {
    console.log("[beybladewiki] --offline: reusing cached robots.txt + sitemap");
    robots = fs.readFileSync(robotsPath, "utf8");
    sitemap = fs.readFileSync(sitemapPath, "utf8");
  } else {
    console.log(`[beybladewiki] GET ${HOST}/robots.txt`);
    robots = await get(`${HOST}/robots.txt`);
    fs.writeFileSync(robotsPath, robots, "utf8");

    console.log(`[beybladewiki] GET ${HOST}/sitemap-index.xml`);
    const index = await get(`${HOST}/sitemap-index.xml`);
    fs.writeFileSync(path.join(rawDir, "sitemap-index.xml"), index, "utf8");

    const children = locs(index);
    if (children.length !== 1) {
      console.warn(
        `[beybladewiki] expected 1 child sitemap, got ${children.length} — ` +
          `fetching all of them`,
      );
    }
    const parts = [];
    for (const child of children) {
      const url = child.startsWith("http") ? child : `${HOST}/${child}`;
      console.log(`[beybladewiki] GET ${url}`);
      parts.push(await get(url));
    }
    sitemap = parts.join("\n");
    fs.writeFileSync(sitemapPath, sitemap, "utf8");
  }

  /*
   * 🛑 Assert the robots.txt policy we were written against still holds. If
   * the owner tightens it, this script must stop rather than keep running on
   * a stale reading of their terms.
   */
  const generic = robots.match(/User-agent:\s*\*([\s\S]*?)(?=\nUser-agent:|$)/i);
  const genericBlock = generic ? generic[1] : "";
  const stillAllowed = /^\s*Allow:\s*\/\s*$/m.test(genericBlock);
  const aiInput = /ai-input\s*=\s*yes/i.test(genericBlock);
  if (!stillAllowed || !aiInput) {
    console.error(
      "[beybladewiki] 🛑 robots.txt no longer carries `Allow: /` plus " +
        "`ai-input=yes` for the generic agent. STOPPING — re-read their policy " +
        "before changing this check.",
    );
    process.exit(2);
  }

  const all = locs(sitemap);
  const toys = all.filter((u) => u.startsWith(SCOPE));
  console.log(
    `[beybladewiki] ${all.length} URLs total, ${toys.length} under /${SCOPE}`,
  );

  const taxonomy = slotTaxonomy(toys);
  const allSlots = [...new Set([...taxonomy.values()].flatMap((s) => [...s]))];
  const slotsByLength = [...allSlots].sort(
    (a, b) => b.length - a.length || a.localeCompare(b),
  );

  const partSlugs = toys
    .filter((u) => u.startsWith("toys/part/"))
    .map((u) => u.slice("toys/part/".length))
    .filter((s) => s && !s.includes("/"));

  const beySlugs = toys
    .filter((u) => u.startsWith("toys/beyblade/"))
    .map((u) => u.slice("toys/beyblade/".length))
    .filter((s) => s && !s.includes("/"));

  const launcherSlugs = toys
    .filter((u) => u.startsWith("toys/launcher/"))
    .map((u) => u.slice("toys/launcher/".length))
    .filter((s) => s && !s.includes("/"));

  const parts = partSlugs.map((slug) => {
    const { slot, code } = attributeSlot(slug, slotsByLength);
    return { slug, slot, code, slotSource: slot ? "url-prefix" : null };
  });

  const unattributed = parts.filter((p) => !p.slot);
  const perSlot = {};
  for (const p of parts) {
    if (!p.slot) continue;
    perSlot[p.slot] = (perSlot[p.slot] ?? 0) + 1;
  }

  const fetchedAt = new Date().toISOString();
  const provenance = {
    source: HOST,
    fetched: ["robots.txt", "sitemap-index.xml", "sitemap-0.xml"],
    pageContentFetched: false,
    pageContentBlockedBy: "cloudflare-waf",
    thirdParty: true,
    contentSignal: "search=yes, ai-input=yes, ai-train=no",
    disallowedPathsNeverFetched: DISALLOWED,
    fetchedAt,
  };

  const write = (name, data) => {
    fs.writeFileSync(
      path.join(OUT_DIR, name),
      `${JSON.stringify(data, null, 2)}\n`,
      "utf8",
    );
    console.log(`  wrote ${name}`);
  };

  write("parts.json", { provenance, count: parts.length, parts });
  write("beys.json", {
    provenance,
    count: beySlugs.length,
    beys: beySlugs.map((slug) => ({ slug })),
  });
  write("launchers.json", {
    provenance,
    count: launcherSlugs.length,
    launchers: launcherSlugs.map((slug) => ({ slug })),
  });
  write("slot-taxonomy.json", {
    provenance,
    distinctSlots: allSlots.length,
    byGeneration: Object.fromEntries(
      [...taxonomy.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([g, s]) => [g, [...s].sort()]),
    ),
    partsPerSlot: Object.fromEntries(
      Object.entries(perSlot).sort((a, b) => b[1] - a[1]),
    ),
  });
  write("_manifest.json", {
    provenance,
    totals: {
      sitemapUrls: all.length,
      toysUrls: toys.length,
      parts: parts.length,
      beys: beySlugs.length,
      launchers: launcherSlugs.length,
      distinctSlots: allSlots.length,
      partsWithDerivedSlot: parts.length - unattributed.length,
      partsWithoutDerivedSlot: unattributed.length,
    },
    unattributedSample: unattributed.slice(0, 40).map((p) => p.slug),
  });

  console.log(
    `\n[beybladewiki] parts ${parts.length} ` +
      `(${parts.length - unattributed.length} slot-attributed, ` +
      `${unattributed.length} not) · beys ${beySlugs.length} · ` +
      `launchers ${launcherSlugs.length} · slots ${allSlots.length}`,
  );
  if (unattributed.length) {
    console.log(
      `[beybladewiki] unattributed sample: ${unattributed
        .slice(0, 8)
        .map((p) => p.slug)
        .join(", ")}`,
    );
  }
}

main().catch((err) => {
  console.error(`[beybladewiki] ${err.message}`);
  process.exit(1);
});
