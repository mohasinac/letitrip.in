import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { SellerGuideView, Heading, Text, Stack, Section, Ol, Ul, Li } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Prize Draws Seller Guide — LetItRip",
  description: "Run prize draws and digital code giveaways on LetItRip. Learn how to create listings, manage codes, and announce winners.",
  path: "/seller-guide/prize-draws",
  keywords: ["prize draw india", "digital code giveaway letitrip", "seller prize draw guide"],
});

export const revalidate = 3600;

const H2 = "mb-3 text-xl font-semibold";

export default function Page() {
  return (
    <SellerGuideView
      labels={{ title: "Prize Draws Guide" }}
      sections={
        <Stack gap="none" className="max-w-3xl space-y-8">
          <Section>
            <Heading level={2} className={H2}>What are Prize Draws?</Heading>
            <Text className="text-zinc-600 dark:text-zinc-400">
              Prize draws let buyers purchase entries for a chance to win a high-value item or digital code
              at a fraction of the retail price. You upload the prize codes in advance; winners receive
              their code instantly when revealed.
            </Text>
          </Section>

          <Section>
            <Heading level={2} className={H2}>Creating a Prize Draw</Heading>
            <Ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
              <Li>Go to <strong>Store Dashboard → Listings → Prize Draws → New Prize Draw</strong>.</Li>
              <Li>Set the listing title, description, entry price, and total number of entries.</Li>
              <Li>Upload your prize codes (CSV or one-per-line). Codes are encrypted and never shown until reveal.</Li>
              <Li>Set the reveal window — buyers can reveal their result only within this period.</Li>
              <Li>Publish the listing. It will appear on the Prize Draws browse page.</Li>
            </Ol>
          </Section>

          <Section>
            <Heading level={2} className={H2}>The Reveal Flow</Heading>
            <Text className="text-zinc-600 dark:text-zinc-400 mb-3">
              Once a buyer purchases an entry they can hit <strong>Reveal</strong> during the reveal window.
              A randomly assigned code is shown once. Codes are assigned using a cryptographically secure
              random draw — each entry has an equal chance.
            </Text>
            <Text className="text-zinc-600 dark:text-zinc-400">
              If your pool is exhausted (all codes revealed), any remaining unrevealed purchases are
              automatically refunded.
            </Text>
          </Section>

          <Section>
            <Heading level={2} className={H2}>Rules and Policies</Heading>
            <Ul className="list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
              <Li>Codes must be valid and unused at the time of upload.</Li>
              <Li>You are responsible for ensuring the prize is fulfilled as described.</Li>
              <Li>Prize draws are subject to LetItRip&apos;s platform fees on each entry sold.</Li>
              <Li>Listings that misrepresent the prize will be removed and may result in account suspension.</Li>
            </Ul>
          </Section>

          <Section>
            <Heading level={2} className={H2}>Tips</Heading>
            <Ul className="list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
              <Li>Set entry price at 5–10% of the item retail value for strong conversion.</Li>
              <Li>Use a short reveal window (24–72 h) to create urgency.</Li>
              <Li>Promote the listing on your store page and social channels before it goes live.</Li>
              <Li>Add a YouTube unboxing or review video to build trust.</Li>
            </Ul>
          </Section>
        </Stack>
      }
    />
  );
}
