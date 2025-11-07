"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, X } from "lucide-react";
import ShopForm from "@/components/seller/ShopForm";
import MediaUploader from "@/components/media/MediaUploader";
import type { Shop } from "@/types";

export default function EditShopPage() {
  const params = useParams();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Media upload states
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Fetch shop data
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch(`/api/shops/${shopId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Failed to load shop");
          return;
        }

        setShop(data.shop);
        setLogoPreview(data.shop.logo);
        setBannerPreview(data.shop.banner);
      } catch (err) {
        setError("An error occurred while loading shop");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  // Handle shop info update
  const handleShopUpdate = async (formData: Partial<Shop>) => {
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/shops/${shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update shop");
        return;
      }

      setShop(data.shop);
      setSuccessMessage("Shop updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("An error occurred while updating shop");
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (mediaFiles: Array<{ file: File }>) => {
    if (mediaFiles.length === 0) return;

    const file = mediaFiles[0].file;
    setLogoUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Implement actual upload to storage
    // For now, simulate upload with mock URL
    setTimeout(async () => {
      const mockUrl = `/uploads/logos/${file.name}`;
      await handleShopUpdate({ logo: mockUrl });
      setLogoUploading(false);
    }, 1500);
  };

  // Handle banner upload
  const handleBannerUpload = async (mediaFiles: Array<{ file: File }>) => {
    if (mediaFiles.length === 0) return;

    const file = mediaFiles[0].file;
    setBannerUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Implement actual upload to storage
    // For now, simulate upload with mock URL
    setTimeout(async () => {
      const mockUrl = `/uploads/banners/${file.name}`;
      await handleShopUpdate({ banner: mockUrl });
      setBannerUploading(false);
    }, 1500);
  };

  // Remove logo
  const handleRemoveLogo = async () => {
    setLogoPreview(null);
    await handleShopUpdate({ logo: undefined });
  };

  // Remove banner
  const handleRemoveBanner = async () => {
    setBannerPreview(null);
    await handleShopUpdate({ banner: undefined });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error && !shop) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Shop</h1>
        <p className="text-gray-600 mt-1">
          Update your shop information and media
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <AlertCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Shop Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Shop Information
        </h2>
        <ShopForm mode="edit" shop={shop} onSubmit={handleShopUpdate} />
      </div>

      {/* Logo Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop Logo</h2>
        <p className="text-sm text-gray-600 mb-4">
          Recommended size: 400x400px. Max file size: 2MB.
        </p>

        {logoPreview ? (
          <div className="relative inline-block">
            <img
              src={logoPreview}
              alt="Shop logo"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={handleRemoveLogo}
              className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <MediaUploader
            accept="image"
            maxFiles={1}
            resourceType="shop"
            onFilesAdded={handleLogoUpload}
            className="max-w-md"
          />
        )}
      </div>

      {/* Banner Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Shop Banner
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Recommended size: 1200x400px. Max file size: 5MB.
        </p>

        {bannerPreview ? (
          <div className="relative inline-block max-w-2xl">
            <img
              src={bannerPreview}
              alt="Shop banner"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={handleRemoveBanner}
              className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <MediaUploader
            accept="image"
            maxFiles={1}
            resourceType="shop"
            onFilesAdded={handleBannerUpload}
            className="max-w-2xl"
          />
        )}
      </div>
    </div>
  );
}
