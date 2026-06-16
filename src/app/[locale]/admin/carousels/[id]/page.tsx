import React from "react";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { Code, Span, carouselsRepository } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";
import { Heading, Section, Container, Row, Div, Text, Badge, EmptyState, Table, Thead, Tbody, Tr, Th, Td } from "@mohasinac/appkit/client";
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
              className="text-sm text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
            >
              ← Carousels
            </Link>
          </Row>
          <Heading level={1} className="mb-6" size="2xl" weight="bold">New Named Carousel</Heading>
          <EmptyState
            title="Named carousel creation via API"
            description={
              <Span>
                Named carousels group and organise slides for contextual use (e.g. homepage,
                category pages). To create one, POST to{" "}
                <Code size="xs" padding="inline" rounded="default" surface="subtle">/api/admin/carousel</Code>{" "}
                with a <Code size="xs" padding="inline" rounded="default" surface="subtle">name</Code> field,
                or use the LetItRip CLI. An admin UI form is planned for a future session.
              </Span>
            }
            actionLabel="Back to carousels"
            actionHref={String(ROUTES.ADMIN.CAROUSELS)}
          />
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
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
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
              "rounded-lg px-4 py-2 text-sm font-medium",
              atMax
                ? "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-slate-700 dark:text-zinc-500"
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
            <Table className="w-full text-sm">
              <Thead surface="muted">
                <Tr>
                  <Th className="text-left" padding="md" color="muted" weight="medium">Order</Th>
                  <Th className="text-left" padding="md" color="muted" weight="medium">Title</Th>
                  <Th className="text-left" padding="md" color="muted" weight="medium">Active</Th>
                  <Th className="text-right" padding="md" color="muted" weight="medium">Edit</Th>
                </Tr>
              </Thead>
              <Tbody className="divide-y divide-zinc-100 dark:divide-slate-700">
                {slides.map((slide, idx) => (
                  <Tr key={slide.id} className="bg-white hover:bg-zinc-50 dark:bg-slate-900 dark:hover:bg-slate-800">
                    <Td className="text-zinc-500 dark:text-zinc-400" padding="md">{idx + 1}</Td>
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
