#!/usr/bin/env node
/**
 * Derive a parts/beys ROSTER from a third-party reference site's published
 * sitemap, to measure our own coverage against.
 *
 *   REFERENCE_ROSTER_HOST=https://<host> node scripts/fetch-reference-roster.mjs
 *   node scripts/fetch-reference-roster.mjs --offline      # reuse the cache
 *
 * ── 🛑 THE HOST IS NOT IN THIS FILE, DELIBERATELY ─────────────────────────
 *
 * It comes from `REFERENCE_ROSTER_HOST` with no default, so the committed
 * source names no third party. Run it with the env var set, or `--offline`
 * against the gitignored cache under `raw/`.
 *
 * ── 🛑 WHAT THIS FETCHES, AND WHAT IT REFUSES TO ──────────────────────────
 *
 * Exactly two files, both of which the site publishes FOR crawlers:
 *
 *   /robots.txt
 *   /sitemap-index.xml  ->  its child sitemap(s)
 *
 * It fetches NO page content and must never be made to. Measured 2026-10-20,
 * every content path returns 403 — a Cloudflare challenge to curl and a hard
 * WAF block ("you have been blocked") to a real browser. That is an explicit
 * access control, and the site's robots.txt additionally sets
 * `Content-Signal: ai-train=no`. The script asserts the generic-agent policy
 * still carries `Allow: /` plus `ai-input=yes` and exits 2 if it does not.
 *
 * Nothing is lost by that restraint. The FACTS all come from a CC-BY-SA wiki
 * whose API returns clean JSON, and the two corpora converge: that wiki's
 * `Category:Parts` holds 2,261 pages, which lands within 1% of the roster
 * count below. What the roster adds is not content — it is a target.
 *
 * ── 🛑 WHY A ROSTER IS WORTH HAVING WITHOUT ANY CONTENT ───────────────────
 *
 * Two things fall out of URL structure alone:
 *
 * 1. A COVERAGE TARGET — 2,567 parts, 2,041 beys, 140 launchers. A checklist
 *    that says when the wiki-sourced import is complete.
 * 2. An INDEPENDENT SLOT VOCABULARY — 65 slot names bucketed by generation,
 *    which is a second opinion on `PART_SLOT_VALUES`. It agreed with 56 of our
 *    59 and flagged a `spinoffs` family plus three MERGED slots
 *    (disc-integrated-driver, ratchet-integrated-bit/-blade) that our union
 *    did not hold.
 *
 * A slug is a fact about what exists. Its value here is as a gap list we then
 * close from a licensed source.
 *
 * ── 🛑 SLOT ATTRIBUTION IS DERIVED, AND LABELLED AS SUCH ──────────────────
 *
 * A part slug encodes its slot as a prefix, so the slot can be recovered by
 * matching against the vocabulary the index pages give us. That is mechanical
 * but it is INFERENCE, so each row carries `slotSource: "url-prefix"` and an
 * unresolvable one carries `slot: null` rather than a guess.
 *
 * It must be a LONGEST-prefix match. `armor` and `armor-tip` are both real
 * slots, so first-match-wins files all 70-odd `armor-tip-*` parts under
 * `armor` and the counts still look plausible.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:network,writes-docs-research
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** Only this subtree is in scope. */
const SCOPE = "toys/";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const OUT_DIR = path.resolve(arg("--out", "docs/research/reference-roster-2026-10"));
const OFFLINE = process.argv.includes("--offline");
const HOST = (process.env.REFERENCE_ROSTER_HOST ?? "").replace(/\/+$/, "");

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

/**
 * Every `<loc>`, reduced to a site-relative path.
 *
 * 🛑 Strip the scheme and host with a REGEX, never by replacing a `${host}/`
 * string. In offline mode the host is unknown and empty, so `${host}/` is just
 * `"/"` — which replaced the first slash of `https://` and produced
 * `https:/host/toys/...`. Every `startsWith("toys/")` then failed and the run
 * wrote a roster of ZEROS over a good one, reporting success.
 */
function locs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) =>
    m[1].replace(/^https?:\/\/[^/]+\/?/i, "").replace(/\/$/, ""),
  );
}

/**
 * The `toys/parts/{generation}/{slot}` index pages — the authority for the
 * slot vocabulary. Exactly four segments: three is a generation index and
 * `toys/parts/builder` is a tool page whose JSON their robots.txt disallows.
 */
function slotTaxonomy(urls) {
  const byGeneration = new Map();
  for (const u of urls) {
    const seg = u.split("/");
    if (seg.length !== 4 || seg[0] !== "toys" || seg[1] !== "parts") continue;
    const [, , generation, slot] = seg;
    if (slot === "builder") continue;
    /*
     * 🛑 `part` appears as a slot segment under five generations and is NOT a
     * slot — it is the overflow page for parts the site has not filed. Keeping
     * it would add a meaningless 66th name and make it the longest-prefix
     * winner for nothing.
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
  const cached = fs.existsSync(robotsPath) && fs.existsSync(sitemapPath);

  let robots;
  let sitemap;

  if (OFFLINE || (!HOST && cached)) {
    if (!cached) {
      console.error(
        "[roster] --offline needs a cache under raw/, and there is none.\n" +
          "  set REFERENCE_ROSTER_HOST and run without --offline.",
      );
      process.exit(2);
    }
    console.log("[roster] offline: reusing the cached robots.txt + sitemap");
    robots = fs.readFileSync(robotsPath, "utf8");
    sitemap = fs.readFileSync(sitemapPath, "utf8");
  } else {
    if (!HOST) {
      console.error(
        "[roster] REFERENCE_ROSTER_HOST is not set and there is no cache.\n" +
          "  The host is deliberately absent from this file — pass it in the env.",
      );
      process.exit(2);
    }
    console.log(`[roster] GET ${HOST}/robots.txt`);
    robots = await get(`${HOST}/robots.txt`);
    fs.writeFileSync(robotsPath, robots, "utf8");

    console.log(`[roster] GET ${HOST}/sitemap-index.xml`);
    const index = await get(`${HOST}/sitemap-index.xml`);
    fs.writeFileSync(path.join(rawDir, "sitemap-index.xml"), index, "utf8");

    const parts = [];
    for (const child of locs(index)) {
      const url = child.startsWith("http") ? child : `${HOST}/${child}`;
      console.log(`[roster] GET ${url}`);
      parts.push(await get(url));
    }
    sitemap = parts.join("\n");
    fs.writeFileSync(sitemapPath, sitemap, "utf8");
  }

  /*
   * 🛑 Assert the policy this script was written against still holds. If the
   * owner tightens it, stop rather than keep running on a stale reading of
   * their terms.
   */
  const generic = robots.match(/User-agent:\s*\*([\s\S]*?)(?=\nUser-agent:|$)/i);
  const block = generic ? generic[1] : "";
  if (!/^\s*Allow:\s*\/\s*$/m.test(block) || !/ai-input\s*=\s*yes/i.test(block)) {
    console.error(
      "[roster] 🛑 robots.txt no longer carries `Allow: /` plus `ai-input=yes` " +
        "for the generic agent. STOPPING — re-read the policy before changing " +
        "this check.",
    );
    process.exit(2);
  }
  /* Paths the generic agent is Disallowed. Recorded so nobody later "improves"
   * this by reaching for the JSON that would have been convenient. */
  const disallowed = [...block.matchAll(/^\s*Disallow:\s*(\S+)\s*$/gim)].map((m) => m[1]);

  const all = locs(sitemap);
  const toys = all.filter((u) => u.startsWith(SCOPE));
  console.log(`[roster] ${all.length} URLs total, ${toys.length} under /${SCOPE}`);

  const taxonomy = slotTaxonomy(toys);
  const allSlots = [...new Set([...taxonomy.values()].flatMap((s) => [...s]))];
  const slotsByLength = [...allSlots].sort(
    (a, b) => b.length - a.length || a.localeCompare(b),
  );

  const sub = (prefix) =>
    toys
      .filter((u) => u.startsWith(prefix))
      .map((u) => u.slice(prefix.length))
      .filter((s) => s && !s.includes("/"));

  const partSlugs = sub("toys/part/");
  const beySlugs = sub("toys/beyblade/");
  const launcherSlugs = sub("toys/launcher/");

  const parts = partSlugs.map((slug) => {
    const { slot, code } = attributeSlot(slug, slotsByLength);
    return { slug, slot, code, slotSource: slot ? "url-prefix" : null };
  });
  const unattributed = parts.filter((p) => !p.slot);
  const perSlot = {};
  for (const p of parts) if (p.slot) perSlot[p.slot] = (perSlot[p.slot] ?? 0) + 1;

  const provenance = {
    note:
      "Derived from a third-party reference site's PUBLISHED sitemap and " +
      "robots.txt only. No page content was fetched: every content path " +
      "returns 403 behind a WAF, which is an explicit access control. Slugs " +
      "are facts about what exists; the facts themselves come from a CC-BY-SA " +
      "wiki. The host is supplied via REFERENCE_ROSTER_HOST and is not " +
      "recorded here.",
    fetched: ["robots.txt", "sitemap-index.xml", "sitemap-0.xml"],
    pageContentFetched: false,
    pageContentBlockedBy: "waf",
    thirdParty: true,
    disallowedPathsNeverFetched: disallowed,
  };

  const write = (name, data) => {
    fs.writeFileSync(path.join(OUT_DIR, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
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
    partsPerSlot: Object.fromEntries(Object.entries(perSlot).sort((a, b) => b[1] - a[1])),
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
    `\n[roster] parts ${parts.length} (${parts.length - unattributed.length} slot-attributed) · ` +
      `beys ${beySlugs.length} · launchers ${launcherSlugs.length} · slots ${allSlots.length}`,
  );
}

main().catch((err) => {
  console.error(`[roster] ${err.message}`);
  process.exit(1);
});
