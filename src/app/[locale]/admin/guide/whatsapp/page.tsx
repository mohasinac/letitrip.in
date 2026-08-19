import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { AdminWhatsAppGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "WhatsApp Integration Guide — Admin | LetItRip",
  description: "Admin guide: connecting Meta's WhatsApp Business Cloud API — Business Manager setup, phone number registration, access tokens, and message templates.",
  path: "/admin/guide/whatsapp",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminWhatsAppGuideView />;
}
