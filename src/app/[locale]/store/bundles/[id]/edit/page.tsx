import { StoreBundleEditClient } from "./store-bundle-edit-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoreBundleEditClient id={id} />;
}
