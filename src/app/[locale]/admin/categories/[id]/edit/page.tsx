import { CategoryEditClient } from "./category-edit-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryEditClient id={id} />;
}
