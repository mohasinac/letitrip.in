"use client";

import { useApiQuery, useApiMutation, useAuth, useMessage } from "@/hooks";
import { sellerService } from "@/services";
import { useTranslations } from "next-intl";
import type { SellerPayoutDetails } from "@/db/schema";

export type SafePayoutDetails = Omit<SellerPayoutDetails, "bankAccount"> & {
  bankAccount?: Omit<NonNullable<SellerPayoutDetails["bankAccount"]>, "accountNumber">;
};

export interface SellerPayoutSettingsData {
  payoutDetails: SafePayoutDetails;
}

export type UpdatePayoutSettingsPayload =
  | { method: "upi"; upiId: string }
  | {
      method: "bank_transfer";
      bankAccount: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        accountType: "savings" | "current";
      };
    };

/**
 * useSellerPayoutSettings
 * Fetches and manages the authenticated seller's payout details.
 */
export function useSellerPayoutSettings() {
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("sellerPayoutSettings");

  const { data, isLoading, error, refetch } =
    useApiQuery<SellerPayoutSettingsData>({
      queryKey: ["seller-payout-settings"],
      queryFn: () => sellerService.getPayoutSettings(),
      enabled: !authLoading && !!user,
    });

  const { mutate: updatePayoutSettings, isLoading: isSaving } = useApiMutation<
    SellerPayoutSettingsData,
    UpdatePayoutSettingsPayload
  >({
    mutationFn: (payload) => sellerService.updatePayoutSettings(payload),
    onSuccess: () => {
      showSuccess(t("updateSuccess"));
      refetch();
    },
    onError: (err) => {
      showError(err?.message ?? t("updateError"));
    },
  });

  return {
    payoutDetails: data?.payoutDetails ?? null,
    isConfigured: data?.payoutDetails?.isConfigured ?? false,
    isLoading: authLoading || isLoading,
    isSaving,
    error,
    updatePayoutSettings,
    refetch,
  };
}
