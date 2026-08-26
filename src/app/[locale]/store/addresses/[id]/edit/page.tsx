import { EditStoreAddressClient } from "@/components/store/StoreAddressClients";

export const metadata = { title: "Edit Pickup Address — Store" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditStoreAddressClient addressId={id} />;
}
