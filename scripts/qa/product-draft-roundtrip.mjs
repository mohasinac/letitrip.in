#!/usr/bin/env node
/**
 * product-draft-roundtrip — prove the seller listing form's per-type fields
 * survive the write boundary.
 *
 * ## Why this is separate from roundtrip-diff
 *
 * `roundtrip-diff --entity product` now runs, because `product` was finally
 * registered in `SCHEMAS.forms`. But `productDraftSchema` is `.passthrough()`
 * — a draft is saved half-filled and must accept an in-progress listing — and
 * a passthrough schema drops nothing BY CONSTRUCTION. So that check proves the
 * entity is covered; it cannot prove this particular bug is fixed.
 *
 * The schema that actually strips is `productCreateSchema`
 * (`src/validation/request-schemas.ts`), a plain `z.object()` with no
 * `.passthrough()`. THAT is the boundary a seller's classified city fell
 * through, and this script is the check that walks it:
 *
 *     flat draft -> draftToProductInput() -> productCreateSchema -> assert
 *
 * One listing per type, each carrying every per-type field its form renders.
 * A field that does not survive is named, with the shape it should have had.
 *
 * ## What "survive" means
 *
 * Not "the parse succeeded" — the parse succeeded before this fix too, which
 * is exactly why the loss was silent. It means the NESTED destination is
 * present and holds the value the flat draft key carried.
 *
 * Exit 0 — every per-type field arrived. Exit 1 — one did not.
 */

import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/*
 * The consumer's schema is Zod v4 and TypeScript; appkit's mapper is compiled
 * ESM. Rather than stand up a TS loader for one file, the expectations below
 * are asserted against the MAPPER's output plus a hand-mirrored copy of the
 * per-type shapes the write schema names. If the two ever disagree, the
 * mirrored list is the thing to re-derive — it is quoted from
 * classifiedMetaSchema / digitalCodeMetaSchema / liveItemMetaSchema /
 * printMeta in `src/validation/request-schemas.ts`.
 */
const CASES = [
  {
    listingType: "classified",
    draft: {
      title: "Test classified",
      classifiedCity: "Bengaluru",
      classifiedLocality: "Indiranagar",
      classifiedPincode: "560038",
      classifiedAcceptsShipping: true,
      classifiedNegotiable: true,
    },
    expect: {
      "classified.meetupArea.city": "Bengaluru",
      "classified.meetupArea.locality": "Indiranagar",
      "classified.meetupArea.pincode": "560038",
      "classified.acceptsShipping": true,
      "classified.negotiable": true,
    },
  },
  {
    listingType: "digital-code",
    draft: {
      title: "Test code",
      digitalCodeDelivery: "manual-email",
      digitalCodePoolSize: 25,
      digitalCodeRedemptionInstructions: "Redeem in-app",
      digitalCodeExpiresAt: "2027-01-01T00:00:00.000Z",
    },
    expect: {
      "digitalCode.codeDeliveryMethod": "manual-email",
      "digitalCode.codePoolSize": 25,
      "digitalCode.redemptionInstructions": "Redeem in-app",
      "digitalCode.expiresAt": "2027-01-01T00:00:00.000Z",
    },
  },
  {
    listingType: "live",
    draft: {
      title: "Test live",
      liveSpecies: "Juniperus chinensis",
      liveAgeMonths: 120,
      liveSex: "n/a",
      liveCareInfo: "Water weekly",
      liveTransportMethod: "specialist",
      liveHandlingFee: 250,
      liveJurisdictions: ["KA", "MH"],
      liveCites: true,
    },
    expect: {
      "liveItem.species": "Juniperus chinensis",
      "liveItem.ageMonths": 120,
      "liveItem.sex": "n/a",
      "liveItem.careInfo": "Water weekly",
      "liveItem.transport.method": "specialist",
      "liveItem.transport.handlingFee": 250,
      "liveItem.jurisdictionAllowed": ["KA", "MH"],
    },
  },
  {
    listingType: "art",
    draft: {
      title: "Test print",
      printSize: "A3",
      printMaterial: "Matte paper",
      printFinish: "Satin",
      printEditionSize: 50,
    },
    expect: {
      "printMeta.size": "A3",
      "printMeta.material": "Matte paper",
      "printMeta.finish": "Satin",
      "printMeta.editionSize": 50,
    },
  },
];

/** Read a dotted path, returning a sentinel for "absent". */
const MISSING = Symbol("missing");
function at(obj, path) {
  let cur = obj;
  for (const key of path.split(".")) {
    if (cur == null || typeof cur !== "object" || !(key in cur)) return MISSING;
    cur = cur[key];
  }
  return cur;
}

function eq(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => eq(v, b[i]));
  }
  return a === b;
}

async function main() {
  let mapper;
  try {
    mapper = await import(
      pathToFileURL(join(ROOT, "appkit", "dist", "features", "seller", "utils", "product-draft-mapping.js")).href
    );
  } catch (err) {
    console.error("\n✗ Could not load the mapper from appkit/dist.\n");
    console.error(`  ${err?.message ?? err}\n`);
    console.error("  Run `npm --prefix appkit run build` first.\n");
    return 2;
  }

  const { draftToProductInput, productToDraft } = mapper;
  if (typeof draftToProductInput !== "function") {
    console.error("✗ appkit/dist does not export draftToProductInput — is the build stale?");
    return 2;
  }

  const failures = [];

  for (const c of CASES) {
    const mapped = draftToProductInput({ ...c.draft, listingType: c.listingType });

    for (const [path, want] of Object.entries(c.expect)) {
      const got = at(mapped, path);
      if (got === MISSING) {
        failures.push(`${c.listingType}: ${path} is ABSENT after mapping (draft carried it)`);
      } else if (!eq(got, want)) {
        failures.push(
          `${c.listingType}: ${path} = ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`,
        );
      }
    }

    // The flat keys must NOT survive — the write schema does not name them,
    // so leaving them in would be dead weight that reads as stored.
    for (const k of Object.keys(c.draft)) {
      if (k === "title") continue;
      if (k in mapped) failures.push(`${c.listingType}: flat key \`${k}\` leaked into the payload`);
    }

    // And the inverse must restore the form.
    if (typeof productToDraft === "function") {
      const back = productToDraft(mapped);
      for (const [k, v] of Object.entries(c.draft)) {
        if (k === "title") continue;
        // `liveCites` is boolean -> string -> boolean; compare truthiness.
        if (k === "liveCites") {
          if (!back[k]) failures.push(`${c.listingType}: round-trip lost \`${k}\``);
          continue;
        }
        if (!eq(back[k], v)) {
          failures.push(
            `${c.listingType}: round-trip \`${k}\` = ${JSON.stringify(back[k])}, expected ${JSON.stringify(v)}`,
          );
        }
      }
    }
  }

  if (failures.length === 0) {
    const fields = CASES.reduce((n, c) => n + Object.keys(c.expect).length, 0);
    console.log(
      `product-draft-roundtrip: clean ✓ (${CASES.length} listing types, ${fields} per-type field(s) survive the mapping and round-trip back)`,
    );
    return 0;
  }

  console.error(`\nproduct-draft-roundtrip: ${failures.length} failure(s):\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(
    "\n  `draftToProductInput` folds the form's flat per-type keys into the nested",
  );
  console.error(
    "  blocks `productCreateSchema` names. A field listed above never arrives, so",
  );
  console.error("  a seller filling it in would see a successful save and lose the value.\n");
  return 1;
}

process.exit(await main());
