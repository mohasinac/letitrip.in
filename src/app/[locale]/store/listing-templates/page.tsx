"use client";
import { readListResponse } from "@/lib/api/read-list-response";
import { normalizeError } from "@mohasinac/appkit/client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Alert,
  EmptyState,
  Row,
  Section,
  ROUTES,
  ACTIONS,
  Skeleton,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { getListingTemplates } from "@/lib/api/store-client";
import {useEffect, useState, Suspense } from "react";
import type { ListingTemplateDocument } from "@mohasinac/appkit/client";



function PageInner() {
  const router = useRouter();
  const [items, setItems] = useState<ListingTemplateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getListingTemplates(API_ROUTES.STORE.LISTING_TEMPLATES)
      .then((r) => readListResponse<ListingTemplateDocument>(r, "templates"))
      .then(setItems)
      .catch((err) => setLoadError(normalizeError(err).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Row justify="between">
            <Heading level={1}>Listing Templates</Heading>
            <Button
              variant="primary"
              onClick={() => router.push(String(ROUTES.STORE.LISTING_TEMPLATES_NEW))}
            >
              New template
            </Button>
          </Row>
          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
            </Stack>
          ) : loadError ? (
            // A FAILED request must not render the empty state. `errorResponse()`
            // is valid JSON with a non-2xx status, so `r.json()` resolved and
            // `?? []` produced an empty list — the page said "nothing here"
            // when it meant "the request failed". See readListResponse.
            <Alert variant="error" title="Couldn't load this list">
              {loadError} Refresh to retry.
            </Alert>
          ) : items.length === 0 ? (
            <EmptyState
              title="No templates yet"
              description="Templates pre-fill the create form with your defaults for each listing type."
            />
          ) : (
            <Stack gap="sm">
              {items.map((t) => (
                <Row
                  key={t.id} rounded="default" padding="md" border="default" align="center" justify="between">
                  <Stack gap="xs">
                    <Text weight="medium">{t.name}</Text>
                    <Text size="xs" color="muted">
                      {t.listingType} · used {t.usageCount}× ·{" "}
                      {t.isShared ? "Shared" : "Private"}
                    </Text>
                  </Stack>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(String(ROUTES.STORE.LISTING_TEMPLATES_EDIT(t.id)))
                    }
                  >
                    {ACTIONS.STORE["edit-listing"].label}
                  </Button>
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
