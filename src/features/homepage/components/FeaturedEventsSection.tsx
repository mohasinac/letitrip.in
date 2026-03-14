"use client";

import { useTranslations } from "next-intl";
import { useFeaturedEvents } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { EventCard } from "@/components";
import { SectionCarousel } from "./SectionCarousel";

export function FeaturedEventsSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useFeaturedEvents();

  const events = data?.items ?? [];

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
      renderItem={(event) => <EventCard event={event} />}
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
