import { ROUTES } from "@/constants";
import { PAGE_CONTAINER } from "@/constants";
import {
  THEMED_BG_PRIMARY,
  THEMED_BG_SECONDARY,
  THEMED_BORDER,
  THEMED_TEXT_PRIMARY,
  THEMED_TEXT_SECONDARY,
} from "@/constants";
import { Heading, Text, Caption, Grid, Section, Container, Stack, Card, Row, Div, TextLink } from "@mohasinac/appkit/ui";
import { getTranslations } from "next-intl/server";
import { ShoppingBag, Truck, MapPin, CheckCircle2 } from "lucide-react";

const themed = {
  bgPrimary: THEMED_BG_PRIMARY,
  bgSecondary: THEMED_BG_SECONDARY,
  border: THEMED_BORDER,
  textPrimary: THEMED_TEXT_PRIMARY,
  textSecondary: THEMED_TEXT_SECONDARY,
};
const page = { container: PAGE_CONTAINER };

export async function TrackOrderView() {
  const t = await getTranslations("trackOrder");

  const STEPS = [
    {
      icon: ShoppingBag,
      title: t("step1Title"),
      text: t("step1Text"),
      color: "text-primary",
      bg: "bg-primary/10 dark:bg-primary/15",
    },
    {
      icon: Truck,
      title: t("step2Title"),
      text: t("step2Text"),
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-900/40",
    },
    {
      icon: MapPin,
      title: t("step3Title"),
      text: t("step3Text"),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/40",
    },
    {
      icon: CheckCircle2,
      title: t("step4Title"),
      text: t("step4Text"),
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
  ];

  return (
    <Container className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section color="inverse" 
        tone="accent-banner" padding="y-2-5xl"
      >
        <Container className={`${page.container.sm} text-center`}>
          <Heading color="inverse" level={1} variant="none" className="mb-4">
            {t("title")}
          </Heading>
          <Text color="inverse" variant="none" className="/80">
            {t("subtitle")}
          </Text>
        </Container>
      </Section>

      <Container
        className={page.container.md} padding="y-4xl"
      >
        <Stack gap="hero">
        {/* Sign-in prompt */}
        <Section
          className={`text-center`} border="default" surface="subtle" rounded="2xl" padding="xl"
        >
          <Row align="center" justify="center"
            className={`w-16 h-16 bg-primary/10 dark:bg-primary/15 mx-auto mb-4`} rounded="full"
          >
            <ShoppingBag className="w-8 h-8 text-primary" />
          </Row>
          <Heading level={2} className="mb-3">
            {t("signInPrompt")}
          </Heading>
          <Row gap="md" justify="center" className="mt-6">
            <TextLink rounded="lg" paddingX="xl" paddingY="md"
              href={ROUTES.AUTH.LOGIN}
              className="bg-primary hover:bg-primary/90 text-white transition-colors" weight="medium"
            >
              {t("signIn")}
            </TextLink>
            <TextLink rounded="lg" paddingX="xl" paddingY="md"
              href={ROUTES.USER.ORDERS}
              className={`${themed.bgPrimary} border ${themed.border} ${themed.textPrimary} hover:opacity-80 transition-opacity`} weight="medium"
            >
              {t("viewOrders")}
            </TextLink>
          </Row>
        </Section>

        {/* How it works */}
        <Section>
          <Heading level={2} className="mb-10" align="center">
            {t("howItWorksTitle")}
          </Heading>
          {/* eslint-disable-next-line lir/no-hardcoded-grid-cols -- responsive 1→2→4 breakpoint; FLUID_GRID tokens not yet available */}
          <Grid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" gap="lg">
            {STEPS.map(({ icon: Icon, title, text, color, bg }, index) => (
              <Card padding="lg" rounded="xl"
                className={`${themed.bgSecondary} border ${themed.border} relative`}
              >
                <Caption className="absolute top-4 right-4" weight="bold">
                  {String(index + 1).padStart(2, "0")}
                </Caption>
                <Row align="center" justify="center"
                  className={`w-12 h-12 ${bg} mb-4`} rounded="xl"
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </Row>
                <Heading level={3} className="mb-2">
                  {title}
                </Heading>
                <Text variant="secondary" size="sm" className="leading-relaxed">
                  {text}
                </Text>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Need help */}
        <Section
          layout="flex-sm-row-between" gap="md" border="default" surface="subtle" rounded="xl" padding="lg"
        >
          <Stack gap="sm">
            <Heading level={2} className="mb-1">
              {t("needHelpTitle")}
            </Heading>
            <Text variant="secondary" size="sm">
              {t("needHelpText")}
            </Text>
          </Stack>
          <Row gap="md" className="flex-shrink-0">
            <TextLink
              href={ROUTES.PUBLIC.HELP}
              className={`${themed.textSecondary} hover:text-primary underline underline-offset-4 transition-colors`} size="sm"
            >
              {t("helpCenter")}
            </TextLink>
            <TextLink rounded="lg" paddingX="md" paddingY="xs"
              href={ROUTES.PUBLIC.CONTACT}
              className="bg-primary hover:bg-primary/90 text-white transition-colors" size="sm"
            >
              {t("contactSupport")}
            </TextLink>
          </Row>
        </Section>
        </Stack>
      </Container>
    </Container>
  );
}

