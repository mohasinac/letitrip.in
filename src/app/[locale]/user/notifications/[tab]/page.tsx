import { UserNotificationsView } from "@mohasinac/appkit";

export default async function Page({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  await params;
  return <UserNotificationsView />;
}
