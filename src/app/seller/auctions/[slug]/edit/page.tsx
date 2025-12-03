"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import AuctionForm from "@/components/seller/AuctionForm";
import { auctionsService } from "@/services/auctions.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import { PageState } from "@/components/common/PageState";
import type { AuctionFE } from "@/types/frontend/auction.types";
import { notFound } from "@/lib/error-redirects";

export default function EditAuctionPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [auction, setAuction] = useState<AuctionFE | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  useEffect(() => {
    if (slug) {
      loadAuction();
    }
  }, [slug]);

  const loadAuction = useCallback(async () => {
    await execute(async () => {
      const data = await auctionsService.getBySlug(slug);
      setAuction(data);
    });
  }, [slug, execute]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      const updateData: any = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        startingBid: data.startingBid,
        reservePrice: data.reservePrice,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
      };

      if (data.images) {
        updateData.images = data.images;
      }

      if (data.videos) {
        updateData.videos = data.videos;
      }

      // Use the auction's ID for the update API call
      await auctionsService.update(auction!.id, updateData);
      router.push("/seller/auctions");
    } catch (err: any) {
      console.error("Error updating auction:", err);
      setSubmitError(err.message || "Failed to update auction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <PageState.Error
        message={error.message}
        onRetry={loadAuction}
        fullPage={false}
      />
    );
  }

  if (isLoading) {
    return <PageState.Loading message="Loading auction..." fullPage={false} />;
  }

  if (!auction) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Auction not found
        </h2>
        <Link
          href="/seller/auctions"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Go back to auctions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/seller/auctions"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auctions
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Edit Auction
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Update your auction details
        </p>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            {submitError}
          </p>
        </div>
      )}

      {/* Form */}
      <AuctionForm
        mode="edit"
        initialData={auction}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
