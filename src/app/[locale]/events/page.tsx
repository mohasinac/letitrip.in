"use client";

import { useApiQuery } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { EmptyState, Spinner } from "@/components";
import { EventCard } from "@/features/events";
import { eventService } from "@/services";
import type { EventDocument } from "@/db/schema";

interface EventsListResponse {
  items: EventDocument[];
}

const { themed, spacing, typography } = THEME_CONSTANTS;

export default function EventsPage() {
  const t = useTranslations("events");
  const { data: activeData, isLoading } = useApiQuery<EventsListResponse>({
    queryKey: ["public-events-active"],
    queryFn: () =>
      eventService.list("status=active&sorts=-startsAt&pageSize=20"),
  });

  const { data: pastData, isLoading: pastLoading } =
    useApiQuery<EventsListResponse>({
      queryKey: ["public-events-past"],
      queryFn: () => eventService.list("status=ended&sorts=-endsAt&pageSize=6"),
    });

  const activeEvents = activeData?.items ?? [];
  const pastEvents = pastData?.items ?? [];

  return (
    <div className={spacing.stack}>
      {/* Current Events */}
      <section>
        <h1 className={`${typography.h2} ${themed.textPrimary} mb-4`}>
          {t("currentEvents")}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : activeEvents.length === 0 ? (
          <EmptyState
            title={t("noActiveEvents")}
            description={t("noActiveEventsDesc")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {!pastLoading && pastEvents.length > 0 && (
        <section className="mt-10">
          <h2 className={`${typography.h3} ${themed.textPrimary} mb-4`}>
            {t("pastEvents")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
