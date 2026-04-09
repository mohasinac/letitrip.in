import type { Metadata } from "next";
import { use } from "react";
import { SITE_CONFIG } from "@/constants";
import { EventParticipateView } from "@/features/events/components";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: `Participate in Event — ${SITE_CONFIG.brand.name}`,
  description:
    "Join this event on LetItRip. Submit your entry and participate.",
  robots: { index: false, follow: false },
};

export default function EventParticipatePage({ params }: Props) {
  const { id } = use(params);
  return <EventParticipateView id={id} />;
}
