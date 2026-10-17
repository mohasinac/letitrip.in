import React from "react";
import { Container, Div, Heading, Section, Stack, Text } from "@mohasinac/appkit";
import { breadcrumbJsonLd } from "@mohasinac/appkit/seo/json-ld";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { SEO_CONFIG } from "@/constants";
import { AuthenticityCheckerClient } from "@/features/authenticity/components/AuthenticityCheckerClient";
import { AuthenticityReference } from "@/features/authenticity/components/AuthenticityReference";
import { TOOL_AUTHENTICITY_PATH } from "@/constants";
import { AUTHENTICITY_GATED_CLASS, authenticityToolJsonLd } from "@/features/authenticity/seo";

const TITLE = "Authenticity checker — original, midfake or unlicensed";
const DESCRIPTION =
  "Check a Beyblade against what collectors have actually recorded: 90 Metal-series box codes seen on genuine boxes, the midfake batch codes, 220 canonical releases with their product codes, and the physical checks that apply per generation. Free reference for everyone; the per-item lookup needs an account.";

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
 * The interactive lookup needs an account. A page whose entire content is
 * "please sign in" is thin content, so this page is deliberately split:
 *
 *   - PUBLIC and server-rendered: the h1, the intro, and `<AuthenticityReference>`
 *     — the generation table, the disputed-decoding explanation, the universal
 *     checks, the licensed marques. Identical for crawlers and for humans.
 *   - GATED: only `<AuthenticityCheckerClient>`, wrapped in a div carrying
 *     `AUTHENTICITY_GATED_CLASS`, which the `WebApplication` JSON-LD names in
 *     `hasPart.cssSelector` with `isAccessibleForFree: false`.
 *
 * That ordering matters: the gate is DECLARED, not hidden. Serving the reference
 * content to crawler user-agents only would be cloaking, and `noindex` would
 * throw away a high-intent query this site is unusually well placed to answer.
 * It is the same pattern `gatedPriceWebPageJsonLd` uses for guest-gated prices.
 *
 * 🛑 No `revalidate` and no segment config. Everything server-side here is
 * static, so the default — cached indefinitely — is strictly cheaper than any
 * window, and adding one would be the regression the caching section of
 * CLAUDE.md warns about. There is no per-request data on this route at all; the
 * session check happens inside the client component and the assessment happens
 * in `/api/tools/authenticity`, where `auth: true` is enforced.
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

            {/* The gated region named by the JSON-LD above. */}
            <Div className={AUTHENTICITY_GATED_CLASS}>
              <AuthenticityCheckerClient />
            </Div>

            <AuthenticityReference />
          </Stack>
        </Container>
      </Section>
    </>
  );
}
