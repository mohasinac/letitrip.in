import type { Metadata } from "next";
import { FAQPageView, faqJsonLd } from "@mohasinac/appkit";
import { listPublicFaqs } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "FAQ — LetItRip Help Centre",
  description:
    "Answers to common questions about shipping, returns, payments, auctions and pre-orders on LetItRip.",
  path: "/faqs",
  keywords: ["letitrip faq", "collectibles marketplace help", "auction help india"],
});

export const revalidate = 3600;

export default async function Page() {
  const rawFaqs = await listPublicFaqs(undefined, 200).catch(() => []);
  const ldFaqs = rawFaqs.map((faq) => ({
    question: faq.question,
    answer: typeof faq.answer === "string" ? faq.answer : faq.answer.text,
  }));

  const ldFaq = ldFaqs.length > 0 ? faqJsonLd(ldFaqs) : null;

  return (
    <>
      {ldFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }}
        />
      )}
      <FAQPageView faqs={rawFaqs} />
    </>
  );
}
