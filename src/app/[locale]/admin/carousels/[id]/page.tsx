import React from "react";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { carouselsRepository, AdminCarouselGroupEditorView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";
import { Heading, Section, Container, Row, Div, Text, Badge, Table, Thead, Tbody, Tr, Th, Td } from "@mohasinac/appkit/client";
import { MAX_SLIDES_PER_CAROUSEL } from "@mohasinac/appkit";


const __O = {
  hidden: "overflow-hidden",
} as const;
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCarouselDetailPage({ params }: Props) {
  const { id } = await params;
  if (id === "new") {
    return (
      <Section padding="y-xl">
        <Container>
          <Row className="mb-6" gap="sm">
            <Link
              href={String(ROUTES.ADMIN.CAROUSELS)}
              className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
            >
              ← Carousels
            </Link>
          </Row>
          <AdminCarouselGroupEditorView />
        </Container>
      </Section>
    );
  }

  const result = await carouselsRepository.getCarouselWithSlides(id).catch(() => null);
  if (!result) return notFound();

  const { carousel, slides } = result;
  const atMax = carousel.slideIds.length >= MAX_SLIDES_PER_CAROUSEL;

  return (
    <Section padding="y-xl">
      <Container>
        <Row className="mb-2" gap="sm">
          <Link
            href={String(ROUTES.ADMIN.CAROUSELS)}
            className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text-muted)]"
          >
            ← Carousels
          </Link>
        </Row>

        <Row justify="between" className="mb-6">
          <Div>
            <Heading level={1} weight="bold" size="2xl">
              {carousel.name}
            </Heading>
            <Row className="mt-1" gap="sm">
              <Badge variant={carousel.status === "active" ? "success" : "secondary"} >
                {carousel.status}
              </Badge>
              <Text variant="muted" size="sm">
                {carousel.slideIds.length}/{MAX_SLIDES_PER_CAROUSEL} slides
              </Text>
            </Row>
          </Div>
          <Link
            href={atMax ? "#" : String(ROUTES.ADMIN.CAROUSEL_NEW)}
            className={[
              "rounded-lg px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium",
              atMax
                ? "cursor-not-allowed bg-[var(--appkit-color-border)] text-[var(--appkit-color-text-muted)]"
                : "bg-[var(--appkit-color-primary)] text-white hover:opacity-90",
            ].join(" ")}
            aria-disabled={atMax}
            title={atMax ? `Maximum ${MAX_SLIDES_PER_CAROUSEL} slides reached` : undefined}
          >
            + Add Slide
          </Link>
        </Row>

        {slides.length === 0 ? (
          <Div className="text-center" padding="y-4xl" rounded="xl" border="default">
            <Text variant="muted">No slides in this carousel yet.</Text>
          </Div>
        ) : (
          <Div className={`${__O.hidden}`} rounded="xl" border="default">
            <Table size="sm">
              <Thead surface="muted">
                <Tr>
                  <Th className="text-left" padding="md" color="muted" weight="medium">Order</Th>
                  <Th className="text-left" padding="md" color="muted" weight="medium">Title</Th>
                  <Th className="text-left" padding="md" color="muted" weight="medium">Active</Th>
                  <Th className="text-right" padding="md" color="muted" weight="medium">Edit</Th>
                </Tr>
              </Thead>
              <Tbody className="divide-y divide-zinc-100 divide-[var(--appkit-color-border)]">
                {slides.map((slide, idx) => (
                  <Tr key={slide.id} className="bg-[var(--appkit-color-surface)] hover:bg-[var(--appkit-color-bg)] dark:bg-[var(--appkit-color-surface-elevated)] dark:hover:bg-[var(--appkit-color-surface-elevated)]">
                    <Td padding="md" color="muted">{idx + 1}</Td>
                    <Td weight="medium" padding="md" color="primary">{slide.title}</Td>
                    <Td padding="md">
                      <Badge variant={slide.active ? "success" : "secondary"} >
                        {slide.active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td className="text-right" padding="md">
                      <Link
                        href={String(ROUTES.ADMIN.CAROUSEL_EDIT(slide.id))}
                        className="text-[var(--appkit-color-primary)] hover:underline"
                      >
                        Edit slide
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
