import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ShieldAlert } from "lucide-react";
import {
  Container,
  Div,
  Section,
  Stack,
  Row,
  Heading,
  Text,
  Breadcrumb,
  Main,
  ROUTES,
  faqJsonLd,
} from "@mohasinac/appkit";
import { listPublicFaqs } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Scam Awareness FAQs — LetItRip",
  description:
    "Answers to common questions about recognising, avoiding, and reporting collectibles scams in India. Includes buyer protection coverage, graded slab verification, and off-platform payment risks.",
  path: "/scams/faqs",
  keywords: [
    "collectibles scam faq india",
    "how to avoid upi scam",
    "fake psa card",
    "letitrip buyer protection",
    "off platform payment risk",
  ],
});

export const revalidate = 3600;

export default async function Page() {
  const faqs = await listPublicFaqs("scam_awareness", 20).catch(() => []);

  const ldFaqs = faqs.map((f) => ({
    question: f.question,
    answer: typeof f.answer === "string" ? f.answer : f.answer?.text ?? "",
  }));
  const ld = ldFaqs.length > 0 ? faqJsonLd(ldFaqs) : null;

  const scamsHref = String(ROUTES.PUBLIC.SCAMS);

  return (
    <>
      {ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      )}

      <Main>
        {/* Breadcrumb strip */}
        <Div className="border-b appkit-breadcrumb-strip">
          <Container size="xl" className="py-3">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Scam Registry", href: scamsHref },
                { label: "FAQs" },
              ]}
            />
          </Container>
        </Div>

        {/* Page header */}
        <Section className="border-b py-10">
          <Container size="xl">
            <Stack gap="sm">
              <Row gap="sm" align="center">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--appkit-color-warning,theme(colors.amber.500))]/10 text-[color:var(--appkit-color-warning,theme(colors.amber.600))]">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <Heading level={1} className="text-3xl font-bold">
                  Scam Awareness FAQs
                </Heading>
              </Row>
              <Text variant="secondary" className="max-w-2xl text-base">
                Common questions about spotting, avoiding, and reporting collectibles scams in India.
                Learn how LetItRip protects you and what to do if something goes wrong.
              </Text>
              <Row gap="sm" className="flex-wrap pt-1">
                <Text variant="secondary" className="text-sm">
                  {faqs.length} answers
                </Text>
                <Text variant="secondary" className="text-sm">·</Text>
                <Link
                  href={String(ROUTES.PUBLIC.SCAM_TYPES)}
                  className="text-sm text-[color:var(--appkit-color-primary,theme(colors.blue.600))] hover:underline"
                >
                  View all scam types →
                </Link>
                <Text variant="secondary" className="text-sm">·</Text>
                <Link
                  href={scamsHref}
                  className="text-sm text-[color:var(--appkit-color-primary,theme(colors.blue.600))] hover:underline"
                >
                  Search the registry →
                </Link>
              </Row>
            </Stack>
          </Container>
        </Section>

        {/* FAQ list */}
        <Section className="py-10">
          <Container size="xl" className="max-w-3xl">
            {faqs.length === 0 ? (
              <Text variant="secondary">No FAQs found.</Text>
            ) : (
              <Stack gap="lg" as="dl">
                {faqs.map((faq) => {
                  const answerHtml =
                    typeof faq.answer === "string" ? faq.answer : (faq.answer?.text ?? "");
                  return (
                    <Stack key={faq.id} gap="sm" as="div">
                      <dt>
                        <Heading level={2} className="text-lg font-semibold">
                          {faq.question}
                        </Heading>
                      </dt>
                      <dd
                        className="prose prose-sm max-w-none text-[color:var(--appkit-color-text-secondary,theme(colors.zinc.600))]"
                        dangerouslySetInnerHTML={{ __html: answerHtml }}
                      />
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Container>
        </Section>

        {/* Footer CTA */}
        <Section className="border-t py-8">
          <Container size="xl">
            <Row justify="between" align="center" className="flex-wrap gap-4">
              <Stack gap="xs">
                <Heading level={3} className="text-base font-semibold">
                  Encountered a scammer?
                </Heading>
                <Text variant="secondary" className="text-sm">
                  Report them to protect other collectors in India.
                </Text>
              </Stack>
              <Row gap="sm">
                <Link
                  href={String(ROUTES.PUBLIC.SCAM_REPORT)}
                  className="appkit-button appkit-button--primary appkit-button--md"
                >
                  Report a Scammer
                </Link>
                <Link
                  href={scamsHref}
                  className="appkit-button appkit-button--outline appkit-button--md"
                >
                  View Registry
                </Link>
              </Row>
            </Row>
          </Container>
        </Section>
      </Main>
    </>
  );
}
