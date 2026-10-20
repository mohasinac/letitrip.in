import { ImageResponse } from "next/og";
import { getBeyBySlug, renderBeyOg, safeRead } from "@mohasinac/appkit/server";
/*
 * 🛑 From `@/constants/seo`, NOT the `@/constants` barrel.
 *
 * The barrel re-exports `navigation.tsx`, which imports
 * `@mohasinac/appkit/client` — so touching it from a server graph instantiates
 * appkit a SECOND time under the client condition, with its own empty provider
 * registry. Measured 2026-10-20: that made `/api/payment/create-order` answer
 * 401 to every valid session, and the whole cost was one import string.
 *
 * The sibling `parts/[classification]/[code]/opengraph-image.tsx` still uses
 * the barrel. That is a pre-existing instance, not a licence to copy it — this
 * file was written by mirroring that shim and the import was deliberately
 * changed.
 */
import { SEO_CONFIG } from "@/constants/seo";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const siteName = SEO_CONFIG.siteName ?? "LetItRip";

  /*
   * `safeRead` for the same reason the page uses it: Next still ATTEMPTS to
   * prerender, and an unguarded throw during that attempt is fatal to the
   * build. A missing bey renders the generic card rather than failing the
   * route — `renderBeyOg(null, …)` exists for exactly that.
   */
  const bey = await safeRead(() => getBeyBySlug(slug), {
    route: "/beys/[slug]/opengraph-image",
    key: "beys.getBeyBySlug",
    fallback: null,
  });

  /*
   * No second read. Every figure on the card — type, spin, mass, part count —
   * is already on the document the page itself fetched, and `getBeyBySlug` is
   * `React.cache`d so this shares that read rather than repeating it.
   */
  return new ImageResponse(renderBeyOg(bey, { siteName }), { ...size });
}
