"use client";

import { useToast } from "@mohasinac/appkit/ui";
import { useRouter } from "@/i18n/navigation";
import { useCreateAddress } from "@/hooks";
import { Heading } from "@mohasinac/appkit/ui";
import { Card, AddressForm } from "@/components";
import type { AddressFormData } from "@/hooks";
import {
  THEME_CONSTANTS,
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";

export function AddAddressView() {
  const router = useRouter();
  const { showToast } = useToast();
  const tAddresses = useTranslations("addresses");
  const tActions = useTranslations("actions");

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
