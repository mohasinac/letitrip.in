import { notFound } from "next/navigation";
import { LotteryDetailView } from "@mohasinac/appkit";
import { getLotteryEventCached } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export const revalidate = 30;

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const [event, user] = await Promise.all([
    getLotteryEventCached(id),
    getServerSessionUser(),
  ]);
  if (!event) notFound();
  return <LotteryDetailView event={event} user={user ?? null} />;
}
