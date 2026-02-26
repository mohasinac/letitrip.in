import { use } from "react";
import { CategoryProductsView } from "@/features/categories";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryProductsPage({ params }: PageProps) {
  const { slug } = use(params);
  return <CategoryProductsView slug={slug} />;
}
