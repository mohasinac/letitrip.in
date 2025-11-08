"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import AuctionForm from "@/components/seller/AuctionForm";
import { auctionsService } from "@/services/auctions.service";
import type { Auction } from "@/types";

export default function EditAuctionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadAuction();
    }
  }, [id]);

  const loadAuction = async () => {
    try {
      setLoading(true);
      const data = await auctionsService.getById(id);
      setAuction(data);
    } catch (err: any) {
      console.error("Error loading auction:", err);
      setError("Failed to load auction");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Auction>) => {
    try {
      setIsSubmitting(true);
      setError("");

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

      await auctionsService.update(id, updateData);
      router.push("/seller/auctions");
    } catch (err: any) {
      console.error("Error updating auction:", err);
      setError(err.message || "Failed to update auction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
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
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auctions
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Edit Auction</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your auction details
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
        mode="edit"
        initialData={auction}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
