import { PublicProfileView, getPublicUserProfile } from "@mohasinac/appkit";
import type { Metadata } from "next";
import { generateProfileMetadata } from "@/constants/seo.server";

export const revalidate = 120;

type Props = { params: Promise<{ userId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const user = await getPublicUserProfile(userId).catch(() => null);
  if (!user) return { title: "Profile Not Found" };
  return generateProfileMetadata({
    displayName: user.displayName ?? null,
    email: null,
    photoURL: user.photoURL ?? null,
    role: user.role ?? "user",
    uid: user.id ?? userId,
  });
}

export default async function Page({ params }: Props) {
  const { userId } = await params;
  return <PublicProfileView userId={userId} />;
}
