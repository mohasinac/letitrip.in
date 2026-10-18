import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

/*
 * 🛑 Its OWN canonical. Root metadata is INHERITED, so a page that does not
 * set one declares itself a duplicate of the homepage — which is what happened
 * to /promotions and /reviews (Root Cause #81).
 *
 * 🛑 `noindex` AND the robots.txt Disallow AND this layout's redirect are all
 * three present, and none is redundant: the redirect means a crawler never
 * receives indexable content, the Disallow stops the crawl, and `noindex` is
 * the actual directive for a crawler that fetches anyway (robots.txt is
 * advisory). The redirect is what makes the combination coherent rather than
 * clever — a disallowed URL can still be listed bare if something links to it.
 */
export const metadata = _gm({
  title: "Sticker sheet tracer — LetItRip",
  description: "Trace kiss-cut outlines on a scanned sticker sheet.",
  path: "/tools/sticker-tracer",
  // `_gm`'s own flag — it owns the robots shape, so a hand-rolled
  // `robots: { index: false }` here would be a second spelling of one concern.
  noIndex: true,
});

/*
 * Server-side gate, not <RoleGuard>. RoleGuard is a client component and would
 * prerender a shell first; this redirects before any HTML is produced.
 *
 * It also scopes the dynamic cost to THIS subtree — /tools and
 * /tools/price-index have no layout of their own and keep their caching.
 */
export default makeAdminSectionLayout("admin:products:write", {
  getUser: getServerSessionUser,
});
