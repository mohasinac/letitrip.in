import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLotteryEventCached } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getLotteryEventCached(id);
  if (!event) return _gm({ title: "Lottery Not Found — LetItRip", description: "", path: "/lottery" });
  return _gm({
    title: `${event.title} — Lottery — LetItRip`,
    description: `Enter the ${event.title} lottery on LetItRip. Slots assigned instantly on submission.`,
    path: `/lottery/${id}`,
  });
}

/*
 * 🛑 Must stay in step with `page.tsx`'s value — the LOWEST `revalidate` across
 * a route's layout and page governs the entire route, so leaving this at 30
 * would have silently capped the page's 3600 and made that change a no-op.
 * CLAUDE.md names this exact file as the example of the trap.
 *
 * Freshness now comes from invalidation (the revalidation webhook) rather than
 * from expiry; this is the backstop for changes nothing reported.
 */
export const revalidate = 3600;

export default async function Layout({ children, params }: LayoutProps) {
  const { id } = await params;
  const event = await getLotteryEventCached(id);
  if (!event) notFound();
  return <Suspense>{children}</Suspense>;
}
