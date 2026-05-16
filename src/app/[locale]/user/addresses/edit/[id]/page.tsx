import { EditAddressClient } from "@/components";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EditAddressClient addressId={id} />;
}
