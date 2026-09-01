import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AdminWhatsAppGuideView } from "@mohasinac/appkit";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


export const metadata: Metadata = _gm({
  title: "WhatsApp Integration Guide — Admin | LetItRip",
  description: "Admin guide: connecting Meta's WhatsApp Business Cloud API — Business Manager setup, phone number registration, access tokens, and message templates.",
  path: "/admin/guide/whatsapp",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminWhatsAppGuideView />;
}
