import React from "react";
import { Heading, ROUTES, Row, Span, Stack, Text, TextLink } from "@mohasinac/appkit";
import { GENERATIONS, UNIVERSAL_CHECKS } from "../data/generations";
import { LICENSED_IMPORTERS, LICENSED_MANUFACTURERS } from "../data/marques";

/**
 * The PUBLIC half of /tools/authenticity — a server component, no "use client",
 * no session, no I/O.
 *
 * 🛑 This exists for SEO and for fairness in the same stroke. The interactive
 * lookup needs an account; this does not. So a visitor who arrives from search
 * signed out still gets the generation table, the checks that apply regardless
 * of generation, and who the licensed marques are — which is the substance of
 * the answer. Only the per-item lookup is behind the gate, and the structured
 * data says so (see features/authenticity/seo.ts).
 *
 * It renders from the same static knowledge base the engine uses, so the public
 * page and the gated tool can never describe different rules.
 */
export function AuthenticityReference() {
  return (
    <Stack gap="lg" className="min-w-0">
      <Stack gap="sm" className="min-w-0">
        <Heading level={2} size="lg">
          Which generation is it, and what does the box code mean
        </Heading>
        <Text color="muted">
          The retail code prefix identifies the generation, and the generation
          decides which checks are worth anything. Note the prefixes nest —{" "}
          <Span weight="semibold">BB-105</Span> is Metal Fight and{" "}
          <Span weight="semibold">B-174</Span> is Burst, so read the whole letter
          group before the digits.
        </Text>
        {GENERATIONS.map((g) => (
          <Stack key={g.id} gap="xs" padding="card-tight" rounded="lg" surface="card" border="subtle" className="min-w-0">
            <Row gap="sm" align="center" className="min-w-0">
              <Text weight="semibold" className="min-w-0">
                {g.label}
              </Text>
              <Text size="sm" color="muted">
                {g.years}
              </Text>
            </Row>
            <Text size="sm" color="muted">
              Codes: {g.codePrefixes.map((p) => `${p}00`).join(", ")} · Licensed marques:{" "}
              {g.licensedMarques.join(", ")}
            </Text>
            <Text size="sm" color="muted">
              {g.hasKnownDateCodeTable
                ? "A box date code (a letter then four digits) can be checked against the recorded original and midfake tables for this generation."
                : "No box date-code decoding has been established for this generation — applying the Metal Fight rule here would be inventing an answer."}
            </Text>
          </Stack>
        ))}
      </Stack>

      <Stack gap="sm" className="min-w-0">
        <Heading level={2} size="lg">
          The two readings of a Metal Fight box code
        </Heading>
        <Text color="muted">
          A code like <Span weight="semibold">A0813</Span> has two competing
          community decodings and Takara Tomy has published neither: letter as the
          month with the next two digits as the day (8 January 2013), or letter as
          the factory with the digits as the week of the year. The checker shows
          both and labels the decode disputed, because printing one as fact is the
          easiest way for a tool like this to mislead.
        </Text>
        <Text color="muted">
          A second thing worth knowing before you lean on any code:{" "}
          <Span weight="semibold">
            a product code that merely exists proves nothing
          </Span>
          . One counterfeit catalogue measured for this site carried over 900
          genuine Takara Tomy codes across 1,277 unlicensed products. What carries
          information is whether the code and the model name agree.
        </Text>
      </Stack>

      <Stack gap="sm" className="min-w-0">
        <Heading level={2} size="lg">
          Checks that apply whatever the generation
        </Heading>
        {UNIVERSAL_CHECKS.map((c) => (
          <Stack key={c.id} gap="xs" padding="card-tight" rounded="lg" surface="card" border="subtle" className="min-w-0">
            <Text weight="semibold">{c.label}</Text>
            <Text size="sm" color="muted">
              {c.detail}
            </Text>
          </Stack>
        ))}
      </Stack>

      <Stack gap="sm" className="min-w-0">
        <Heading level={2} size="lg">
          Who is actually licensed
        </Heading>
        <Text color="muted">
          Manufacturers: {LICENSED_MANUFACTURERS.join(", ")}. Regional importers,
          whose sticker or certificate is a positive signal rather than a
          substitute marque:{" "}
          {LICENSED_IMPORTERS.map((i) => `${i.name} (${i.region})`).join(", ")}.
        </Text>
        <Text color="muted">
          🛑 Funskool in particular is a legitimate licensed Indian importer. A
          Funskool box is not a fake, and any guide that implies otherwise is
          wrong.
        </Text>
      </Stack>

      <Stack gap="xs" className="min-w-0">
        <Text color="muted">
          The longer buying guide, with the signals in the order worth checking
          them, is at <TextLink href={String(ROUTES.PUBLIC.SPOT_A_FAKE)}>how to spot a fake</TextLink>.
          If a specific seller is the problem rather than a specific item, the{" "}
          <TextLink href={String(ROUTES.PUBLIC.SCAMS)}>scam registry</TextLink> takes reports.
        </Text>
      </Stack>
    </Stack>
  );
}
