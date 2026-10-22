import { AdminIntegrationsPageClient } from "@/components/admin/AdminIntegrationsPageClient";

export const metadata = { title: "Integrations — Admin" };

/**
 * Admin → Site → Integrations.
 *
 * A shim over a client component, because the page both READS the settings
 * document and WRITES patches back to `PUT /api/admin/site` — so the fetch has
 * to be per-viewer and live. 🛑 It deliberately does NOT read the settings
 * server-side: `admin/layout.tsx` already awaits the session and makes this
 * whole subtree dynamic, and a server read here would still be prerender-
 * attempted and so would need `safeRead` for no gain, while the client has to
 * refetch after every write anyway.
 */
export default function Page() {
  return <AdminIntegrationsPageClient />;
}
