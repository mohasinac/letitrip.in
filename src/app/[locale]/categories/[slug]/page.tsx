import { redirect } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/*
 * 🛑 No `generateMetadata` here, deliberately.
 *
 * This page only redirects, and `redirect()` produces a 307 with no body — so
 * any metadata built here never reaches a browser or a crawler. What it DID
 * cost was a `getCategoryBySlug()` Firestore read on every crawl of every
 * category URL, the result of which was discarded. The canonical that matters
 * is declared by the route this lands on (`[tab]/sort/[sortKey]/page/[page]`),
 * which already points back at `/categories/{slug}`.
 *
 * Same rule as `promotions/page.tsx` and `stores/[storeSlug]/page.tsx`, both
 * bare redirects for this reason — CLAUDE.md § Known TS Patterns.
 */
export default async function Page({ params }: Props) {
  const { slug } = await params;
  /*
   * 🛑 Pass the UNPREFIXED path.
   *
   * `redirect` here is the next-intl wrapper from `@/i18n/navigation`, which
   * applies the locale itself — and under `localePrefix: "never"` that means
   * applying none. Interpolating `/${locale}` as well produced `/en/categories/…`,
   * which the intl middleware then 307s a SECOND time to strip. Every category
   * link on the site paid two hops before any HTML rendered, including the 62
   * on the homepage and all 4,658 URLs the sitemap used to advertise.
   */
  redirect(`/categories/${slug}/products/sort/relevance/page/1`);
}
