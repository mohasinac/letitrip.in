import { ProductDetailPageView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductDetailPageView slug={params.slug} />;
}
