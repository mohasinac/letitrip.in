"use client";

/**
 * The client boundary for event likes.
 *
 * 🛑 THIS WRAPPER EXISTS BECAUSE A FUNCTION IS NOT SERIALISABLE.
 *
 * `EventLikeButton` takes an `onToggle` callback and `EventLikersRail` takes
 * a `loadMore`. The event hero is a Server Component, and a function prop
 * cannot cross that boundary — Next.js serialises props into the RSC flight
 * payload, and a closure has no serialisation. So the fetch lives here, on
 * the client side of the line, and the server passes only plain data.
 *
 * Everything the server hands down is a string, number or boolean array —
 * which is also what keeps a raw repository document from leaking into the
 * page HTML (Root Cause #70): the likers were already projected through
 * `toPublicLiker` before they got here.
 */

import { useCallback } from "react";
import { Stack } from "@mohasinac/appkit/ui";
import { EventLikeButton } from "@mohasinac/appkit/features/events/components/EventLikeButton";
import { EventLikersRail } from "@mohasinac/appkit/features/events/components/EventLikersRail";
import type { PublicLiker } from "@mohasinac/appkit/features/events/schemas/likes";

interface Props {
  eventId: string;
  initialLiked: boolean;
  initialCount: number;
  likers: PublicLiker[];
  hasMore: boolean;
}

export function EventLikesClient({
  eventId,
  initialLiked,
  initialCount,
  likers,
  hasMore,
}: Props) {
  const toggle = useCallback(async (id: string) => {
    const res = await fetch(`/api/events/${encodeURIComponent(id)}/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The session cookie is what identifies the liker — the document id is
      // `{eventId}__{userId}` and the route reads the uid from the session,
      // never from the body.
      credentials: "same-origin",
    });
    const json = await res.json();
    if (!res.ok) {
      /*
       * Throw with the server's `code` so `EventLikeButton` can roll its
       * optimistic update back AND `isAuthError` can recognise a 401 and open
       * the sign-in modal. A bare `Error` loses the status, which is how the
       * spin wheel's 401 never opened its modal (Root Cause #86's neighbour).
       */
      const err = new Error(json?.error ?? "Could not save your like") as Error & {
        code?: string;
        status?: number;
      };
      err.code = json?.code;
      err.status = res.status;
      throw err;
    }
    return json.data as { liked: boolean; likeCount: number };
  }, []);

  const loadMore = useCallback(async (offset: number) => {
    const res = await fetch(
      `/api/events/${encodeURIComponent(eventId)}/likes?offset=${offset}`,
      { credentials: "same-origin" },
    );
    if (!res.ok) throw new Error("Could not load more");
    const json = await res.json();
    return json.data as { likers: PublicLiker[]; hasMore: boolean };
  }, [eventId]);

  return (
    <Stack gap="sm">
      <EventLikeButton
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
