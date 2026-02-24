"use client";

import { useEffect } from "react";
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
import { useRouter } from "next/navigation";
import {
  ROUTES,
  UI_LABELS,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import type { Address } from "@/hooks";
import { useState } from "react";

export default function UserAddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch addresses
  const {
    data: addresses,
    isLoading: fetchLoading,
    error,
    refetch,
  } = useAddresses();

  // Delete mutation
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

  // Set default mutation
  const { mutate: setDefault, isLoading: settingDefault } =
    useSetDefaultAddress({
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

  const handleEdit = (id: string) => {
    router.push(ROUTES.USER.ADDRESSES_EDIT(id));
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteAddress({ id: deleteId });
    }
  };

  const handleSetDefault = (id: string) => {
    setDefault({ addressId: id });
  };

  if (authLoading || fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { spacing } = THEME_CONSTANTS;

  return (
    <>
      <div className={spacing.stack}>
        <div className="flex items-center justify-between">
          <Heading level={3}>{UI_LABELS.USER.ADDRESSES.TITLE}</Heading>
          <Button
            variant="primary"
            onClick={() => router.push(ROUTES.USER.ADDRESSES_ADD)}
          >
            {UI_LABELS.USER.ADDRESSES.ADD}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-red-600 dark:text-red-400">
            {ERROR_MESSAGES.GENERIC.INTERNAL_ERROR}
          </div>
        )}

        {/* Empty State */}
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
            title={UI_LABELS.USER.ADDRESSES.EMPTY}
            description={UI_LABELS.USER.ADDRESSES.EMPTY_SUBTITLE}
            actionLabel={UI_LABELS.USER.ADDRESSES.ADD_FIRST}
            onAction={() => router.push(ROUTES.USER.ADDRESSES_ADD)}
          />
        )}

        {/* Address List */}
        {addresses && addresses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {addresses.map((address) => (
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title={UI_LABELS.USER.ADDRESSES.DELETE_CONFIRM_TITLE}
          message={UI_LABELS.USER.ADDRESSES.DELETE_CONFIRM_MESSAGE}
          isDeleting={deleting}
        />
      )}
    </>
  );
}
