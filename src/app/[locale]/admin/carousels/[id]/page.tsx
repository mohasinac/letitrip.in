import React from "react";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { carouselsRepository } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";
import { Heading, Section, Container, Row, Div, Text, Badge, EmptyState } from "@mohasinac/appkit/client";
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
      <Section className="py-8">
        <Container>
          <Row className="mb-6 gap-2">
            <Link
              href={String(ROUTES.ADMIN.CAROUSELS)}
              className="text-sm text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
            >
              ← Carousels
            </Link>
          </Row>
          <Heading level={1} className="mb-6 text-2xl font-bold">New Named Carousel</Heading>
          <EmptyState
            title="Named carousel creation via API"
            description={
              <span>
                Named carousels group and organise slides for contextual use (e.g. homepage,
                category pages). To create one, POST to{" "}
                <code className="font-mono text-xs bg-[var(--appkit-color-border)] px-1 py-0.5 rounded">/api/admin/carousel</code>{" "}
                with a <code className="font-mono text-xs bg-[var(--appkit-color-border)] px-1 py-0.5 rounded">name</code> field,
                or use the LetItRip CLI. An admin UI form is planned for a future session.
              </span>
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
    <Section className="py-8">
      <Container>
        <Row className="mb-2 gap-2">
          <Link
            href={String(ROUTES.ADMIN.CAROUSELS)}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ← Carousels
          </Link>
        </Row>

        <Row justify="between" className="mb-6">
          <Div>
            <Heading level={1} className="text-2xl font-bold">
              {carousel.name}
            </Heading>
            <Row className="mt-1 gap-2">
              <Badge variant={carousel.status === "active" ? "success" : "secondary"} >
                {carousel.status}
              </Badge>
              <Text variant="muted" className="text-sm">
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
          <Div className="rounded-xl border border-zinc-200 py-16 text-center dark:border-slate-700">
            <Text variant="muted">No slides in this carousel yet.</Text>
          </Div>
        ) : (
          <Div className={`${__O.hidden} rounded-xl border border-zinc-200 dark:border-slate-700`}>
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">Active</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-300">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-700">
                {slides.map((slide, idx) => (
                  <tr key={slide.id} className="bg-white hover:bg-zinc-50 dark:bg-slate-900 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">{slide.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant={slide.active ? "success" : "secondary"} >
                        {slide.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={String(ROUTES.ADMIN.CAROUSEL_EDIT(slide.id))}
                        className="text-[var(--appkit-color-primary)] hover:underline"
                      >
                        Edit slide
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Div>
        )}
      </Container>
    </Section>
  );
}
