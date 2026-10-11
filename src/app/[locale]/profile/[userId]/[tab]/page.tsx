import { PublicProfileView } from "@mohasinac/appkit/features/about/components/PublicProfileView";

export const revalidate = 1800;

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string; tab: string }>;
}) {
  const { userId, tab } = await params;
  return <PublicProfileView userId={userId} tab={tab} />;
}
