"use client";

import { useEffect, useState } from "react";
import {
  useAuth,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useMessage,
} from "@/hooks";
import {
  Heading,
  Button,
  Spinner,
  EmptyState,
  AddressCard,
  ConfirmDeleteModal,
} from "@/components";
import { useRouter } from "@/i18n/navigation";
import {
  ROUTES,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";
import type { Address } from "@/hooks";

export function UserAddressesView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const tAddresses = useTranslations("addresses");
  const tLoading = useTranslations("loading");

  const {
    data: addresses,
    isLoading: fetchLoading,
    error,
    refetch,
  } = useAddresses();

  const { mutate: deleteAddress, isLoading: deleting } = useDeleteAddress({
    onSuccess: () => {
      showSuccess(SUCCESS_MESSAGES.ADDRESS.DELETED);
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      showError(error?.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR);
    },
  });

  const { mutate: setDefault } = useSetDefaultAddress({
    onSuccess: () => {
      showSuccess(SUCCESS_MESSAGES.ADDRESS.DEFAULT_SET);
      refetch();
    },
    onError: (error) => {
      showError(error?.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR);
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  const handleEdit = (id: string) =>
    router.push(ROUTES.USER.ADDRESSES_EDIT(id));
  const handleDelete = (id: string) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId) deleteAddress({ id: deleteId });
  };
  const handleSetDefault = (id: string) => setDefault({ addressId: id });

  const { spacing, flex } = THEME_CONSTANTS;

  if (authLoading || fetchLoading) {
    return (
      <div className={`${flex.center} min-h-screen`}>
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className={spacing.stack}>
        <div className={flex.between}>
          <Heading level={3}>{tAddresses("title")}</Heading>
          <Button
            variant="primary"
            onClick={() => router.push(ROUTES.USER.ADDRESSES_ADD)}
          >
            {tAddresses("add")}
          </Button>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400">
            {tLoading("failed")}
          </div>
        )}

        {!fetchLoading && (!addresses || addresses.length === 0) && (
          <EmptyState
            icon={
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
            title={tAddresses("empty")}
            description={tAddresses("emptySubtitle")}
            actionLabel={tAddresses("addFirst")}
            onAction={() => router.push(ROUTES.USER.ADDRESSES_ADD)}
          />
        )}

        {addresses && addresses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {addresses.map((address: Address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => handleEdit(address.id)}
                onDelete={() => handleDelete(address.id)}
                onSetDefault={() => handleSetDefault(address.id)}
              />
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title={tAddresses("deleteConfirmTitle")}
          message={tAddresses("deleteConfirmMessage")}
          isDeleting={deleting}
        />
      )}
    </>
  );
}
