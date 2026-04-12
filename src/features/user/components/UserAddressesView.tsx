"use client";

import { Spinner, Button, Grid } from "@mohasinac/appkit/ui";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  useAuth,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useMessage,
} from "@/hooks";
import { AddressCard, ConfirmDeleteModal, EmptyState } from "@/components";
import { UserAddressesView as AppkitUserAddressesView } from "@mohasinac/appkit/features/account";
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import type { Address } from "@/hooks";

export function UserAddressesView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const tAddresses = useTranslations("addresses");
  const tActions = useTranslations("actions");

  const { data: addresses, isLoading, refetch } = useAddresses();

  const { mutate: deleteAddress, isPending: deleting } = useDeleteAddress({
    onSuccess: () => {
      showSuccess(SUCCESS_MESSAGES.ADDRESS.DELETED);
      setDeleteId(null);
      refetch();
    },
    onError: (error) =>
      showError(error?.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR),
  });

  const { mutate: setDefault } = useSetDefaultAddress({
    onSuccess: () => {
      showSuccess(SUCCESS_MESSAGES.ADDRESS.DEFAULT_SET);
      refetch();
    },
    onError: (error) =>
      showError(error?.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  return (
    <AppkitUserAddressesView
      isEmpty={!isLoading && !addresses?.length}
      renderToolbar={() => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push(ROUTES.USER.ADDRESSES_ADD)}
        >
          {tActions("addAddress")}
        </Button>
      )}
      renderAddresses={() =>
        isLoading ? (
          <Spinner />
        ) : (
          <Grid
            gap="md"
            className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {addresses?.map((address: Address) => (
              <AddressCard
                key={address.id}
                address={address}
                onDelete={() => setDeleteId(address.id)}
                onSetDefault={() => setDefault({ addressId: address.id })}
                onEdit={() =>
                  router.push(ROUTES.USER.ADDRESSES_EDIT(address.id))
                }
              />
            ))}
          </Grid>
        )
      }
      renderEmpty={() => (
        <EmptyState
          title={tAddresses("noAddresses")}
          description={tAddresses("noAddressesDesc")}
          actionLabel={tActions("addAddress")}
          onAction={() => router.push(ROUTES.USER.ADDRESSES_ADD)}
        />
      )}
      renderDeleteModal={() =>
        deleteId ? (
          <ConfirmDeleteModal
            isOpen
            onClose={() => setDeleteId(null)}
            onConfirm={() => deleteAddress({ id: deleteId })}
            isDeleting={deleting}
            title={tAddresses("confirmDelete")}
            message={tAddresses("confirmDeleteDesc")}
          />
        ) : null
      }
    />
  );
}
