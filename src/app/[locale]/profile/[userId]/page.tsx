import { notFound } from "next/navigation";
import { PublicProfileView, getPublicUserProfile } from "@mohasinac/appkit";
import { PageViewTracker } from "@mohasinac/appkit/client";
import type { Metadata } from "next";
import { generateProfileMetadata } from "@/constants/seo.server";

export const revalidate = 120;

type Props = { params: Promise<{ userId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const user = await getPublicUserProfile(userId).catch(() => null);
  if (!user) return { title: "Profile Not Found" };
  if ((user.publicProfile as any)?.isPublic === false) return { title: "Profile Not Found" };
  const meta = generateProfileMetadata({
    displayName: user.displayName ?? null,
    email: null,
    photoURL: user.photoURL ?? null,
    role: user.role ?? "user",
    uid: user.id ?? userId,
  });

  // One canonical per profile, pointing at the SLUG.
  //
  // `/profile/{uid}` keeps resolving — links already shared, and ones inside
  // sent notification emails, must not 404 — but a uid URL and a slug URL are
  // the same page, and two live URLs for one page split it in search results.
  // Declared only when a slug exists; a uid-only profile keeps inheriting.
  if (user.slug) {
    meta.alternates = { ...meta.alternates, canonical: `/profile/${user.slug}` };
  }
  return meta;
}

export default async function Page({ params }: Props) {
  const { userId } = await params;
  const user = await getPublicUserProfile(userId).catch(() => null);
  if (!user) notFound();
  // Private profile — return 404 so no link crawlers or direct URL visitors can access it
  if ((user.publicProfile as any)?.isPublic === false) notFound();
  return (
    <>
      <PageViewTracker entityType="user-profile" entityId={userId} url={`/profile/${userId}`} />
      <PublicProfileView userId={userId} />
    </>
  );
}
