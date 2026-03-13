import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants";
import { TrackOrderView } from "@/features/about";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trackOrder");
  return {
    title: ` — `,
    description: t("metaDescription"),
  };
}

export default async function TrackOrderPage() {
  return <TrackOrderView />;
}
