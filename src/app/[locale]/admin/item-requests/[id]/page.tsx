import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { itemRequestsRepository } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit";
import { Section, Container, Row, Stack, Heading, Text, Badge } from "@mohasinac/appkit/client";
import { ItemRequestDetailActions } from "./ItemRequestDetailActions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_VARIANT: Record<string, "success" | "danger" | "secondary" | "warning"> = {
  "pending-approval": "warning",
  open: "success",
  fulfilled: "secondary",
  closed: "secondary",
  rejected: "danger",
};

export default async function AdminItemRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await itemRequestsRepository.findById(id);
  if (!item) return notFound();

  return (
    <Section padding="y-xl">
      <Container size="md">
        <Row className="mb-2" gap="sm">
          <Link
            href={String(ROUTES.ADMIN.ITEM_REQUESTS)}
            className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
          >
            ← Item Requests
          </Link>
        </Row>

        <Row justify="between" align="center" className="mb-6">
          <Heading level={1} size="2xl" weight="bold">
            {item.title}
          </Heading>
          <Badge variant={STATUS_VARIANT[item.status] ?? "secondary"}>{item.status.replace(/-/g, " ")}</Badge>
        </Row>

        <Stack gap="md" padding="lg" rounded="xl" border="default">
          <Row justify="between">
            <Text color="muted" size="sm">Requested by</Text>
            <Text weight="medium">{item.opDisplayName}</Text>
          </Row>
          {item.category && (
            <Row justify="between">
              <Text color="muted" size="sm">Category</Text>
              <Text weight="medium">{item.category}</Text>
            </Row>
          )}
          {item.brand && (
            <Row justify="between">
              <Text color="muted" size="sm">Brand</Text>
              <Text weight="medium">{item.brand}</Text>
            </Row>
          )}
          {typeof item.maxBudget === "number" && (
            <Row justify="between">
              <Text color="muted" size="sm">Max budget</Text>
              <Text weight="medium">₹{item.maxBudget}</Text>
            </Row>
          )}
          <Row justify="between">
            <Text color="muted" size="sm">Replies</Text>
            <Text weight="medium">{item.replyCount}</Text>
          </Row>
          <Stack gap="xs">
            <Text color="muted" size="sm">Description</Text>
            <Text className="whitespace-pre-wrap">{item.description}</Text>
          </Stack>
        </Stack>

        <Row className="mt-6">
          <ItemRequestDetailActions id={item.id} status={item.status} />
        </Row>
      </Container>
    </Section>
  );
}
