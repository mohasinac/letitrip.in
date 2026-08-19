import { notFound } from "next/navigation";
import { Heading, RichText, Stack } from "@mohasinac/appkit/ui";
import { EventOfferCard, RelatedEventsCarousel, getRelatedEvents } from "@mohasinac/appkit";
import { EVENT_LABELS } from "./_constants";
import { eventIsActive } from "./_helpers";
import { getEventCached } from "./_data";
import { PollInlineClient } from "./PollInlineClient";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

type PollConfig = {
  options: { id: string; label: string }[];
  allowMultiSelect: boolean;
  allowComment: boolean;
  requireLogin?: boolean;
};

type OfferConfig = {
  couponId: string;
  displayCode: string;
  bannerText?: string;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const event = await getEventCached(id);
  if (!event) notFound();

  const description =
    typeof event.description === "string" ? event.description : "";
  const isActive = eventIsActive(event);
  const pollConfig = (event as { pollConfig?: PollConfig }).pollConfig;
  const offerConfig = (event as { offerConfig?: OfferConfig }).offerConfig;

  const tags = Array.isArray(event.tags) ? event.tags : [];
  const relatedEvents = tags.length > 0
    ? await getRelatedEvents(tags, event.id).catch(() => [])
    : [];

  return (
    <Stack gap="lg">
      {description ? <RichText html={description} /> : null}
      {event.type === "offer" && offerConfig?.displayCode ? (
        <EventOfferCard
          couponCode={offerConfig.displayCode}
          offerDescription={offerConfig.bannerText}
          title={event.title ?? "Exclusive offer"}
        />
      ) : null}
      {pollConfig?.options?.length ? (
        <Stack gap="3">
          <Heading
            level={2} size="lg" weight="semibold" color="primary">
            {EVENT_LABELS.OVERVIEW_POLL_HEADING}
          </Heading>
          <PollInlineClient
            eventId={id}
            pollConfig={pollConfig}
            isActive={isActive}
          />
        </Stack>
      ) : null}
      {relatedEvents.length > 0 && (
        <RelatedEventsCarousel
          items={relatedEvents.map((e) => ({
            id: e.id,
            slug: e.slug,
            title: e.title,
            coverImage: e.coverImage ?? null,
            coverImageUrl: e.coverImageUrl,
          }))}
        />
      )}
    </Stack>
  );
}
