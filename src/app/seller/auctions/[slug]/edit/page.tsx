/**
 * @fileoverview React Component
 * @module src/app/seller/auctions/[slug]/edit/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { PageState } from "@/components/common/PageState";
import AuctionForm from "@/components/seller/AuctionForm";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { auctionsService } from "@/services/auctions.service";
import type { AuctionFE } from "@/types/frontend/auction.types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default /**
 * Performs edit auction page operation
 *
 * @returns {any} The editauctionpage result
 *
 */
function EditAuctionPage() {
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

  /**
 * Performs load auction operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The loadauction result
 *
 */
const loadAuction = useCallback(async () => {
    await execute(async () => {
      const data = await auctionsService.getBySlug(slug);
      setAuction(data);
    });
  }, [slug, execute]);

  /**
   * Performs async operation
   *
   * @param {any} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {any} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      const updateData: any = {
        /** Name */
        name: data.name,
        /** Slug */
        slug: data.slug,
        /** Description */
        description: data.description,
        /** Starting Bid */
        startingBid: data.startingBid,
        /** Reserve Price */
        reservePrice: data.reservePrice,
        /** Start Time */
        startTime: data.startTime,
        /** End Time */
        endTime: data.endTime,
        /** Status */
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
      logError(err as Error, {
        /** Component */
        component: "AuctionEdit.updateAuction",
        /** Metadata */
        metadata: { slug, auctionId: auction?.id },
      });
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
