import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getScammerProfilePageData } from "@mohasinac/appkit/features/scams/actions/scam-actions";
import { getScamType } from "@mohasinac/appkit/features/scams/constants/scam-types";
import { ScamProfileView } from "@mohasinac/appkit/features/scams/components/ScamProfileView";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { SCAM_TYPE_LABELS } from "@mohasinac/appkit/features/scams/constants/scam-types";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { breadcrumbJsonLd, faqJsonLd } from "@mohasinac/appkit/seo/json-ld";

export const revalidate = 1800;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getScammerProfilePageData(id);
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
  const data = await getScammerProfilePageData(id);

  if (!data) notFound();

  const { scammer } = data;
  const name = scammer.displayNames[0] ?? "Unknown";

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: String(ROUTES.HOME) },
    { name: "Scam Registry", url: String(ROUTES.PUBLIC.SCAMS) },
    { name, url: String(ROUTES.PUBLIC.SCAM_DETAIL(id)) },
  ]);

  const scamTypeData = getScamType(scammer.scamType);
  const faqLd = scamTypeData
    ? faqJsonLd([
        {
          question: `How do I avoid ${scamTypeData.label.toLowerCase()} scams?`,
          answer: scamTypeData.howToAvoid.join(" "),
        },
        {
          question: `How does a ${scamTypeData.label.toLowerCase()} scam work?`,
          answer: scamTypeData.howItHappens,
        },
      ])
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <ScamProfileView
        scammer={data.scammer}
        incidents={data.incidents}
        comments={data.comments}
        relatedScammers={data.relatedScammers}
        similarScamReports={data.similarScamReports}
        isAuthenticated={false}
      />
    </>
  );
}
