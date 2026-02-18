"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
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
import { logger } from "@/classes";
import {
  THEME_CONSTANTS,
  UI_LABELS,
  ROUTES,
  API_ENDPOINTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";

export default function EditAddressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const addressId = params?.id as string;
  const { showToast } = useToast();

  const [address, setAddress] = useState<AddressFormData | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  // Fetch address data
  useEffect(() => {
    if (user && addressId) {
      const fetchAddress = async () => {
        try {
          const response = await fetch(
            API_ENDPOINTS.ADDRESSES.GET_BY_ID(addressId),
          );

          if (!response.ok) {
            throw new Error(ERROR_MESSAGES.DATABASE.NOT_FOUND);
          }

          const data = await response.json();
          setAddress(data);
        } catch (error) {
          logger.error("Error fetching address:", error);
          showToast(
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
            "error",
          );
          router.push(ROUTES.USER.ADDRESSES);
        } finally {
          setLoadingAddress(false);
        }
      };

      fetchAddress();
    }
  }, [user, addressId, router, showToast]);

  const handleSubmit = async (data: AddressFormData) => {
    setSaving(true);

    try {
      const response = await fetch(API_ENDPOINTS.ADDRESSES.UPDATE(addressId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
        );
      }

      showToast(SUCCESS_MESSAGES.ADDRESS.UPDATED, "success");
      router.push(ROUTES.USER.ADDRESSES);
    } catch (error) {
      logger.error("Error updating address:", error);
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
      const response = await fetch(API_ENDPOINTS.ADDRESSES.DELETE(addressId), {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
        );
      }

      showToast(SUCCESS_MESSAGES.ADDRESS.DELETED, "success");
      router.push(ROUTES.USER.ADDRESSES);
    } catch (error) {
      logger.error("Error deleting address:", error);
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
        <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
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
          <Heading level={3}>{UI_LABELS.USER.ADDRESSES.EDIT}</Heading>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={saving || deleting}
          >
            {UI_LABELS.ACTIONS.DELETE}
          </Button>
        </div>

        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <AddressForm
            initialData={address}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={saving}
            submitLabel={UI_LABELS.ACTIONS.UPDATE}
          />
        </Card>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={UI_LABELS.MODALS.CONFIRM_DELETE}
        message={UI_LABELS.USER.ADDRESSES.DELETE_CONFIRM}
        isDeleting={deleting}
      />
    </div>
  );
}
