# Imagery — measured 2026-10-19

What competitors actually put on a product page, and what it costs on the wire.

> 🛑 **This closes half of the H1 gap the original crawl left open.** That crawl
> measured content and SEO and explicitly did not measure imagery or layout —
> *"The crawl measured content and SEO; it never measured layout… image aspect
> handling…"*. The other half is [`layout.md`](layout.md).

## Method — re-runnable, no auth

Both platforms expose per-product image metadata publicly, including pixel
dimensions, so these are **measurements, not inferences**:

```bash
# Shopify — returns images[] with width/height/alt/position per product
curl -sL "https://<host>/products.json?limit=60"

# WooCommerce Store API — returns images[] with src/srcset/sizes/alt
curl -sL "https://<host>/wp-json/wc/store/v1/products?per_page=50"

# Bytes on the wire, with format negotiation
curl -sIL -H "Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8" "<image-url>"
```

🛑 **Sample, not census.** 50–60 products per site (8 for beyyuniverse, its whole
catalogue). The medians are stable; the maxima are the largest in the sample and
the true maximum may be higher. `redeyemerch.in` returned a non-JSON empty body
to `products.json` and is **not measured here**.

## Images per product

| Site | Platform | n | min | **median** | mean | max | Distribution |
|---|---|---|---|---|---|---|---|
| beybladeartshop | Shopify | 60 | 2 | **2** | 2.52 | 4 | `2:31  3:27  4:2` |
| toycollectorsindia | Shopify | 60 | 1 | **4** | 5.10 | **31** | `1:11 2:6 3:8 4:9 5:3 6:6 7:7 8:2 9:3 10:1 13:3 31:1` |
| hobsoncollectibles | Shopify | 50 | 1 | **4** | 6.34 | 20 | `1:2 2:8 3:12 4:6 5:1 6:2 7:2 8:2 9:2 10:3 11:2 12:2 13:1 14:1 16:1 17:1 18:1 20:1` |
| worldhobbyshop | Woo | 50 | 1 | **1** | 1.28 | 7 | `1:46  3:2  5:1  7:1` |
| raikages | Woo | 50 | 1 | **3** | 4.86 | **21** | `1:20 2:5 3:5 4:5 6:4 7:2 8:2 14:1 16:1 17:1 18:1 19:2 21:1` |
| tcgrepublic | Woo | 50 | 1 | **1** | 1.26 | 2 | `1:37  2:13` |
| bladekingbeys 🛑 | Woo | 50 | 1 | **1** | 1.06 | 4 | `1:49  4:1` |
| toyzeindia | Woo | 50 | 1 | **2** | 2.46 | 4 | `1:25  2:1  4:24` — bimodal |
| beyyuniverse | Woo | 8 | 1 | **2** | 1.88 | 2 | `1:1  2:7` |

**The market median is 1–4.** Our generated catalogue is **1 on all 1,237
products**, which is at the floor. The two sites with real multi-photo coverage
(TCI, raikages) are also the two with the most pre-owned/single-unit stock, which
is the commercial reason — see the dispute note below.

## Stored dimensions and aspect

| Site | Top stored dimensions | Square share |
|---|---|---|
| beybladeartshop | **1496×1496 ×146**, 748×748 ×3, 448×448 ×2 | **151 / 151 — 100%** |
| toycollectorsindia | **1280×1706 ×120**, 800×800 ×35, 1000×1000 ×27, 1100×1100 ×19, 1200×800 ×17, 720×720 ×16, 867×1154 ×8 | 106 / 306 — 35% |
| hobsoncollectibles | **3000×3000 ×73**, 1920×1920 ×16, 1000×1500 ×10, 1200×800 ×9, 900×1200 ×8 | 118 / 317 — 37% |

TCI's non-square breakdown: **portrait 3:4 (0.75) ×134**, landscape 1.50 ×29,
portrait 0.87 ×6, landscape 1.76 ×5, portrait 0.88 ×4, portrait 0.85 ×4.

🛑 **The single most common stored shape in this market is 1280×1706 — portrait
3:4, 134 of 306 images on one site.** A square box with `object-fit: cover`
removes ~25% of its height. On a pre-owned listing that is the end where wear
shows.

The two extremes are both defensible and opposite: **BAS normalises everything to
a 1496² square** (perfectly uniform grid, sellers must crop), **hobson stores
3000² masters** and lets the CDN do the work.

## Format and responsive delivery

| Site | Stored formats | Served | srcset widths |
|---|---|---|---|
| beybladeartshop | webp 151 | **AVIF at 246w, WebP above**, `Vary: Accept` | 246 → 1946 |
| toycollectorsindia | jpg 169, png 73, webp 64 | WebP | yes |
| hobsoncollectibles | png 249, jpg 45, webp 23 | **WebP even for an untransformed PNG** | yes |
| worldhobbyshop | webp 47, jpg 17 | WebP | **47 distinct values, 50w → 2560w** |
| raikages | jpeg 243 | JPEG only | 25 values, 50w → 2560w |
| tcgrepublic | webp 63 | WebP | 12 values, 218w → 800w |
| bladekingbeys | png 43, jpg 8, webp 1, jpeg 1 | PNG | 150w → 1916w |
| toyzeindia | jpg 123 | JPEG only | — |
| beyyuniverse | jpg 12, jpeg 3 | JPEG only | — |
| tcgindia | webp | WebP | **0 — none at all** |

WooCommerce emits its pregenerated thumbnail ladder automatically with a `sizes`
of `(max-width: 2048px) 100vw, 2048px`. Shopify resizes on demand from a
`?width=N` query parameter and negotiates format from `Accept`.

**We emit zero `srcset` site-wide** (`images: { unoptimized: true }`), so a 64px
thumbnail and a 1200px hero download identical bytes. `tcgindia` — the only other
custom Next.js site measured — has the same gap.

## Bytes on the wire

One source image, three widths (beybladeartshop, a 1496² WebP master):

| Request | Content-Type | Bytes | Cache-Control |
|---|---|---|---|
| `?width=246` | **image/avif** | **15,877** | `public, max-age=31557600` + `Vary: Accept` |
| `?width=600` | image/webp | 77,832 | same |
| `?width=1946` | image/webp | 250,148 | same |

Hobson's 3000² PNG: **206,910 B untransformed** → **25,386 B at `?width=600`**, an
8.1× reduction from one query parameter.

WooCommerce, pregenerated rather than on-demand:

| Request | Bytes | Cache-Control |
|---|---|---|
| WHS `-300x300.webp` | 21,472 | `public, max-age=604800` |
| WHS full master `.webp` | 283,020 | `public, max-age=604800` |
| raikages `img_5917-scaled.jpeg` | **362,338** | 🛑 **`private`** |

🛑 **raikages serves a 362 KB raw phone JPEG with `Cache-Control: private`** — no
CDN or browser caching at all, on every view. That is the clearest own-goal in the
sample and worth not copying.

Ours, for comparison: `/media/<slug>` returns `image/webp` with
`public, max-age=86400, immutable` and **no `Content-Length`** (it is streamed
through the watermarker). `/images/seed-tiles/*.svg` is 460 B with
`max-age=31536000, immutable`.

## Alt text — the market is at zero

| Site | With alt | Without |
|---|---|---|
| tcgrepublic | **37** | 26 |
| beyyuniverse | 11 | 4 |
| worldhobbyshop | 8 | 56 |
| beybladeartshop | **0** | 151 |
| toycollectorsindia | **0** | 306 |
| hobsoncollectibles | **0** | 317 |
| raikages | **0** | 243 |
| bladekingbeys | **0** | 53 |
| toyzeindia | **0** | 123 |

**Six of nine sites have zero alt text on every product image measured.**
tcgrepublic's 59% is the best anyone does. This is an open SEO and accessibility
axis where the entire market is weak — and `ProductDocument.images` is
`string[]`, so we currently cannot store alt either.

## Filenames tell you who uploaded the photo

| Pattern | Site | Means |
|---|---|---|
| `rn-image_picker_lib_temp_<uuid>.jpg` | toycollectorsindia | **React Native image picker** — uploaded from a phone app |
| `WhatsApp-Image-2026-02-21-at-3.25.07-PM.jpeg` | beyyuniverse | forwarded WhatsApp photo |
| `img_5917-scaled.jpeg` | raikages | raw iPhone camera roll; `-scaled` is WordPress auto-downscaling at its 2560px threshold |
| `1000782511.jpg` | toyzeindia | Android camera |
| `20261006_075326.webp` | beybladeartshop | date-stamped camera export |
| `*._AC_SL1500_.jpg` | bladekingbeys 🛑 | **Amazon's CDN naming — scraped** |
| `ChatGPT-Image-Aug-13-2026-*.png` | bladekingbeys 🛑 | **AI-generated; may depict no physical object** |

🛑 **Only the last two are fraud signals.** Phone and WhatsApp filenames are what
honest small sellers in this market actually produce — four of nine sites upload
that way. Flagging them would bury the two patterns that matter.

`worldhobbyshop`'s own `og:image` is `cropped-IMG-20221211-WA0057-6.jpg.webp` — a
WhatsApp photo, as the site-wide social card.

## Gallery mechanics on a product page

| Site | Libraries detected | `<img>` with width+height | video |
|---|---|---|---|
| worldhobbyshop | **photoswipe ×14, jquery.zoom + wc-zoom** (hover magnify), flexslider | 10 of 12 | 0 (2 YouTube links) |
| raikages | aspect-ratio ×14, photoswipe ×9, flickity, flexslider; **lazyload with an inline base64 SVG placeholder at exact dimensions** | 10 of 10 | 0 (1 YouTube link) |
| beybladeartshop | lightbox ×6, swiper | 9 of 16 | 0 |
| toycollectorsindia | swiper ×18, splide ×7, lightbox ×3 | 6 of 34 | **6 `<video>` + 1 iframe** |

🛑 **WHS serves a 2048×2048 master to photoswipe for zoom.** Our lightbox scales
the *already-downloaded* bytes with CSS `transform` up to 300%, and our real
catalogue imagery caps at **480px wide** — so zooming reveals nothing. For grading
a pre-owned Beyblade, zoom is the feature.

WooCommerce puts `width`/`height` on nearly every `<img>` (CLS protection);
raikages additionally ships a dimension-accurate SVG data-URI placeholder.

**TCI has 6 `<video>` elements on one product page.** We support exactly one video
per listing (`ProductDocument.video` is singular, not an array).

## The commercial reason multi-photo matters here

The market is **76–93% sold out** — mostly pre-owned, single-unit stock. WHS's
product description template pre-empts the resulting dispute in two bullets:
*"condition **exactly as pictured**"* and *"**only what is shown** is included"*.
Its homepage FAQ asks it outright:

> **"Why does the same pre-owned Beyblade have different photos, conditions or
> prices"**

A single image cannot carry that promise. This is why the per-unit listing model
and a real multi-image gallery are the same feature, not two.

## 🛑 One correction to this directory's README

[`README.md`](README.md) states *"Product imagery stays on `seedPhoto()` tiles
until real photography exists."* That was true when written and is now **stale**:
as of 2026-10-14 we hold 195 bey covers and 309 part photos fetched from the
Beyblade Wiki via the MediaWiki API, transcoded to bounded WebP, uploaded to
Storage and referenced as `/media/<shortId>` — **630 of 1,237 generated catalogue
products carry a real photo**; 607 still carry a flat colour tile. Provenance is
recorded per file in
[`../bey-corpus-2026-10/image-provenance.json`](../bey-corpus-2026-10/image-provenance.json)
and `part-image-provenance.json`, so removal stays mechanical.

The 36,461 images in the local `linka` crawl remain **not republished** — that
part of the README stands unchanged.
