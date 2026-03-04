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

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import { userRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthorizationError } from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
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
function sanitisePayoutDetails(
  details: SellerPayoutDetails | undefined,
): Omit<SellerPayoutDetails, "bankAccount"> & {
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

export async function GET() {
  try {
    const authUser = await requireAuth();
    const user = await userRepository.findById(authUser.uid);

    if (!user) {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    if (user.role !== "seller" && user.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    return successResponse({
      payoutDetails: sanitisePayoutDetails(user.payoutDetails),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const user = await userRepository.findById(authUser.uid);

    if (!user) {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    if (user.role !== "seller" && user.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    const body = await request.json();
    const validation = updatePayoutSettingsSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const data = validation.data;
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

    await userRepository.update(authUser.uid, { payoutDetails });

    serverLogger.info("Seller payout details updated", {
      uid: authUser.uid,
      method: payoutDetails.method,
    });

    return successResponse(
      { payoutDetails: sanitisePayoutDetails(payoutDetails) },
      SUCCESS_MESSAGES.PAYOUT_SETTINGS.UPDATED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
