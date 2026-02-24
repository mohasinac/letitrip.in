"use client";

import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { EmptyState, Spinner } from "@/components";
import { EventCard } from "@/features/events";
import type { EventDocument } from "@/db/schema";

interface EventsListResponse {
  items: EventDocument[];
}

const { themed, spacing, typography } = THEME_CONSTANTS;

export default function EventsPage() {
  const { data: activeData, isLoading } = useApiQuery<EventsListResponse>({
    queryKey: ["public-events-active"],
    queryFn: () =>
      apiClient.get<EventsListResponse>(
        `${API_ENDPOINTS.EVENTS.LIST}?status=active&sorts=-startsAt&pageSize=20`,
      ),
  });

  const { data: pastData, isLoading: pastLoading } =
    useApiQuery<EventsListResponse>({
      queryKey: ["public-events-past"],
      queryFn: () =>
        apiClient.get<EventsListResponse>(
          `${API_ENDPOINTS.EVENTS.LIST}?status=ended&sorts=-endsAt&pageSize=6`,
        ),
    });

  const activeEvents = activeData?.items ?? [];
  const pastEvents = pastData?.items ?? [];

  return (
    <div className={spacing.stack}>
      {/* Current Events */}
      <section>
        <h1 className={`${typography.h2} ${themed.textPrimary} mb-4`}>
          {UI_LABELS.EVENTS.CURRENT_EVENTS}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : activeEvents.length === 0 ? (
          <EmptyState
            title={UI_LABELS.EVENTS.NO_ACTIVE_EVENTS}
            description={UI_LABELS.EVENTS.NO_ACTIVE_EVENTS_DESC}
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
            {UI_LABELS.EVENTS.PAST_EVENTS}
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
