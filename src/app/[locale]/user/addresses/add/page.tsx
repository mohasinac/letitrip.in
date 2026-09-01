import { redirect } from "next/navigation";
import { ROUTES } from "@mohasinac/appkit";

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
 * Legacy path. The canonical route is `/user/addresses/new`.
 *
 * Kept rather than deleted: this URL has been live and may be bookmarked, and
 * a 404 is a worse outcome than a redirect for a path that costs three lines
 * to honour.
 */
export default function Page() {
  redirect(String(ROUTES.USER.ADDRESSES_NEW));
}
