import { EditAddressClient } from "@/components";

interface Props {
  params: Promise<{ id: string }>;
}

/** Edit an address — the standard `/[id]/edit` shape. See `new/page.tsx`. */
export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EditAddressClient addressId={id} />;
}
