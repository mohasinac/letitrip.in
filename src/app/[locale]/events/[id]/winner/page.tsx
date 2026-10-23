import type { Metadata } from "next";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { notFound } from "next/navigation";
import { EventRaffleWinnerView } from "@mohasinac/appkit/features/events/components/EventRaffleWinnerView";
import { couponsRepository } from "@mohasinac/appkit/features/promotions/repository/coupons.repository";
import { rafflePrizeCouponIdsOf } from "@mohasinac/appkit/features/events/schemas/firestore";
import { safeRead } from "@mohasinac/appkit/server";
import { EVENT_META } from "../_constants";
import { getEventCached } from "../_data";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export const revalidate = 600;

type RouteParams = { locale: string; id: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventCached(id);
  return {
    title: event
      ? `${EVENT_META.WINNER_TITLE(event.title ?? "")} ${EVENT_META.TITLE_SUFFIX}`
      : EVENT_META.NOT_FOUND_TITLE,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const event = await getEventCached(id);
  if (!event) notFound();

  // Plan §10 — when the prize is a coupon AND the viewer is the winner,
  // resolve the coupon code so the view can render a one-click Claim CTA.
  const eventAny = event as unknown as Record<string, JsonValue>;
  /*
   * 🛑 `rafflePrizeCouponIdsOf`, not `eventAny.rafflePrizeCouponId`. A raffle
   * may now award several coupons, and an event drawn before the widening
   * carries only the deprecated scalar — this helper is the one place that
   * folds the two together, so neither kind of winner sees a blank prize.
   */
  const couponIds = rafflePrizeCouponIdsOf(event);
  const winnerUserId =
    typeof eventAny.raffleWinnerUserId === "string"
      ? eventAny.raffleWinnerUserId
      : undefined;

  /*
   * ONE batch read for every prize coupon. The winner banner is the subject of
   * this page; the codes only enrich it with a Claim CTA, and the winner can
   * still claim from /user/coupons — so this stays a `safeRead` that degrades
   * to "no code shown" rather than taking the announcement down.
   */
  const prizeCoupons = couponIds.length > 0
    ? await safeRead(() => couponsRepository.findByIds(couponIds), {
        route: "/events/[id]/winner",
        key: "coupons.findByIds",
        fallback: [],
      })
    : [];
  /*
   * The existing single-code prop is kept fed from the first coupon so the
   * winner view renders exactly as before for the common one-prize case; the
   * full list is passed alongside it.
   */
  const rafflePrizeCouponCode: string | undefined = prizeCoupons[0]?.code;
  const rafflePrizeCouponCodes = prizeCoupons.map((c) => c.code);

  // Anonymous is a legitimate viewer here — the page renders for everyone and
  // only the "you won" framing depends on knowing who is reading it.
  const viewer = await safeRead(() => getServerSessionUser(), {
    route: "/events/[id]/winner",
    key: "session.getServerSessionUser",
    fallback: null,
  });
  const currentUserIsWinner =
    !!viewer && !!winnerUserId && viewer.uid === winnerUserId;

  return (
    <EventRaffleWinnerView
      event={{ ...event, rafflePrizeCouponCode, rafflePrizeCouponCodes }}
      currentUserIsWinner={currentUserIsWinner}
    />
  );
}
