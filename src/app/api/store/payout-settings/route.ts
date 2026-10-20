/**
 * GET  /api/store/payout-settings â€” Returns masked payout details.
 * PATCH /api/store/payout-settings â€” Updates UPI or bank payout details.
 *   Bank account number is stored in full server-side; only masked form returned.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
// The ONE GSTIN validator -- shape plus the base-36 check character. Shared
// with the platform-GSTIN gate in site settings rather than re-derived.
import {
  ADVANCED_LISTING_TYPE_CAPABILITY,
  hasAdvancedListingTypes,
  isValidGstin,
  listingTypesAllowedFor,
} from "@mohasinac/appkit";
import {
  resolveStoreCapabilities,
  type StoreCapability,
} from "@mohasinac/appkit/features/auth/permissions/constants";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { SellerPayoutDetails } from "@mohasinac/appkit/features/auth/schemas/firestore";
import { ROLES_STORE_WRITE } from "@/constants";

// --- Helper -------------------------------------------------------------------

function sanitisePayoutDetails(details: SellerPayoutDetails | undefined): Omit<
  SellerPayoutDetails,
  "bankAccount"
> & {
  bankAccount?: Omit<NonNullable<SellerPayoutDetails["bankAccount"]>, "accountNumber">;
} {
  if (!details) return { method: "upi", isConfigured: false };
  if (!details.bankAccount) return details;
  const { accountNumber: _removed, ...safeBank } = details.bankAccount;
  return { ...details, bankAccount: safeBank };
}

// --- Schemas ------------------------------------------------------------------

const upiSchema = z.object({
  method: z.literal("upi"),
  upiId: z.string().min(3, "Invalid UPI ID").max(50),
  emiEnabled: z.boolean().optional(),
  // Authoring-only: how the seller types prices. See StoreDocument.pricesIncludeGst.
  pricesIncludeGst: z.boolean().optional(),
  // C5e tier 2 — the seller's own opt-in per protection. See StoreDocument.
  supportsShippingProtection: z.boolean().optional(),
  supportsSaleProtection: z.boolean().optional(),
  /*
   * Advanced listing types — pre-orders, prize draws, classifieds, digital
   * codes, live items, art, stickers.
   *
   * 🛑 Declared in BOTH arms of the discriminated union. A field present in
   * only one arm is stripped by the other, so a seller on bank transfer would
   * tick the box, get a success toast, and the value would evaporate — which
   * is exactly what happened to `gstin` on this same route.
   *
   * Stored as the `advanced_listing_types` capability rather than its own
   * boolean, so there is one owner of "what may this store list". See the
   * PATCH handler for why the array is MERGED, never replaced.
   */
  advancedListingTypesEnabled: z.boolean().optional(),
  // -- Tax identity (2026-10-19) -----------------------------------------
  //
  // These three were ALREADY collected by SellerPayoutSettingsView, which
  // renders a Tax Info section with GSTIN / PAN / business-type inputs and
  // PATCHes taxInfo: { ... } to this route. This schema did not declare
  // them, and z.object() STRIPS unknown keys -- so a seller typed their
  // GSTIN, saw a success toast, and the value evaporated. Root Cause #38,
  // on the form-to-schema axis.
  //
  // The GSTIN is what decides whether that seller invoices under their own
  // registration or under LetItRip's (see resolveSupplierIdentity), so it
  // has to round-trip.
  gstin: z
    .string()
    .trim()
    .max(15)
    .optional()
    // An EMPTY string must pass: it is how a seller clears a GSTIN they
    // entered by mistake. Only a non-empty value is validated, and it is
    // validated properly -- shape AND the base-36 check character, through
    // the one validator the platform GSTIN already uses. A second regex
    // here would be a second definition of 'valid GSTIN' free to disagree.
    .refine((v) => !v || isValidGstin(v), {
      message:
        'Invalid GSTIN - check the 15-character format and its check digit.',
    }),
  legalName: z.string().trim().max(150).optional(),
  registeredAddress: z.string().trim().max(300).optional(),
});

const bankSchema = z.object({
  method: z.literal("bank_transfer"),
  accountHolderName: z.string().min(2).max(100),
  accountNumber: z.string().min(9).max(18).regex(/^\d+$/, "Only digits"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  bankName: z.string().min(2).max(80),
  accountType: z.enum(["savings", "current"]),
  emiEnabled: z.boolean().optional(),
  // Authoring-only: how the seller types prices. See StoreDocument.pricesIncludeGst.
  pricesIncludeGst: z.boolean().optional(),
  // C5e tier 2 — the seller's own opt-in per protection. See StoreDocument.
  supportsShippingProtection: z.boolean().optional(),
  supportsSaleProtection: z.boolean().optional(),
  /*
   * Advanced listing types — pre-orders, prize draws, classifieds, digital
   * codes, live items, art, stickers.
   *
   * 🛑 Declared in BOTH arms of the discriminated union. A field present in
   * only one arm is stripped by the other, so a seller on bank transfer would
   * tick the box, get a success toast, and the value would evaporate — which
   * is exactly what happened to `gstin` on this same route.
   *
   * Stored as the `advanced_listing_types` capability rather than its own
   * boolean, so there is one owner of "what may this store list". See the
   * PATCH handler for why the array is MERGED, never replaced.
   */
  advancedListingTypesEnabled: z.boolean().optional(),
  // -- Tax identity (2026-10-19) -----------------------------------------
  //
  // These three were ALREADY collected by SellerPayoutSettingsView, which
  // renders a Tax Info section with GSTIN / PAN / business-type inputs and
  // PATCHes taxInfo: { ... } to this route. This schema did not declare
  // them, and z.object() STRIPS unknown keys -- so a seller typed their
  // GSTIN, saw a success toast, and the value evaporated. Root Cause #38,
  // on the form-to-schema axis.
  //
  // The GSTIN is what decides whether that seller invoices under their own
  // registration or under LetItRip's (see resolveSupplierIdentity), so it
  // has to round-trip.
  gstin: z
    .string()
    .trim()
    .max(15)
    .optional()
    // An EMPTY string must pass: it is how a seller clears a GSTIN they
    // entered by mistake. Only a non-empty value is validated, and it is
    // validated properly -- shape AND the base-36 check character, through
    // the one validator the platform GSTIN already uses. A second regex
    // here would be a second definition of 'valid GSTIN' free to disagree.
    .refine((v) => !v || isValidGstin(v), {
      message:
        'Invalid GSTIN - check the 15-character format and its check digit.',
    }),
  legalName: z.string().trim().max(150).optional(),
  registeredAddress: z.string().trim().max(300).optional(),
});

const updatePayoutSchema = z.discriminatedUnion("method", [upiSchema, bankSchema]);

// --- GET ----------------------------------------------------------------------

export const GET = withProviders(createApiHandler({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    return successResponse({
      payoutDetails: sanitisePayoutDetails(
        user!.payoutDetails as SellerPayoutDetails | undefined,
      ),
      emiEnabled: store?.emiEnabled ?? false,
      // Absent means inclusive, matching the schema default.
      pricesIncludeGst: store?.pricesIncludeGst ?? true,
      // Absent means NOT supported — the one answer that must not be ambiguous.
      supportsShippingProtection: store?.supportsShippingProtection ?? false,
      supportsSaleProtection: store?.supportsSaleProtection ?? false,
      /*
       * Derived, not the raw `capabilities` array.
       *
       * 🛑 `capabilities` is listed in PRIVATE_STORE_FIELDS — "internal
       * feature gating; server-enforced, never client-read" — so shipping it
       * whole to a browser would publish every admin-granted entitlement
       * (`lower_commission_rate`, `priority_support`, …) to the seller.
       * Projecting the one boolean the form owns is the allow-list discipline
       * from § Public Data Projections.
       *
       * `allowedListingTypes` is sent alongside it because the create shells
       * need the same answer the server gate will give, and deriving it twice
       * on the client is how ten hand-written copies of the union happened.
       */
      advancedListingTypesEnabled: hasAdvancedListingTypes(
        resolveStoreCapabilities(store?.capabilities),
      ),
      allowedListingTypes: listingTypesAllowedFor({
        capabilities: resolveStoreCapabilities(store?.capabilities),
      }),
      // Returned so the Tax Info section renders what is actually stored.
      // It previously rendered res.data.taxInfo.*, a key this route has
      // never sent -- so the inputs were always blank on load regardless
      // of what had been saved.
      gstin: store?.gstin ?? "",
      legalName: store?.legalName ?? "",
      registeredAddress: store?.registeredAddress ?? "",
    });
  },
}));

// --- PATCH --------------------------------------------------------------------

export const PATCH = withProviders(createApiHandler<(typeof updatePayoutSchema)["_output"]>({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  schema: updatePayoutSchema,
  handler: async ({ user, body }) => {
    const data = body!;
    let details: SellerPayoutDetails;

    if (data.method === "upi") {
      details = {
        method: "upi",
        upiId: data.upiId,
        isConfigured: true,
      };
    } else {
      const masked = data.accountNumber.slice(-4).padStart(data.accountNumber.length, "â€¢");
      details = {
        method: "bank_transfer",
        bankAccount: {
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          accountNumberMasked: masked,
          ifscCode: data.ifscCode.toUpperCase(),
          bankName: data.bankName,
          accountType: data.accountType,
        },
        isConfigured: true,
      };
    }

    await userRepository.update(user!.uid, { payoutDetails: details });

    let emiEnabled = false;
    let pricesIncludeGst = true;
    let supportsShippingProtection = false;
    let supportsSaleProtection = false;
    // Defaults to false, the same direction the server gate fails: a store we
    // could not read is treated as basic-only, never as entitled.
    let advancedListingTypesEnabled = false;
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (store) {
      /*
       * One write for both store flags rather than two — `updateStore` is a
       * document write, so splitting them would cost an extra round trip and
       * leave a window where one landed and the other did not.
       */
      const storePatch: {
        emiEnabled?: boolean;
        pricesIncludeGst?: boolean;
        supportsShippingProtection?: boolean;
        supportsSaleProtection?: boolean;
        gstin?: string;
        legalName?: string;
        registeredAddress?: string;
        capabilities?: StoreCapability[];
      } = {};
      if (data.emiEnabled !== undefined) storePatch.emiEnabled = data.emiEnabled;
      if (data.pricesIncludeGst !== undefined) storePatch.pricesIncludeGst = data.pricesIncludeGst;
      if (data.supportsShippingProtection !== undefined) storePatch.supportsShippingProtection = data.supportsShippingProtection;
      if (data.supportsSaleProtection !== undefined) storePatch.supportsSaleProtection = data.supportsSaleProtection;
      // Written on the STORE, not the user: the GSTIN identifies the
      // supplier of record on that store's invoices, and a seller may own
      // more than one store. `undefined` means 'not sent, leave alone';
      // an empty string is a deliberate clear and is written through.
      if (data.gstin !== undefined) storePatch.gstin = data.gstin;
      if (data.legalName !== undefined) storePatch.legalName = data.legalName;
      if (data.registeredAddress !== undefined) storePatch.registeredAddress = data.registeredAddress;
      /*
       * Advanced listing types — a MERGE into the capability array, never a
       * replacement.
       *
       * 🛑 This is the one field on this route whose storage is shared with
       * the admin. `capabilities` also carries `verified_seller`,
       * `lower_commission_rate`, `priority_support` and twelve more that only
       * an admin may grant — so writing `[.."advanced_listing_types"]` from a
       * seller form would silently revoke every one of them. That is Root
       * Cause #76 exactly: a form whose write shape can EXPRESS state it does
       * not own will eventually overwrite it.
       *
       * The seller's form owns ONE member of this array and touches only that
       * member. Everything else is read from the stored document and written
       * back unchanged.
       *
       * 🛑 Merged onto the RESOLVED set, not the raw field. `capabilities: []`
       * resolves to DEFAULT_STORE_CAPABILITIES, so merging onto the raw empty
       * array would write `["advanced_listing_types"]` — a non-empty array
       * that no longer resolves to the defaults, silently dropping the
       * `suggest_brands` and `create_coupons` the store effectively had.
       */
      if (data.advancedListingTypesEnabled !== undefined) {
        const current = new Set<string>(resolveStoreCapabilities(store.capabilities));
        if (data.advancedListingTypesEnabled) current.add(ADVANCED_LISTING_TYPE_CAPABILITY);
        else current.delete(ADVANCED_LISTING_TYPE_CAPABILITY);
        storePatch.capabilities = Array.from(current) as StoreCapability[];
      }
      if (Object.keys(storePatch).length > 0) {
        await storeRepository.updateStore(store.storeSlug, storePatch);
      }
      emiEnabled = data.emiEnabled ?? store.emiEnabled ?? false;
      /*
       * 🛑 Echoed back so the form reflects what was stored, and defaulted to
       * `true` to match the schema. A field a form can send but never reads
       * back is how a toggle silently reverts on reload — the shape of Root
       * Cause #38, which this route's own `emiEnabled` line already avoids.
       */
      pricesIncludeGst = data.pricesIncludeGst ?? store.pricesIncludeGst ?? true;
      supportsShippingProtection =
        data.supportsShippingProtection ?? store.supportsShippingProtection ?? false;
      supportsSaleProtection = data.supportsSaleProtection ?? store.supportsSaleProtection ?? false;
      /*
       * Echoed from the patch we just wrote when the field was sent, and from
       * the stored document otherwise — same reason as `pricesIncludeGst`
       * above. A checkbox the form can send but never reads back is how a
       * toggle silently reverts on reload (Root Cause #38).
       */
      advancedListingTypesEnabled = hasAdvancedListingTypes(
        storePatch.capabilities ?? resolveStoreCapabilities(store.capabilities),
      );
    }

    return successResponse({
      payoutDetails: sanitisePayoutDetails(details),
      emiEnabled,
      pricesIncludeGst,
      supportsShippingProtection,
      supportsSaleProtection,
      advancedListingTypesEnabled,
      // Echoed for the same reason as pricesIncludeGst above: a field a
      // form can send but never reads back is how a value silently
      // reverts on reload.
      gstin: data.gstin ?? store?.gstin ?? "",
      legalName: data.legalName ?? store?.legalName ?? "",
      registeredAddress: data.registeredAddress ?? store?.registeredAddress ?? "",
    }, "Payout details updated successfully.");
  },
}));