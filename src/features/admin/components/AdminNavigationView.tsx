"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import {
  AdminPageHeader,
  Button,
  Card,
  Text,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  useToast,
} from "@/components";
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
      <div className={`${THEME_CONSTANTS.spacing.stack} w-full`}>
        <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
        <Card>
          <div className="text-center py-10">{tLoading("default")}</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${THEME_CONSTANTS.spacing.stack} w-full`}>
        <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
        <Card>
          <div className="text-center py-10">
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
        actionLabel={isSaving ? tLoading("saving") : tActions("save")}
        onAction={handleSave}
        actionDisabled={isSaving}
      />

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

      {/* Mobile floating save */}
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
