"use client";

/**
 * D56 — the public rate card and self-serve booking form.
 *
 * 🛑 A month that is TAKEN is shown as taken, not hidden. A calendar with
 * gaps looks like a bug; a calendar that says "November — booked" is the
 * answer the visitor came for, and it is also what makes the 409 on a
 * racing booking comprehensible rather than mysterious.
 *
 * 🛑 It never says WHO booked a month. `/api/ads/slots` returns availability
 * only — a boolean per period — so there is nothing on this page to leak.
 * Who advertises where is a commercial fact about two other parties.
 */

import * as React from "react";
import { Suspense } from "react";
import {
  Section,
  Container,
  Stack,
  Row,
  Grid,
  Div,
  Heading,
  Text,
  Badge,
  Button,
  FormShellContext,
  FormErrorSummary,
  SectionForm,
  buildSectionsFromSchema,
  useSectionFormNav,
  useFormShellState,
  applyZodIssues,
  useApiMutation,
  apiClient,
  adCreativeFormSchema,
  useToast,
} from "@mohasinac/appkit/client";
import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/constants/api";

interface SlotOffer {
  placementId: string;
  label: string;
  priceRsPerPeriod: number;
  availability: { period: string; available: boolean }[];
}

function monthLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatRs(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface CreativeValues {
  [key: string]: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

const EMPTY_CREATIVE: CreativeValues = { title: "", body: "", ctaLabel: "", ctaHref: "" };

/** The wire shape — the creative NESTS, while the form above is flat. */
interface BookSlotPayload {
  placementId: string;
  period: string;
  creative: {
    title: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
}

function AdvertiseInner() {
  const { showToast } = useToast();
  const [picked, setPicked] = React.useState<{ placementId: string; period: string } | null>(null);
  const [form, setForm] = React.useState<CreativeValues>(EMPTY_CREATIVE);

  /*
   * 🛑 `useQuery`, not a `useEffect` + `fetch`. The booking mutation
   * INVALIDATES this key on both success and a 409, which is what reloads the
   * calendar — a hand-rolled loader meant every caller had to remember to
   * call it, and the 409 path is exactly the one where forgetting leaves a
   * taken month still rendered as available.
   */
  const slotsQuery = useQuery({
    queryKey: ["ads", "slots"],
    queryFn: () => apiClient.get<{ slots: SlotOffer[] }>(API_ROUTES.ADS.SLOTS),
  });
  const slots = slotsQuery.data?.slots ?? (slotsQuery.isPending ? null : []);

  const sections = React.useMemo(
    () => buildSectionsFromSchema<CreativeValues>(adCreativeFormSchema),
    [],
  );
  const nav = useSectionFormNav(sections, form);
  const { shellCtx, setFieldError } = useFormShellState(adCreativeFormSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  const bookMutation = useApiMutation({
    errorMessage: "We could not book that slot.",
    /*
     * 🛑 A NAMED payload, not `Record<string, unknown>`. A bag of unknowns
     * type-checks against anything, so a misspelled `placmentId` would
     * compile and reach the route as an unrecognised key — which
     * `adBookingWriteSchema` is `.strict()` about, so it would surface as an
     * opaque 400 on a field nobody can see (`audit-unknown-leakage`).
     */
    mutationFn: (payload: BookSlotPayload) =>
      apiClient.post(API_ROUTES.ADS.BOOKINGS, payload),
    onSuccess: () => {
      showToast("Booked — your creative is awaiting review.", "success");
      setPicked(null);
      setForm(EMPTY_CREATIVE);
      void slotsQuery.refetch();
    },
    onError: (error) => {
      /*
       * 🛑 The 409 reaches the advertiser as its own sentence AND the
       * calendar is refetched. The slot was free when the page rendered and
       * is not now — saying "something went wrong" while still showing it as
       * available invites the identical click again.
       */
      const status = (error as { status?: number } | null)?.status;
      setFieldError(
        "title",
        status === 409
          ? "Someone booked that month while you were filling this in — pick another."
          : "We could not book that slot. Check the fields and try again.",
      );
      if (status === 409) {
        setPicked(null);
        void slotsQuery.refetch();
      }
    },
  });

  const onSubmit = () => {
    if (!picked) return;
    const parsed = adCreativeFormSchema.safeParse(form);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }
    const { title, body, ctaLabel, ctaHref } = parsed.data;
    bookMutation.mutate({
      placementId: picked.placementId,
      period: picked.period,
      /* The wire shape NESTS these; the form is flat so the schema can drive
       * the fields. Empty strings are dropped rather than sent — `.strict()`
       * on the wire schema would reject an empty `ctaHref` as a bad url. */
      creative: {
        title,
        ...(body ? { body } : {}),
        ...(ctaLabel ? { ctaLabel } : {}),
        ...(ctaHref ? { ctaHref } : {}),
      },
    });
  };

  if (slots === null) {
    return (
      <Section padding="y-xl">
        <Container>
          <Text variant="secondary">Loading the rate card…</Text>
        </Container>
      </Section>
    );
  }

  /*
   * 🛑 Nothing for sale is said OUT LOUD rather than rendered as an empty
   * grid. A page with a heading and no cards reads as broken; a page that
   * says there is no inventory right now is the truth and is actionable.
   */
  if (slots.length === 0) {
    return (
      <Section padding="y-xl">
        <Container>
          <Heading level={1}>Advertise with us</Heading>
          <Text variant="secondary" className="mt-3">
            No ad slots are for sale at the moment. Check back soon.
          </Text>
        </Container>
      </Section>
    );
  }

  return (
    <Section padding="y-xl">
      <Container>
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading level={1}>Advertise with us</Heading>
            <Text variant="secondary">
              A flat fee per slot per month. Pick a slot and a month, send us your
              creative, and we review it before it goes live.
            </Text>
          </Stack>

          <Grid cols="cards" gap="md">
            {slots.map((slot) => (
              <Div
                key={slot.placementId}
                padding="5"
                rounded="xl"
                shadow="sm"
                className="border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)]"
              >
                <Stack gap="sm">
                  <Row justify="between" align="start" gap="3">
                    <Text weight="semibold">{slot.label}</Text>
                    <Text weight="semibold" numeric>
                      {formatRs(slot.priceRsPerPeriod)}
                      <Text as="span" size="xs" variant="secondary">
                        {" "}/ month
                      </Text>
                    </Text>
                  </Row>
                  <Stack gap="xs">
                    {slot.availability.map((a) => {
                      const isPicked =
                        picked?.placementId === slot.placementId && picked?.period === a.period;
                      return (
                        <Row key={a.period} justify="between" align="center" gap="3">
                          <Text size="sm">{monthLabel(a.period)}</Text>
                          {a.available ? (
                            <Button
                              size="sm"
                              variant={isPicked ? "primary" : "secondary"}
                              onClick={() =>
                                setPicked({ placementId: slot.placementId, period: a.period })
                              }
                            >
                              {isPicked ? "Selected" : "Select"}
                            </Button>
                          ) : (
                            /*
                             * Taken, and said so. Hiding the row would make
                             * the calendar look sparse for no stated reason.
                             */
                            <Badge variant="pending">Booked</Badge>
                          )}
                        </Row>
                      );
                    })}
                  </Stack>
                </Stack>
              </Div>
            ))}
          </Grid>

          {picked && (
            <Div
              padding="5"
              rounded="xl"
              shadow="sm"
              className="border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)]"
            >
              <Stack gap="md">
                <Stack gap="xs">
                  <Heading level={2} size="lg">
                    Your creative
                  </Heading>
                  <Text size="sm" variant="secondary">
                    {slots.find((s) => s.placementId === picked.placementId)?.label} ·{" "}
                    {monthLabel(picked.period)}
                  </Text>
                  {/*
                    Said before they type, not after they submit. "Awaiting
                    review" arriving as a surprise on the confirmation screen
                    reads as a problem; said here it is the deal.
                  */}
                  <Text size="xs" variant="secondary">
                    Every creative is reviewed by a person before it appears
                    anywhere on the site.
                  </Text>
                </Stack>

                <FormShellContext.Provider value={shellCtx}>
                  <FormErrorSummary />
                  <SectionForm<CreativeValues>
                    sections={sections}
                    values={form}
                    onChange={(partial) => setForm((prev) => Object.assign({}, prev, partial))}
                    onSubmit={onSubmit}
                    schema={adCreativeFormSchema}
                    openIds={nav.openIds}
                    onOpenChange={nav.setOpenIds}
                    isLoading={bookMutation.isPending}
                    submitLabel="Book this slot"
                    onCancel={() => {
                      setPicked(null);
                      setForm(EMPTY_CREATIVE);
                    }}
                    cancelLabel="Cancel"
                  />
                </FormShellContext.Provider>
              </Stack>
            </Div>
          )}
        </Stack>
      </Container>
    </Section>
  );
}

/*
 * Page-level Suspense — the appkit client primitives below reach
 * `useSearchParams()` through the shell, which throws during prerender
 * without a boundary (Root Cause #17b). A route-segment config is never the
 * fix here; `audit-no-force-dynamic` blocks it.
 */
export default function AdvertisePage() {
  return (
    <Suspense>
      <AdvertiseInner />
    </Suspense>
  );
}
