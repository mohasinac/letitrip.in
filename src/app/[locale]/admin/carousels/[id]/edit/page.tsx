import React from "react";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { carouselsRepository, AdminCarouselGroupEditorView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit";
import { Section, Container, Row } from "@mohasinac/appkit/client";

/**
 * Rename a named carousel GROUP, or change its status.
 *
 * There was no way to do either. `AdminCarouselGroupEditorView` was create-only
 * — a carousel's name was fixed at the moment it was created, for its whole
 * life. The API had supported PATCH the entire time.
 *
 * ## The editor loads its own record
 *
 * This page only proves the id exists (so a bad URL is a 404 rather than an
 * editor bound to nothing) and does NOT pass the document down. The editor
 * fetches from the single-item GET itself, which is the rule that keeps
 * Root Cause #38 out: an editor seeded from a narrower projection re-sends the
 * fields it never received as their defaults on the next save.
 *
 * ## PATCH, not PUT
 *
 * `/api/admin/carousels/[id]` exports GET/PATCH/DELETE. The sibling
 * `AdminFeatureEditorView` uses `apiClient.put`, and copying it here would have
 * been a silent 405 — `audit-client-verb-match` now blocks that class.
 */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCarouselGroupEditPage({ params }: Props) {
  const { id } = await params;

  const existing = await carouselsRepository.findById(id);
  if (!existing) return notFound();

  return (
    <Section padding="y-xl">
      <Container>
        <Row className="mb-6" gap="sm">
          <Link
            href={String(ROUTES.ADMIN.CAROUSEL_DETAIL(id))}
            className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
          >
            ← {existing.name}
          </Link>
        </Row>
        <AdminCarouselGroupEditorView carouselId={id} />
      </Container>
    </Section>
  );
}
