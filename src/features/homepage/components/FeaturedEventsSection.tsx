"use client";

import { useTranslations } from "next-intl";
import { useEvents } from "@mohasinac/appkit/features/events";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { SectionCarousel } from "@mohasinac/appkit/features/homepage";
import { EventCard } from "@mohasinac/appkit/features/events";
import { Link } from "@/i18n/navigation";

export function FeaturedEventsSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { events, isLoading } = useEvents({ pageSize: 12, sort: "-createdAt" });

  if (!isLoading && events.length === 0) return null;

  return (
    <SectionCarousel
      title={t("featuredEvents")}
      description={t("featuredEventsSubtitle")}
      headingVariant="editorial"
      pillLabel={t("eventsPill")}
      viewMoreHref={ROUTES.PUBLIC.EVENTS}
      viewMoreLabel={tActions("viewAllArrow")}
      items={events}
      renderItem={(event) => (
        <Link href={ROUTES.PUBLIC.EVENT_DETAIL(event.id)} className="block">
          <EventCard event={event} className="h-full" />
        </Link>
      )}
      perView={{ base: 2, sm: 3, md: 4 }}
      gap={12}
      autoScroll
      autoScrollInterval={5000}
      keyExtractor={(e) => e.id}
      isLoading={isLoading}
      skeletonCount={5}
      className={THEME_CONSTANTS.themed.bgSecondary}
    />
  );
}

