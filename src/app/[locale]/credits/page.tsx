import type { Metadata } from "next";
import { Section, Container, Stack, Heading, Text, Anchor, Div } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

/**
 * Where the reference data on this site comes from, and under what licence.
 *
 * ── 🛑 WHY THIS PAGE EXISTS, AND WHY IT NAMES ONLY SOME SOURCES ───────────
 *
 * The parts, beys, characters and products databases are built from facts
 * extracted from a community wiki published under CC BY-SA. Attribution is a
 * LICENCE OBLIGATION there, not a courtesy — so the source is named here and
 * every individual page links back to the exact article it drew from.
 *
 * 🛑 ONE SOURCE IS DELIBERATELY NOT NAMED, anywhere on this site or in the
 * repository. A separate reference site's terms forbade crawling and AI use,
 * and it was crawled anyway for a coverage count — no content, no prose, no
 * images, and both gaps it implied turned out not to exist in the data we
 * actually hold. Crediting it would publish the violation, which is worse for
 * them than the silence. It is supplied to the one script that touches it via
 * an environment variable with no default, so the committed source cannot name
 * it either.
 *
 * Owner's instruction, 2026-10-20: *"cc the sources which allowed the crawls,
 * do not cc the ones which prohibited the crawls and we did it anyhow."*
 */
export const revalidate = 86400;

export const metadata: Metadata = _gm({
  title: "Credits & Sources — LetItRip",
  description:
    "The community sources behind the LetItRip parts and Beyblade reference databases, and the licences they are published under.",
  path: "/credits",
  keywords: ["letitrip credits", "beyblade wiki attribution", "cc by-sa"],
});

export default function Page() {
  return (
    <Section padding="y-lg">
      <Container size="md">
        <Stack gap="lg" className="min-w-0">
          <Stack gap="xs" className="min-w-0">
            <Heading level={1}>Credits &amp; sources</Heading>
            <Text color="muted">
              The reference side of this site — the part glossary, the Beyblade database, the
              characters and the product listings — is built from facts gathered by community
              projects. This page says which, and under what terms.
            </Text>
          </Stack>

          <Stack gap="sm" className="min-w-0">
            <Heading level={2} size="lg">
              Beyblade Wiki
            </Heading>
            <Text>
              Names, product codes, release dates, weights, part classifications, slot
              assignments, stated owners, special moves and first appearances are drawn from the{" "}
              <Anchor href="https://beyblade.fandom.com/" underline="always">
                Beyblade Wiki
              </Anchor>
              , published under{" "}
              <Anchor
                href="https://creativecommons.org/licenses/by-sa/3.0/"
                underline="always"
              >
                CC&nbsp;BY-SA&nbsp;3.0
              </Anchor>
              .
            </Text>
            <Text size="sm" color="muted">
              {/*
               * This paragraph is the substance of the compliance claim, so it
               * states the mechanism rather than gesturing at good intentions.
               */}
              We take <strong>facts only</strong> — the descriptive and historical prose on those
              articles is never reproduced. Every sentence of description on our part and bey
              pages is generated from those facts by our own templates. Each page links back to
              the specific article it drew from, and that link is part of how we meet the
              licence rather than a nicety.
            </Text>
          </Stack>

          <Stack gap="sm" className="min-w-0">
            <Heading level={2} size="lg">
              PlasticsDB
            </Heading>
            <Text>
              Part-compatibility rulings for the Plastic and HMS generations — which combinations
              physically assemble, and whether a base free-spins — come from the community
              PlasticsDB compatibility spreadsheet.
            </Text>
          </Stack>

          <Stack gap="sm" className="min-w-0">
            <Heading level={2} size="lg">
              Product photography
            </Heading>
            <Text size="sm" color="muted">
              {/*
               * 🛑 A different obligation from the text above: these are
               * publisher product shots with no uploader grant, so provenance
               * is recorded per image (source page, source file, fetch time)
               * and removal is a one-file lookup rather than a search.
               */}
              Catalogue imagery is largely publisher product photography. We record the source
              page and file for every image we hold, so attribution is possible and removal is
              mechanical. If you hold rights to an image used here and want it taken down,{" "}
              <Anchor href="/contact" underline="always">
                contact us
              </Anchor>{" "}
              and it will be removed.
            </Text>
          </Stack>

          <Div>
            <Text size="xs" color="faint">
              Beyblade is a trademark of its respective owners. LetItRip is an independent
              marketplace and is not affiliated with, endorsed by, or sponsored by any
              manufacturer or rights holder.
            </Text>
          </Div>
        </Stack>
      </Container>
    </Section>
  );
}
