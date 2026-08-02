"use client";

import { useRouter } from "@/i18n/navigation";
import { SellerGroupedListingsView, ROUTES } from "@mohasinac/appkit/client";
import { deleteGroupedListing } from "@/lib/api/store-client";
import { API_ROUTES } from "@/constants";

export function GroupedListingsClient() {
  const router = useRouter();
  return (
    <SellerGroupedListingsView
      onCreateClick={() => router.push(String(ROUTES.STORE.GROUPED_LISTINGS_NEW))}
      onEditClick={(id) => router.push(String(ROUTES.STORE.GROUPED_LISTINGS_EDIT(id)))}
      onDeleteClick={async (id) => {
        await deleteGroupedListing(API_ROUTES.STORE.GROUPED_LISTING_BY_ID(id));
        router.refresh();
      }}
    />
  );
}
