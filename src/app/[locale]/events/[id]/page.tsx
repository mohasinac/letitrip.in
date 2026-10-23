import { notFound } from "next/navigation";
import { Heading, RichText, Stack } from "@mohasinac/appkit/ui";
import { getRelatedEvents } from "@mohasinac/appkit/features/events/actions/event-actions";
import { EventOfferCard } from "@mohasinac/appkit/features/events/components/EventOfferCard";
import { RelatedEventsCarousel } from "@mohasinac/appkit/features/events/components/RelatedEventsCarousel";
import { AttachedCouponsSection } from "@mohasinac/appkit/features/promotions/components/AttachedCouponsSection";
import { getAttachedCoupons, safeRead, getLikeTrendCached } from "@mohasinac/appkit/server";
import { EventInsights } from "@mohasinac/appkit/features/events/components/EventInsights";
import {
  buildPollChart,
  buildCouponSavingsChart,
  buildLikeTrendChart,
  buildSaleProgress,
} from "@mohasinac/appkit/features/events/utils/event-charts";
import { EVENT_LABELS } from "./_constants";
import { eventIsActive } from "./_helpers";
import { getEventCached, getPollResultsCached } from "./_data";
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

  /*
   * Both optional rails, so both run in PARALLEL rather than one after the
   * other — Rule #6 budgets ~3 sequential Firestore round trips for a whole
   * request and the event itself has already spent one. `getAttachedCoupons`
   * is a single `getAll`, and it short-circuits to `[]` with no read at all
   * when the event carries no `couponIds`, which is every event today.
   */
  /*
   * The empty arm is typed rather than a bare `Promise.resolve([])`, which
   * would infer `never[]` and make the ternary a union of two array types.
   * Defensive only — it is not load-bearing today.
   */
  type RelatedEvent = Awaited<ReturnType<typeof getRelatedEvents>>[number];
  const relatedEventsPromise: Promise<RelatedEvent[]> =
    tags.length > 0
      ? safeRead(() => getRelatedEvents(tags, event.id), {
          route: "/events/[id]",
          key: "events.getRelatedEvents",
          fallback: [],
        })
      : Promise.resolve([]);

  /*
   * The like trend joins the SAME Promise.all rather than being awaited
   * after it — Rule #6 budgets ~3 sequential Firestore round trips per
   * request and the event itself already spent one. It is a single bounded
   * query (200 rows max) and returns null below the plot threshold.
   */
  const [relatedEvents, attachedCoupons, pollResults, likeTrend] = await Promise.all([
    relatedEventsPromise,
    getAttachedCoupons(event.couponIds),
    // Only fetched when the event HAS a poll — otherwise this is a read
    // for a chart that cannot render.
    pollConfig?.options?.length
      ? getPollResultsCached(id)
      : Promise.resolve([] as Awaited<ReturnType<typeof getPollResultsCached>>),
    safeRead(() => getLikeTrendCached(event.id), {
      route: "/events/[id]",
      key: "events.getLikeTrend",
      fallback: null,
    }),
  ]);

  /*
   * Every builder returns null when it has nothing real, and <EventInsights>
   * renders nothing when they all do — so an event with no poll, no coupons
   * and three likes shows no section at all rather than empty frames.
   */
  const savingsChart = buildCouponSavingsChart(attachedCoupons);
  const pollChart = buildPollChart(
    pollConfig,
    pollResults.map((r) => ({ optionId: String(r.optionId), count: Number(r.count ?? 0) })),
  );
  const likeTrendChart = buildLikeTrendChart(likeTrend);
  const saleProgress =
    event.type === "sale" || event.type === "offer"
      ? buildSaleProgress(
          event.startsAt ? new Date(event.startsAt) : undefined,
          event.endsAt ? new Date(event.endsAt) : undefined,
        )
      : null;

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
      {/*
        Below the offer card on purpose. An `offer` event's `offerConfig` code
        is THE offer — the thing the event is about — and these are additional
        codes the editor attached. Putting them first would bury the headline
        under its own footnotes.

        Renders nothing when the list is empty, so this costs untouched events
        exactly one `null`.
      */}
      <AttachedCouponsSection
        coupons={attachedCoupons}
        title="Coupons for this event"
        description="Copy a code and apply it at checkout."
      />
      <EventInsights
        savingsChart={savingsChart}
        pollChart={pollChart}
        likeTrendChart={likeTrendChart}
        saleProgress={saleProgress}
      />
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
