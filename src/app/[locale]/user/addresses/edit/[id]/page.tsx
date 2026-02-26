"use client";

import { useState, useEffect } from "react";
import { useAuth, useApiQuery } from "@/hooks";
import {
  Card,
  Heading,
  Button,
  Spinner,
  AddressForm,
  ConfirmDeleteModal,
  useToast,
} from "@/components";
import type { AddressFormData } from "@/hooks";
import { useRouter, useParams } from "next/navigation";
import { addressService } from "@/services";
import {
  THEME_CONSTANTS,
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";

export default function EditAddressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const addressId = params?.id as string;
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const tAddresses = useTranslations("addresses");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");
  const tConfirm = useTranslations("confirm");

  const {
    data: address,
    isLoading: loadingAddress,
    error: addressError,
  } = useApiQuery<AddressFormData>({
    queryKey: ["address", addressId],
    queryFn: () => addressService.getById(addressId),
    enabled: !!user && !!addressId,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (addressError) {
      showToast(ERROR_MESSAGES.ADDRESS.FETCH_FAILED, "error");
      router.push(ROUTES.USER.ADDRESSES);
    }
  }, [addressError, router, showToast]);

  const handleSubmit = async (data: AddressFormData) => {
    setSaving(true);

    try {
      await addressService.update(addressId, data);
      showToast(SUCCESS_MESSAGES.ADDRESS.UPDATED, "success");
      router.push(ROUTES.USER.ADDRESSES);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await addressService.delete(addressId);
      showToast(SUCCESS_MESSAGES.ADDRESS.DELETED, "success");
      router.push(ROUTES.USER.ADDRESSES);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
        "error",
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.USER.ADDRESSES);
  };

  if (loading || loadingAddress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }

  if (!user || !address) {
    return null;
  }

  return (
    <div className="max-w-3xl">
      <div className={THEME_CONSTANTS.spacing.stack}>
        <div className="flex items-center justify-between">
          <Heading level={3}>{tAddresses("edit")}</Heading>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={saving || deleting}
          >
            {tActions("delete")}
          </Button>
        </div>

        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <AddressForm
            initialData={address}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={saving}
            submitLabel={tActions("update")}
          />
        </Card>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={tConfirm("delete")}
        message={tAddresses("deleteConfirm")}
        isDeleting={deleting}
      />
    </div>
  );
}
