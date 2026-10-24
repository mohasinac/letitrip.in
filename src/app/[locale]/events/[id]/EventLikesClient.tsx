"use client";

/**
 * The client boundary for event likes.
 *
 * 🛑 THIS WRAPPER EXISTS BECAUSE A FUNCTION IS NOT SERIALISABLE.
 *
 * `EventLikeButton` takes an `onToggle` callback and `EventLikersRail` takes a
 * `loadMore`. The event hero is a Server Component, and a function prop cannot
 * cross that boundary — props are serialised into the RSC flight payload and a
 * closure has no serialisation. So the handlers live here, on the client side
 * of the line, and the server passes only plain data.
 *
 * Everything handed down is a string, number or plain object that already went
 * through `toPublicLiker`, so no repository document reaches the page HTML
 * (Root Cause #70).
 *
 * 🛑 The fetches themselves live in `src/lib/api/events-client.ts`, NOT here.
 * `audit-direct-fetch-ui` ignores `/lib/api/` exactly so there is one place a
 * route string and a credentials mode are written, and `audit-hardcoded-api-routes`
 * blocks the literal path a component would otherwise inline.
 */

import { useCallback, useEffect, useState } from "react";
import { Stack, useToast } from "@mohasinac/appkit/ui";
import { EventLikeButton } from "@mohasinac/appkit/features/events/components/EventLikeButton";
import { EventLikersRail } from "@mohasinac/appkit/features/events/components/EventLikersRail";
import type { PublicLiker } from "@mohasinac/appkit/features/events/schemas/likes";
import { trackError, ErrorCategory, ErrorSeverity } from "@mohasinac/appkit/client";
import { toggleEventLike, fetchEventLikers } from "@/lib/api/events-client";

interface Props {
  eventId: string;
  initialCount: number;
  likers: PublicLiker[];
  hasMore: boolean;
}

export function EventLikesClient({
  eventId,
  initialCount,
  likers,
  hasMore,
}: Props) {
  const { showToast } = useToast();

  /*
   * 🛑 RESOLVED AFTER HYDRATION, NOT ON THE SERVER.
   *
   * `/events/:id` is publicly CDN-cached at s-maxage=60, so reading the
   * session server-side would bake ONE visitor's liked state into a
   * response served to everyone hitting that edge for the next minute.
   *
   * Starting at `false` is the honest default: an unliked heart that
   * turns out to be liked corrects itself a moment later, whereas a
   * filled one that turns out not to be invites a click that un-likes
   * something the visitor never liked.
   */
  const [initialLiked, setInitialLiked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchEventLikers(eventId, 0)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.data?.viewerLiked) setInitialLiked(true);
      })
      /*
       * 🛑 SILENT TO THE VISITOR, LOUD TO THE OPERATOR — not swallowed.
       *
       * Failing to learn the viewer already liked this costs one wasted
       * tap and `toggle` is idempotent on the document id, so there is
       * nothing useful to show them. But a bare `.catch(() => undefined)`
       * makes the NEXT failure invisible too, which is the whole reason
       * audit-silent-degrade exists.
       *
       * `trackError` is the same route HomepageSectionBoundary uses:
       * nothing renders, and the client-error beacon records it.
       */
      .catch((err: unknown) => {
        trackError(
          err instanceof Error ? err : String(err),
          ErrorCategory.NETWORK,
          ErrorSeverity.LOW,
          {
            page: "/events/[id]",
            component: "EventLikesClient",
            action: "resolveViewerLiked",
            metadata: { eventId },
          },
        );
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const toggle = useCallback(
    async (id: string) => {
      const res = await toggleEventLike(id);
      const json = await res.json();
      if (!res.ok) {
        /*
         * Throw carrying the server's `code` and `status`.
         *
         * `EventLikeButton` needs the throw to roll its optimistic update
         * back, and `isAuthError` needs the STATUS to recognise a 401 and
         * open the sign-in modal. A bare `Error` loses both — which is
         * exactly how the spin wheel's 401 never opened its own modal until
         * `onSpin` was taught to throw an `ApiError`.
         */
        const err = new Error(json?.error ?? "Could not save your like") as Error & {
          code?: string;
          status?: number;
        };
        err.code = json?.code;
        err.status = res.status;
        // 401 is not a failure to report — the button turns it into a
        // sign-in prompt, and a toast on top would be noise.
        if (res.status !== 401) {
          showToast(json?.error ?? "Could not save your like", "error");
        }
        throw err;
      }
      return json.data as { liked: boolean; likeCount: number };
    },
    [showToast],
  );

  const loadMore = useCallback(
    async (offset: number) => {
      const res = await fetchEventLikers(eventId, offset);
      if (!res.ok) {
        showToast("Could not load more likes", "error");
        throw new Error("Could not load more likes");
      }
      const json = await res.json();
      return json.data as { likers: PublicLiker[]; hasMore: boolean };
    },
    [eventId, showToast],
  );

  return (
    <Stack gap="sm">
      <EventLikeButton
        // Remounts when the resolved state arrives, so the button picks up
        // the real initial value rather than keeping its first render.
        key={`like-${initialLiked}`}
        eventId={eventId}
        initialLiked={initialLiked}
        initialCount={initialCount}
        onToggle={toggle}
      />
      <EventLikersRail
        likers={likers}
        totalCount={initialCount}
        hasMore={hasMore}
        loadMore={loadMore}
      />
    </Stack>
  );
}
