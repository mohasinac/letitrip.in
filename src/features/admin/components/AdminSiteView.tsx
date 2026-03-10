/**
 * AdminSiteView
 *
 * Tier 2 — feature component.
 * Extracted from src/app/[locale]/admin/site/page.tsx (was 162 lines).
 * Manages site settings: basic info, contact, social links, backgrounds.
 */

"use client";

import { useState, useEffect } from "react";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { AdminPageHeader, Button, Card, Text, useToast } from "@/components";
import BackgroundSettings from "./BackgroundSettings";
import { useAlgoliaSyncProducts, useAlgoliaSyncPages } from "@/hooks";
import { useAdminSiteSettings } from "../hooks/useAdminSiteSettings";
import {
  SiteBasicInfoForm,
  SiteContactForm,
  SiteSocialLinksForm,
  SiteCommissionsForm,
  SiteCredentialsForm,
} from ".";
import type { CredentialsUpdateValues } from ".";
import type {
  SiteSettingsDocument,
  SiteSettingsCredentialsMasked,
} from "@/db/schema";

export function AdminSiteView() {
  const { showToast } = useToast();
  const t = useTranslations("adminSite");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");

  const { data, isLoading, error, refetch, updateMutation } =
    useAdminSiteSettings();

  const [settings, setSettings] = useState<Partial<SiteSettingsDocument>>({
    siteName: "LetItRip",
    motto: "Your Marketplace, Your Rules",
    background: {
      light: {
        type: "color",
        value: "#f9fafb",
        overlay: { enabled: false, color: "#000000", opacity: 0 },
      },
      dark: {
        type: "color",
        value: "#030712",
        overlay: { enabled: false, color: "#000000", opacity: 0 },
      },
    },
    contact: {
      email: "support@letitrip.in",
      phone: "+91-XXXXXXXXXX",
      address: "Marketplace Street, India",
    },
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
  });

  // Masked credential values from the API — shown as hints in SiteCredentialsForm
  const [maskedCredentials, setMaskedCredentials] =
    useState<SiteSettingsCredentialsMasked>({});

  // New credential values entered by the admin (plaintext — never stored here, sent to API once)
  const [credentialsUpdates, setCredentialsUpdates] =
    useState<CredentialsUpdateValues>({});

  useEffect(() => {
    if (data) {
      // Strip credentialsMasked out of the regular settings state
      const { credentialsMasked, ...rest } = data as any;
      setSettings(rest);
      if (credentialsMasked) setMaskedCredentials(credentialsMasked);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      // Build payload: regular settings + any new credential values the admin typed
      const payload: Partial<SiteSettingsDocument> & {
        credentials?: CredentialsUpdateValues;
      } = { ...settings };

      // Include credentials only when at least one field is non-empty
      const hasNewCredential = Object.values(credentialsUpdates).some((v) => v);
      if (hasNewCredential) {
        (payload as any).credentials = credentialsUpdates;
        // Also sync whatsappNumber into contact if the admin changed it
        if (credentialsUpdates.whatsappNumber) {
          payload.contact = {
            ...payload.contact,
            whatsappNumber: credentialsUpdates.whatsappNumber,
          } as any;
        }
      }

      await updateMutation.mutateAsync(payload as any);
      await refetch();
      // Reset credential fields so they don't re-submit on the next save
      setCredentialsUpdates({});
      showToast(t("settingsSaved"), "success");
    } catch {
      showToast(t("settingsFailed"), "error");
    }
  };

  const isSaving = updateMutation.isPending;

  // ── Algolia sync mutations ────────────────────────────────────────────────
  const syncProductsMutation = useAlgoliaSyncProducts();
  const syncPagesMutation = useAlgoliaSyncPages();

  const handleAlgoliaSync = async (
    mutate: () => Promise<{ indexed?: number } | undefined>,
    label: string,
  ) => {
    try {
      const result = await mutate();
      showToast(`✅ Indexed ${result?.indexed ?? 0} records`, "success");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : `${label} sync failed`,
        "error",
      );
    }
  };

  if (isLoading) {
    return (
      <div className={`${THEME_CONSTANTS.spacing.stack} sm:space-y-6 w-full`}>
        <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
        <Card>
          <div className="text-center py-8">{tLoading("default")}</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${THEME_CONSTANTS.spacing.stack} sm:space-y-6 w-full`}>
        <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
        <Card>
          <div className="text-center py-8">
            <Text className="text-red-600 mb-4">{error.message}</Text>
            <Button variant="outline" onClick={() => refetch()}>
              {tActions("retry")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${THEME_CONSTANTS.spacing.stack} sm:space-y-6 w-full`}>
      <AdminPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actionLabel={isSaving ? tLoading("saving") : t("saveAllChanges")}
        onAction={handleSave}
        actionDisabled={isSaving}
      />

      <BackgroundSettings
        lightMode={settings.background?.light!}
        darkMode={settings.background?.dark!}
        onChange={(mode, config) => {
          setSettings({
            ...settings,
            background: {
              ...settings.background!,
              [mode]: config,
            },
          });
        }}
      />

      <SiteBasicInfoForm settings={settings} onChange={setSettings} />

      <SiteContactForm settings={settings} onChange={setSettings} />

      <SiteSocialLinksForm settings={settings} onChange={setSettings} />

      <SiteCommissionsForm settings={settings} onChange={setSettings} />

      <SiteCredentialsForm
        maskedCredentials={maskedCredentials}
        whatsappNumber={settings.contact?.whatsappNumber}
        onChange={setCredentialsUpdates}
      />

      {/* Algolia Search Tools */}
      <Card>
        <div className="p-4 sm:p-6">
          <Text className="font-semibold text-base mb-1">
            {t("algoliaTitle")}
          </Text>
          <Text variant="secondary" size="sm" className="mb-4">
            {t("algoliaSubtitle")}
          </Text>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                handleAlgoliaSync(
                  () => syncProductsMutation.mutateAsync(undefined),
                  "Products",
                )
              }
              disabled={syncProductsMutation.isPending}
            >
              {syncProductsMutation.isPending
                ? "⏳ Syncing products…"
                : "🔄 Sync Products → Algolia"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                handleAlgoliaSync(
                  () => syncPagesMutation.mutateAsync(undefined),
                  "Pages",
                )
              }
              disabled={syncPagesMutation.isPending}
            >
              {syncPagesMutation.isPending
                ? "⏳ Syncing pages…"
                : "🔄 Sync Pages → Algolia"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Floating Save Button for Mobile */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 block sm:hidden">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="primary"
          className="shadow-xl"
        >
          {isSaving ? tLoading("saving") : `💾 ${tActions("save")}`}
        </Button>
      </div>
    </div>
  );
}
