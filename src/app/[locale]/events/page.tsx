import { getTranslations, setRequestLocale } from "next-intl/server";
import { EventsListView } from "@/features/events/components";
import { eventRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import { dateToISOString } from "@/utils";
import type { Metadata } from "next";
import type { EventListResponse } from "@mohasinac/appkit/features/events";
import { resolveLocale } from "@/i18n/resolve-locale";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "events" });
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    openGraph: { title, type: "website" },
  };
}

export default async function EventsPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
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
          startsAt: dateToISOString(e.startsAt),
          endsAt: dateToISOString(e.endsAt),
          createdAt: dateToISOString(e.createdAt),
          updatedAt: dateToISOString(e.updatedAt),
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
