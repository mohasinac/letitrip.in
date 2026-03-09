import { notFound } from "next/navigation";
import { eventRepository } from "@/repositories";
import { EventDetailView } from "@/features/events";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await eventRepository.findById(id);
  if (!event) return {};
  return {
    title: event.title,
    description: event.description?.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await eventRepository.findById(id);
  if (!event) notFound();

  return <EventDetailView id={id} initialData={event} />;
}
