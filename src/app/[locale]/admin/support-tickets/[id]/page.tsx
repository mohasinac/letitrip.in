import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { supportRepository } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";
import { Section, Container, Row, Text } from "@mohasinac/appkit/client";
import { SupportTicketViewClient } from "./SupportTicketViewClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminSupportTicketViewPage({ params }: Props) {
  const { id } = await params;
  const ticket = await supportRepository.getTicketById(id).catch(() => null);
  if (!ticket) return notFound();

  return (
    <Section padding="y-xl">
      <Container>
        <Row className="mb-2" gap="sm">
          <Link
            href={String(ROUTES.ADMIN.SUPPORT_TICKETS)}
            className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
          >
            ← Support Tickets
          </Link>
        </Row>
        <Text weight="medium" size="lg" className="mb-4">
          {ticket.subject}
        </Text>
        <SupportTicketViewClient
          ticketId={ticket.id}
          subject={ticket.subject}
          userDisplayName={ticket.userDisplayName}
          category={ticket.category}
          currentStatus={ticket.status}
          currentPriority={ticket.priority}
          description={ticket.description}
          messages={ticket.messages.map((m) => ({
            id: m.id,
            authorId: m.authorId,
            authorRole: m.authorRole,
            body: m.body,
            createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
          }))}
          internalNotes={ticket.internalNotes}
          orderId={ticket.orderId}
          relatedParties={ticket.relatedParties}
          statusHistory={(ticket.statusHistory ?? []).map((e) => ({
            ...e,
            at: e.at instanceof Date ? e.at.toISOString() : String(e.at),
          }))}
          statusHistoryTruncated={ticket.statusHistoryTruncated}
        />
      </Container>
    </Section>
  );
}
