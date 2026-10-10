# SEO signals — measured

| Signal | worldhobbyshop | beybladeartshop | Shopify trio | tcgindia |
|---|---|---|---|---|
| Title / meta length | 50 / 141 | 50 / **225 (truncates)** | varies | — |
| H1 / H2 / H3 on homepage | **1 / 17 / 21** | **1 / 28 / 60** | TCI **2 / 27 / 86** | — |
| Homepage visible words | **1,816** | **5,540** | TCI 7,430 (see below) | — |
| Unique internal links | **79** | 57 | — | — |
| JSON-LD types | **8** incl. `BreadcrumbList`, `UnitPriceSpecification`, `WebPage`, `SearchAction` | 3 | 4 (Product/Offer/Brand/Organization) | **9** incl. `FAQPage`, `ItemList`, `CollectionPage` |
| BreadcrumbList | **✓ 6 levels** | ✗ | ✗ | ✓ |
| `valueAddedTaxIncluded` | **✓** | ✗ | ✗ | ✗ (no `offers` at all) |
| Category body copy | **36 of 46, 400–900 chars** | ✗ | ✗ | ✓ |
| Blog / guides | 10 posts | 6 articles + a buying guide | — | **28 rules posts + 2 guides** |
| City landing pages | ✗ | ✗ | ✗ | **15** |

## Our baseline

**Category and brand pages emit no structured data at all** — verified: zero
`ld+json` hits under `src/app/[locale]/categories/` and `/brands/`. Meanwhile
worldhobbyshop ships a 6-level `BreadcrumbList`, and **no Shopify competitor
has one**, so it is both the biggest gap and the biggest available edge.

And the category `generateMetadata` that does exist sits on a bare
`redirect()`, so **the metadata never reaches a browser** — a crawler follows
the redirect and reads the canonical of the page it lands on. Deleting it is a
Rule #6 win, not a loss.

## 🛑 Three readings corrected

1. **"Neither leader has an H1 or above-the-fold copy."** False — see the
   table. worldhobbyshop's is genuinely text-first: eyebrow + `h1` "Buy
   Original Beyblades in India" + a full paragraph as the first in-flow
   content. On the two Shopify sites the hero headings sit inside a slideshow
   whose slides are CSS background images with absolutely-positioned overlay
   text, which is how a first-viewport measurement misses them.

2. **TCI is not the word-count leader.** Of its 7,430 words, **3,926 (53%) are
   the full body text of four blog posts inlined into the homepage**,
   duplicating its own canonical blog URLs. Strip that and TCI is ~3,500,
   below BAS's 5,540. **5,540 is the honest benchmark.** Inlining whole
   articles is not a pattern to copy.

3. **The SEO leader has the FEWEST products and words on its homepage.**
   worldhobbyshop: 8 product cards, 1,816 words, **one** product rail. Its
   advantage is **taxonomy routing** — 6 generation tiles plus a 25-link
   systems matrix — plus a 10-question FAQ. Not merchandising volume. TCI has
   6× the words and 49 product cards and ranks worse.

## What they actually rank on

Category body copy with internal cross-links (WHS), content volume, domain age
+ product count, and in tcgindia's case **programmatic local SEO plus a
rules-content cluster**.

🛑 **tcgindia has the best SEO architecture of the fifteen with the SECOND
SMALLEST catalogue** (272 products) — city pages, a game→set hierarchy, a
format axis, 28 rules posts, and a **per-product `FAQPage`**. That combination
is reproducible by us at any catalogue size, which is what makes it the model
worth copying rather than the big Shopify stores'.

## Ranked changes, with render cost

| # | Change | Effort | Impact | Render / ISR cost |
|---|---|---|---|---|
| 1 | Delete the dead category `generateMetadata`; canonical → a new `layout.tsx` | XS | Med | **Negative** |
| 2 | `breadcrumbJsonLd` + `CollectionPage` + `faqJsonLd` on the category **tab** page | S | **Highest** | **Zero** — route already dynamic SSR; `ancestors[]` + `faqs[]` ride the existing read; both builders exist |
| 3 | `contentBody` + sibling/parent cross-links | M | **High** | **Zero** — children and siblings already fetched and rendered |
| 4 | The same trio on `/brands/[slug]` | S | High | The `revalidate` half is already done (3600) |
| 5 | `ItemList` — **names + URLs only, no `offers`** | S | Med | A price in an `ItemList` trips `audit-guest-price-leak` R3 — exactly what hobbykart does |
| 6 | `priceSpecification` + `valueAddedTaxIncluded` + `priceValidUntil` | S | Med | 🛑 **after** the GST phase |
| 7 | **Per-product `faqJsonLd`** — the tcgindia model | S | **High** | Builder exists, used on 3 pages; nobody else in the crawl does it |
| 8 | Sublisting sitemap section | XS | Med — ~40 pages currently invisible | One parallel query |
| 9 | Buying-guide + **TCG rules** hub (+14 posts) | M | **High long-tail** | Pure seed data |
| 10 | `/help/{account,auctions,orders,shopping}` sitemap coverage | XS | Low | Four `page()` lines |
| 11 | **City × category landing pages** | M | **High** — no Beyblade competitor has these | **Must be static** — `generateStaticParams`, no `searchParams` |
| 12 | ~~Long-tail tag stuffing~~ | — | **Rejected** | 162 products on one tag is thin content |

**Net ISR impact of 1–10 is negative.** Nothing adds dynamic rendering;
category and product detail routes are already fully dynamic. #11 adds 15–60
**static** pages.

🛑 **#11 must not reintroduce the combinatorial query-variant space that
caused the Hobby outage** (Root Cause #104). `generateStaticParams`, no
`searchParams`, and real per-city copy — which is why it is gated on #3.

## Blog topics — note the split

Beyblade competitors write **buying** guides; TCG competitors write **rules**
guides. Both clusters are worth having and they rank for different intents.

**Beyblade:** spotting a fake (tri-wing vs Phillips screws; cadmium/lead) ·
why imports cost ~142% (70% BCD + 5% GST) · generation history with years ·
a price table from the measured medians · weight-disk guide · launcher-skipping
repair · spin-track identification · Beyblade X UX-line explainer.

**TCG:** card rarity guide · set-code explainer · booster box vs ETB vs
bundle · what a PSA grade means and why it changes the price · buying
authentic cards in India · Japanese vs English vs Korean print runs.

## Commerce features — 🛑 payments are INDICATIVE only

Read from homepage markup. **Themes ship payment icons regardless of what is
enabled**, so treat the payment rows as unconfirmed. Shipping and social are
reliable (real links, real policy text).

| | WHS | BAS | RedEye | TCI | tcgindia | tcgrep | hobbykart | raikages |
|---|---|---|---|---|---|---|---|---|
| Razorpay / Stripe / Cashfree | — | — | — | **all 3** | — | — | — | — |
| UPI | ✓ | ✓ | — | ✓ | — | — | ✓ | — |
| COD | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — |
| **International shipping** | **✗** | **✓** | **✓** | — | — | — | — | — |
| Courier named | — | BlueDart | — | BlueDart, DTDC, **Shiprocket** | — | **Shiprocket** | — | — |
| Cart drawer | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ |
| Wishlist | ✓ | — | — | ✓ | — | ✓ | ✓ | ✓ |
| Compare | — | — | ✓ | ✓ | — | ✓ | — | ✓ |
| Gift wrap · express checkout | — | — | — | **✓ ✓** | — | — | — | — |
| Newsletter | ✓ | ✓ | ✓ | ✓ | — | ✓ **Mailchimp** | ✓ | ✓ |
| WhatsApp · Instagram | ✓ ✓ | ✓ ✓ | ✓ ✓ | ✓ ✓ | ✓ ✓ | ✓ ✓ | ✓ ✓ | — |
| GA4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Meta Pixel | — | — | — | — | — | **✓** | — | — |
| **Clarity** | — | **✓** | — | **✓** | — | — | — | — |
| Review widget | — | — | — | — | — | — | — | — |
| Chat widget | — | — | — | — | — | — | — | — |
| Related products on PDP | ✓ | ✓ | ✓ | — | ✓ | — | — | — |

**Readings:**

- **toycollectorsindia is the checkout benchmark** — three gateways plus
  UPI/COD/netbanking, Shiprocket, gift wrap, compare, wishlist, express
  checkout. Also the largest catalogue.
- **International shipping is a differentiator, not table stakes** — only BAS
  and RedEye. WHS's FAQ says *"not at the moment"*.
- **WhatsApp on 7 of 8, Discord on none.**
- 🛑 **Nobody runs a review widget and nobody runs a chat widget.** Our native
  reviews are ahead of all fifteen.
- 🛑 **Nobody uses stock-urgency messaging** despite 76–93% sold-out. A
  non-pattern worth respecting — which is why "N people viewed this this week"
  from real pageview data is the honest version of that nudge.
- **Clarity on two sites** — free session recording. We have none; it would
  answer the contrast and form-abandonment questions empirically instead of
  from contrast ratios alone.
