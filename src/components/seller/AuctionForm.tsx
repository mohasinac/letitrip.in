"use client";

import { logError } from "@/lib/error-logger";
import { auctionsService } from "@/services/auctions.service";
import { AuctionStatus } from "@/types/shared/common.types";
import {
  AuctionForm,
  Card,
  DateTimePicker,
  FormActions,
  FormCurrencyInput,
  FormField,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
  RichTextEditor,
  SlugInput,
} from "@letitrip/react-library";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AuctionFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  shopId?: string;
  className?: string;
}

/**
 * Next.js wrapper for AuctionForm component
 *
 * Provides Next.js-specific implementations:
 * - Router navigation
 * - Service layer integration
 * - Toast notifications
 * - Component injection
 */
export default function AuctionFormWrapper({
  mode,
  initialData,
  shopId,
  className = "",
}: AuctionFormWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const auction = await auctionsService.createAuction(data);
        toast.success("Auction created successfully!");
        router.push(`/seller/auctions/${auction.id}`);
      } else if (mode === "edit" && initialData?.id) {
        await auctionsService.updateAuction(initialData.id, data);
        toast.success("Auction updated successfully!");
        router.push(`/seller/auctions/${initialData.id}`);
      }
    } catch (error: any) {
      logError("Failed to save auction", error);
      toast.error(error.message || "Failed to save auction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleValidateSlug = async (slug: string, shopId: string) => {
    try {
      const data = await auctionsService.validateSlug(slug, shopId);
      return { available: data.available };
    } catch (error: any) {
      throw new Error("Error checking URL availability");
    }
  };

  const statusOptions = Object.values(AuctionStatus).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  }));

  return (
    <AuctionForm
      mode={mode}
      initialData={initialData}
      shopId={shopId}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      className={className}
      onValidateSlug={handleValidateSlug}
      onCancel={handleCancel}
      onValidationError={(message) => toast.error(message)}
      onSlugError={(error) => toast.error(error)}
      onSlugSuccess={() => toast.success("URL is available!")}
      CardComponent={Card}
      FormFieldComponent={FormField}
      FormInputComponent={FormInput}
      FormTextareaComponent={FormTextarea}
      FormSelectComponent={FormSelect}
      FormLabelComponent={FormLabel}
      SlugInputComponent={SlugInput}
      RichTextEditorComponent={RichTextEditor}
      DateTimePickerComponent={DateTimePicker}
      FormCurrencyInputComponent={FormCurrencyInput}
      FormActionsComponent={FormActions}
      statusOptions={statusOptions}
    />
  );
}
