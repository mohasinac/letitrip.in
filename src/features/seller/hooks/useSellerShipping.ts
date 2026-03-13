"use client";

import { useAuth, useMessage } from "@/hooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getSellerShippingAction,
  updateSellerShippingAction,
  verifyShiprocketPickupOtpAction,
} from "@/actions";
import { useTranslations } from "next-intl";
import type { SellerShippingConfig, SellerPickupAddress } from "@/db/schema";

export interface SellerShippingData {
  shippingConfig: Omit<
    SellerShippingConfig,
    "shiprocketToken" | "shiprocketTokenExpiry"
  > & {
    isTokenValid?: boolean;
  };
}

export type UpdateShippingPayload =
  | {
      method: "custom";
      customShippingPrice: number;
      customCarrierName: string;
    }
  | {
      method: "shiprocket";
      shiprocketCredentials?: { email: string; password: string };
      pickupAddress?: Omit<
        SellerPickupAddress,
        "isVerified" | "shiprocketAddressId"
      >;
    };

export interface VerifyPickupOtpPayload {
  otp: number;
  pickupLocationId: number;
}

/**
 * useSellerShipping
 * Fetches and manages the authenticated seller's shipping configuration.
 */
export function useSellerShipping() {
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("sellerShipping");

  const { data, isLoading, error, refetch } = useQuery<SellerShippingData>({
    queryKey: ["seller-shipping"],
    queryFn: async () => ({
      shippingConfig: (await getSellerShippingAction()) as any,
    }),
    enabled: !authLoading && !!user,
  });

  const { mutate: updateShipping, isPending: isSaving } = useMutation<
    SellerShippingData,
    Error,
    UpdateShippingPayload
  >({
    mutationFn: (payload) => updateSellerShippingAction(payload),
    onSuccess: () => {
      showSuccess(t("updateSuccess"));
      refetch();
    },
    onError: (err) => {
      showError(err?.message ?? t("updateError"));
    },
  });

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation<
    { message: string },
    Error,
    VerifyPickupOtpPayload
  >({
    mutationFn: (payload) => verifyShiprocketPickupOtpAction(payload),
    onSuccess: () => {
      showSuccess(t("pickupVerified"));
      refetch();
    },
    onError: (err) => {
      showError(err?.message ?? t("otpVerifyError"));
    },
  });

  return {
    shippingConfig: data?.shippingConfig ?? null,
    isConfigured: data?.shippingConfig?.isConfigured ?? false,
    isTokenValid: data?.shippingConfig?.isTokenValid ?? false,
    isLoading: authLoading || isLoading,
    isSaving,
    isVerifying,
    error,
    updateShipping,
    verifyOtp,
    refetch,
  };
}
