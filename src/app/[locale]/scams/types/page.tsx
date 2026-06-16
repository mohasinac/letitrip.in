import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  IndianRupee,
  UserX,
  CreditCard,
  Package,
  UserCheck,
  ShieldAlert,
  Truck,
} from "lucide-react";
import {
  Container,
  Div,
  Section,
  Stack,
  Row,
  Grid,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Breadcrumb,
  Main,
  ROUTES,
  SCAM_CATEGORIES,
  SCAM_TYPES,
  Span,
  getScamTypesByCategory,
  faqJsonLd,
} from "@mohasinac/appkit";
import type { ScamCategory } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Scam Types — LetItRip Scam Registry",
  description:
    "Learn about all 27 documented scam patterns targeting India's collectibles market. Understand how each scam works and how to protect yourself.",
  path: "/scams/types",
  keywords: [
    "collectibles scam types india",
    "pokemon trading scam",
    "fake payment screenshot scam",
    "upi scam collectibles",
    "advance payment ghost india",
  ],
});

export const revalidate = 3600;

const CATEGORY_ICON_MAP: Record<ScamCategory, React.ReactNode> = {
  price_manipulation: <IndianRupee className="h-5 w-5" />,
  social_engineering: <UserX className="h-5 w-5" />,
  payment_fraud: <CreditCard className="h-5 w-5" />,
  preorder_delivery_fraud: <Package className="h-5 w-5" />,
  identity_impersonation: <UserCheck className="h-5 w-5" />,
  item_authenticity_fraud: <ShieldAlert className="h-5 w-5" />,
  logistics_fraud: <Truck className="h-5 w-5" />,
};

function renderScamTypeCard(
  scamType: ReturnType<typeof getScamTypesByCategory>[number],
  categoryLabel: string,
) {
  const howItHappensSummary =
    scamType.howItHappens.length > 150
      ? `${scamType.howItHappens.slice(0, 150).trimEnd()}…`
      : scamType.howItHappens;
  return (
    <Card key={scamType.id} variant="outlined" padding="md">
      <CardHeader>
        <Row justify="between" align="start" gap="sm">
          <Heading level={3} size="base" weight="semibold">{scamType.label}</Heading>
          <Badge variant="warning" className="shrink-0">{categoryLabel}</Badge>
        </Row>
        <Text variant="secondary" className="mt-1" size="sm">{scamType.shortDescription}</Text>
      </CardHeader>
      <CardBody>
        <Stack gap="sm">
          <Stack gap="xs">
            <Text className="tracking-wide text-[color:var(--appkit-color-text-muted,theme(colors.zinc.500))]" size="xs" weight="semibold" transform="uppercase">How it happens</Text>
            <Text variant="secondary" className="leading-relaxed" size="sm">{howItHappensSummary}</Text>
          </Stack>
          <Stack gap="xs">
            <Text className="tracking-wide text-[color:var(--appkit-color-text-muted,theme(colors.zinc.500))]" size="xs" weight="semibold" transform="uppercase">How to avoid</Text>
            <Stack gap="xs" as="ul">
              {scamType.howToAvoid.map((tip, i) => (
                <Row key={i} gap="sm" align="start" as="li">
                  <Span layout="flex-center" weight="bold" className="mt-1 h-4 w-4 shrink-0 bg-[color:var(--appkit-color-success,theme(colors.green.600))]/10 text-[10px] text-[color:var(--appkit-color-success,theme(colors.green.700))]" rounded="full">{i + 1}</Span>
                  <Text variant="secondary" className="leading-relaxed" size="sm">{tip}</Text>
                </Row>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}

function renderCategorySection(category: (typeof SCAM_CATEGORIES)[number]) {
  const types = getScamTypesByCategory(category.id);
  return (
    <Stack key={category.id} gap="md" id={category.id}>
      <Row gap="sm" align="center">
        <Span layout="flex-center" className="h-9 w-9 bg-[color:var(--appkit-color-primary,theme(colors.blue.600))]/10 text-[color:var(--appkit-color-primary,theme(colors.blue.600))]" rounded="lg">
          {CATEGORY_ICON_MAP[category.id]}
        </Span>
        <Heading level={2} size="xl" weight="bold">{category.label}</Heading>
      </Row>
      <Text variant="secondary" className="max-w-2xl" size="sm">{category.description}</Text>
      <Grid cols={2} gap="md">
        {types.map((scamType) => renderScamTypeCard(scamType, category.label))}
      </Grid>
    </Stack>
  );
}

export default function Page() {
  const registryHref = String(ROUTES.PUBLIC.SCAMS);

  const ld = faqJsonLd(
    SCAM_TYPES.slice(0, 10).map((t) => ({
      question: `How do I avoid ${t.label.toLowerCase()} scams?`,
      answer: t.howToAvoid.join(" "),
    })),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Main>
        {/* Breadcrumb strip */}
        <Div className="border-b appkit-breadcrumb-strip">
          <Container size="xl" padding="y-sm">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Scam Registry", href: registryHref }, { label: "Scam Types" }]} />
          </Container>
        </Div>

        {/* Page header */}
        <Section className="border-b" padding="y-2xl">
          <Container size="xl">
            <Stack gap="sm">
              <Heading level={1} weight="bold" size="3xl">Scam Types — LetItRip Scam Registry</Heading>
              <Text variant="secondary" className="max-w-2xl" size="base">
                27 documented scam patterns across 7 categories, specific to India&apos;s collectibles aftermarket. Learn how each scam works and how to protect yourself.
              </Text>
              <Row gap="sm" wrap padding="t-2xs">
                <Text variant="secondary" size="sm">{SCAM_TYPES.length} documented scam types</Text>
                <Text variant="secondary" size="sm">·</Text>
                <Text variant="secondary" size="sm">{SCAM_CATEGORIES.length} categories</Text>
                <Text variant="secondary" size="sm">·</Text>
                <Link href={registryHref} className="text-sm text-[color:var(--appkit-color-primary,theme(colors.blue.600))] hover:underline">View verified scammer profiles →</Link>
              </Row>
            </Stack>
          </Container>
        </Section>

        {/* Category sections */}
        <Section padding="y-2xl">
          <Container size="xl">
            <Stack gap="xl">
              {SCAM_CATEGORIES.map(renderCategorySection)}
            </Stack>
          </Container>
        </Section>

        {/* Footer CTA */}
        <Section className="border-t" padding="y-xl">
          <Container size="xl">
            <Row justify="between" align="center" gap="md" wrap>
              <Stack gap="xs">
                <Heading level={3} size="base" weight="semibold">Encountered a scammer?</Heading>
                <Text variant="secondary" size="sm">Report them to protect other collectors in India.</Text>
              </Stack>
              <Row gap="sm">
                <Link href={String(ROUTES.PUBLIC.SCAM_REPORT)} className="appkit-button appkit-button--primary appkit-button--md">Report a Scammer</Link>
                <Link href={registryHref} className="appkit-button appkit-button--outline appkit-button--md">View Registry</Link>
              </Row>
            </Row>
          </Container>
        </Section>
      </Main>
    </>
  );
}
