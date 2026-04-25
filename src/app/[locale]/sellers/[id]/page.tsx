import { PublicProfileView, getPublicUserProfile } from "@mohasinac/appkit";
import type { Metadata } from "next";
import { generateProfileMetadata } from "@/constants/seo.server";

export const revalidate = 120;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await getPublicUserProfile(id).catch(() => null);
  if (!user) return { title: "Seller Not Found" };
  return generateProfileMetadata({
    displayName: user.displayName ?? null,
    email: null,
    photoURL: user.photoURL ?? null,
    role: user.role ?? "seller",
    uid: user.id ?? id,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <PublicProfileView userId={id} />;
}
