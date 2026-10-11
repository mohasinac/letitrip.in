/**
 * GET  /api/store/payout-settings â€” Returns masked payout details.
 * PATCH /api/store/payout-settings â€” Updates UPI or bank payout details.
 *   Bank account number is stored in full server-side; only masked form returned.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { userRepository, storeRepository, createApiHandler, successResponse } from "@mohasinac/appkit";
import type { SellerPayoutDetails } from "@mohasinac/appkit";
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
      } = {};
      if (data.emiEnabled !== undefined) storePatch.emiEnabled = data.emiEnabled;
      if (data.pricesIncludeGst !== undefined) storePatch.pricesIncludeGst = data.pricesIncludeGst;
      if (data.supportsShippingProtection !== undefined) storePatch.supportsShippingProtection = data.supportsShippingProtection;
      if (data.supportsSaleProtection !== undefined) storePatch.supportsSaleProtection = data.supportsSaleProtection;
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
    }, "Payout details updated successfully.");
  },
}));