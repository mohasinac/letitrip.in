import { AddAddressClient } from "@/components";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


/**
 * Create an address — the standard `/new` shape.
 *
 * `/user/addresses/add` and `/user/addresses/edit/[id]` were the only two
 * non-standard route shapes in the codebase; every other entity uses `/new`
 * and `/[id]/edit`. Both old paths remain as redirects, so bookmarks and any
 * link already in the wild keep working.
 */
export default function Page() {
  return <AddAddressClient />;
}
