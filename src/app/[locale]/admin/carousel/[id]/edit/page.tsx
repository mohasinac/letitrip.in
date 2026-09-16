import { notFound } from "next/navigation";
import { carouselRepository } from "@mohasinac/appkit";
import { CarouselEditClient } from "./carousel-edit-client";

/*
 * 🛑 THE EXISTENCE CHECK IS THE POINT OF THIS FILE.
 *
 * This was a bare shim with no check, so an invented id rendered a full
 * editor — every field, a Save button and usually a Delete button — for a
 * record that does not exist. 27 of 40 admin detail pages were like this.
 * /admin/orders/[id]/view already did it correctly and is the reference.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const record = await carouselRepository.findById(id);
  if (!record) return notFound();

  return <CarouselEditClient id={id} />;
}
