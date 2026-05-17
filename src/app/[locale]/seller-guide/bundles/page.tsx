import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { SellerGuideView, Heading, Text, Stack, Section, Ol, Ul, Li } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Bundles Seller Guide — LetItRip",
  description: "Learn how to create and manage product bundles on LetItRip. Increase average order value by grouping related collectibles.",
  path: "/seller-guide/bundles",
  keywords: ["sell bundle collectibles india", "product bundles letitrip", "bundle listing guide"],
});

export const revalidate = 3600;

const H2 = "mb-3 text-xl font-semibold";

export default function Page() {
  return (
    <SellerGuideView
      labels={{ title: "Bundles Guide" }}
      sections={
        <Stack gap="none" className="max-w-3xl space-y-8">
          <Section>
            <Heading level={2} className={H2}>What are Bundles?</Heading>
            <Text className="text-zinc-600 dark:text-zinc-400">
              Bundles let you group multiple products into a single listing. Buyers get a curated set at a
              combined price — great for starter kits, themed collections, or clearance lots.
            </Text>
          </Section>

          <Section>
            <Heading level={2} className={H2}>Creating a Bundle</Heading>
            <Ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
              <Li>Go to <strong>Store Dashboard → Listings → Bundles → New Bundle</strong>.</Li>
              <Li>Set a title, description, and cover image for the bundle.</Li>
              <Li>Search for and add the individual products you want to include.</Li>
              <Li>Set the bundle price — this overrides individual product prices for buyers who purchase the bundle.</Li>
              <Li>Publish the bundle. It will appear on your store page and the Bundles browse page.</Li>
            </Ol>
          </Section>

          <Section>
            <Heading level={2} className={H2}>Stock Sync</Heading>
            <Text className="text-zinc-600 dark:text-zinc-400">
              Bundle availability is tied to its component products. If any included product sells out, the bundle
              is automatically marked unavailable. Stock is restored if the product is restocked.
            </Text>
          </Section>

          <Section>
            <Heading level={2} className={H2}>Tips</Heading>
            <Ul className="list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
              <Li>Offer a 5–15% discount vs buying items individually to drive bundle conversions.</Li>
              <Li>Use themed bundles (e.g. &quot;Pokémon Starter Kit&quot;) that tell a story.</Li>
              <Li>Pin your best bundles to the top of your store page.</Li>
              <Li>Bundles appear with a &quot;Bundle&quot; badge on product cards.</Li>
            </Ul>
          </Section>
        </Stack>
      }
    />
  );
}
