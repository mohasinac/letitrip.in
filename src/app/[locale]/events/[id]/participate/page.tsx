import { use } from "react";
import { EventParticipateView } from "@/features/events";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EventParticipatePage({ params }: Props) {
  const { id } = use(params);
  return <EventParticipateView id={id} />;
}
