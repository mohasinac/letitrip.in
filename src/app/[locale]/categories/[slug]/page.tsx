import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  redirect(`/${locale}/categories/${slug}/products/sort/relevance/page/1`);
}
