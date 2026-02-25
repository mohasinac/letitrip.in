"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { Card, Heading, Spinner, AddressForm, useToast } from "@/components";
import type { AddressFormData } from "@/hooks";
import { useRouter } from "next/navigation";
import { logger } from "@/classes";
import { apiClient } from "@/lib/api-client";
import {
  THEME_CONSTANTS,
  ROUTES,
  API_ENDPOINTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";

export default function AddAddressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const tAddresses = useTranslations("addresses");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  const handleSubmit = async (data: AddressFormData) => {
    setSaving(true);

    try {
      await apiClient.post(API_ENDPOINTS.ADDRESSES.CREATE, data);

      showToast(SUCCESS_MESSAGES.ADDRESS.CREATED, "success");
      router.push(ROUTES.USER.ADDRESSES);
    } catch (error) {
      logger.error("Error saving address:", error);
      showToast(
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.USER.ADDRESSES);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
