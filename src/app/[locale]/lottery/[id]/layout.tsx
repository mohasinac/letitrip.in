import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getLotteryEventCached, buildLotteryMetadata } from "@mohasinac/appkit/server";
import type { Metadata } from "next";

export const revalidate = 30;

type Props = {
  params: Promise<{ locale: string; id: string }>;
  children: ReactNode;
};

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { id } = await params;
  const event = await getLotteryEventCached(id);
  return buildLotteryMetadata(event);
}

export default async function LotteryDetailLayout({ params, children }: Props) {
  const { id } = await params;
  const event = await getLotteryEventCached(id);
  if (!event) notFound();

  return (
    <Suspense fallback={null}>
      {children}
    </Suspense>
  );
}
