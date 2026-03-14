/**
 * Admin Users Page
 *
 * Route: /admin/users/[[...action]]
 * Thin wrapper — all logic lives in AdminUsersView.
 */

import type { Metadata } from "next";
import { use } from "react";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { AdminUsersView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminUsers");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function AdminUsersPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminUsersView action={action} />;
}
