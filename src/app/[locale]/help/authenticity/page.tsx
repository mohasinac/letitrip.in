import React from "react";
import { Container, Heading, ROUTES, Section, Stack, Text, TextLink } from "@mohasinac/appkit";
import { faqJsonLd, breadcrumbJsonLd } from "@mohasinac/appkit/seo/json-ld";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AuthenticityReference } from "@/features/authenticity/components/AuthenticityReference";
import { TOOL_AUTHENTICITY_PATH } from "@/constants";

const PATH = "/help/authenticity";

export const metadata = _gm({
  title: "Is my Beyblade original? — Help Centre",
  description:
    "What original, reproduction, midfake and unlicensed actually mean, how to read the code on the box, which checks are conclusive for each generation, and which brands are licensed. No account needed.",
  path: PATH,
  keywords: [
    "is my beyblade original",
    "fake beyblade india",
    "midfake meaning",
    "takara tomy box code",
    "funskool beyblade genuine",
  ],
});

export const revalidate = 3600;

/**
 * The help-centre article on authenticity.
 *
 * 🛑 Why this exists alongside `/tools/authenticity` and `/spot-a-fake`, rather
 * than being a fourth copy of the same prose:
 *
 *   - `/spot-a-fake` is the BUYING guide — the signals in the order worth
 *     checking them when you are about to pay someone. It lives in appkit.
 *   - `/tools/authenticity` is the LOOKUP — you have an item, you want it graded.
 *   - this page is the VOCABULARY — what the words mean, which is what somebody
 *     searching "is my beyblade original" or "what is a midfake" actually needs
 *     before either of the others is useful to them.
 *
 * The generation table and the checks are rendered from `<AuthenticityReference>`,
 * the SAME component the tool page uses, so the three surfaces cannot state
 * different rules. Only the framing above it is written twice, deliberately,
 * because the framing is the difference between the pages.
 */
const FAQS = [
  {
    question: "What is the difference between a reproduction, a midfake and a counterfeit?",
    answer:
      "A counterfeit is an unlicensed copy sold as if it were genuine, usually poor quality, and sometimes containing lead or cadmium in metal parts. A reproduction is an unlicensed copy that is labelled as one — a legitimate thing to sell when disclosed. \"Midfake\" is used two ways: in the Metal Fight community it means a reduced-quality Takara Tomy batch built on Takara Tomy blueprints, which may carry the real marque; more loosely in India it means any unbranded first-copy.",
  },
  {
    question: "Does a Takara Tomy product code prove a Beyblade is genuine?",
    answer:
      "No. A counterfeit catalogue measured for this site carried more than 900 genuine Takara Tomy codes across 1,277 unlicensed products. What carries information is whether the code and the model name agree with each other, not whether the code exists.",
  },
  {
    question: "What does a code like A0813 on the bottom of the box mean?",
    answer:
      "It is a production date stamp, and how it decodes is disputed. One reading takes the letter as the month and the next two digits as the day; another takes the letter as the factory and the digits as the week of the year. Takara Tomy has published neither. Collectors have recorded which codes appear on known-genuine boxes and which belong to reduced-quality batches, but a code in neither list means \"not recorded\", not \"fake\".",
  },
  {
    question: "Is a Funskool Beyblade fake?",
    answer:
      "No. Funskool is a licensed Indian importer, and Sonokong is the licensed South Korean producer. Their names on a box are a positive signal. The same applies to Mani in Hong Kong, Sheng Tai in Singapore, NewBoy in the Middle East and the other regional importers.",
  },
  {
    question: "A seller says the item is \"aftermarket\" or \"custom\". Is that a fake?",
    answer:
      "It is unlicensed. Sellers of unlicensed tops rarely claim to be originals — they sell under their own brand and describe it as aftermarket, custom or upgraded. If the most prominent marque on the box is not Takara Tomy, Hasbro, Sonokong or a licensed regional importer, it is an unlicensed product whatever it is called.",
  },
];

export default function AuthenticityHelpPage() {
  const ldFaq = faqJsonLd(FAQS);
  const ldBreadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Help Centre", url: "/help" },
    { name: "Is my Beyblade original?", url: PATH },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }}
      />
      <Section padding="y-lg">
        <Container size="md">
          <Stack gap="lg" className="min-w-0">
            <Stack gap="xs" className="min-w-0">
              <Heading level={1}>Is my Beyblade original?</Heading>
              <Text color="muted">
                Usually the honest answer is &quot;nothing here contradicts it&quot;
                rather than yes or no — authenticity is settled by physical checks,
                and which checks count depends entirely on the generation. This page
                is the vocabulary and the per-generation checklist. To have a
                specific item graded against the recorded box codes, use the{" "}
                <TextLink href={TOOL_AUTHENTICITY_PATH}>authenticity checker</TextLink>
                ; for the signals in the order worth checking them when you are
                about to pay someone, read{" "}
                <TextLink href={String(ROUTES.PUBLIC.SPOT_A_FAKE)}>how to spot a fake</TextLink>.
              </Text>
            </Stack>

            <Stack gap="sm" className="min-w-0">
              {FAQS.map((f) => (
                <Stack
                  key={f.question}
                  gap="xs"
                  padding="card"
                  rounded="lg"
                  surface="card"
                  border="subtle"
                  className="min-w-0"
                >
                  <Heading level={2} size="lg">
                    {f.question}
                  </Heading>
                  <Text color="muted">{f.answer}</Text>
                </Stack>
              ))}
            </Stack>

            <AuthenticityReference />
          </Stack>
        </Container>
      </Section>
    </>
  );
}
