# Part composition and glossary — extracted 2026-10-12

E4a/E4b. Derived from the **local** corpus with no network crawl, by two
committed scripts so the output is reproducible rather than a one-off:

```
node scripts/extract-part-composition.mjs   # -> composition.json, review-list.json, slot-frequency.json
node scripts/extract-part-glossary.mjs      # -> part-glossary.json
```

Both read `C:/Users/mohsi/Downloads/Beyblade-Game-master` (override with
`BEY_CORPUS` / `BEY_ROOT`). Neither writes to Firestore or to
`appkit/src/seed/` — this directory is what D12/D13 will seed FROM.

## What is here

| File | Rows | What |
|---|---|---|
| `composition.json` | **260** beys | slot breakdown per bey, plus explicit slot MERGES |
| `review-list.json` | **61** | no breakdown found, or the document flags its own uncertainty |
| `part-glossary.json` | **759** parts | keyed `(classification, code)`, with `usedBy`, weights and aliases |
| `slot-frequency.json` | 20 slots | how often each canonical slot appears, from the real corpus |

Per generation: **gen1 99 · gen2 64 · gen3 66 · gen4 31**.

## Three corrections to the plan, measured

1. 🛑 **`case study/` is not 1,920 parts.** There are 1,920 `## Case N —`
   headers and they are **physics and game-design cases** — "Hit to a Freely
   Suspended Body", "Track Height as a Physics Variable", `[SPECIAL MOVE] …`,
   arena analyses. **89** carry a weight, and those are the real parts.
   section 3.8's own wording ("89 carry a confirmed weight") was right; the
   "1,920 parseable part headers" figure was not. Taking it at face value would
   have produced a glossary mostly of physics essays with part-shaped keys —
   worse than a small one, because it would look comprehensive.

2. **`bottom_parts.txt` has 35 entries, not 44.**

3. **Slots genuinely merge**, confirmed in the corpus: `Spin Gear + Blade Base
   → RUNNING CORE` (HMS) and `SPIN TRACK + TIP combined: F:D` (4D). 13 explicit
   merges extracted. So a `Record<Generation, Slot[]>` cannot express the data
   and the slot set must stay keyed on `system` (Root Cause #61).

## Two normalisers were required, both the section 3.8 shape

- **Slot spellings** — the corpus uses `ATTACK RING (AR)`, `METAL ATTACK RING
  (MAR)`, `4D ENERGY RING`, `CHROME / WARRIOR WHEEL`… matched longest-first, or
  `METAL ATTACK RING` resolves to `ATTACK RING` with `METAL ` dangling.
- **Generation** — raw header values include `gen3 (S5 Sparking-era)`, `burst`,
  `gen4 (canonical)` and `gen4 (canonical) / gen3 S7 (TRACKER cross-listing)`.
  Grouping on the raw string produced **nine** "generations" for four, with
  single-row buckets that read as real eras. The parenthetical is kept as
  `generationNote` but is never a value anything groups on (Root Cause #33).

## The control that matters

`extract-part-glossary.mjs` **exits non-zero** unless `RF` ⇄ "rubber flat"
resolves both ways, because that is the one job the glossary is a prerequisite
for (D2 Fix 3). It caught a real bug: composition rows set `code: null`
explicitly and the merge only filled `undefined`, so a part known by name could
never acquire its code — `RF` was absent from the whole glossary while the
output looked complete.

## Not taken

🛑 **Facts only.** Fandom is CC-BY-SA, so names, codes, weights and slots are
extracted and the **prose is not** — our own descriptions come from the category
templates. raikages' scraped bodies, one ending "Add to Wishlist Add to
Wishlist", are the example of doing this badly.

🛑 `game-original/` is excluded by a **path test**, not a heuristic — those are
the user's own game inventions and must never reach a marketplace catalogue.

🛑 The 36,461 crawled images are third-party product photography and are **not**
republished. Product imagery stays on `seedPhoto()` tiles.
