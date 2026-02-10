/**
 * AdminSiteSettings Page
 * Path: /admin/site
 *
 * Orchestrates site settings forms: basic info, contact, social links, backgrounds.
 * Sub-components handle individual form sections.
 */

"use client";

import { useState } from "react";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { Button, BackgroundSettings, AdminPageHeader } from "@/components";
import { useToast } from "@/components";
import { logger } from "@/classes";
import {
  SiteBasicInfoForm,
  SiteContactForm,
  SiteSocialLinksForm,
} from "@/components/admin/site";
import type { SiteSettingsDocument } from "@/db/schema";

export default function AdminSiteSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save settings
      logger.info("Saving settings:", settings);
      showToast(UI_LABELS.ADMIN.SITE.SETTINGS_SAVED, "success");
    } catch {
      showToast(UI_LABELS.ADMIN.SITE.SETTINGS_FAILED, "error");
    } finally {
      setIsSaving(false);
    }
  };

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
