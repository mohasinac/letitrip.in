import React from "react";
import Link from "next/link";
import { carouselsRepository } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";
import { Heading, Section, Container, Row, Div, Text, Badge } from "@mohasinac/appkit/client";
import { MAX_SLIDES_PER_CAROUSEL } from "@mohasinac/appkit";

export const dynamic = "force-dynamic";

export default async function AdminCarouselsPage() {
  const carousels = await carouselsRepository.listCarousels().catch(() => []);

  return (
    <Section className="py-8">
      <Container>
        <Row className="mb-6 items-center justify-between">
          <Heading level={1} className="text-2xl font-bold">
            Named Carousels
          </Heading>
          <Link
            href={`${String(ROUTES.ADMIN.CAROUSELS)}/new`}
            className="rounded-lg bg-[var(--appkit-color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + New Carousel
          </Link>
        </Row>

        {carousels.length === 0 ? (
          <Div className="rounded-xl border border-zinc-200 py-16 text-center dark:border-slate-700">
            <Text variant="muted">No named carousels yet. Create one to group slides.</Text>
          </Div>
        ) : (
          <Div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">Slides</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-700">
                {carousels.map((carousel) => (
                  <tr key={carousel.id} className="bg-white hover:bg-zinc-50 dark:bg-slate-900 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                      {carousel.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {carousel.slideIds.length}/{MAX_SLIDES_PER_CAROUSEL}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={carousel.status === "active" ? "success" : "secondary"}
                                              >
                        {carousel.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={String(ROUTES.ADMIN.CAROUSEL_DETAIL(carousel.id))}
                        className="text-[var(--appkit-color-primary)] hover:underline"
                      >
                        Edit
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
