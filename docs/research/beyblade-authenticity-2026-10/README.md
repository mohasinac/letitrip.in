# Beyblade authenticity — research behind `/tools/authenticity`

Combed 2026-10-18. This file is the provenance for every claim the checker
makes. **If a rule is not sourced here, the tool must not assert it.**

The tool's job is explicitly *not* to deliver verdicts. It is to tell a buyer
which signals apply to the generation in front of them, which of those signals
the input already satisfies or fails, and what is still unknown. Three findings
below make that the only defensible design.

---

## 🛑 The three findings that constrain the whole design

### 1. Code-matching alone is NOT a detector

Already measured by this project, in
[`../competitor-crawl-2026-10/counterfeit-signals.md`](../competitor-crawl-2026-10/counterfeit-signals.md):
bladekingbeys.com ships **516 `B-xx`, 189 `BB-xx`, 147 `BX-xx`, 95 `UX-xx` and
85 `CX-xx` codes** on 1,277 counterfeit products. They use real Takara Tomy
product codes.

So a product code that *exists* proves nothing. What carries signal is
**name-vs-code consistency** — a title claiming "Storm Pegasus" against a code
that belongs to Phantom Orion is a real discrepancy, and that is what the engine
checks.

### 2. The decoding of MFB box date codes is DISPUTED

Two incompatible readings are in circulation, and the project must not pick one
silently:

| Reading | `A0813` means | Source |
|---|---|---|
| **Month / day / year** | 08 January 2013 | the r/Beyblade reference post (below), stated as the rule and used consistently across all 111 of its entries |
| **Factory / week / year** | plant `A`, ISO week 08 (≈ February), 2013 | surfaced in WBO discussion summaries while searching for Burst code formats |

Both are community reconstructions. **Takara Tomy has never published a
decoding**, and the reference post says so itself about the midfake batches:
*"There is not an official statement of Takara Tomy for these low-quality
batches!!"*

The engine therefore shows **both** interpretations and labels the decode
`disputed`. It never prints one date as fact.

### 🛑 2b. The reference post's own counts are inflated — and so are its dates

Measured while parsing it, not assumed. The post heads each year with a count
(`*Year 2011* **[49x]**`) and **three of five are wrong**:

| Year | Source claims | Source actually lists |
|---|---|---|
| 2008 | 2 | 2 |
| 2009 | 9 | 9 |
| 2010 | 31 | **30** |
| 2011 | 49 | **40** |
| 2012 | 20 | **17** |
| **total** | **111** | **98** |

So "111 Takara Tomy codes" — which is what any retelling of this post will say —
is wrong. The shipped table has **98 entries across 90 distinct codes**.

Separately, **six codes carry a written date that contradicts the post's own
stated rule**: `C0812`, `C1912`, `C3010`, `G1010`, `H0310`, `K1010`. (`C3010` is
written "30.03.2020"; `H0310` as "03.10.2010".) The generator derives every date
*from the code* and flags these as `sourceDateDiffers`, so the UI can say the
source is internally inconsistent there rather than picking a side.

🛑 **The first version of the generator's guard trusted the 111 and failed the
whole run.** That is the right direction of failure and the wrong number — the
same shape as Root Cause #84. The floor is now measured.

### 3. "Midfake" ≠ counterfeit, and the market's word is "aftermarket"

A midfake is a *lower-quality batch produced on Takara Tomy blueprints*, with
TT-style codes — not a Hongyi/Flame knockoff. The community treats it as its own
tier, and this codebase already has the vocabulary for it:
`ProductAuthenticity = "original" | "reproduction" | "unverified"`, with
"Midfake" as the buyer-facing label on the reproduction tier
([`appkit/src/features/products/schemas/firestore.ts`](../../appkit/src/features/products/schemas/firestore.ts)).

And per the crawl finding: counterfeit sellers here make **no authenticity claim
at all** — zero occurrences of `original`/`fake`/`replica` across 1,277
products. They sell as *"aftermarket"*, *"custom"*, *"upgraded components"*. The
tool answers that framing directly rather than offering a true/false verdict
nobody was asked for.

---

## Sources

### Primary — community reference data

| Source | What was taken | Access note |
|---|---|---|
| r/Beyblade, ["Takara Tomy Original Codes Metal Series 18.01.2021"](https://www.reddit.com/r/Beyblade/comments/kzyzt1/takara_tomy_original_codes_metal_series_18012021/) by u/GodKillgroth (157 pts, 110 comments, body edited 25.04.2021) | **98 original MFB box-code entries → 90 distinct codes**, the midfake code families, the New Boy "unclear" set, the `BB-`/`BBG-` release list, the four series windows | reddit.com returns `403 blocked by network security` to both WebFetch and a real Chromium here; retrieved via the [Arctic Shift](https://arctic-shift.photon-reddit.com/) public archive API. Body archived verbatim at [`sources/reddit-kzyzt1.md`](sources/reddit-kzyzt1.md) |
| r/Beyblade comments on the same post (100 fetched) | u/WBOSai: codes *"ending in 813 are definitely midfakes"*; L-Drago Destroy F:S tip screw — **original = triangular hole**, fake differs | same API |
| [beyblade.fandom.com/wiki/Counterfeit_Beyblades](https://beyblade.fandom.com/wiki/Counterfeit_Beyblades) | the **producer lists per generation**, the risk section (lead/cadmium, Armstrong's mixture), the tips section, the **official importer list** | `/wiki/` 403s; fetched via `api.php?action=parse&prop=wikitext` with a browser UA, per the project's existing wiki note |
| fandom [TT Hongli](https://beyblade.fandom.com/wiki/TT_Hongli), [Hongyi](https://beyblade.fandom.com/wiki/Hongyi), [Flame](https://beyblade.fandom.com/wiki/Flame_(Company)) | per-producer tells — which generation each targets, packaging behaviour, specific part substitutions | same |
| [WBO: Midfake Beyblade Discussion and Information](https://worldbeyblade.org/Thread-Midfake-Beyblade-Discussion-and-Information) | additional midfake codes `D2211`, `F1512`, `I2814`; jagged fusion-wheel edges; over-shiny metal | 🛑 **Not read directly.** Cloudflare interstitial (`Just a moment…`, HTTP 403) defeats both curl and a real Chromium, and bypassing a bot gate is not something to do. Taken from search-engine summaries of the thread and marked lower-confidence in the data |

### Secondary — India-specific buying context

| Source | What was taken |
|---|---|
| [spiralforge.in — Beyblade Seller Scams in India](https://spiralforge.in/beyblade-seller-scams-in-india/) | six scam archetypes; OLX / FB Marketplace / AliExpress as risk channels; per-generation checks (Takara copyright text under attack rings; face-bolt and fusion-wheel codes; Burst QR; X distributor provenance); INR price bands |
| [beybladeartshop.com — Beyblade Buying Guide India](https://beybladeartshop.com/pages/beyblade-buying-guide-india-2024) | tri-wing vs Phillips; shine-does-not-tarnish tell; *"midfakes are almost impossible to distinguish without experience"*; INR bands |
| [Funskool](https://en.wikipedia.org/wiki/Funskool) + the fandom importer list | **Funskool is a LEGITIMATE licensed Indian importer** — a Funskool marque is not a fake signal, and the tool must not treat it as one |

### Rejected as a source

| Source | Why rejected |
|---|---|
| [malloftoys.com authentication checklist](https://malloftoys.com/blogs/news/how-to-spot-counterfeit-takara-tomy-beyblades) | A retailer page. It asserts a **"Takara Tomy official verification portal"** that QR codes resolve against, **micro-engraved batch codes of the form `X24A-087`**, and a **universal holographic authenticity sticker**. None of the three is corroborated by the wiki, by WBO, or by any community source found, and no such TT portal was locatable. The fetch itself flagged the retailer's commercial interest. **These claims are deliberately absent from the knowledge base.** |
| toys-japan.com / monkeemods.com / alibaba product-insights | Same shape — retailer or marketplace SEO pages restating the above. Not used for any assertion. |

---

## What the tool asserts, by generation

Generation inference comes from the product-code prefix where one is given, and
is otherwise **asked, not guessed**:

| Generation | Years | Code prefixes | Marques |
|---|---|---|---|
| Original / plastic | 1999–2003 | `A-` | Takara, Hasbro |
| HMS (Hard Metal System) | 2003–2005 | `MA-` | Takara, Hasbro |
| Metal Fight (MFB) | 2008–2012 | `BB-` | Takara Tomy, Hasbro, Sonokong |
| Zero-G / Shogun Steel | 2012–2013 | `BBG-` | Takara Tomy, Hasbro |
| Burst | 2015–2023 | `B-` | Takara Tomy, Hasbro |
| Beyblade X | 2023– | `BX-`, `UX-`, `CX-` | Takara Tomy, Hasbro |

Era boundaries and prefixes cross-checked against
[`canonical-beys.json`](../bey-corpus-2026-10/canonical-beys.json) (220 beys,
each carrying `productCode`, `era` and `marque`), which is also what the
generated name index is built from.

### Generation-specific tells, all sourced

- **Plastic / HMS** — Takara copyright text moulded under the Attack Ring and on
  the Blade Base edge; `TT Hongli`, `Aoda`, `A&L`, `Auldey`, `Top Cyclone`,
  `Le Xing`, `Xinlexin`, `Da Zhong`, `DeXing` are the named producers. 🛑 Some
  fake Bakuten-era beys used a Weight Disk containing **Armstrong's mixture**, a
  sensitive explosive — the single most serious safety item in the research.
- **Metal Fight** — `Hongyi` ("Rapidity") is the dominant producer; tells are
  over-shiny metal that never dulls, a **fully die-cast Performance Tip**, rubber
  parts replaced with hard plastic (an RF tip rendered as plain F; a Final Drive
  with no rubber), misspelt names, and the Hongyi logo in place of the TT one.
  Box date code cross-checks against the 111 known-original and the midfake
  families.
- **Burst** — **tri-wing screws** on authentic, Phillips on nearly all
  counterfeits; `Flame`'s packaging imitates TT closely with correct parts, so
  packaging alone is weak there; `Hongyi`, `SB (S3)`, `MQ Funny Toy` and ~25
  others named. Wrong spin direction (a right-spin Xeno Xcalibur) is conclusive.
- **Beyblade X** — authentic uses **rivets and tri-wing screws**; the
  **"BEYBLADE X" logo on the Gear Chip** (counterfeits put their own name or the
  product code there, or leave it blank); **Bits have a metal pin**, fakes don't;
  some fake ratchets have altered tooth designs.

### Cross-generation

Logo presence (Takara Tomy / Hasbro / Sonokong / Funskool); missing UPC/JAN
barcode, or a barcode with no digits beneath it; absent manufacturer contact
details; poor English and misplaced art; rubber replaced with plastic; a loose
"no packaging" listing of a current product; parts that exist in no official
release; and systematic misspelling of the canonical name as trademark evasion
(the project's own measured list: `Pegasis`, `Scythee`, `Jupitar`, `Fireblase`,
`Orian'`, `Cosmec'`, `Libraa'`, `Temp'`).

---

## 🛑 Deliberate non-features

- **No "this is fake" output.** The highest-severity verdict the engine can
  reach is `likely-reproduction`, and only on a matched midfake code family or a
  named counterfeit marque — both of which are statements about a *batch* or a
  *brand*, never an accusation against a seller. The crawl doc's own rule:
  *"a false counterfeit accusation against a real seller is worse than a missed
  one."*
- **No automated listing rejection**, for the same reason. This is a buyer-side
  advisory surface.
- **No Firestore reads.** The whole knowledge base is static and bundled, so the
  tool costs one function invocation and nothing else (Rule #6). The canonical
  index is generated from the corpus by
  [`scripts/gen-authenticity-index.mjs`](../../scripts/gen-authenticity-index.mjs).

## Still open

- The WBO midfake thread's full code list is unread (Cloudflare). The three
  codes taken from search summaries carry `confidence: "reported"` in the data
  and are shown to users as reported-not-verified. Reading that thread would
  likely add codes and should be done by a human who can clear the challenge.
- **No Burst or Beyblade X box date-code format is established.** Searching
  produced only the MFB format and retailer marketing. The engine accepts a code
  for those generations and says plainly that no decoding is known, rather than
  applying the MFB rule to a generation it was never shown to cover.
- The two "unclear" New Boy (Middle East) code entries are carried as
  `unclear` and surface as "seems legitimate, not confirmed", matching the
  source's own hedge.
