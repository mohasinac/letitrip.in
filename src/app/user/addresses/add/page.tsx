"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { Card, Heading, Spinner, AddressForm, useToast } from "@/components";
import type { AddressFormData } from "@/hooks";
import { useRouter } from "next/navigation";
import { logger } from "@/classes";
import {
  UI_LABELS,
  THEME_CONSTANTS,
  ROUTES,
  API_ENDPOINTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";

export default function AddAddressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  const handleSubmit = async (data: AddressFormData) => {
    setSaving(true);

    try {
      const response = await fetch(API_ENDPOINTS.ADDRESSES.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
        );
      }

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
        <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl">
      <div className={THEME_CONSTANTS.spacing.stack}>
        <Heading level={3}>{UI_LABELS.USER.ADDRESSES.ADD}</Heading>

        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <AddressForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={saving}
            submitLabel={UI_LABELS.ACTIONS.CREATE}
          />
        </Card>
      </div>
    </div>
  );
}
