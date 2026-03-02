import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

interface Props {
  params: Promise<{ locale: string; storeSlug: string }>;
}

/** Redirect root store URL → products sub-page */
export default async function StoreIndexPage({ params }: Props) {
  const { locale, storeSlug } = await params;
  redirect(`/${locale}${ROUTES.PUBLIC.STORE_PRODUCTS(storeSlug)}`);
}
