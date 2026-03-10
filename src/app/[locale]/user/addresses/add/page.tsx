"use client";

import { useEffect } from "react";
import { useAuth, useCreateAddress } from "@/hooks";
import { Card, Heading, Spinner, AddressForm, useToast } from "@/components";
import type { AddressFormData } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import {
  THEME_CONSTANTS,
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";

export default function AddAddressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const tAddresses = useTranslations("addresses");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  const { mutate: createAddress, isPending: saving } = useCreateAddress({
    onSuccess: () => {
      showToast(SUCCESS_MESSAGES.ADDRESS.CREATED, "success");
      router.push(ROUTES.USER.ADDRESSES);
    },
    onError: (error: any) => {
      showToast(
        error?.message ?? ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
        "error",
      );
    },
  });

  const handleSubmit = (data: AddressFormData) => {
    createAddress(data);
  };

  const handleCancel = () => {
    router.push(ROUTES.USER.ADDRESSES);
  };

  const { flex } = THEME_CONSTANTS;

  if (loading) {
    return (
      <div className={`${flex.center} min-h-screen`}>
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl">
      <div className={THEME_CONSTANTS.spacing.stack}>
        <Heading level={3}>{tAddresses("add")}</Heading>

        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <AddressForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={saving}
            submitLabel={tActions("create")}
          />
        </Card>
      </div>
    </div>
  );
}
