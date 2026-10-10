# Measured price bands

Every figure here is a **market listing price** — what a competitor asked.

> 🛑 **A sold-out row proves the item is GONE, not that it sold at that price.**
> With 76–93% of these catalogues sold out, that distinction is the whole
> reason `CategoryProductDefaults.priceGuidance` has two separate shapes:
> `market` (these numbers, seeded, advisory) and `sold` (our own completed
> sales, written only by `priceIndexRollup`, absent until we have some).
> **They are rendered side by side and never averaged.** The gap between them
> is the most useful thing we can tell a seller.

All values in decimal rupees (the storage unit since the 2026-05 paise
migration). `n` is the sample size the median was computed over — quote it,
because a band with `n=2` is not evidence.

## Beyblade tops — worldhobbyshop.in + beybladeshopindia.com

| Leaf | p25 | median | p75 |
|---|---|---|---|
| burst-single-layer | 299 | 299 | 399 |
| burst-dual-layer | 299 | 399 | 399 |
| burst-god-evolution | 599 | 599 | 999 |
| burst-cho-z-turbo | 599 | 799 | 999 |
| burst-gt-rise | 799 | 999 | 1099 |
| burst-superking-surge | 999 | 999 | 1499 |
| burst-db-quaddrive | 999 | 1399 | 1799 |
| burst-bu-quadstrike | 1499 | 1599 | 1799 |
| burst-remakes | 999 | 999 | 1499 |
| plastic-3-layer | 799 | 899 | 1499 |
| magna-core-v-force | 999 | 1699 | 1999 |
| x-basic-s1 | 799 | 999 | 1499 |
| x-unique-ux | 1199 | 1399 | 1699 |
| x-custom-cx | 1299 | 1499 | 1799 |
| x-over-remakes | 999 | 1099 | 1499 |
| metal-fusion | 799 | 999 | 1499 |
| metal-masters | 1099 | 1499 | 1999 |
| metal-fury-4d | 1799 | 2399 | 2999 |
| shogun-steel-zero-g | 1599 | 2499 | 2999 |
| phws-metal-system | 799 | 899 | 999 |
| spin-gear-sf | 799 | 1399 | 1799 |
| **hms** | **2999** | **3999** | **9999** |

🛑 The HMS band comes from beybladeshopindia (`n=39`), **not** worldhobbyshop
(`n=2`). Where two sources disagree, prefer the larger `n` and record which
one was used — an `n=2` median is a coin flip presented as data.

🛑 **`burst-single-layer` and `burst-dual-layer` are NOT seeded as separate
leaves**, despite having separate bands here. Both the local corpus and
worldhobbyshop's own merchandising treat the early Burst era as one; see
[`taxonomy.md`](taxonomy.md). The two bands collapse to one leaf at
p25 299 / median 399 / p75 399.

## Parts, launchers, gear

raikagesbeybladestore.in is the **only** source anywhere for component-level
pricing — that is why it is in the crawl despite being the fourth-smallest
catalogue.

| Leaf | p25 | median | p75 | Source |
|---|---|---|---|---|
| energy-rings | 149 | 199 | 249 | raikages n=68 |
| fusion-wheels | 149 | 249 | 299 | raikages n=52 |
| spin-tracks | 149 | 199 | 249 | raikages n=53 |
| performance-tips | 129 | 139 | 149 | raikages n=25 |
| burst-launchers | 399 | 599 | 699 | WHS n=78 |
| metal-launchers | 399 | 599 | 849 | WHS n=37 |
| x-launchers | 299 | 599 | 700 | WHS n=34 |
| original-launchers | 199 | 299 | 899 | WHS n=32 |
| burst-parts | 99 | 149 | 249 | WHS n=82 |
| x-parts | 199 | 299 | 299 | WHS n=14 |
| `*-stadiums` (all four generations) | 2000 | 2999 | 3499 | WHS n=7 |

🛑 **One stadium band seeds all four per-generation stadium leaves.**
worldhobbyshop does not split stadiums by generation — its single "Stadiums &
Arenas" category *describes* the split in prose instead, because WooCommerce's
flat taxonomy could not hold it — so there is no per-generation evidence to
seed with. The leaves are still split (a BX-10 Xtreme Stadium is a Beyblade X
product), they just share a band until we have our own sales.

Absolute floor, thelimitlesscorner.com: right launcher **₹99–149** · plastic
launcher ₹100 · launcher rubber ₹149 · launcher suspension ₹499 · MFB LR
launcher ₹499 · string launcher ₹599–749 · 3-segment grip ₹799–999 · power
launcher ₹1,499.

## Release type — a real multiplier, orthogonal to generation

beybladeshopindia.com. This is why `priceGuidance` has to account for the
`release` feature group and not just the leaf.

| Type | n | p25 | median | p75 | vs Regular |
|---|---|---|---|---|---|
| **Limited Releases** | 170 | 1499 | **2499** | 3999 | **1.8×** |
| Brand New | 35 | 2199 | 3499 | 5999 | 2.5× |
| Regular Releases | 150 | 799 | **1399** | 2699 | 1.0× |
| Random Boosters | 46 | 899 | 1299 | 2099 | 0.9× |
| Early Releases | 18 | 499 | 799 | 899 | 0.6× |

## Trading cards — tcgrepublic.in + hobbykartindia.com

| Format | n | p25 | median | p75 | max |
|---|---|---|---|---|---|
| Singles | 545 | 350 | 400 | 500 | 8,300 |
| Booster pack | 65 | 400 | 950 | 1,550 | 3,500 |
| **Booster box** | 31 | 7,000 | **9,500** | 14,500 | 29,000 |
| Collection box set | 22 | 1,400 | 3,300 | 13,000 | 75,000 |
| **Graded cards / slabs** | 15 | 4,600 | **8,000** | 11,000 | 30,000 |
| Blister pack | 13 | 2,800 | 3,300 | 5,600 | 6,500 |
| Supplies | 31 | 250 | 800 | 1,800 | 8,000 |
| Weiss Schwarz | 14 | 3,500 | 6,500 | 7,500 | 7,800 |
| TCG accessories | 5 | 40 | 40 | 168 | 180 |
| Rip-and-ship | 2 | 739 | — | 1,250 | 1,250 |

**Singles vs sealed differ by ~20×** (₹350–500 against ₹7,000–14,500) and
shoppers never cross-shop them. That is the justification for a tier-2
sealed/singles split in the tree rather than a format tag alone.

## Figures — hobsoncollectibles.com + redeyemerch.in

| Group | n | p25 | median | p75 | max |
|---|---|---|---|---|---|
| Action Figure | 79 | 2,999 | 4,499 | 7,999 | 37,999 |
| Anime Figures | 94 | 1,199 | 1,699 | 2,499 | 6,499 |
| Banpresto | 74 | 1,199 | 1,599 | 2,199 | 4,999 |
| Marvel Legends | 41 | 2,999 | 3,999 | 5,499 | 25,999 |
| S.H.Figuarts | 25 | 5,499 | 5,999 | 7,999 | 29,999 |
| 1/12 scale | 34 | 3,499 | 5,900 | 7,999 | 14,999 |
| Prize Figure | 23 | 1,999 | 2,699 | 2,999 | 4,299 |
| Pixar Cars | 17 | 2,499 | 2,499 | 3,999 | 4,999 |
| Toy Biz (vintage) | 22 | 3,499 | 3,999 | 4,499 | 25,999 |
| "Without Box" | 57 | 499 | 599 | 2,999 | 25,999 |

**"Without Box" is a 57-row condition band, not a category** — the median
drops to ₹599 against ₹1,699 for the same items boxed. It becomes the
`no-box` / `loose` condition features, and the ~3× spread is the argument for
`condition` being a first-class facet rather than prose.

## Hot Wheels — toycollectorsindia.com

Scope is **Hot Wheels only**, and mainline is essentially all 1:64, so **one
band carries the vertical** and scale stops being a tree axis.

| Band | n | median | range | Note |
|---|---|---|---|---|
| **1:64 (mainline + premium)** | **7,418** | **₹850** | 99 – 36,500 | The working band |
| their own "Hotwheels" collection | 27 | ₹399 | 130 – 999 | Plain mainline singles |
| Matchbox Exclusive *(ref)* | 47 | ₹850 | 449 – 1,499 | Out of scope |
| larger scales *(ref)* | — | 1:43 ₹1,999 · 1:24 ₹2,700 · 1:18 ₹4,995 | — | Out of scope |

The out-of-scope rows are kept for comparison only — useful if the vertical
widens, noise if it does not.

## Per-line anchors (worldhobbyshop medians)

Dragoon ₹1,299 (n=37) · Dran ₹1,199 (n=44) · Valkyrie ₹899 (n=41) ·
Spriggan ₹999 (n=37) · Pegasus ₹1,299 (n=30) · L-Drago ₹1,499 (n=23) ·
Dranzer/Driger/Draciel ₹999 · Beylauncher ₹599 (n=44) · Winder ₹300 ·
Stadium ₹2,999.

🛑 **hobsoncollectibles runs 3–11× higher on collector grade** — Dragoon GT
₹14,599, Knight median ₹7,499 — against worldhobbyshop's ₹1,299 for "Dragoon".
Same name, different object: one is a played-with retail top, the other a
boxed collector piece. This is why `priceGuidance` must be scoped by
`listingType` *and* condition within a leaf, and why a named-model leaf holding
a ₹399 sticker sheet beside a ₹1,299 bey would blend into a meaningless band.
