/**
 * Seller Payout Settings API
 *
 * GET  /api/seller/payout-settings
 *   Returns the seller's saved payout details.
 *   Bank account numbers are masked (last 4 digits only) in the response.
 *
 * PATCH /api/seller/payout-settings
 *   Save or update UPI ID or bank account details.
 *   Only admin/system reads the full account number — this endpoint stores it
 *   server-side and only returns the masked version to the client.
 */

import { z } from "zod";
import { userRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import type { SellerPayoutDetails } from "@/db/schema";

// ─── Schemas ────────────────────────────────────────────────────────────────

const bankAccountSchema = z.object({
  accountHolderName: z.string().min(2).max(100),
  accountNumber: z
    .string()
    .regex(/^\d{9,18}$/, "Account number must be 9–18 digits"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code (e.g. HDFC0001234)"),
  bankName: z.string().min(2).max(100),
  accountType: z.enum(["savings", "current"]).default("savings"),
});

const updatePayoutSettingsSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("upi"),
    upiId: z
      .string()
      .regex(
        /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/,
        "Please enter a valid UPI ID (e.g. name@upi)",
      ),
  }),
  z.object({
    method: z.literal("bank_transfer"),
    bankAccount: bankAccountSchema,
  }),
]);

// ─── Helper: mask account number ─────────────────────────────────────────────

function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return "****";
  return "X".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

/**
 * Strip full account number from client response.
 * Only the masked version is returned.
 */
function sanitisePayoutDetails(details: SellerPayoutDetails | undefined): Omit<
  SellerPayoutDetails,
  "bankAccount"
> & {
  bankAccount?: Omit<
    NonNullable<SellerPayoutDetails["bankAccount"]>,
    "accountNumber"
  >;
} {
  if (!details) return { method: "upi", isConfigured: false };
  if (!details.bankAccount) return details;
  const { accountNumber: _removed, ...safeBank } = details.bankAccount;
  return { ...details, bankAccount: safeBank };
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export const GET = createApiHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }) => {
    return successResponse({
      payoutDetails: sanitisePayoutDetails(user!.payoutDetails),
    });
  },
});

// ─── PATCH ────────────────────────────────────────────────────────────────────

export const PATCH = createApiHandler<
  (typeof updatePayoutSettingsSchema)["_output"]
>({
  auth: true,
  roles: ["seller", "admin"],
  schema: updatePayoutSettingsSchema,
  handler: async ({ user, body }) => {
    const data = body!;
    let payoutDetails: SellerPayoutDetails;

    if (data.method === "upi") {
      payoutDetails = {
        method: "upi",
        upiId: data.upiId,
        isConfigured: true,
      };
    } else {
      const { accountNumber, ...bankRest } = data.bankAccount;
      payoutDetails = {
        method: "bank_transfer",
        bankAccount: {
          ...bankRest,
          accountNumber, // Full number stored server-side only
          accountNumberMasked: maskAccountNumber(accountNumber),
        },
        isConfigured: true,
      };
    }

    await userRepository.update(user!.uid, { payoutDetails });

    serverLogger.info("Seller payout details updated", {
      uid: user!.uid,
      method: payoutDetails.method,
    });

    return successResponse(
      { payoutDetails: sanitisePayoutDetails(payoutDetails) },
      SUCCESS_MESSAGES.PAYOUT_SETTINGS.UPDATED,
    );
  },
});
