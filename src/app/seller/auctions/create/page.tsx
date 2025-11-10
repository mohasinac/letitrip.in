"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AuctionForm from "@/components/seller/AuctionForm";
import { auctionsService } from "@/services/auctions.service";
import type { Auction } from "@/types";

export default function CreateAuctionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: Partial<Auction>) => {
    try {
      setIsSubmitting(true);
      setError("");

      const auctionData: any = {
        shopId: data.shopId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        startingBid: data.startingBid,
        reservePrice: data.reservePrice,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
      };

      if (data.images && data.images.length > 0) {
        auctionData.images = data.images;
      }

      if (data.videos && data.videos.length > 0) {
        auctionData.videos = data.videos;
      }

      await auctionsService.create(auctionData);
      router.push("/seller/auctions");
    } catch (err: any) {
      console.error("Error creating auction:", err);
      setError(err.message || "Failed to create auction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/seller/auctions"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auctions
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Create New Auction
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Set up a new auction for your items
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <AuctionForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
