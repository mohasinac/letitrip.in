import React from "react";
import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit";
import { breadcrumbJsonLd } from "@mohasinac/appkit/seo/json-ld";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { SEO_CONFIG } from "@/constants";
import { AuthenticityCheckerClient } from "@/features/authenticity/components/AuthenticityCheckerClient";
import { AuthenticityReference } from "@/features/authenticity/components/AuthenticityReference";
import { TOOL_AUTHENTICITY_PATH } from "@/constants";
import { authenticityToolJsonLd } from "@/features/authenticity/seo";
import { KNOWLEDGE_BASE_SIZES } from "@/features/authenticity/data/knowledge-sizes.generated";

const TITLE = "Authenticity checker — original, midfake or unlicensed";
const DESCRIPTION =
  `Check a Beyblade against what collectors have actually recorded: ${KNOWLEDGE_BASE_SIZES.originalCodes} Metal-series box codes seen on genuine boxes across ${KNOWLEDGE_BASE_SIZES.modelsWithCodeHistory} models and ${KNOWLEDGE_BASE_SIZES.regions} regions, ${KNOWLEDGE_BASE_SIZES.midfakeCodes} midfake batch codes, ${KNOWLEDGE_BASE_SIZES.canonicalBeys} canonical releases with their product codes, and the physical checks that apply per generation. Free, no account, no sign-in.`;

export const metadata = _gm({
  title: `${TITLE} — LetItRip`,
  description: DESCRIPTION,
  /*
   * 🛑 The canonical comes from `path` through the ONE host definition in
   * `appkit.config.js` (Root Cause #81). Never a second absolute URL here.
   */
  path: TOOL_AUTHENTICITY_PATH,
  keywords: [
    "fake beyblade checker",
    "midfake beyblade code",
    "takara tomy box code",
    "is my beyblade original",
    "beyblade authenticity india",
    "rapidity beyblade fake",
  ],
});

/**
 * 🛑 SEO SHAPE — read this before changing what renders where.
 *
 * The whole page is public, and the split below is now about RENDERING rather
 * than access: the h1, the intro and `<AuthenticityReference>` are
 * server-rendered static content, while `<AuthenticityCheckerClient>` is the
 * interactive part. Identical for crawlers and for humans either way.
 *
 * It used to be an access split — the lookup needed an account, and the
 * `WebApplication` JSON-LD carried a `hasPart` node with
 * `isAccessibleForFree: false` naming the gated div, on the reasoning that a
 * gate must be DECLARED rather than hidden (`noindex` would throw away a
 * high-intent query; serving the reference content to crawler user-agents only
 * would be cloaking). When the gate went, that declaration and the class it
 * named went with it — a paywall node a crawler can see is false is worse than
 * no node at all.
 *
 * 🛑 No `revalidate` and no segment config. Everything server-side here is
 * static, so the default — cached indefinitely — is strictly cheaper than any
 * window, and adding one would be the regression the caching section of
 * CLAUDE.md warns about. There is no per-request data on this route at all, and
 * now no session read anywhere in the subtree either: the assessment happens in
 * `/api/tools/authenticity`, which is public and does zero I/O.
 */
export default function AuthenticityToolPage() {
  const ldTool = authenticityToolJsonLd({
    siteUrl: SEO_CONFIG.siteUrl,
    path: TOOL_AUTHENTICITY_PATH,
    name: "Beyblade authenticity checker",
    description: DESCRIPTION,
  });

  const ldBreadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Tools", url: "/tools" },
    { name: "Authenticity checker", url: TOOL_AUTHENTICITY_PATH },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldTool) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }}
      />
      <Section padding="y-lg">
        <Container size="md">
          <Stack gap="lg" className="min-w-0">
            <Stack gap="xs" className="min-w-0">
              <Heading level={1}>{TITLE}</Heading>
              <Text color="muted">
                Give the checker a model name, the code on the box, or the brand
                printed on the packaging, and it reports which checks apply to that
                generation and what the recorded data does — and does not — settle.
                It grades rather than rules: the strongest thing it will say is that
                something matches a batch collectors record as a midfake, which is a
                statement about a production run and not an accusation against a
                seller.
              </Text>
            </Stack>

            <AuthenticityCheckerClient />

            <AuthenticityReference />
          </Stack>
        </Container>
      </Section>
    </>
  );
}
