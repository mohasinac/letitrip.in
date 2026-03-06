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
import {
  AdminPageHeader,
  BackgroundSettings,
  Button,
  Card,
  Text,
  useToast,
} from "@/components";
import { useApiQuery, useApiMutation } from "@/hooks";
import { siteSettingsService } from "@/services";
import { SiteBasicInfoForm, SiteContactForm, SiteSocialLinksForm } from ".";
import type { SiteSettingsDocument } from "@/db/schema";

export function AdminSiteView() {
  const { showToast } = useToast();
  const t = useTranslations("adminSite");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");

  const { data, isLoading, error, refetch } = useApiQuery<{
    data: SiteSettingsDocument;
  }>({
    queryKey: ["site-settings"],
    queryFn: () => siteSettingsService.get(),
  });

  const updateMutation = useApiMutation<any, Partial<SiteSettingsDocument>>({
    mutationFn: (data) => siteSettingsService.update(data),
  });

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

  useEffect(() => {
    if (data?.data) {
      setSettings(data.data);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutate(settings);
      await refetch();
      showToast(t("settingsSaved"), "success");
    } catch {
      showToast(t("settingsFailed"), "error");
    }
  };

  const isSaving = updateMutation.isLoading;

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
