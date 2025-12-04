"use client";

import { EventBanner } from "@/components/events/EventBanner";
import { EventCountdown } from "@/components/events/EventCountdown";
import { PollVoting } from "@/components/events/PollVoting";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { eventsService, type Event } from "@/services/events.service";
import { Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [pollResults, setPollResults] = useState<any>(null);
  const [registering, setRegistering] = useState(false);

  const { isLoading: loading, execute } = useLoadingState({
    onLoadError: (error) => {
      logError(error as Error, { component: "EventDetail.loadEvent" });
    },
  });

  useEffect(() => {
    loadEvent();
    if (user) {
      checkRegistration();
    }
  }, [eventId, user]);

  const loadEvent = async () => {
    await execute(async () => {
      const data = await eventsService.getById(eventId);
      if (data.success) {
        setEvent(data.event);

        // Load poll results if poll event
        if ((data.event as any).isPollEvent) {
          await loadPollResults();
        }
      }
    });
  };

  const checkRegistration = async () => {
    await execute(async () => {
      const data = await eventsService.checkRegistration(eventId);
      if (data.success) {
        setIsRegistered(data.registered);
      }
    });
  };

  const loadPollResults = async () => {
    await execute(async () => {
      const data = await eventsService.checkVote(eventId);
      if (data.success) {
        setPollResults(data);
      }
    });
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please login to register");
      router.push("/login");
      return;
    }

    setRegistering(true);

    await execute(async () => {
      await eventsService.register(eventId);
      toast.success("Successfully registered for event!");
      setIsRegistered(true);
      await loadEvent();
    });

    setRegistering(false);
  };

  const handleVote = async (optionId: string) => {
    if (!user) {
      toast.error("Please login to vote");
      router.push("/login");
      return;
    }

    try {
      await eventsService.vote(eventId, optionId);
      // Reload poll results
      await loadPollResults();
    } catch (error) {
      logError(error as Error, {
        component: "EventDetail.handleVote",
        context: { eventId, optionId },
      });
      toast.error("Failed to vote");
    }
  };

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Event not found
        </h1>
        <Link
          href="/events"
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isUpcoming = startDate > now;
  const isActive = startDate <= now && now <= endDate;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Banner */}
        <div className="mb-8">
          <EventBanner
            event={event}
            isRegistered={isRegistered}
            onRegister={handleRegister}
            showRegistrationButton={!event.isPollEvent && isUpcoming}
          />
        </div>

        {/* Countdown for upcoming events */}
        {isUpcoming && (
          <div className="mb-8">
            <EventCountdown
              targetDate={event.startDate}
              label="Event starts in"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Poll Voting */}
            {event.isPollEvent && pollResults && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <PollVoting
                  eventId={eventId}
                  options={pollResults.options}
                  totalVotes={pollResults.totalVotes}
                  isActive={isActive}
                  allowMultipleVotes={event.allowMultipleVotes}
                  onVote={handleVote}
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Status */}
            {isRegistered && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">You're registered!</span>
                </div>
              </div>
            )}

            {/* Event Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Event Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Type:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white font-medium">
                    {event.type}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Participants:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white font-medium">
                    {event.participantCount}
                    {event.maxParticipants && ` / ${event.maxParticipants}`}
                  </span>
                </div>
                {event.isPollEvent && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Votes:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">
                      {event.voteCount || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
