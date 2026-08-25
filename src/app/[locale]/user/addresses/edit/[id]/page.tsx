import { redirect } from "next/navigation";
import { ROUTES } from "@mohasinac/appkit";

interface Props {
  params: Promise<{ id: string }>;
}

/** Legacy path. The canonical route is `/user/addresses/[id]/edit`. */
export default async function Page({ params }: Props) {
  const { id } = await params;
  redirect(String(ROUTES.USER.ADDRESSES_EDIT(id)));
}
