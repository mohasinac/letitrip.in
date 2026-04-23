import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; storeSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { locale, storeSlug } = await params;
  redirect(`/${locale}/stores/${storeSlug}/products`);
}
