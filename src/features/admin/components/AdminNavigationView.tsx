"use client";

import { useToast } from "@mohasinac/appkit/ui";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Text, Button } from "@mohasinac/appkit/ui";
import { AdminNavigationView as AppkitAdminNavigationView } from "@mohasinac/appkit/features/admin";
import {
  AdminPageHeader, Card, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components";
import { useAdminSiteSettings } from "../hooks/useAdminSiteSettings";
import { NavbarConfigForm } from "./NavbarConfigForm";
import { FooterConfigForm } from "./FooterConfigForm";
import type { SiteSettingsDocument } from "@/db/schema";

export function AdminNavigationView() {
  const { showToast } = useToast();
  const t = useTranslations("adminNavigation");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");

  const { data, isLoading, error, refetch, updateMutation } =
    useAdminSiteSettings();

  const [settings, setSettings] = useState<Partial<SiteSettingsDocument>>({});
  const isSaving = updateMutation.isPending;

  // Seed local state when data loads
  const [hydrated, setHydrated] = useState(false);
  if (data && !hydrated) {
    setSettings(data as Partial<SiteSettingsDocument>);
    setHydrated(true);
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        navbarConfig: settings.navbarConfig,
        footerConfig: settings.footerConfig,
      } as any);
      await refetch();
      showToast(t("saveSuccess"), "success");
    } catch {
      showToast(t("saveFailed"), "error");
    }
  };

  if (isLoading) {
    return (
      <AppkitAdminNavigationView
        renderHeader={() => (
          <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
        )}
        isLoading
        renderTable={() => (
          <Card>
            <div className="text-center py-10">{tLoading("default")}</div>
          </Card>
        )}
      />
    );
  }

  if (error) {
    return (
      <AppkitAdminNavigationView
        renderHeader={() => (
          <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
        )}
        renderTable={() => (
          <Card>
            <div className="text-center py-10">
              <Text className="text-red-600 mb-4">{error.message}</Text>
              <Button variant="outline" onClick={() => refetch()}>
                {tActions("retry")}
              </Button>
            </div>
          </Card>
        )}
      />
    );
  }

  return (
    <AppkitAdminNavigationView
      renderHeader={() => (
        <AdminPageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actionLabel={isSaving ? tLoading("saving") : tActions("save")}
          onAction={handleSave}
          actionDisabled={isSaving}
        />
      )}
      renderTable={() => (
        <Tabs defaultValue="navbar">
          <TabsList>
            <TabsTrigger value="navbar">{t("navbarTab")}</TabsTrigger>
            <TabsTrigger value="footer">{t("footerTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="navbar">
            <NavbarConfigForm settings={settings} onChange={setSettings} />
          </TabsContent>

          <TabsContent value="footer">
            <FooterConfigForm settings={settings} onChange={setSettings} />
          </TabsContent>
        </Tabs>
      )}
      renderDrawer={() => (
        /* Mobile floating save */
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
      )}
    />
  );
}

