"use client";

import { useRouter } from "@/i18n/navigation";
import { SellerGroupedListingsView, ROUTES } from "@mohasinac/appkit/client";

export function GroupedListingsClient() {
  const router = useRouter();
  return (
    <SellerGroupedListingsView
      onCreateClick={() => router.push(String(ROUTES.STORE.GROUPED_LISTINGS_NEW))}
      onEditClick={(id) => router.push(String(ROUTES.STORE.GROUPED_LISTINGS_EDIT(id)))}
      onDeleteClick={async (id) => {
        // audit-direct-fetch-ok: advanced store feature; no server action yet
        await fetch(`/api/store/grouped-listings/${id}`, { method: "DELETE" });
        router.refresh();
      }}
    />
  );
}
