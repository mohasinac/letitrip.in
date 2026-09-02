import { Suspense } from "react";
import { WishlistPageClient } from "./WishlistPageClient";

export default function Page() {
  return (
    <Suspense>
      <WishlistPageClient />
    </Suspense>
  );
}
