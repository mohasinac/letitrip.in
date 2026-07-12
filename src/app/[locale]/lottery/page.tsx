import { Suspense } from "react";
import { ROUTES } from "@mohasinac/appkit";
import { LotteryListView } from "@mohasinac/appkit/client";
import { listLotteryEvents } from "@mohasinac/appkit/server";
import type { Metadata } from "next";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Lotteries — LetItRip",
  description: "Enter active lotteries on LetItRip and win collectible prizes.",
};

export default async function LotteryListPage() {
  const events = await listLotteryEvents({ status: "active" }).catch(() => []);

  return (
    <Suspense fallback={null}>
      <LotteryListView items={events as Parameters<typeof LotteryListView>[0]["items"]} />
    </Suspense>
  );
}
