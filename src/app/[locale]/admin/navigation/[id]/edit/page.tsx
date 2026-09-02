import { NavEditorPageClient } from "../../NavEditorPageClient";

export const metadata = { title: "Edit Nav Item — Admin" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NavEditorPageClient itemId={id} />;
}
