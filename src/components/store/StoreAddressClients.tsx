"use client";

/**
 * Add / edit a STORE pickup address, as pages.
 *
 * `SellerAddressesView` is one component containing the list AND its drawer
 * editor, so there was no standalone editor to mount. But `AddressForm` is
 * purely presentational — it knows nothing about endpoints or owner types —
 * and every `useAddresses` hook already accepts endpoint overrides. So these
 * are the user-side clients with the endpoints swapped, not a second form.
 *
 * Three things differ from the user pages, and all three were bugs waiting to
 * happen rather than styling choices:
 *
 *  · `byIdEndpoint` / `listEndpoint` point at `/api/store/addresses`, whose
 *    handlers derive `ownerType: "store"` and the `ownerId` from the session —
 *    neither is ever sent by the client.
 *  · `method: "PUT"`. The store route exports PUT while the user route exports
 *    PATCH, and the hook defaults to PATCH — so this would have 405'd.
 *    `audit-client-verb-match` caught it before the page existed.
 *  · `landmark` now round-trips. The store API has always accepted it and the
 *    drawer collects it, while `AddressForm` had no field — so editing a
 *    drawer-created address here used to drop it.
 */
import { useRouter } from "@/i18n/navigation";
import {
  AddressForm,
  Div,
  Heading,
  Stack,
  Text,
  ROUTES,
  useAddress,
  useCreateAddress,
  useToast,
  useUpdateAddress,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

const LIST = API_ROUTES.STORE.ADDRESSES;
const BY_ID = (id: string) => `${API_ROUTES.STORE.ADDRESSES}/${id}`;

export function AddStoreAddressClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const back = () => router.push(String(ROUTES.STORE.ADDRESSES));

  const create = useCreateAddress({
    listEndpoint: LIST,
    onSuccess: () => {
      showToast("Pickup address saved.", "success");
      back();
    },
    onError: (err) => showToast(err.message ?? "Failed to save address.", "error"),
  });

  return (
    <Stack className="max-w-lg" gap="md">
      <Heading level={1} size="xl" weight="bold" color="primary">Add Pickup Address</Heading>
      <AddressForm
        onSubmit={async (data) => { await create.mutateAsync(data); }}
        onCancel={back}
        isLoading={create.isPending}
        submitLabel="Save Address"
        defaultCountry="India"
      />
    </Stack>
  );
}

export function EditStoreAddressClient({ addressId }: { addressId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const back = () => router.push(String(ROUTES.STORE.ADDRESSES));

  const { data: address, isLoading } = useAddress(addressId, { byIdEndpoint: BY_ID });

  const update = useUpdateAddress(addressId, {
    byIdEndpoint: BY_ID,
    // See the header: the store route is PUT, the hook defaults to PATCH.
    method: "PUT",
    onSuccess: () => {
      showToast("Pickup address updated.", "success");
      back();
    },
    onError: (err) => showToast(err.message ?? "Failed to update address.", "error"),
  });

  if (isLoading) {
    return (
      <Stack className="max-w-lg animate-pulse" gap="md">
        {Array.from({ length: 6 }).map((_, i) => (
          <Div key={i} className="h-10" surface="subtle" rounded="lg" />
        ))}
      </Stack>
    );
  }

  if (!address) return <Text size="sm" color="muted">Address not found.</Text>;

  return (
    <Stack className="max-w-lg" gap="md">
      <Heading level={1} size="xl" weight="bold" color="primary">Edit Pickup Address</Heading>
      <AddressForm
        initialData={address}
        onSubmit={async (data) => { await update.mutateAsync(data); }}
        onCancel={back}
        isLoading={update.isPending}
        submitLabel="Update Address"
        defaultCountry="India"
      />
    </Stack>
  );
}
