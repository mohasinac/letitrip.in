/**
 * GET /api/seller/payout-settings
 *   Returns the seller's saved payout details.
 *   Bank account numbers are masked (last 4 digits only) in the response.
 *
 * Mutations use Server Action: updatePayoutSettingsAction.
 */

import { userRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import type { SellerPayoutDetails } from "@/db/schema";

// ─── Helper ───────────────────────────────────────────────────────────────────

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
