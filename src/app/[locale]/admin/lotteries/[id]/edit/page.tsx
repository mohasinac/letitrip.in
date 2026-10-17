import React from "react";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { requireRecord } from "@mohasinac/appkit/next/routing/require-record";
import { adminGetEventById } from "@mohasinac/appkit/features/events/actions/event-actions";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { Section, Container, Row, Stack, Heading, Text } from "@mohasinac/appkit/client";
import { LotteryAdminSlotView } from "@mohasinac/appkit/client";
import { LotteryConfigClient } from "./LotteryConfigClient";

/**
 * Configure a lottery's slots.
 *
 * ## Why this page did not exist
 *
 * `LotteryAdminEditView` was a complete, working editor with **zero
 * consumers** — found by `audit-orphan-view-component`. It was not merely
 * unwired: wiring it to the obvious route would have destroyed data, because
 * its submit hardcoded `isBooked: false` on every slot and
 * `PATCH /api/admin/events/[id]` is `.passthrough()`. So a lottery's slots
 * could only ever come from `npm run seed`, on a feature whose public pages
 * were live.
 *
 * ## 🛑 `adminGetEventById`, never `getLotteryEventCached`
 *
 * The cached reader runs `toClientLotteryConfig`, an allow-list that strips
 * `price` and `weight` from every slot. Seeding this form from it would show
 * every price as 0 and then save those zeros back — a silent, total repricing
 * that looks like a normal edit.
 *
 * ## Slots only
 *
 * Title, dates, status and media belong to the event and are edited in the
 * ordinary event editor, which is where a lottery is now created (its type
 * picker was missing `lottery` entirely). This page owns the one thing that
 * editor cannot express.
 *
 * ## The read-only panel is not decoration
 *
 * The form's write shape deliberately cannot name `isBooked` or `weight` — a
 * field the form can send is a field the form can destroy (Root Cause #76), so
 * `lotterySlotWriteSchema` is `.strict()` with neither. The consequence is that
 * an admin pricing slots had **no surface anywhere** showing which slots were
 * already claimed, or what odds their prices produced. `LotteryAdminSlotView`
 * answers both and was itself orphaned — found by `audit-orphan-view-component`
 * alongside the editor, and left unwired for the same reason: the page that
 * would host it did not exist. Fed from `adminGetEventById`, so the weights are
 * the real server-derived ones.
 *
 * 🛑 Each slot is mapped field-by-field, never spread. `bookedByUserId` /
 * `bookedByDisplayName` are PII and must not cross into a Client Component
 * prop, which Next.js serialises into the page's HTML (Root Cause #70).
 */

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminLotteryConfigPage({ params }: Props) {
  const { id } = await params;

  /*
   * 🛑 `requireRecord`, not `.catch(() => null)` followed by `notFound()`.
   *
   * That shape conflates two different outcomes: a Firestore failure and a
   * lottery that does not exist. It 404'd a REAL lottery whenever the read
   * threw — telling the admin their event was gone — and left no trace
   * anywhere. `requireRecord` 404s only on a genuine absence and records a
   * `DEGRADED_READ` otherwise, which is why it exists.
   *
   * A non-lottery event at this URL is a wrong URL, not a missing record, so
   * that stays an explicit `notFound()`.
   */
  const event = await requireRecord(() => adminGetEventById(id), {
    route: "/admin/lotteries/[id]/edit",
    key: "events.adminGetEventById",
  });
  if (event && event.type !== "lottery") notFound();

  /*
   * `event` is null ONLY when the read itself failed — an absent lottery has
   * already 404'd above. Say so rather than rendering an editor seeded from
   * nothing, which would show every slot price as 0 and let an admin save
   * those zeros back over real prices.
   */
  if (!event) {
    return (
      <Section padding="y-xl">
        <Container>
          <Stack gap="md">
            <Heading level={1} weight="bold" size="2xl">
              Could not load this lottery
            </Heading>
            <Text variant="muted" size="sm">
              The read failed rather than returning nothing, so the lottery is
              probably still there. Reload in a moment; the failure has been
              recorded.
            </Text>
          </Stack>
        </Container>
      </Section>
    );
  }

  const cfg = event.lotteryConfig;

  return (
    <Section padding="y-xl">
      <Container>
        <Stack gap="lg">
          <Row gap="sm">
            <Link
              href={String(ROUTES.ADMIN.LOTTERIES)}
              className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
            >
              ← Lotteries
            </Link>
          </Row>

          <Stack gap="xs">
            <Heading level={1} weight="bold" size="2xl">
              {event.title}
            </Heading>
            <Text variant="muted" size="sm">
              Slots and pricing. Dates, status and media are edited on the event
              itself.
            </Text>
          </Stack>

          <LotteryConfigClient
            eventId={id}
            initialData={{
              title: event.title,
              description: event.description ?? "",
              totalSlots: cfg?.totalSlots ?? 1,
              pricingMode: cfg?.pricingMode ?? "uniform",
              uniformPrice: cfg?.uniformPrice,
              drawWindowDurationMinutes: cfg?.drawWindowDurationMinutes ?? 5,
              maxPullsPerTransaction: cfg?.maxPullsPerTransaction ?? 1,
              maxPullsPerUser: cfg?.maxPullsPerUser ?? 1,
              // Real prices, because this came from the admin reader. A booked
              // slot's buyer is deliberately NOT passed down — the form cannot
              // express booking state, so it cannot overwrite it.
              slots: (cfg?.slots ?? []).length
                ? cfg!.slots.map((s) => ({
                    slotNumber: s.slotNumber,
                    name: s.name,
                    image: s.image,
                    price: s.price,
                  }))
                : [{ slotNumber: 1, name: "", price: 0 }],
            }}
          />

          {(cfg?.slots ?? []).length > 0 ? (
            <LotteryAdminSlotView
              slots={(cfg?.slots ?? []).map((s) => ({
                slotNumber: s.slotNumber,
                name: s.name,
                image: s.image,
                isBooked: Boolean(s.isBooked),
                price: s.price ?? 0,
                weight: s.weight ?? 0,
              }))}
            />
          ) : null}
        </Stack>
      </Container>
    </Section>
  );
}
