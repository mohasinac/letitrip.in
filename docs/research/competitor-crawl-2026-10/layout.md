# Layout — measured 2026-10-19

Computed geometry at two viewports, from a real browser. This is the other half of
the H1 gap: *"The crawl measured content and SEO; it never measured layout… nav
pattern, product-grid columns per breakpoint, PDP CTA behaviour on scroll, filter
placement, image aspect handling, and tap-target sizes."*

## Method

A headless Chromium at `390×844` and `1280×900`, reading
`getBoundingClientRect()` and `getComputedStyle()` — **not** inferred from class
names. Column count is derived by counting repeated cards whose
`Math.round(top)` matches the first card's within 8px, which is robust to any CSS
mechanism (grid, flex, float).

```js
// column count of the largest repeated-card group
const tops = cards.map(c => Math.round(c.getBoundingClientRect().top));
const cols = tops.filter(t => Math.abs(t - tops[0]) < 8).length;
```

Depth: **worldhobbyshop in full** (home, a parent category, a leaf product) — it is
the taxonomy/SEO leader and the site the composition work draws from. Static HTML
markers for the other three leaders.

---

## worldhobbyshop — the full walk

### Homepage composition

The heading outline, in document order:

```
h1  Buy Original Beyblades in India
h2  Shop Beyblades by Generation
    h3 Beyblade X · Beyblade Burst · Beyblade Metal · Plastic Generation
    h3 Launchers, Grips & Accessories · Stadiums & Arenas
h2  Browse Beyblade Systems & Series
    h3 Beyblade X systems · Metal systems · Burst systems · Plastic Generation systems
h2  Recently added Beyblades
h2  Beyblade Guides & Collector Resources
h2  Clearance Products
h2  A Beyblade Store Built for Indian Bladers and Collectors
h2  Trusted by Thousands of Bladers
h2  Frequently Asked Questions About Buying Beyblades in India   (10 × h3)
```

Measured geometry:

| Block | 1280 | 390 |
|---|---|---|
| **"Shop by Generation"** | **6 image tiles, 3 cols**; tile 383×420; image 381×284 — **AR 1.34, `object-fit: cover`**, natural 768×768 | **1 col**; tile 366×380; image 364×257, AR 1.42 |
| **"Browse Systems & Series"** | **25 links, 8 cols**; 116×41px; **text only, no images** | **2 cols**, same 116×41 |
| **Product rail** | 8 cards, **4 cols**; card 280×477; image 254×254 — **AR 1:1 `cover`**; 9 srcset entries; `loading="lazy"` | 8 cards, **2 cols**; card 177×402; image 159×159 |
| Visible nav links | 32 (+ burger present) | 17 |
| Fixed / sticky chrome | **none** | **none** |
| Smallest header tap target | — | **20px** (1 element under 44) |

18 images total on the homepage, 11 with `srcset`, 15 lazy.

🛑 **The generation tiles are not square.** AR 1.34 ≈ 4:3 landscape, cropped
`cover` from a 768² source. Two different aspect conventions coexist on one page:
4:3 for taxonomy tiles, 1:1 for product cards.

🛑 **The systems matrix carries no imagery at all** — 25 text pills. It is pure
internal-link routing, and the crawl already identified it as this site's biggest
SEO asset. At 41px tall the pills are under the 44px tap-target floor.

### Category page — the generation drill-down

`/beyblade-burst/` renders **only subcategory tiles. No product cards at all.**

| | 1280 | 390 |
|---|---|---|
| Subcategory tiles (`LI.product-category`) | **12 tiles, 6 cols**; card 139×274; image 113×113 **AR 1:1 `cover`** | **2 cols**; card 166×274; image 148×148 |
| Tile label | **"Single Layer / Pre-Dual Layer (32)"** — name **+ product count** | same |
| Add-to-cart on tile | no | no |
| Filter sidebar | left, `left: 64px`, width 138–173px | **stacks below content, 343×1124 — not a drawer** |
| Filter widgets | **exactly two: "Filter by stock status", "Filter by price"** | same two |
| Filter button | — | **none exists** |
| Sort | native `<select name="orderby">`, **5 options** | same |
| Body copy | 779 words, 3 long paragraphs | same |
| Fixed / sticky chrome | **none** | **none** |

So the shape is **parent category → count-bearing image tiles → leaf category →
products**. The count in the label is the navigational payload: it tells you
whether the click is worth making.

🛑 **On mobile the sidebar stacks rather than collapsing into a drawer, and there
is no Filter button.** That is the opposite of the pattern most storefronts use,
and it means two filters are always reachable without a tap.

### Product page

| | 1280 |
|---|---|
| Zoom master | **2048×2048**, served to photoswipe, `object-fit: fill` |
| Thumbnails | ~5 |
| Primary CTA | `Add to cart` **196×50**, `position: relative` |
| Secondary CTA | `Buy Now` **105×50**, `position: relative` |
| **Sticky CTA** | **none** — both buttons scroll away at `top: 841px` |
| Tabs | *Description*, *Additional information* |
| Body copy | 349 words |
| Related | "Related Products" ×5 |
| Fixed / sticky chrome | **none** |

---

## Cross-site markers

From served HTML on the four leaders:

| | beybladeartshop | toycollectorsindia | worldhobbyshop | tcgindia |
|---|---|---|---|---|
| Platform | Shopify | Shopify | WooCommerce | custom Next.js |
| Homepage HTML | 1,113,869 B | 1,028,923 B | **245,431 B** | 120,232 B |
| `srcset=` on homepage | 58 | 94 | 10 | **0** |
| `loading="lazy"` | 57 | 98 | 14 | 1 |
| `fetchpriority` | 4 | 4 | 1 | 1 |
| PDP gallery libs | lightbox, swiper | **swiper ×18, splide ×7** | **photoswipe, jquery.zoom, flexslider** | — |
| PDP `<video>` | 0 | **6** | 0 | — |
| `og:image` | the site **logo** (926px) | padded to **1200×628**, `pad_color=ffffff` | a **WhatsApp photo** | dynamic `/opengraph-image` |

**The SEO leader ships the smallest homepage** — 245 KB against ~1 MB for both
Shopify sites — and the fewest `srcset` images, because it ships the fewest
images (18). Its advantage is taxonomy routing and copy, not merchandising volume.
That matches the correction already recorded in [`README.md`](README.md).

---

## What this means for us

| Measured | Ours today |
|---|---|
| Generation tiles: 6, AR 1.34 `cover`, 3→1 cols | `categories` section seeds `maxCategories: 8`; our template says 6 |
| Subcategory nav: **image tiles with product counts**, 6→2 cols | a **text pill row** (`OverflowRow variant="nav"`) — no image, no count |
| Product grid: 4→2 cols, 1:1 `cover` | `Grid cols="cards"` is 1 → 2 at `md` → `auto-fill` above `lg` |
| Filters: 2 widgets, sidebar that **stacks** on mobile | filter **drawer** |
| **Zero sticky chrome anywhere, no sticky PDP CTA** | we have a measured bottom-chrome tier and a CTA bar |
| PDP zoom over a **2048²** master | CSS `scale()` over a **480px** image |

🛑 **The sticky finding is the one worth pausing on.** Not one of the three pages
measured has a single `position: fixed` or `sticky` element spanning the viewport,
at either width — including the PDP, where `Add to cart` simply scrolls away. Our
`BottomChrome` tier is a deliberate divergence from the market, not a catch-up
item. It may well be the better choice; it is not the consensus one.

The two 44px tap-target misses (a 20px header control, the 41px systems pills) are
**failures to copy**, not patterns.
