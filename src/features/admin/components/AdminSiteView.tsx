import { Button, Row } from "@mohasinac/appkit/ui";
/**
 * AdminSiteView — Thin Adapter
 *
 * Tier 2 — feature component.
 * Uses appkit AdminSiteView shell + letitrip business logic.
 * Manages site settings: basic info, contact, social links, backgrounds.
 */

("use client");

import { useState, useEffect } from "react";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { AdminSiteView as AppkitAdminSiteView } from "@mohasinac/appkit/features/admin";
import { AdminPageHeader, Card, useToast } from "@/components";
import BackgroundSettings from "./BackgroundSettings";
import { useAlgoliaSyncProducts, useAlgoliaSyncPages } from "@/features/admin";
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

  const [maskedCredentials, setMaskedCredentials] =
    useState<SiteSettingsCredentialsMasked>({});
  const [credentialsUpdates, setCredentialsUpdates] =
    useState<CredentialsUpdateValues>({});

  useEffect(() => {
    if (data) {
      const { credentialsMasked, ...rest } = data as any;
      setSettings(rest);
      if (credentialsMasked) setMaskedCredentials(credentialsMasked);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      const payload: Partial<SiteSettingsDocument> & {
        credentials?: CredentialsUpdateValues;
      } = { ...settings };

      const hasNewCredential = Object.values(credentialsUpdates).some((v) => v);
      if (hasNewCredential) {
        (payload as any).credentials = credentialsUpdates;
        if (credentialsUpdates.whatsappNumber) {
          payload.contact = {
            ...payload.contact,
            whatsappNumber: credentialsUpdates.whatsappNumber,
          } as any;
        }
      }

      await updateMutation.mutateAsync(payload as any);
      await refetch();
      setCredentialsUpdates({});
      showToast(t("settingsSaved"), "success");
    } catch {
      showToast(t("settingsFailed"), "error");
    }
  };

  const isSaving = updateMutation.isPending;
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

  return (
    <AppkitAdminSiteView
      renderHeader={() => (
        <AdminPageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actionLabel={isSaving ? tLoading("saving") : t("saveAllChanges")}
          onAction={handleSave}
          actionDisabled={isSaving || isLoading}
        />
      )}
      renderForm={() => (
        <div className={`${THEME_CONSTANTS.spacing.stack} sm:space-y-6`}>
          {isLoading && (
            <Card>
              <div className="text-center py-8">{tLoading("default")}</div>
            </Card>
          )}

          {error && (
            <Card>
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error.message}</div>
                <Button variant="outline" onClick={() => refetch()}>
                  {tActions("retry")}
                </Button>
              </div>
            </Card>
          )}

          {!isLoading && !error && (
            <>
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
                  <div className="font-semibold text-base mb-1">
                    {t("algoliaTitle")}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                    {t("algoliaSubtitle")}
                  </div>
                  <Row wrap gap="md">
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
                  </Row>
                </div>
              </Card>
            </>
          )}
        </div>
      )}
      className={`${THEME_CONSTANTS.spacing.stack} sm:space-y-6 w-full`}
    />
  );
}
