import { FaqEditClient } from "./faq-edit-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FaqEditClient id={id} />;
}
