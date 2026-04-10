"use client";

/**
 * UserAddressesView
 *
 * User address management using the unified ListingLayout shell.
 * Displays addresses in a responsive grid with add/edit/delete/set-default.
 */

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useAuth,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useMessage,
} from "@/hooks";
import {
  Button,
  ConfirmDeleteModal,
  EmptyState,
  ListingLayout,
  Spinner,
} from "@/components";
import { AddressCard } from "@/components";
import { Heading, Row, Text } from "@mohasinac/appkit/ui";
import { useRouter } from "@/i18n/navigation";
import {
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";
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

  const { mutate: deleteAddress, isPending: deleting } = useDeleteAddress({
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
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const handleEdit = (id: string) =>
    router.push(ROUTES.USER.ADDRESSES_EDIT(id));
  const handleDelete = (id: string) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId) deleteAddress({ id: deleteId });
  };
  const handleSetDefault = (id: string) => setDefault({ addressId: id });

  if (authLoading || fetchLoading) {
    return (
      <Row justify="center" gap="none" className="min-h-screen">
        <Spinner size="lg" label={tLoading("default")} />
      </Row>
    );
  }

  if (!user) return null;

  const total = addresses?.length ?? 0;

  return (
    <>
      <ListingLayout
        headerSlot={
          <div>
            <Heading level={3}>{tAddresses("title")}</Heading>
            {total > 0 && (
              <Text variant="secondary" className="mt-1">
                {tAddresses("subtitleWithCount", { count: total })}
              </Text>
            )}
          </div>
        }
        actionsSlot={
          <Button
            variant="primary"
            onClick={() => router.push(ROUTES.USER.ADDRESSES_ADD)}
          >
            {tAddresses("add")}
          </Button>
        }
      >
        {error ? (
          <EmptyState
            title={tLoading("failed")}
            description={tAddresses("empty")}
          />
        ) : total === 0 ? (
          <EmptyState
            icon={<MapPin className="w-16 h-16" />}
            title={tAddresses("empty")}
            description={tAddresses("emptySubtitle")}
            actionLabel={tAddresses("addFirst")}
            onAction={() => router.push(ROUTES.USER.ADDRESSES_ADD)}
          />
        ) : (
          <div className={THEME_CONSTANTS.grid.addressCards}>
            {addresses!.map((address: Address) => (
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
      </ListingLayout>

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
