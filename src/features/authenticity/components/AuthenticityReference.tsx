import React from "react";
import { Heading, ROUTES, Row, Span, Stack, Text, TextLink } from "@mohasinac/appkit";
import { GENERATIONS, UNIVERSAL_CHECKS } from "../data/generations";
import { KNOWLEDGE_BASE_SIZES } from "../data/knowledge-sizes.generated";
import { LICENSED_IMPORTERS, LICENSED_MANUFACTURERS } from "../data/marques";

/**
 * The server-rendered half of /tools/authenticity — no "use client", no
 * session, no I/O.
 *
 * 🛑 This exists for SEO: it is the substance of the answer in crawlable HTML,
 * so the page is worth indexing whether or not anyone runs a lookup. It used to
 * also be the FREE half, back when the lookup needed an account; the lookup is
 * open now and this is simply the static part.
 *
 * It renders from the same static knowledge base the engine uses, so the page
 * and the tool can never describe different rules.
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
          The same bey, six regions, different codes
        </Heading>
        <Text color="muted">
          A Metal Fight bey was boxed for Japan, for Taiwan (Funbox Toys), for
          Hong Kong (Mani Limited), for Korea (Sonokong), for the Middle East
          (New Boy) and occasionally for Indonesia — and each run carries its own
          batch codes. The checker records{" "}
          {KNOWLEDGE_BASE_SIZES.originalCodes} codes across{" "}
          {KNOWLEDGE_BASE_SIZES.modelsWithCodeHistory} models and{" "}
          {KNOWLEDGE_BASE_SIZES.regions} regions, so a box covered in Korean text
          with a Sonokong logo comes back as a recorded Korean release rather than
          as something suspicious. Several codes are recorded in more than one
          region, and some Japanese boxes carry an importer sticker on the back
          instead of a separate code — that is normal, not a tell.
        </Text>
        <Text color="muted">
          🛑 {KNOWLEDGE_BASE_SIZES.contestedCodes} codes are recorded as genuine
          by one compilation and as a midfake batch by another. Those come back as
          the disagreement they are. Nobody benefits from a tool that picks a side
          there: calling it a midfake accuses whoever is holding a real box, and
          calling it genuine reassures whoever is holding a fake.
        </Text>
      </Stack>

      <Stack gap="sm" className="min-w-0">
        <Heading level={2} size="lg">
          Midfakes are three different things
        </Heading>
        <Text color="muted">
          <Span weight="semibold">Taiwanese batches</Span> — Takara-Tomy
          blueprints, Taiwanese production, poorer alloys and mould quality. This
          is what the word usually means, and there has never been an official
          Takara Tomy statement acknowledging the runs.
        </Text>
        <Text color="muted">
          <Span weight="semibold">High-quality Sonokong fakes</Span> — Korean
          boxes that reproduce the importer panel, both logos and a plausible
          barcode. Packaging inspection does not settle one of these; the codes
          and the physical checks do.
        </Text>
        <Text color="muted">
          <Span weight="semibold">Chinese midfake printing</Span> — and this one
          is not about the code at all. The collector who compiled the list is
          explicit that on several of them{" "}
          <Span weight="semibold">the code itself is authentic</Span> and what
          differs is the typeface it is printed in. In the reference pair the
          source supplies, the genuine code is pressed into the card and the
          midfake one is ink-printed in a different face — one example each, so
          treat it as a thing to compare rather than a rule, and do not read a
          matching code as either proof or condemnation.
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
