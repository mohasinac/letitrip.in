# Description templates — the shapes they reuse

**The finding that justifies category-owned content:** worldhobbyshop reuses
**two** bodies across 1,195 listings, and tcgindia generates **five templated
FAQs per product**. Nobody writes 1,195 descriptions by hand. Our sellers do,
because no category→description mechanism exists anywhere in the codebase.

🛑 **Two bodies per category, not one** — which is why
`CategoryDocument.descriptionTemplates` is a keyed set rather than a string
field. WHS's pre-owned body and new-in-box body are both live on the same
category, selected by condition.

## worldhobbyshop — pre-owned

Heading: **"Important Things To Know"**, then bullets:

- original Takara Tomy
- pre-owned
- condition exactly as pictured
- only what is shown is included — launcher/stadium sold separately
- a catalog backlink

The fourth bullet is the one that matters commercially: in a market that is
76–93% pre-owned, "only what is shown is included" is the single most common
dispute, pre-empted.

## worldhobbyshop — new in box

```
<h2>{title}</h2>
```

then a spec list — **Manufacturer / Condition / UPC / Series / System /
Country of Origin / Category** — then **"What's in the box?"** (Beyblade,
Launcher, Ripcord, Manual, Original Packaging), then a Beyblade Wiki link.

Maps cleanly onto our fields: the spec list is `specifications[]`, "What's in
the box?" is `CategoryProductDefaults.inTheBox` → `ProductDocument.features`,
and the Wiki link is the attribution outbound link that keeps us on the right
side of CC-BY-SA.

## beybladeartshop — the best prose of the fifteen

2,814 filled descriptions, median **346 chars**:

> *"The {name} is a {type}-type Beyblade from the {series} series, released by
> {brand} in {year} as part of the {code} model line. Featuring the {system}, …
> Perfect for collectors and competitive players seeking…"*

**Six interpolation slots in one sentence**, and every one of them is a field
the local corpus already carries at 71–100% coverage. This is the template the
`{{title}}` / `{{brand}}` / `{{series}}` / `{{system}}` / `{{type}}` /
`{{year}}` slot set was derived from.

## redeyemerch — a third shape

```
<h2>📦 Product Description</h2>
```

then: Japan import · no-box, exactly as pictured · compatible with all Burst
launchers · includes Layer/Disc/Driver · ideal for battles · a trust line.

Worth keeping as a distinct `variant` because "no-box but complete" is a
different promise from WHS's "only what is shown".

## tcgindia — five FAQs per product

- *"Is {product} authentic?"*
- *"Is {product} sealed?"*
- *"Can I request {product} if out of stock?"*
- *"Are pulls guaranteed?"*
- *"Can I return {product}?"*

Three interpolate the name; two are category constants. **Nobody else in the
crawl does this**, and it is the single densest SEO win available — it feeds
`faqJsonLd` per product, rendered at **read** time, so fixing a wrong answer
fixes every listing at once.

## 🛑 raikages — the counter-example

114-char bodies lifted verbatim from the Beyblade Wiki including Japanese name
and romaji. One sampled row ends:

> **"Add to Wishlist Add to Wishlist"**

A UI string scraped into a product body, shipped, and still live. That is what
an unreviewed template produces, and it is the argument for `isTested?: boolean`
on `CategoryDescriptionTemplate` — a flag an admin sets only after publishing
a real listing from it.

## The slot set

| Slot | Resolved from |
|---|---|
| `{{title}}` | `draft.title` |
| `{{brand}}` | brand **display name** (`deriveTaxonomy` already resolves id → name) |
| `{{condition}}` | the `CONDITION_OPTIONS` **label**, not the raw enum |
| `{{category}}` / `{{categoryPath}}` | leaf name / `categoryNames` joined " › " |
| `{{series}}` / `{{system}}` | tier-1 / tier-2 ancestor name |
| `{{type}}` / `{{spin}}` | the normalised feature, or a spec row |
| `{{year}}` | a `releaseYear` custom field |
| `{{siteName}}` / `{{storeName}}` | `"LetItRip"` from SEO_CONFIG / server-side only |
| ~~`{{price}}`~~ | 🛑 **deliberately not offered** |

🛑 **`{{price}}` is not offered because a price in free text is an ungated
public price that `<GatedPrice>` cannot wrap**, and `audit-guest-price-leak` R2
blocks it. The gate hides prices from signed-out visitors; a template that
interpolates one into the description body would walk straight around it.

Unresolved slots → **empty string**, and the picker reports *"2 of 9 slots
could not be filled: {{year}}, {{type}}"*. A literal `{{series}}` must never
reach a published description; the `.min(20)` body rule still guards an
all-empty resolution.

**Reuse the existing engine.** `extractVariablePlaceholders` /
`usesVariableInterpolation` / `validateFAQVariables` in
`faq/schemas/firestore.ts` already serve 63 FAQs. Promote to
`_internal/shared/templating/placeholders.ts` and re-point the FAQ module,
keeping its local export name. Writing a second regex is Root Cause #75.

## The clobber rule

🛑 **Field order must change first.** Description is authored **above** the
category selector in `SellerProductShell`. Auto-filling a field the seller
walked past reads as data loss. Reorder: title → category → condition →
*picker* → description.

| Situation on category change | Behaviour |
|---|---|
| Seller never touched the text | Replaced silently; picker says "Updated for *Burst Dual Layer*" |
| Seller edited one character | **Nothing overwritten**; offer "Replace" with a confirm |
| Seller cleared the box | Fills silently |
| No template at any ancestor | **Leave existing text alone**; say "No template yet" |

Never blank a field to signal absence. Follows the accepted precedent already
in that file, which auto-fills `slug`/`seoTitle` from title and
`seoDescription` from description, each guarded by `if (!prev.X)`.
