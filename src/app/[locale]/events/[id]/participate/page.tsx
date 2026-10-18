import type { Metadata } from "next";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { EVENT_META, EVENT_TYPE } from "../_constants";
import { eventIsActive, toIsoOrUndefined } from "../_helpers";
import { toClientSpinPrize } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { RAFFLE_MAX_ENTRIES_PER_USER } from "@mohasinac/appkit";
import { getEventCached, getUserSpinResultsCached, getHasEnteredCached } from "../_data";
import { EventParticipateClient } from "./EventParticipateClient";

/*
 * 🛑 Already inert, and the session read below does not make it worse.
 *
 * `getServerSessionUser()` is a dynamic API, so it would normally void this
 * declaration — but measured against `.next/prerender-manifest.json` on
 * 2026-10-19, `/[locale]/events/[id]/participate` appears in NEITHER `routes`
 * nor `dynamicRoutes`, i.e. it was already fully dynamic SSR and this 600 has
 * never had an effect. Checked before adding the session read rather than
 * reasoned about: a grep for `export const revalidate` tells you what someone
 * wrote, the manifest tells you what Next does (Root Cause #94).
 *
 * Kept rather than deleted so the intent survives if the route ever becomes
 * cacheable; do not raise it expecting a change.
 */
export const revalidate = 600;

type RouteParams = { locale: string; id: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventCached(id);
  return {
    title: event
      ? EVENT_META.PARTICIPATE_TITLE(event.title ?? "")
      : EVENT_META.NOT_FOUND_TITLE,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const event = await getEventCached(id);
  if (!event) notFound();

  const eventType = (event.type as string | undefined) ?? "";
  const isActive = eventIsActive(event);

  // Polls are participated via the inline vote on the Overview tab.
  // Sale / Offer events have nothing form-shaped to submit on participate
  // (the offer is the event itself, surfaced on Overview). Ended events
  // have nothing to submit. Send all of these back to Overview to avoid
  // rendering an empty participate panel that the user perceives as a
  // stuck spinner.
  if (
    eventType === EVENT_TYPE.POLL ||
    eventType === EVENT_TYPE.SALE ||
    eventType === EVENT_TYPE.OFFER ||
    !isActive
  ) {
    redirect(String(ROUTES.PUBLIC.EVENT_DETAIL(id)));
  }

  const hasLeaderboard =
    (event as { hasLeaderboard?: boolean }).hasLeaderboard === true;
  const ev = event as unknown as Record<string, JsonValue>;
  const pollConfig = ev.pollConfig as unknown as Parameters<typeof EventParticipateClient>[0]["event"]["pollConfig"];
  const surveyConfig = ev.surveyConfig as unknown as Parameters<typeof EventParticipateClient>[0]["event"]["surveyConfig"];
  const feedbackConfig = ev.feedbackConfig as unknown as Parameters<typeof EventParticipateClient>[0]["event"]["feedbackConfig"];
  /*
   * 🛑 Allow-listed through `toClientSpinPrize`, not cast wholesale.
   *
   * This used to cast `ev.spinPrizes` straight into a `"use client"` prop with
   * `weight` and `couponId` intact — so every wheel's ODDS and its internal
   * coupon document ids were serialised into the public RSC payload. The
   * adapter exists for exactly this and was already used by the two API routes
   * that publish an event; the SSR page was the one surface that bypassed it
   * (Root Cause #70). The tester case for this asserts
   * `weightsInPublicSource: 0`.
   *
   * The narrowed type is the enforcement: `SpinPrize` here no longer HAS a
   * `weight`, so re-introducing one is a compile error rather than a silent
   * leak. The stored shape in appkit keeps `weight` — the admin editor authors
   * it.
   */
  const spinPrizes = (Array.isArray(ev.spinPrizes) ? ev.spinPrizes : [])
    .map((p) => p as unknown as { id: string; label: string; isActive?: boolean })
    .map(toClientSpinPrize);

  /*
   * `toIsoOrUndefined`, not a `typeof === "string"` guard.
   *
   * The repository deserialises Firestore Timestamps into `Date` objects, so
   * the old guard was false on every real document and BOTH window fields
   * arrived as `null`. `SpinWheelView` then computed `inWindow === true`
   * unconditionally: its "The spin window is not open." state was unreachable
   * dead code, the button rendered enabled outside the window, and a closed
   * window was discoverable only as a 403 the UI printed as "Spin failed".
   */
  const spinWindowStart = toIsoOrUndefined(ev.spinWindowStart) ?? null;
  const spinWindowEnd = toIsoOrUndefined(ev.spinWindowEnd) ?? null;

  /*
   * Hydrate the viewer's own spin state server-side.
   *
   * `SpinWheelViewProps` has declared `alreadyUsed` / `initialPrizeId` /
   * `initialCouponCode` all along and nothing ever passed them, so the button
   * rendered enabled for someone already at their cap: they clicked, paid a
   * round trip, and got an error for a state the page already knew about.
   *
   * Reuses `getUserSpinResultsCached`, which is `safeRead`-wrapped and keyed on
   * `(id, userId)` per the React.cache discipline. Guests are not hydrated —
   * their identity is an IP hash the server computes and the page cannot know.
   */
  const viewer = await getServerSessionUser();
  /*
   * Only the read this event type actually needs. A raffle page must not pay
   * for a spin-results query and vice versa — Rule #6's ~3-round-trip budget,
   * and both are extra reads on a per-request render.
   */
  const mySpins =
    viewer?.uid && eventType === EVENT_TYPE.SPIN_WHEEL
      ? await getUserSpinResultsCached(id, viewer.uid)
      : [];
  const spinMaxPerUser =
    typeof ev.spinMaxPerUser === "number" && ev.spinMaxPerUser > 0
      ? ev.spinMaxPerUser
      : 1;
  const alreadyUsed = mySpins.length >= spinMaxPerUser;

  const raffleAlreadyEntered =
    viewer?.uid && eventType === EVENT_TYPE.RAFFLE
      ? await getHasEnteredCached(id, viewer.uid)
      : false;
  const raffleType = typeof ev.raffleType === "string"
    ? (ev.raffleType as "open_raffle" | "top_n_scorers" | "top_n_participants" | "spin_wheel")
    : undefined;
  const raffleTopN = typeof ev.raffleTopN === "number" ? ev.raffleTopN : undefined;
  const rafflePrize = typeof ev.rafflePrize === "string" ? ev.rafflePrize : undefined;

  return (
    <EventParticipateClient
      event={{
        id,
        title: event.title ?? "",
        description:
          typeof event.description === "string" ? event.description : undefined,
        endsAt: toIsoOrUndefined(event.endsAt),
        type: eventType,
        pollConfig,
        surveyConfig,
        feedbackConfig,
        spinPrizes,
        spinWindowStart,
        spinWindowEnd,
        spinAlreadyUsed: alreadyUsed,
        spinInitialPrizeId: mySpins[0]?.spinPrizeId,
        spinInitialCouponCode: mySpins[0]?.spinPrizeCouponCode,
        raffleType,
        raffleTopN,
        rafflePrize,
        raffleAlreadyEntered,
        raffleMaxEntriesPerUser: RAFFLE_MAX_ENTRIES_PER_USER,
      }}
      hasLeaderboard={hasLeaderboard}
      embedded
    />
  );
}
