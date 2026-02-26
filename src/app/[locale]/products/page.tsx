import { Suspense } from "react";
import { ProductsView } from "@/features/products";

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsView />
    </Suspense>
  );
}
