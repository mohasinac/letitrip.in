import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLotteryEventCached } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants";

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

export const revalidate = 30;

export default async function Layout({ children, params }: LayoutProps) {
  const { id } = await params;
  const event = await getLotteryEventCached(id);
  if (!event) notFound();
  return <Suspense>{children}</Suspense>;
}
