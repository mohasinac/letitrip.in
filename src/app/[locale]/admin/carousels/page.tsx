import { Link } from "@/i18n/navigation";
import { carouselsRepository } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit";
import { Heading, Section, Container, Row, Text, Badge, EmptyState, Table, Thead, Tbody, Tr, Th, Td, Div } from "@mohasinac/appkit/client";

const __O = {
  hidden: "overflow-hidden",
} as const;

export default async function AdminCarouselsPage() {
  const carousels = await carouselsRepository.listCarousels();

  return (
    <Section padding="y-xl">
      <Container>
        <Row justify="between" className="mb-6">
          <Heading level={1} size="2xl" weight="bold">Named Carousels</Heading>
          <Link
            href={String(ROUTES.ADMIN.CAROUSELS_NEW)}
            className="rounded-lg px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium bg-[var(--appkit-color-primary)] text-white hover:opacity-90"
          >
            + New Carousel
          </Link>
        </Row>

        {carousels.length === 0 ? (
          <EmptyState
            title="No named carousels yet"
            description="Named carousels group slides for contextual use (homepage, category pages)."
            actionLabel="New Carousel"
            actionHref={String(ROUTES.ADMIN.CAROUSELS_NEW)}
          />
        ) : (
          <Div className={`${__O.hidden}`} rounded="xl" border="default">
            <Table size="sm">
              <Thead surface="muted">
                <Tr>
                  <Th className="text-left" padding="md" color="muted" weight="medium">Name</Th>
                  <Th className="text-left" padding="md" color="muted" weight="medium">Status</Th>
                  <Th className="text-left" padding="md" color="muted" weight="medium">Slides</Th>
                  <Th className="text-right" padding="md" color="muted" weight="medium">View</Th>
                </Tr>
              </Thead>
              <Tbody className="divide-y divide-zinc-100 divide-[var(--appkit-color-border)]">
                {carousels.map((carousel) => (
                  <Tr key={carousel.id} className="bg-[var(--appkit-color-surface)] hover:bg-[var(--appkit-color-bg)] dark:bg-[var(--appkit-color-surface-elevated)] dark:hover:bg-[var(--appkit-color-surface-elevated)]">
                    <Td weight="medium" padding="md" color="primary">{carousel.name}</Td>
                    <Td padding="md">
                      <Badge variant={carousel.status === "active" ? "success" : "secondary"}>
                        {carousel.status}
                      </Badge>
                    </Td>
                    <Td padding="md" color="muted">
                      <Text size="sm" variant="muted">{(carousel.slideIds ?? []).length}</Text>
                    </Td>
                    <Td className="text-right" padding="md">
                      <Link
                        href={String(ROUTES.ADMIN.CAROUSEL_DETAIL(carousel.id))}
                        className="text-[var(--appkit-color-primary)] hover:underline"
                      >
                        View
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Div>
        )}
      </Container>
    </Section>
  );
}
