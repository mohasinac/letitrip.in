import { getTranslations, setRequestLocale } from "next-intl/server";
import { EventsListView } from "@/features/events";
import { eventRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";
import type { EventListResponse } from "@mohasinac/feat-events";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    openGraph: { title, type: "website" },
  };
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const result = await eventRepository
    .list({
      filters: "status==active",
      sorts: "-startsAt",
      page: 1,
      pageSize: 24,
    })
    .catch(() => null);
  const initialData: EventListResponse | undefined = result
    ? {
        items: result.items.map((e) => ({
          ...e,
          startsAt:
            e.startsAt instanceof Date
              ? e.startsAt.toISOString()
              : String(e.startsAt),
          endsAt:
            e.endsAt instanceof Date
              ? e.endsAt.toISOString()
              : String(e.endsAt),
          createdAt:
            e.createdAt instanceof Date
              ? e.createdAt.toISOString()
              : String(e.createdAt),
          updatedAt:
            e.updatedAt instanceof Date
              ? e.updatedAt.toISOString()
              : String(e.updatedAt),
        })),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      }
    : undefined;
  return <EventsListView initialData={initialData} />;
}
