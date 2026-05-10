import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getScammerProfilePageData } from "@mohasinac/appkit";
import { ScamProfileView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { SCAM_TYPE_LABELS } from "@mohasinac/appkit";

export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getScammerProfilePageData(id).catch(() => null);
  if (!data) return { title: "Profile Not Found" };

  const { scammer } = data;
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
  const data = await getScammerProfilePageData(id).catch(() => null);

  if (!data) notFound();

  return (
    <ScamProfileView
      scammer={data.scammer}
      incidents={data.incidents}
      comments={data.comments}
      relatedScammers={data.relatedScammers}
      isAuthenticated={false}
    />
  );
}
