"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import {
  Container,
  ReviewFormDrawer,
  ROUTES,
  Section,
  Text,
  apiClient,
} from "@mohasinac/appkit/client";

/**
 * /user/reviews/[id]/edit — the buyer's own review editor.
 *
 * 🛑 There was no edit route for a review in EITHER portal. `/user/reviews` was
 * list-only, `/admin/reviews` had no per-review page, and there was no review
 * form anywhere in the application — so a reviewer had no way to change what
 * they had written. See ReviewFormDrawer's header for the full measurement.
 *
 * Shares ONE form component with the inline drawer on the product page, so the
 * two cannot drift in validation or in which fields they own.
 *
 * The drawer opens immediately and closing it returns to the list — this route
 * exists for a deep link (from a notification, or the reviews list) rather than
 * as a page a buyer lands on and browses.
 */
interface ReviewResponse {
  data?: {
    id: string;
    rating?: number;
    title?: string;
    comment?: string;
  };
}

function EditReviewPageInner() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");
  const [initial, setInitial] = useState<
    { rating: number; title: string; comment: string } | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient.get<ReviewResponse>(`/api/reviews/${id}`);
        const r = res?.data;
        if (cancelled) return;
        if (!r) {
          setError("That review could not be found.");
          return;
        }
        setInitial({
          rating: r.rating ?? 0,
          title: r.title ?? "",
          comment: r.comment ?? "",
        });
      } catch (err) {
        // First statement in the block, deliberately: a bare `catch {}`
        // discards the only description of what went wrong, and a failed load
        // is indistinguishable from a missing review to whoever is reading the
        // page. audit-catch-normalize wants the call adjacent to the catch.
        void normalizeError(err);
        if (!cancelled) setError("That review could not be loaded.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const close = () => router.push(String(ROUTES.USER.REVIEWS));

  return (
    <Section padding="y-xl">
      <Container>
        {error ? (
          <Text color="muted" size="sm">
            {error}
          </Text>
        ) : (
          <Text color="muted" size="sm">
            Editing your review…
          </Text>
        )}
        {/*
          Mounted only once the current values have loaded. Opening the drawer
          against empty state would show a blank form over a real review, and
          saving it would overwrite the text with nothing — the shape of Root
          Cause #98, where an editor seeded from the wrong value re-saved a
          destructive default.
        */}
        {initial && (
          <ReviewFormDrawer
            isOpen
            onClose={close}
            reviewId={id}
            initialValues={initial}
            onSaved={close}
          />
        )}
      </Container>
    </Section>
  );
}

/*
 * Page-level Suspense — the client tree reaches useSearchParams() through the
 * router, which throws during prerender without a boundary (Root Cause #17).
 * A route-segment config is never the fix here (Root Cause #89).
 */
export default function Page() {
  return (
    <Suspense>
      <EditReviewPageInner />
    </Suspense>
  );
}
