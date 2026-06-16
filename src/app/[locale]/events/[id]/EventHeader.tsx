import { Div, Heading, Row, Span, Stack, Text } from "@mohasinac/appkit/ui";
import { MediaImage } from "@mohasinac/appkit/client";
import { EVENT_LABELS } from "./_constants";
import {
  formatEventDate,
  statusBadgeClass,
  typeBadgeClass,
} from "./_helpers";
import { ShareEventButton } from "./ShareEventButton";

const __O = {
  hidden: "overflow-hidden",
} as const;
const CLS_LABEL = "font-medium text-zinc-700 dark:text-zinc-300";

interface Props {
  title: string;
  coverImage: string | null;
  eventType: string;
  eventStatus: string;
  startsAt: unknown;
  endsAt: unknown;
  totalEntries?: number;
}

export function EventHeader({
  title,
  coverImage,
  eventType,
  eventStatus,
  startsAt,
  endsAt,
  totalEntries,
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
          {eventType ? (
            <Span
              className={`inline-flex items-center capitalize ${typeBadgeClass(eventType)}`} padding="pill-sm" size="xs" weight="semibold" rounded="full"
            >
              {eventType}
            </Span>
          ) : null}
          {eventStatus ? (
            <Span
              className={`inline-flex items-center capitalize ${statusBadgeClass(eventStatus)}`} padding="pill-sm" size="xs" weight="semibold" rounded="full"
            >
              {eventStatus}
            </Span>
          ) : null}
        </Row>

        <Heading
          level={1} size="2xl" weight="bold" color="primary">
          {title}
        </Heading>

        <Div className="flex flex-wrap gap-4 text-sm" color="muted">
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
          {totalEntries !== undefined ? (
            <Text as="span">
              {EVENT_LABELS.HEADER_PARTICIPANTS}{" "}
              <Text as="span" className={CLS_LABEL}>
                {totalEntries.toLocaleString()}
              </Text>
            </Text>
          ) : null}
        </Div>

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
