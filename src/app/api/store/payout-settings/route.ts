/**
 * GET  /api/store/payout-settings â€” Returns masked payout details.
 * PATCH /api/store/payout-settings â€” Updates UPI or bank payout details.
 *   Bank account number is stored in full server-side; only masked form returned.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
// The ONE GSTIN validator -- shape plus the base-36 check character. Shared
// with the platform-GSTIN gate in site settings rather than re-derived.
import { isValidGstin } from "@mohasinac/appkit";
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
    }

    return successResponse({
      payoutDetails: sanitisePayoutDetails(details),
      emiEnabled,
      pricesIncludeGst,
      supportsShippingProtection,
      supportsSaleProtection,
      // Echoed for the same reason as pricesIncludeGst above: a field a
      // form can send but never reads back is how a value silently
      // reverts on reload.
      gstin: data.gstin ?? store?.gstin ?? "",
      legalName: data.legalName ?? store?.legalName ?? "",
      registeredAddress: data.registeredAddress ?? store?.registeredAddress ?? "",
    }, "Payout details updated successfully.");
  },
}));