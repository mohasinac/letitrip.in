import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicScammerById } from "@mohasinac/appkit";
import { ScamProfileView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { SCAM_TYPE_LABELS } from "@mohasinac/appkit";

export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const scammer = await getPublicScammerById(id).catch(() => null);
  if (!scammer) return { title: "Profile Not Found" };

  const name = scammer.displayNames[0] ?? "Unknown";
  const scamLabel = SCAM_TYPE_LABELS[scammer.scamType] ?? scammer.scamType;

  const identifiers = [
    ...scammer.phones.slice(0, 2),
    ...scammer.upiIds.slice(0, 1),
    ...scammer.emails.slice(0, 1),
  ].join(", ");

  return _gm({
    title: `${name} — Verified Scammer | LetItRip Scam Registry`,
    description: `${name} (${scamLabel}) is a verified scammer in India's collectibles community.${identifiers ? ` Contact info: ${identifiers}.` : ""} ${scammer.description.slice(0, 100)}…`,
    path: `/scams/${id}`,
    type: "article",
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const scammer = await getPublicScammerById(id).catch(() => null);

  if (!scammer) notFound();

  // Auth is checked client-side on actions (report/contest).
  // The profile page itself is public — server-render for SEO.
  return <ScamProfileView scammer={scammer} isAuthenticated={false} />;
}
