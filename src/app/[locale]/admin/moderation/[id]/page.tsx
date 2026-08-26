import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { moderationQueueRepository, Anchor } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit";
import { Section, Container, Row, Stack, Heading, Text, Badge } from "@mohasinac/appkit/client";
import { ModerationDetailActions } from "./ModerationDetailActions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_VARIANT: Record<string, "success" | "danger" | "secondary" | "warning"> = {
  approved: "success",
  rejected: "danger",
  pending: "warning",
};

export default async function AdminModerationDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await moderationQueueRepository.findById(id).catch(() => null);
  if (!item) return notFound();

  return (
    <Section padding="y-xl">
      <Container size="md">
        <Row className="mb-2" gap="sm">
          <Link
            href={String(ROUTES.ADMIN.MODERATION)}
            className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
          >
            ← Moderation Queue
          </Link>
        </Row>

        <Row justify="between" align="center" className="mb-6">
          <Heading level={1} size="2xl" weight="bold">
            {item.mediaType} · {item.entityType}
          </Heading>
          <Badge variant={STATUS_VARIANT[item.status] ?? "secondary"}>{item.status}</Badge>
        </Row>

        <Stack gap="md" padding="lg" rounded="xl" border="default">
          <Row justify="between">
            <Text color="muted" size="sm">Entity</Text>
            <Text weight="medium">{item.entityType} · {item.entityId}</Text>
          </Row>
          <Row justify="between">
            <Text color="muted" size="sm">Submitted by</Text>
            <Text weight="medium">{item.ownerId}</Text>
          </Row>
          {item.storeId && (
            <Row justify="between">
              <Text color="muted" size="sm">Store</Text>
              <Text weight="medium">{item.storeId}</Text>
            </Row>
          )}
          <Row justify="between">
            <Text color="muted" size="sm">Submitted at</Text>
            <Text weight="medium">{new Date(item.submittedAt).toLocaleString()}</Text>
          </Row>
          {item.mediaUrl && (
            <Row justify="between">
              <Text color="muted" size="sm">Media</Text>
              <Anchor href={item.mediaUrl} target="_blank">View media</Anchor>
            </Row>
          )}
          {item.reviewerId && (
            <Row justify="between">
              <Text color="muted" size="sm">Reviewed by</Text>
              <Text weight="medium">{item.reviewerId}</Text>
            </Row>
          )}
          {item.reviewedAt && (
            <Row justify="between">
              <Text color="muted" size="sm">Reviewed at</Text>
              <Text weight="medium">{new Date(item.reviewedAt).toLocaleString()}</Text>
            </Row>
          )}
          {item.reason && (
            <Stack gap="xs">
              <Text color="muted" size="sm">Reason</Text>
              <Text className="whitespace-pre-wrap">{item.reason}</Text>
            </Stack>
          )}
        </Stack>

        <Row className="mt-6">
          <ModerationDetailActions id={item.id} status={item.status} />
        </Row>
      </Container>
    </Section>
  );
}
