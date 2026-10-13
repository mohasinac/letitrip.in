import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityCollectiblesView } from "@mohasinac/appkit/features/products/components/CityCollectiblesView";
import { MEETUP_CITIES, meetupCityBySlug } from "@mohasinac/appkit/features/products/constants/meetup-cities";
import { generateMetadata as _gm } from "@/constants/seo.server";

type Props = { params: Promise<{ city: string }> };

/**
 * 🛑 STATIC, and that is the whole design of this route.
 *
 * `generateStaticParams` over a fixed six-city list means these pages prerender
 * and the `revalidate` below is real. A city page that awaited `searchParams`
 * would be dynamic and every crawler hit would pay a render — on the surface
 * most likely to be crawled widely (Root Cause #94). An unknown city 404s
 * rather than rendering an empty page with a stranger's town in its title.
 */
export function generateStaticParams() {
  return MEETUP_CITIES.map((c) => ({ city: c.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const match = meetupCityBySlug(city);
  if (!match) return { title: "City not found" };
  return _gm({
    title: `Collectibles for sale in ${match.city} — LetItRip`,
    description: `Classified collectibles listings in ${match.city}, ${match.state}. Meet the seller, inspect the item and pay in person — Beyblades, trading cards, diecast and figures.`,
    path: `/collectibles/${match.slug}`,
    keywords: [
      `collectibles ${match.city}`,
      `beyblade ${match.city}`,
      `buy collectibles in ${match.city}`,
    ],
  });
}

export default async function Page({ params }: Props) {
  const { city } = await params;
  const match = meetupCityBySlug(city);
  if (!match) notFound();
  return <CityCollectiblesView city={match} />;
}
