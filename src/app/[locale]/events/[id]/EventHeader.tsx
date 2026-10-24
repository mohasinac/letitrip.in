import { Div, Heading, Row, Span, Stack, Text } from "@mohasinac/appkit/ui";
import { EventTypeBadge } from "@mohasinac/appkit/features/events/components/EventTypeBadge";
import type { PublicLiker } from "@mohasinac/appkit/features/events/schemas/likes";
import { EventLikesClient } from "./EventLikesClient";
import type { FirestoreValue } from "@mohasinac/appkit/schemas/types";
import { MediaImage } from "@mohasinac/appkit/client";
import { EVENT_LABELS } from "./_constants";
import {
  formatEventDate,
  statusBadgeClass,
  typeBadgeClass,
} from "./_helpers";
import { OwnerQuickActions } from "@mohasinac/appkit/client";
import { ROUTES } from "@mohasinac/appkit";
import { ShareEventButton } from "./ShareEventButton";

const __O = {
  hidden: "overflow-hidden",
} as const;
const CLS_LABEL = "font-medium text-[var(--appkit-color-text-muted)]";

interface Props {
  /** Needed for the admin edit/clone affordance — the header is where it goes. */
  eventId: string;
  title: string;
  coverImage: string | null;
  eventType: string;
  eventStatus: string;
  startsAt: FirestoreValue;
  endsAt: FirestoreValue;
  /** Likes, and who — server-resolved so the hero paints with them. */
  likeCount: number;
  viewerLiked: boolean;
  likers: PublicLiker[];
  likersHasMore: boolean;
}

export function EventHeader({
  eventId,
  title,
  coverImage,
  eventType,
  eventStatus,
  startsAt,
  endsAt,
  likeCount,
  viewerLiked,
  likers,
  likersHasMore,
}: Props) {
  const startsAtFormatted = formatEventDate(startsAt);
  const endsAtFormatted = formatEventDate(endsAt);

  return (
    <Stack gap="md">
      {coverImage ? (
        <Div className={`relative aspect-[16/7] w-full ${__O.hidden}`} rounded="xl" surface="subtle">
          <MediaImage
            src={coverImage}
            alt={title || EVENT_LABELS.COVER_ALT_FALLBACK}
            size="card"
          />
        </Div>
      ) : null}

      <Stack gap="3">
        <Row align="center" gap="sm" wrap>
          {/*
            * 🛑 THE HERO USED TO PRINT THE RAW ENUM under a CSS `capitalize`,
            * so a spin_wheel event announced itself as "Spin_wheel" — CSS
            * cannot humanise an underscore. The card had emoji in a private
            * map it could not reach, and the colours lived in a third file
            * where offer/survey shared one class. All three now resolve to
            * EVENT_TYPE_META.
            */}
          {eventType ? <EventTypeBadge type={eventType} /> : null}
          {eventStatus ? (
            <Span layout="inline-flex" 
              className={`capitalize ${statusBadgeClass(eventStatus)}`} padding="pill-sm" size="xs" weight="semibold" rounded="full"
            >
              {eventStatus}
            </Span>
          ) : null}
        </Row>

        <Row gap="sm" align="center" justify="between" wrap>
          <Heading
            level={1} size="2xl" weight="bold" color="primary">
            {title}
          </Heading>
          {/*
            Admin-only: the only event editor is `/admin/events/[id]/edit`, so
            passing an `ownerId` would hand a non-admin creator a pencil
            pointing at a route their role cannot open.

            🛑 Rendered as JSX from a Server Component, which is the normal RSC
            boundary and is fine — the trap Root Cause #76 describes is CALLING
            a `/client` runtime value or reading a property off it, not
            rendering a client component.
          */}
          <OwnerQuickActions
            resource="EVENT"
            placement="detail"
            editHref={String(ROUTES.ADMIN.EVENTS_EDIT(eventId))}
            recordLabel={title}
          />
        </Row>

        <Row wrap textSize="sm" gap="md" color="muted">
          {startsAtFormatted ? (
            <Text as="span">
              {EVENT_LABELS.HEADER_START}{" "}
              <Text as="span" className={CLS_LABEL}>
                {startsAtFormatted}
              </Text>
            </Text>
          ) : null}
          {endsAtFormatted ? (
            <Text as="span">
              {EVENT_LABELS.HEADER_END}{" "}
              <Text as="span" className={CLS_LABEL}>
                {endsAtFormatted}
              </Text>
            </Text>
          ) : null}
          {/*
            * The participant count is GONE from the hero, replaced by the
            * like rail below. It read `stats.totalEntries`, which is 0 by
            * construction on an offer or a sale — nobody enters a cashback
            * code — so it rendered "Participants: 0" on most of the corpus.
            * Entries still appear where they are real: participate,
            * leaderboard, and every admin surface.
            */}
        </Row>

        <EventLikesClient
          eventId={eventId}
          initialLiked={viewerLiked}
          initialCount={likeCount}
          likers={likers}
          hasMore={likersHasMore}
        />

        <Row align="center" gap="sm" padding="t-2xs">
          <Text size="sm" color="muted">
            {EVENT_LABELS.HEADER_SHARE}
          </Text>
          <ShareEventButton />
        </Row>
      </Stack>
    </Stack>
  );
}
