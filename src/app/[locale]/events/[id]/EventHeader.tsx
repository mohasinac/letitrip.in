import { Div, Heading, Text } from "@mohasinac/appkit/ui";
import { MediaImage } from "@mohasinac/appkit/client";
import { EVENT_LABELS } from "./_constants";
import {
  formatEventDate,
  statusBadgeClass,
  typeBadgeClass,
} from "./_helpers";
import { ShareEventButton } from "./ShareEventButton";

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
    <Div className="space-y-4">
      {coverImage ? (
        <Div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-slate-800">
          <MediaImage
            src={coverImage}
            alt={title || EVENT_LABELS.COVER_ALT_FALLBACK}
            size="card"
          />
        </Div>
      ) : null}

      <Div className="space-y-3">
        <Div className="flex flex-wrap items-center gap-2">
          {eventType ? (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${typeBadgeClass(eventType)}`}
            >
              {eventType}
            </span>
          ) : null}
          {eventStatus ? (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(eventStatus)}`}
            >
              {eventStatus}
            </span>
          ) : null}
        </Div>

        <Heading
          level={1}
          className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
        >
          {title}
        </Heading>

        <Div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
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

        <Div className="flex items-center gap-2 pt-1">
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            {EVENT_LABELS.HEADER_SHARE}
          </Text>
          <ShareEventButton />
        </Div>
      </Div>
    </Div>
  );
}
