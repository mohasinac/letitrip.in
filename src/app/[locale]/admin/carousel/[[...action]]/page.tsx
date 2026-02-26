import { use } from "react";
import { AdminCarouselView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminCarouselPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminCarouselView action={action} />;
}
