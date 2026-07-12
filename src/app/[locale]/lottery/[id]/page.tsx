import { notFound } from "next/navigation";
import { getLotteryEventCached } from "@mohasinac/appkit/server";
import { LotteryDetailView } from "@mohasinac/appkit/client";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export const revalidate = 30;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function LotteryDetailPage({ params }: Props) {
  const { id } = await params;
  const [event, user] = await Promise.all([
    getLotteryEventCached(id),
    getServerSessionUser().catch(() => null),
  ]);

  if (!event) notFound();

  return (
    <LotteryDetailView
      event={event as Parameters<typeof LotteryDetailView>[0]["event"]}
      user={user ? { uid: user.uid, displayName: user.displayName } : null}
    />
  );
}
