"use client";

import { SellerGroupedListingsView } from "@mohasinac/appkit/client";
import { ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <SellerGroupedListingsView
      onCreateClick={() => router.push(String(ROUTES.STORE.GROUPED_LISTINGS_NEW))}
      onEditClick={(id) => router.push(String(ROUTES.STORE.GROUPED_LISTINGS_EDIT(id)))}
      onDeleteClick={async (id) => {
        await fetch(`/api/store/grouped-listings/${id}`, { method: "DELETE" });
        router.refresh();
      }}
    />
  );
}
