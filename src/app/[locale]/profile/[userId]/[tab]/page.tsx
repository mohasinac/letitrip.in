import type { Metadata } from "next";
import { PublicProfileView } from "@mohasinac/appkit/features/about/components/PublicProfileView";
import { getPublicUserProfile } from "@mohasinac/appkit/server";
import { generateProfileMetadata } from "@/constants/seo.server";

export const revalidate = 1800;

/**
 * Mirrors the parent `profile/[userId]/page.tsx`, which already resolves a
 * real display name — a static title here would give every tab of every
 * profile the SAME title, which is the duplicate-title problem this is meant
 * to remove rather than relocate.
 *
 * The private-profile branch matters: a profile whose owner has turned off
 * `publicProfile.isPublic` must not leak a display name through metadata on
 * the tab route when the parent route already refuses to.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string; tab: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const user = await getPublicUserProfile(userId);
  if (!user) return { title: "Profile Not Found" };
  if ((user.publicProfile as { isPublic?: boolean } | undefined)?.isPublic === false) {
    return { title: "Profile Not Found" };
  }
  return generateProfileMetadata({
    displayName: user.displayName ?? null,
    email: null,
    photoURL: user.photoURL ?? null,
    role: user.role ?? "user",
    uid: user.id ?? userId,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string; tab: string }>;
}) {
  const { userId, tab } = await params;
  return <PublicProfileView userId={userId} tab={tab} />;
}
