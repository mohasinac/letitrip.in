"use client";

import { EventCard } from "@/components/events/EventCard";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const { isLoading: loading, execute } = useLoadingState({
    initialData: [],
    onLoadError: (error) => {
      logError(error, { component: "EventsPage.loadEvents" });
    },
  });

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    await execute(async () => {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("type", filter);
      }
      params.append("upcoming", "true");

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load events");

      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Events
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover and join upcoming events
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            "all",
            "workshop",
            "seminar",
            "competition",
            "poll",
            "announcement",
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === type
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No upcoming events found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                href={`/events/${event.id}`}
                showStatus
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
