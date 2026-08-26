import React from "react";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { adminGetEventById, ROUTES } from "@mohasinac/appkit";
import { Section, Container, Row, Stack, Heading, Text } from "@mohasinac/appkit/client";
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
 */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminLotteryConfigPage({ params }: Props) {
  const { id } = await params;

  const event = await adminGetEventById(id).catch(() => null);
  if (!event || event.type !== "lottery") return notFound();

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
        </Stack>
      </Container>
    </Section>
  );
}
