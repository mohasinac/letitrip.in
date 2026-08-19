import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { scammerRepository } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";
import { Section, Container, Row, Text } from "@mohasinac/appkit/client";
import { ScammerViewClient } from "./ScammerViewClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminScammerViewPage({ params }: Props) {
  const { id } = await params;
  const scammer = await scammerRepository.findById(id).catch(() => null);
  if (!scammer) return notFound();

  return (
    <Section padding="y-xl">
      <Container>
        <Row className="mb-2" gap="sm">
          <Link
            href={String(ROUTES.ADMIN.SCAMMERS)}
            className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
          >
            ← Scammers
          </Link>
        </Row>
        <Text weight="medium" size="lg" className="mb-4">
          {scammer.displayNames?.[0] ?? "Scammer profile"}
        </Text>
        <ScammerViewClient
          scammerId={scammer.id}
          displayNames={scammer.displayNames}
          scamType={scammer.scamType}
          description={scammer.description}
          phones={scammer.phones}
          upiIds={scammer.upiIds}
          currentStatus={scammer.status}
          verificationNote={scammer.verificationNote}
          reportedBy={scammer.reportedBy}
          reportedByAnon={scammer.reportedByAnon}
        />
      </Container>
    </Section>
  );
}
