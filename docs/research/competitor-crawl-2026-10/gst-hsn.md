# GST / HSN — what is verified and what is not

## The live defect this exists to fix

**GST has never been charged on goods.** Recorded in our own source,
`_internal/server/features/checkout/actions.ts`:

> *"0 of 40 live orders had a `gstAmount`, and the order page's Tax row had
> never rendered."*

And `gstRate` is set on **zero** of the current products. So the Tax row
rendering for the first time is B6's gate, and it is a real first.

## Codes

| HSN | Description | GST | Verified? |
|---|---|---|---|
| `95030020` | Non-electronic toys incl. spinning tops | **5%** | ✅ confirmed |
| `95030099` | Other toys | **5%** | ✅ confirmed |
| `95030010` | Electronic toys | **18%** | ✅ confirmed |
| `95030091` | Of electronic toys | **18%** | ✅ confirmed |
| `4911` | Printed cards / stickers / posters | — | 🛑 **chapter only — rate NOT verified** |
| `9504` | Playing cards, board games | — | 🛑 **chapter only — rate NOT verified** |

🛑 **Only chapter 9503 is confirmed.** The 4911 and 9504 chapters are the
right *chapters* for printed matter and playing cards, but I have not verified
their current rates, and the toys rates themselves moved in the 2025 revision.
**A wrong HSN on a real invoice is worse than an absent one** — verify each
non-9503 chapter before seeding a rate against it.

## Customs — buying-guide content, not a platform field

Basic Customs Duty on toys **70%**; landed ≈**142%** of assessed value.

🛑 **No `importDuty` field.** It is content for the "why do imports cost so
much" blog post and an `orders_payment` FAQ, not a schema field. A field
nothing reads is Root Cause #52.

## Why `taxCodes` is a collection, not two fields on a category

Duplicating `gstRate` + `hsnCode` across ~330 categories means a rate change
is ~330 edits. As an entity it is **one**.

```ts
export interface TaxCodeDocument extends BaseDocument {
  id: string;                 // "tax-hsn-95030020"
  hsnCode: string;            // 4/6/8 digit
  label: string;              // "Toys, non-electronic (HSN 9503 0020) — 5%"
  description?: string;
  gstRate: 0 | 5 | 12 | 18 | 28;
  chapter?: string;           // groups the picker: "9503" | "4911" | "9504"
  effectiveFrom?: Date;
  isActive: boolean;
  notes?: string;
}
```

`CategoryProductDefaults` holds `taxCodeId?: string` instead of the two raw
fields.

### 🛑 The reference is for AUTHORING. The scalars stay for CORRECTNESS.

`ProductDocument.gstRate` / `.hsnCode` **do not go away**, and neither does
the order-item snapshot. `deriveTaxonomy` resolves `taxCodeId` → writes the
resolved values **onto the product**; the order snapshots from the product as
it already does.

Without that layering, editing a tax code would retroactively change GST on
**orders already invoiced** — a compliance problem, not a modelling
preference. It is the same reason `OrderDocumentItem` already snapshots
`hsnCode`/`gstRate`.

**A category edit changes future listings; a tax-code edit changes future
derivations; nothing rewrites a past sale.**

### 🛑 `gstRate` must distinguish `undefined` from `0`

Zero is a **deliberate exemption** (live plants, live animals). The test is
`== null`, never `input.gstRate || default`, which would overwrite every
exempt row with the default.

🛑 **And no default in `DEFAULT_PRODUCT_DATA`** — that would make `undefined`
unreachable in new rows while existing rows lack it, which is the `finalSale`
trap one field over.

### Seed set

`tax-hsn-95030020` 5% (every bey, part, launcher, stadium) ·
`tax-hsn-95030010` 18% (the one electronic fixture) ·
`tax-hsn-95030099` 5% · `tax-exempt-0` 0% (live plants/animals) ·
plus chapter 4911 and 9504 rows **once their rates are verified**.

🛑 **Exactly one electronic fixture at 18%.** It is the only row that proves
the 18% branch works; without it, a 5%-only catalogue cannot distinguish "the
rate is applied" from "the rate is hardcoded".

## What competitors publish

**Nobody publishes rates.** worldhobbyshop emits
`valueAddedTaxIncluded: true` in its JSON-LD and says nothing else; the other
fourteen say nothing at all.

🛑 That `valueAddedTaxIncluded` flag is why the `productJsonLd`
`priceSpecification` work must ship **after** the GST phase — asserting
tax-inclusive pricing on a 0%-rated catalogue is a lie in structured data,
which is worse than an omission.
