import { AdminDisputeReasonsPageClient } from "@/components/admin/AdminDisputeReasonsPageClient";

export const metadata = { title: "Dispute Reasons — Admin" };

/**
 * Admin → Trust & Safety → Dispute reasons.
 *
 * A shim over a client component: the page is a live list with two writes and a
 * refetch after each, so the fetch has to be per-viewer and current.
 * `admin/layout.tsx` already awaits the session and makes this whole subtree
 * dynamic, so a server read here would still be prerender-attempted (and so
 * need `safeRead`) for no gain.
 */
export default function Page() {
  return <AdminDisputeReasonsPageClient />;
}
