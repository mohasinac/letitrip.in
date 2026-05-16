import { Alert, Div, Heading, Text, TextLink } from "@mohasinac/appkit";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

export default function Page() {
  return (
    <Div className="mx-auto max-w-4xl space-y-6">
      <Heading level={1} className="text-2xl font-semibold">Bundles</Heading>

      <Alert variant="info">
        Bundles are curated by the LetItRip team. To add your products to a bundle,{" "}
        <TextLink href="mailto:support@letitrip.in">contact support</TextLink>
        .
      </Alert>

      <Div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-8 text-center space-y-3">
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          When your products are included in a bundle, they will appear here.
        </Text>
        <Link
          href={String(ROUTES.STORE.PRODUCTS)}
          className="text-sm text-primary-600 dark:text-primary-400 underline"
        >
          View your listings
        </Link>
      </Div>
    </Div>
  );
}
