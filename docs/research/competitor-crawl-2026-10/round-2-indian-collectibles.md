# Round 2 — Indian collectibles competitors, crawled 2026-10-13

User-directed, on top of the fifteen-site crawl in this directory. The brief was
a named list of Indian collectibles sellers; four of the seven named were
already covered (beybladeartshop, worldhobbyshop, hobbykartindia,
toycollectorsindia), so this records the **three new** sites plus re-measured
figures for two of the existing ones.

🛑 **What this is for.** Taxonomy gaps, price bands and commerce signals —
aggregate facts. It is **not** a source of product listings: the standing
decision in this plan is that *"competitor data is commercial, not canonical"*,
and the 36,461 crawled images are third-party product photography that must not
be republished. Our catalogue is generated from the local canonical corpus and
priced from measured bands.

---

## Sites

| Site | Platform | Status |
|---|---|---|
| **toyzeindia.in** | WooCommerce | ✅ new |
| **animetoysandwheels.com** | custom **Next.js** | ✅ new |
| **otakuisland.in** | custom | ✅ new |
| hobbykartindia.com | Wix | re-measured |
| toycollectorsindia.com | Shopify | re-measured — **15,036 products** |
| toysnbricks.com | — | 🛑 **HTTP 403**, not readable |

---

## 🛑 Five findings that change something

### 1. `otakuisland.in` states tax-inclusive pricing OUTRIGHT

> *"All prices include GST and there are no hidden charges."*

That is the **first competitor in seventeen sites to say it in words**, and it
independently validates C0c's decision that prices are tax-INCLUSIVE and the
`pricesIncludeGst` flag is authoring-only. Worldhobbyshop asserts the same thing
only in JSON-LD (`valueAddedTaxIncluded: true`); this one tells the buyer.

Of the sites checked this round: otakuisland **states it**, and toyzeindia,
animetoysandwheels, hobbykartindia and toycollectorsindia **say nothing at
all**. So the honest framing for `/fees` (D6b) is that stating it is a
differentiator, not table stakes.

### 2. A FRANCHISE axis, which our taxonomy does not have

`otakuisland.in` navigates by **franchise first** — Naruto, One Piece, Dragon
Ball, Demon Slayer, JJK, Attack on Titan, Bleach, Marvel, Pokémon, Solo
Levelling, Chainsaw Man, Tokyo Ghoul, Hatsune Miku, JoJo, Harry Potter, DC,
Doraemon — crossed with a product-TYPE axis: Collector Statues · Keychains ·
Katanas & Swords · Head Gears · Lamps & Lights · Wall Art & Decor · Hand Gears ·
Cosplay Apparel · Gaming · Horror.

🛑 **Franchise is the `groupedListings` / feature axis, NOT a tree axis.** A
franchise crosses every product type (a Naruto keychain and a Naruto statue), so
a tree node would break the single-chain invariant — the same argument section
4.4 makes for character and lineage. The right home is a `franchise` feature
group, and it is a real gap: our figure branch is organised by maker and scale,
which is how a collector of *figures* shops and not how a fan of *a series*
shops.

### 3. Display and storage is a real product LINE, not an accessory afterthought

`animetoysandwheels.com` sells it as a category with its own price ladder:

| Item | Price |
|---|---|
| Display rack, 3 cars | ₹299 |
| Display rack, 5 cars | ₹399 |
| Display rack, 10 cars | ₹650 |
| Parking zone mat | ₹350 |
| **Rotating display, 120 cars** | **₹5,999** |

Our `bey-gear` branch has `storage-cases` with no price band and no fixtures.
This is the band, and it spans 20× — so one band for "storage" would be
meaningless; it needs splitting by capacity.

### 4. Diecast has a PARTS axis too, which we assumed was Beyblade-only

`toyzeindia.in` carries **`1/64 Rubber Wheels/Tires`** as a top-level category.
So the component-level model D12/D13 built for Beyblade has a direct diecast
analogue — custom wheels and tyres for 1:64 — and raikages is no longer the only
component-level seller in the corpus.

Also from toyzeindia: **`Exclusive Collections (Hot Wheels Red Line Club)`** as
its own nav entry, which matches our existing `hw-rlc` node, and `Pre Orders` as
a nav-level axis rather than a filter.

### 5. Hasbro naming and a real pre-order band for Beyblade X

`hobbykartindia.com` prices pre-orders under **Hasbro** names, which is the
TT↔Hasbro axis E4c needs and our corpus has only two confirmed pairs of:

| Product | Price |
|---|---|
| Hasbro Rocket Griffon H | ₹1,999 |
| Hasbro Glory Valkerion LF | ₹1,999 |
| Hasbro Strike Dran 4-50FF | ₹1,999 |
| Hasbro Delta Unicorn PO 3-60GU | ₹2,380 |
| UX-21 Hells Nether Deck Set | ₹4,150 |
| BX-50 Random Booster | ₹1,580 |

So a Beyblade X pre-order clusters tightly at **₹1,999**, with a deck set at
₹4,150 and a random booster at ₹1,580 — and our `preorder` fixtures should sit
in that band. It also confirms `Beyblade Accessories` as a named subcategory
beside `Beyblade X` and `Metal Fusion`.

---

## Measured prices, round 2

| Segment | Source | Observed |
|---|---|---|
| Hot Wheels RC 1:64 | toyzeindia | ₹3,499 (from ₹3,999) |
| Hot Wheels Elite 64 | toyzeindia | ₹2,799 (from ₹3,499) |
| Pop Race 1:64 resin | toycollectorsindia | **₹1,799 flat across 11 SKUs** |
| Pop Race premium | toycollectorsindia | ₹1,999 |
| Kaido House × Mini GT | animetoysandwheels | ₹2,099 |
| Mini GT | animetoysandwheels | ₹1,549–₹1,699 |
| Jada Nano mystery | animetoysandwheels | ₹399 |
| Keychain (metal) | toycollectorsindia | ₹250 (from ₹500) |
| Anime figurine | otakuisland | ₹2,085–₹6,584 |
| LED statue | otakuisland | ₹5,486 |
| Replica helmet | otakuisland | ₹17,556 |
| Katana / sword | otakuisland | ₹2,085 |
| otakuisland full range | otakuisland | **₹163 – ₹1,59,102** |
| Beyblade X pre-order | hobbykartindia | **₹1,999** (n=3), ₹2,380 |
| RIP-and-SHIP | hobbykartindia | ₹739 |

🛑 **The Pop Race ₹1,799 flat is the most useful single figure here**: eleven
different castings at one price means resin 1:64 is sold at a **line price**, not
a per-casting one. Our diecast band is a distribution; for that sub-line it
should be a constant.

---

## Not read

- **toysnbricks.com** — HTTP 403. Recorded as unreadable rather than as absent;
  a 403 is a bot block, not a dead site.
- The other names in the longer list (indianhobbycenter, thebrickbakery,
  figurineindia, animeindia, otakustore, cardboardgamesindia,
  battlefieldsgaming, thegamestore) were **not fetched this round**. Stated
  rather than silently skipped — the three new sites above already surfaced the
  two structural gaps (franchise axis, display/storage band) that this round was
  for, and the rest are a LEGO/board-game vertical that is out of the narrowed
  Beyblade-depth scope.
