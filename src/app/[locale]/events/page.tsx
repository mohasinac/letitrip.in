import { getTranslations } from "next-intl/server";
import { EventsListView } from "@/features/events";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("events");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    openGraph: { title, type: "website" },
  };
}

export default function EventsPage() {
  return <EventsListView />;
}
