import { PublicProfileView, getPublicUserProfile } from "@mohasinac/appkit";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateProfileMetadata } from "@/constants/seo.server";

export const revalidate = 120;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await getPublicUserProfile(id);
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
  // A record that does not exist must render the 404 view - that is what gets it
  // marked noindex. The HTTP STATUS stays 200, and that is Next's documented
  // behaviour rather than a bug: the response is streamed, so headers are already
  // sent by the time notFound() runs and the status can no longer change. Next
  // injects <meta name="robots" content="noindex"> into the streamed HTML
  // instead, and that is what actually keeps the URL out of the index.
  // Before this, the page rendered its OWN "not found" body with no noindex at
  // all - a genuine soft 404 that stayed indexable forever.
  const user = await getPublicUserProfile(id);
  if (!user) notFound();
  return <PublicProfileView userId={id} />;
}
