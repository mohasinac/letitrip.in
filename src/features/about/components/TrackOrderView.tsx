import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Caption, Grid, Section, Container, Stack, Card, Row, Div } from "@mohasinac/appkit";
import { TextLink } from "@mohasinac/appkit";
import { getTranslations } from "next-intl/server";
import { ShoppingBag, Truck, MapPin, CheckCircle2 } from "lucide-react";

const { themed, flex, page } = THEME_CONSTANTS;

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
      <Section
        className={`${THEME_CONSTANTS.accentBanner.pageHero} text-white py-14 md:py-16 lg:py-20`}
      >
        <Container className={`${page.container.sm} text-center`}>
          <Heading level={1} variant="none" className="mb-4 text-white">
            {t("title")}
          </Heading>
          <Text variant="none" className="text-white/80">
            {t("subtitle")}
          </Text>
        </Container>
      </Section>

      <Container
        className={`${page.container.md} py-14 md:py-16 space-y-14 md:space-y-16`}
      >
        {/* Sign-in prompt */}
        <Section
          className={`${themed.bgSecondary} rounded-2xl border ${themed.border} p-8 text-center`}
        >
          <Div
            className={`w-16 h-16 bg-primary/10 dark:bg-primary/15 rounded-full ${flex.center} mx-auto mb-4`}
          >
            <ShoppingBag className="w-8 h-8 text-primary" />
          </Div>
          <Heading level={2} className="mb-3">
            {t("signInPrompt")}
          </Heading>
          <Row gap="md" className="justify-center mt-6">
            <TextLink
              href={ROUTES.AUTH.LOGIN}
              className={`inline-${flex.center} gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors`}
            >
              {t("signIn")}
            </TextLink>
            <TextLink
              href={ROUTES.USER.ORDERS}
              className={`inline-${flex.center} gap-2 ${themed.bgPrimary} border ${themed.border} ${themed.textPrimary} font-medium px-6 py-3 rounded-lg hover:opacity-80 transition-opacity`}
            >
              {t("viewOrders")}
            </TextLink>
          </Row>
        </Section>

        {/* How it works */}
        <Section>
          <Heading level={2} className="text-center mb-10">
            {t("howItWorksTitle")}
          </Heading>
          {/* eslint-disable-next-line lir/no-hardcoded-grid-cols -- responsive 1→2→4 breakpoint; FLUID_GRID tokens not yet available */}
          <Grid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" gap="lg">
            {STEPS.map(({ icon: Icon, title, text, color, bg }, index) => (
              <Card
                className={`${themed.bgSecondary} rounded-xl border ${themed.border} p-6 relative`}
              >
                <Caption className="absolute top-4 right-4 font-bold">
                  {String(index + 1).padStart(2, "0")}
                </Caption>
                <Div
                  className={`w-12 h-12 ${bg} rounded-xl ${flex.center} mb-4`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </Div>
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
          className={`${themed.bgSecondary} rounded-xl border ${themed.border} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
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
              className={`text-sm ${themed.textSecondary} hover:text-primary underline underline-offset-4 transition-colors`}
            >
              {t("helpCenter")}
            </TextLink>
            <TextLink
              href={ROUTES.PUBLIC.CONTACT}
              className="text-sm bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t("contactSupport")}
            </TextLink>
          </Row>
        </Section>
      </Container>
    </Container>
  );
}

