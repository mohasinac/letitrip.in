import { PublicProfileView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page({ params }: { params: { userId: string } }) {
  return <PublicProfileView userId={params.userId} />;
}
