import { BundleEditClient } from "./bundle-edit-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BundleEditClient id={id} />;
}
