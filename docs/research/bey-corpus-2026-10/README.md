# Bey corpus — canonicalised product identity (B4)

Parsed from a **local** corpus the user already owns:
`C:\Users\mohsi\Downloads\Beyblade-Game-master` — `linka/beys/**` (334 Beyblade
documents) plus `case study/` beside it.

Regenerate with:

```
node scripts/parse-bey-corpus.mjs
```

Output: [`canonical-beys.json`](canonical-beys.json) — `{ canonical, review,
excluded, parts }`. **This is what B5/B6 seed from.**

> **Why local rather than the Beyblade Wiki.** The plan originally called for a
> network crawl of beyblade.fandom.com. Its HTML returns **403** even with a
> full browser header set, so that needed throttling and a workaround. This
> corpus is on disk, has no rate limit, and — being facts (names, codes, types,
> weights, dates) — carries no licensing question. The Wiki API stays the
> gap-filler for JP/romaji names only.

## Result

| | Count |
|---|---|
| bey documents on disk | 334 |
| **excluded by path** (`game-original/`) | **14** |
| candidates | **320** |
| **canonical — seedable** | **216 (68%)** |
| review list — NOT seeded | 104 |
| part glossary (components with a confirmed weight) | 87, 34 with a code |

Per-field coverage within the canonical set:

| Field | Count | Feeds |
|---|---|---|
| type (4-value enum) | 216 / 216 | the `type` FeatureGroup |
| spin (3-value enum) | 216 / 216 | the `spin` FeatureGroup |
| product code | 182 | `itemCode`, and a search term buyers actually use |
| retailed with no standalone code | 34 | still catalogue candidates — see below |
| anime owner | ~215 | `groupedListings`, `groupTheme: "character"` |
| succeeded-by edges | ~96 | `groupedListings`, `groupTheme: "lineage"` |
| Hasbro name | ~127 | search aliases, and the brand split |
| JP / full name | 182 | `searchTxt` tokens |

Era distribution (canonical only): gen1/plastic 55 · gen2/mfb 47 · gen1/hms 25
· gen3/db · gen3/choz · gen2/zerog · gen3/bu · gen3/gt · gen3/god ·
gen3/superking · gen3/burst · gen4/bx.

## The three mandatory normalisers

Skipping any one reproduces **Root Cause #33**: a filter value that is not a
stored value returns zero rows, silently, forever. The corpus has 100% `Type`
coverage in **~90 spellings** and 97% `Spin` in **54**.

| Raw | Normalised | Rule |
|---|---|---|
| `Attack (Hammer variant — heavy slow-smash)` | `attack` + qualifier kept as prose | leading enum word |
| `Balance (per Fandom canonical; not pure Attack as I previously assumed)` | `balance` + qualifier | leading enum word |
| `Endurance` | `stamina` | the corpus's own synonym, 5 docs |
| `**Dual-Spin** ⭐`, `Dual-Spin (HMS standard)` | `dual` | leading word |
| `Right (normal) — REVERSES to Left mid-battle (gimmick)` | `right` + qualifier | leading word |
| `**BBG-23** (Takara Tomy)` | `BBG-23`, marque `Takara Tomy` | strip markdown, keep the parenthetical |
| `MA-21 (Takara) / TAK14371` | `MA-21` | split on `/`, keep the FIRST code |

🛑 **The LEADING WORD wins, and the first version got this wrong in a way
nothing would have caught.** It scanned the whole string in the order
dual → left → right, reasoning that a dual-spin document mentions both
directions. It does — but so does a *right*-spin document describing a gimmick,
and the real corpus value `"Right (normal) — REVERSES to Left mid-battle
(gimmick)"` therefore resolved to **`left`**. A right-spin bey filed as
left-spin is the kind of wrong no audit catches and no page renders as an
error; it just sits in the wrong facet forever. Ten spin cases are now asserted
against the shipped function, including that one.

**Enum integrity verified: 0 canonical rows carry a `type` or `spin` outside
its union.** That is the control that matters, because the failure mode is a
feature slug like `feature-attack-hammer-variant-heavy-slow-smash` — a
vocabulary that has already failed.

## Exclusions — by path or by self-declaration, never by heuristic

**`game-original/` — 14 documents, excluded by a PATH TEST.** These are the
user's own game inventions and must never reach the marketplace catalogue.
A path test has no judgement call in it and no way for one to leak. Verified:
0 game-original rows in the canonical set.

**The review list, 104 rows, each with its reason stated:**

| Reason | Count | What it means |
|---|---|---|
| no product code or line | 32 | the document identifies no retail product at all |
| never retailed | 28 | the corpus says so: `none (anime-exclusive; never released as a retail product)`, `Not assigned (Takara Tomy)` |
| self-flagged uncertain | 26 | the corpus's OWN markers: `[VERIFY exact B-number]`, `(presumed)` |
| **slug collision** | **31** | **see below — this one is dangerous** |
| unmapped Spin | 11 | a spelling the normaliser does not recognise |
| unmapped Type | 2 | ditto |

### 🛑 The slug collisions are the find worth knowing about

16 slugs had 2–3 documents resolving to them. A document id is derived from the
slug, so seeding both would write the first and then **silently overwrite** it
with the second — no error, no count discrepancy, and `appkit-seed status`
cannot see it because it counts ids and the id exists either way. That is the
same blind spot that hid four orphaned checklist cases in B2.

Both documents are legitimate: the corpus carries separate entries for a TT
release and its Hasbro variant under one display name. `Rage Longinus Destroy'
3A` appears twice with **different** Hasbro names (`Rage Longinus Lm' 3A` vs
`Rage Luinor Lm' 3A`); `Dead Phoenix 0 Atomic` three times.

Which document is the catalogue leaf is a product decision, so **every member
of a colliding group goes to review with its siblings named** — never
auto-picked by file order, which would make the answer depend on `readdir()`.

## 🛑 Three plan corrections

**1. The corpus DOES carry the Takara Tomy ↔ Hasbro map.** The plan said it
does not — *"`NAME_CONFLICTS.md` has exactly 2 real pairs, and the
`[Hasbro: xyz]` convention is used twice, one of which is the literal
placeholder `xyz`"*. True of that FILE; false of the per-document fields. Three
labels carry it — `Hasbro EN counterpart` (60 docs), `Hasbro Name` (56),
`English/Hasbro Name` (22) — and **127 canonical rows** have a Hasbro name.
Verified on the plan's own control case: `Zwei Longinus Drake Spiral` →
`Turbo Luinor L4 Drake Spiral`. So the Wiki API is needed for JP/romaji names
only, not for the alias map.

**2. `case study/` is a MECHANICS analysis, not a part glossary.** The plan read
it as *"1,920 parseable `## Case N — Part Name (X.X g)` headers → the part-code
glossary"*. 1,920 headers do parse, but the corpus is physics: *"Case 1 — Hit to
a Freely Suspended Body (at rest, in free space)"*, *"Gyro + Contact Points +
TILT"*, *"Per-Tick Integration (what happens every frame)"*. Only the headers
carrying a **gram figure** name a real component — **87 of them**, which is
within two of the plan's own "89 carry a confirmed weight".

The first version of this parser split every header on `/`, so *"Hit to a Body
Already in Motion (falling / rising)"* produced a part code of **`rising`** —
392 fabricated codes out of 522. Requiring a weight removes the whole class.
The 34 real coded entries match the plan's examples exactly: `W105`, `RDF`,
`EWD`, `UW145`, `BD145`, `SA165`, `SR200`, `GF`, `RS`.

**3. "Retailed with no standalone code" is a distinct state from "never
retailed", and conflating them loses 34 real products.** A bey sold only inside
a Random Booster or a Face-Off Pack reached shops and belongs in the catalogue;
it simply has no `A-xx` of its own. Likewise a document recording a Beyblade X
`Product Line` ("Basic Line", "Unique Line (UX)", "Custom Line (CX-00)") but no
SKU — the product exists, the document just does not name its code.

## Two parser bugs worth recording, both found by sampling rather than reasoning

**The label set differs BY GENERATION.** gen3 documents say `Owner (Anime)` /
`Series (anime, JP)` / `Full Name (TT JP)`; gen1 documents say `Owner` /
`Series` / `Japanese Name`. A single-label lookup written from reading one gen3
file reports every gen1 document as missing the field. The first run did exactly
that, and the tell was an **era histogram far below the known per-directory file
counts** — `gen1/plastic` at 48 against 123 files on disk. The candidate label
lists in the parser are now measured counts across all 320 documents, not
guesses.

**Two fallback labels described something else entirely** — Root Cause #51's
shape. `Release` holds a DATE (`July 2002 (Japan)`) and `Product Line` holds the
Beyblade X tier; using either as a product-code fallback read dates and tiers as
codes. 25 of the 33 unparsed values came from that one fallback. `Product Line`
is now captured as its own field, because the Basic/Unique/Custom split is a
real tree axis (see
[`../competitor-crawl-2026-10/taxonomy.md`](../competitor-crawl-2026-10/taxonomy.md)).

Also: `BB-P01` is a real code (a PSP-exclusive release) that the first regex
rejected, because it required a digit immediately after the dash.

## 🛑 Licensing — facts yes, prose no

Fandom content is **CC-BY-SA**, and this corpus derives from it. Take the
**facts** — names, product codes, types, spin, weights, dates, legality. Facts
are not copyrightable. **Write our own prose** through the category description
templates, which is the entire point of having templates, and **link out** to
the Wiki page the way worldhobbyshop already does.

raikagesbeybladestore is the cautionary example of doing it badly: 114-char
product bodies lifted verbatim from the Wiki including Japanese name and
romaji, one of which ships with the literal UI string **"Add to Wishlist Add to
Wishlist"** welded into the product body.

The 36,461 crawled images are third-party product photography and are **not**
republished as our product images — see
[`../competitor-crawl-2026-10/README.md`](../competitor-crawl-2026-10/README.md).
