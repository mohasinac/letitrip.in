import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventRaffleWinnerView, couponsRepository } from "@mohasinac/appkit";
import { EVENT_META } from "../_constants";
import { getEventCached } from "../_data";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export const revalidate = 60;

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
  const eventAny = event as unknown as Record<string, unknown>;
  const couponId =
    typeof eventAny.rafflePrizeCouponId === "string"
      ? eventAny.rafflePrizeCouponId
      : undefined;
  const winnerUserId =
    typeof eventAny.raffleWinnerUserId === "string"
      ? eventAny.raffleWinnerUserId
      : undefined;

  let rafflePrizeCouponCode: string | undefined;
  if (couponId) {
    const coupon = await couponsRepository.findById(couponId).catch(() => null);
    rafflePrizeCouponCode = coupon?.code;
  }

  const viewer = await getServerSessionUser().catch(() => null);
  const currentUserIsWinner =
    !!viewer && !!winnerUserId && viewer.uid === winnerUserId;

  return (
    <EventRaffleWinnerView
      event={{ ...event, rafflePrizeCouponCode }}
      currentUserIsWinner={currentUserIsWinner}
    />
  );
}
