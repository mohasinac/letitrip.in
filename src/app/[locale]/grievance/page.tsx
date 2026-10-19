import type { Metadata } from "next";
import { PolicyPageView } from "@mohasinac/appkit/features/about/components/PolicyPageView";
import { Div, Heading, Stack, Row, Text, Anchor, PendingValue } from "@mohasinac/appkit/ui";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { BUSINESS, businessAddressLines } from "@/constants/business";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Grievance Redressal — LetItRip",
  description:
    "How to raise a complaint with LetItRip, who handles it, and how long we take to respond.",
  path: "/grievance",
  keywords: ["letitrip grievance officer", "complaint", "grievance redressal"],
});

/**
 * One row of the officer card.
 *
 * `<PendingValue>` rather than `value ?? "—"`: an em-dash reads as "not
 * applicable", and a blank reads as a layout bug. Neither says "we have not
 * published this yet", which is the true state and the one a reader — or a
 * PhonePe reviewer — needs to see.
 */
function Field({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  return (
    <Row gap="sm" wrap>
      <Text size="sm" color="muted" className="min-w-[9rem]">
        {label}
      </Text>
      <Text size="sm" weight="medium">
        <PendingValue value={value} label={label}>
          {href && value ? <Anchor href={href}>{value}</Anchor> : value}
        </PendingValue>
      </Text>
    </Row>
  );
}

export default function Page() {
  const g = BUSINESS.grievance;
  const addressLines = businessAddressLines();

  return (
    <PolicyPageView policy="grievance">
      {/*
        The officer's details come from appkit.config.js -> business.grievance,
        NOT from i18n: they are deployment-specific and several are still
        undecided. Rendering them through <PendingValue> keeps the page honest
        about which ones.

        🛑 Every field here must be filled before submitting to PhonePe —
        a reviewer who sees [to be confirmed] on this page will reject the
        application, and an unpublished grievance officer is a compliance gap
        under the Consumer Protection (E-Commerce) Rules 2020 regardless.
      */}
      <Div
        surface="muted"
        padding="card"
        rounded="lg"
        border="default"
        className="mt-10"
      >
        <Heading level={2} size="lg" className="mb-4">
          Grievance Officer
        </Heading>

        <Stack gap="sm">
          <Field label="Name" value={g?.name} />
          <Field label="Designation" value={g?.designation} />
          <Field
            label="Email"
            value={g?.email}
            href={g?.email ? `mailto:${g.email}` : undefined}
          />
          <Field
            label="Phone"
            value={g?.phone}
            href={g?.phone ? `tel:${g.phone.replace(/[^\d+]/g, "")}` : undefined}
          />
        </Stack>

        <Heading level={3} size="sm" className="mt-6 mb-2 uppercase tracking-wide" color="muted">
          Registered address
        </Heading>
        {addressLines.length > 0 ? (
          <Stack gap="none">
            {addressLines.map((line) => (
              <Text key={line} size="sm">
                {line}
              </Text>
            ))}
          </Stack>
        ) : (
          <PendingValue value={null} label="Registered address" />
        )}

        <Stack gap="xs" className="mt-6">
          <Text size="sm" color="muted">
            {BUSINESS.legalName}
            {BUSINESS.structure ? ` · ${BUSINESS.structure}` : ""}
          </Text>
          <Row gap="sm" wrap>
            <Text size="sm" color="muted">
              GSTIN
            </Text>
            <Text size="sm" weight="medium" numeric>
              <PendingValue value={BUSINESS.gstin} label="GSTIN" />
            </Text>
          </Row>
        </Stack>
      </Div>
    </PolicyPageView>
  );
}
