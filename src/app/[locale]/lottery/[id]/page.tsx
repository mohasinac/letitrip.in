import { notFound } from "next/navigation";
import { LotteryDetailView } from "@mohasinac/appkit";
import { getLotteryEventCached } from "@mohasinac/appkit/server";

/*
 * 🛑 This page deliberately does NOT read the session.
 *
 * It used to `await getServerSessionUser()`, which calls `cookies()` — a dynamic
 * API. That cost twice over:
 *
 *   1. the route became fully dynamic, so `revalidate = 30` below was silently
 *      INERT (Root Cause #94) and every visit paid a complete render;
 *   2. the HTML varied per viewer (login CTA vs. pull form), so it could never
 *      be cached or shared even once the window was fixed.
 *
 * `LotteryDetailView` is a client component and now reads the viewer itself via
 * `useOptionalSession`, with a three-state gate so a signed-in buyer never sees
 * a flash of "Log In to Enter". Nothing on this page is clock-derived — the draw
 * window is enforced server-side on `event.status`, not on a timestamp — so the
 * only staleness risk is a status transition, which the products/events
 * revalidation trigger covers.
 */
export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const event = await getLotteryEventCached(id);
  if (!event) notFound();
  return <LotteryDetailView event={event} />;
}
