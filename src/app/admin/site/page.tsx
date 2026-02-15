/**
 * AdminSiteSettings Page
 * Path: /admin/site
 *
 * Orchestrates site settings forms: basic info, contact, social links, backgrounds.
 * Sub-components handle individual form sections.
 */

"use client";

import { useState, useEffect } from "react";
import { THEME_CONSTANTS, UI_LABELS, API_ENDPOINTS } from "@/constants";
import {
  Button,
  BackgroundSettings,
  AdminPageHeader,
  Card,
} from "@/components";
import { useToast } from "@/components";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  SiteBasicInfoForm,
  SiteContactForm,
  SiteSocialLinksForm,
} from "@/components/admin/site";
import type { SiteSettingsDocument } from "@/db/schema";

export default function AdminSiteSettings() {
  const { showToast } = useToast();

  const { data, isLoading, error, refetch } = useApiQuery<{
    data: SiteSettingsDocument;
  }>({
    queryKey: ["site-settings"],
    queryFn: () => apiClient.get(API_ENDPOINTS.SITE_SETTINGS.GET),
  });

  const updateMutation = useApiMutation<any, Partial<SiteSettingsDocument>>({
    mutationFn: (data) =>
      apiClient.patch(API_ENDPOINTS.SITE_SETTINGS.UPDATE, data),
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

  // Load settings from API when data is fetched
  useEffect(() => {
    if (data?.data) {
      setSettings(data.data);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutate(settings);
      await refetch();
      showToast(UI_LABELS.ADMIN.SITE.SETTINGS_SAVED, "success");
    } catch {
      showToast(UI_LABELS.ADMIN.SITE.SETTINGS_FAILED, "error");
    }
  };

  const isSaving = updateMutation.isLoading;

  if (isLoading) {
    return (
      <div className={`${THEME_CONSTANTS.spacing.stack} sm:space-y-6 w-full`}>
        <AdminPageHeader
          title={UI_LABELS.ADMIN.SITE.TITLE}
          subtitle={UI_LABELS.ADMIN.SITE.SUBTITLE}
        />
        <Card>
          <div className="text-center py-8">{UI_LABELS.LOADING.DEFAULT}</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${THEME_CONSTANTS.spacing.stack} sm:space-y-6 w-full`}>
        <AdminPageHeader
          title={UI_LABELS.ADMIN.SITE.TITLE}
          subtitle={UI_LABELS.ADMIN.SITE.SUBTITLE}
        />
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>{UI_LABELS.ACTIONS.RETRY}</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${THEME_CONSTANTS.spacing.stack} sm:space-y-6 w-full`}>
      <AdminPageHeader
        title={UI_LABELS.ADMIN.SITE.TITLE}
        subtitle={UI_LABELS.ADMIN.SITE.SUBTITLE}
        actionLabel={
          isSaving
            ? UI_LABELS.LOADING.SAVING
            : UI_LABELS.ADMIN.SITE.SAVE_ALL_CHANGES
        }
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
          {isSaving ? UI_LABELS.LOADING.SAVING : `💾 ${UI_LABELS.ACTIONS.SAVE}`}
        </Button>
      </div>
    </div>
  );
}
