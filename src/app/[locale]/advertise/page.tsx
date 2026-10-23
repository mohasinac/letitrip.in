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
  Form,
  FieldInput,
  FieldTextarea,
  useToast,
} from "@mohasinac/appkit/client";
import { ACTIONS } from "@mohasinac/appkit/client";
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

function AdvertiseInner() {
  const { showToast } = useToast();
  const [slots, setSlots] = React.useState<SlotOffer[] | null>(null);
  const [picked, setPicked] = React.useState<{ placementId: string; period: string } | null>(null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [ctaLabel, setCtaLabel] = React.useState("");
  const [ctaHref, setCtaHref] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch(API_ROUTES.ADS.SLOTS);
    const json = (await res.json().catch(() => ({}))) as { data?: { slots?: SlotOffer[] } };
    setSlots(json.data?.slots ?? []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

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

                <Form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  {({ setFieldError, clearErrors }) => (
                    <>
                      <FieldInput
                        name="title"
                        label="Headline"
                        required
                        value={title}
                        onChange={setTitle}
                      />
                      <FieldTextarea
                        name="body"
                        label="Body (optional)"
                        value={body}
                        onChange={setBody}
                      />
                      <FieldInput
                        name="ctaLabel"
                        label="Button text (optional)"
                        value={ctaLabel}
                        onChange={setCtaLabel}
                      />
                      <FieldInput
                        name="ctaHref"
                        label="Button link (optional)"
                        value={ctaHref}
                        onChange={setCtaHref}
                      />
                      <Button
                        type="submit"
                        isLoading={isSaving}
                        action={ACTIONS.ADS["book-ad-slot"]}
                        onClick={async () => {
                          clearErrors();
                          setIsSaving(true);
                          try {
                            const res = await fetch(API_ROUTES.ADS.BOOKINGS, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                placementId: picked.placementId,
                                period: picked.period,
                                creative: {
                                  title,
                                  ...(body ? { body } : {}),
                                  ...(ctaLabel ? { ctaLabel } : {}),
                                  ...(ctaHref ? { ctaHref } : {}),
                                },
                              }),
                            });
                            const json = (await res.json().catch(() => ({}))) as {
                              ok?: boolean;
                              error?: string;
                            };
                            if (!res.ok || !json.ok) {
                              /*
                               * 🛑 The 409 reaches the user as its own
                               * sentence and the calendar is reloaded. The
                               * slot was free when the page rendered and is
                               * not now — telling them "something went
                               * wrong" while still showing it as available
                               * would invite the same click again.
                               */
                              setFieldError(
                                "title",
                                res.status === 409
                                  ? "Someone booked that month while you were filling this in — pick another."
                                  : "We could not book that slot. Check the fields and try again.",
                              );
                              await load();
                              setPicked(null);
                              return;
                            }
                            showToast("Booked — your creative is awaiting review.", "success");
                            setPicked(null);
                            setTitle("");
                            setBody("");
                            setCtaLabel("");
                            setCtaHref("");
                            await load();
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                      >
                        Book this slot
                      </Button>
                    </>
                  )}
                </Form>
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
