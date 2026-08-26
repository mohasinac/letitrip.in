import React from "react";
import { Link } from "@/i18n/navigation";
import { AdminCarouselGroupEditorView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";
import { Section, Container, Row } from "@mohasinac/appkit/client";

/**
 * Create a named carousel GROUP.
 *
 * ## Why this replaces a magic id
 *
 * `/admin/carousels/[id]` used to special-case `id === "new"` and render the
 * editor instead of a detail page. That works right up until a carousel is
 * genuinely stored with the id `new` — at which point the real record becomes
 * permanently unreachable, and nothing reports it. A static segment is also
 * what `audit-dead-route-key` can actually see; a magic value inside a dynamic
 * route is invisible to it.
 *
 * Next.js resolves a static segment before a dynamic one, so this file wins
 * over `[id]` on its own — but the special case is deleted anyway rather than
 * left as dead-but-shadowed code.
 *
 * ## Group, not slide
 *
 * `ROUTES.ADMIN.CAROUSELS_NEW` (plural) is this page. `CAROUSEL_NEW`
 * (singular, `/admin/carousel/new`) is a SLIDE and is a different entity.
 */
export const dynamic = "force-dynamic";

export default function AdminCarouselGroupNewPage() {
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
