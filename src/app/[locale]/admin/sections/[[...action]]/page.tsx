/**
 * Admin Sections Page
 *
 * Route: /admin/sections/[[...action]]
 * Thin wrapper — all logic lives in AdminSectionsView.
 */

import type { Metadata } from "next";
import { use } from "react";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { AdminSectionsView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminSections");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function AdminSectionsPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminSectionsView action={action} />;
}
