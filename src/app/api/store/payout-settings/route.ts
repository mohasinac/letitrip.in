/**
 * GET  /api/store/payout-settings — Returns masked payout details.
 * PATCH /api/store/payout-settings — Updates UPI or bank payout details.
 *   Bank account number is stored in full server-side; only masked form returned.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { userRepository, createApiHandler, successResponse } from "@mohasinac/appkit";
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
});

const bankSchema = z.object({
  method: z.literal("bank_transfer"),
  accountHolderName: z.string().min(2).max(100),
  accountNumber: z.string().min(9).max(18).regex(/^\d+$/, "Only digits"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  bankName: z.string().min(2).max(80),
  accountType: z.enum(["savings", "current"]),
});

const updatePayoutSchema = z.discriminatedUnion("method", [upiSchema, bankSchema]);

// --- GET ----------------------------------------------------------------------

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(createApiHandler({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ user }) => {
    return successResponse({
      payoutDetails: sanitisePayoutDetails(
        user!.payoutDetails as SellerPayoutDetails | undefined,
      ),
    });
  },
}));

// --- PATCH --------------------------------------------------------------------

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
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
      const masked = data.accountNumber.slice(-4).padStart(data.accountNumber.length, "•");
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

    return successResponse({
      payoutDetails: sanitisePayoutDetails(details),
    }, "Payout details updated successfully.");
  },
}));
