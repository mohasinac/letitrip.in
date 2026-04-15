/**
 * SellerStoreSetupView
 *
 * Shown the first time a seller visits /seller/store before they have a store.
 * Collects the minimum required information (storeName) to create a StoreDocument.
 * After creation the parent SellerStoreView re-fetches and switches to the full edit form.
 */

"use client";

import { useState, useCallback } from "react";
import { Heading, Text, Button, Alert } from "@mohasinac/appkit/ui";
import { SellerStoreSetupView as AppkitSellerStoreSetupView } from "@mohasinac/appkit/features/seller";
import { Card, FormField } from "@/components";
import { RichTextEditor } from "@/features/admin";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useSellerStore } from "../hooks";

const { spacing } = THEME_CONSTANTS;

interface SetupFormState {
  storeName: string;
  storeDescription: string;
  storeCategory: string;
}

const EMPTY: SetupFormState = {
  storeName: "",
  storeDescription: "",
  storeCategory: "",
};

export function SellerStoreSetupView() {
  const t = useTranslations("sellerStore");
  const { createStore, isCreating } = useSellerStore();

  const [form, setForm] = useState<SetupFormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const set = useCallback(
    (field: keyof SetupFormState) => (value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName.trim()) return;
    setError(null);
    try {
      await createStore({
        storeName: form.storeName.trim(),
        storeDescription: form.storeDescription || undefined,
        storeCategory: form.storeCategory || undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("setupFailed"));
    }
  };

  return (
    <AppkitSellerStoreSetupView
      isLoading={isCreating}
      className={`max-w-xl mx-auto ${spacing.stack}`}
      renderForm={() => (
        <>
          <div>
            <Heading level={2}>{t("setupTitle")}</Heading>
            <Text variant="secondary" size="sm" className="mt-1">
              {t("setupSubtitle")}
            </Text>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <Card>
            <form onSubmit={handleSubmit} className={spacing.stack}>
              <FormField
                name="storeName"
                label={t("storeName")}
                placeholder={t("storeNamePlaceholder")}
                value={form.storeName}
                onChange={set("storeName")}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("storeDescription")}
                </label>
                <RichTextEditor
                  content={form.storeDescription}
                  onChange={set("storeDescription")}
                  placeholder={t("storeDescriptionPlaceholder")}
                  minHeight="150px"
                  imageUploadConfig={{
                    folder: "stores",
                    context: {
                      type: "rich-text-image",
                      entity: "store-description",
                      name: form.storeName || "store",
                    },
                  }}
                />
              </div>

              <FormField
                name="storeCategory"
                label={t("storeCategory")}
                placeholder={t("storeCategoryPlaceholder")}
                value={form.storeCategory}
                onChange={set("storeCategory")}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!form.storeName.trim() || isCreating}
                  isLoading={isCreating}
                >
                  {isCreating ? t("setupSubmitting") : t("setupSubmit")}
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    />
  );
}

