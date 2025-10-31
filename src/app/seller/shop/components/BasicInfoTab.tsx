import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { uploadToFirebase } from "@/lib/firebase/storage";

interface ShopData {
  storeName: string;
  storeSlug: string;
  description: string;
  logo: string;
  coverImage: string;
  isActive: boolean;
  [key: string]: any;
}

interface BasicInfoTabProps {
  shopData: ShopData;
  onChange: (data: ShopData) => void;
  loading: boolean;
}

export default function BasicInfoTab({
  shopData,
  onChange,
  loading,
}: BasicInfoTabProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const url = await uploadToFirebase(file, `shops/logos/${Date.now()}_${file.name}`);
      onChange({ ...shopData, logo: url });
    } catch (error) {
      console.error("Logo upload failed:", error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const url = await uploadToFirebase(file, `shops/covers/${Date.now()}_${file.name}`);
      onChange({ ...shopData, coverImage: url });
    } catch (error) {
      console.error("Cover upload failed:", error);
    } finally {
      setUploadingCover(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (value: string) => {
    onChange({
      ...shopData,
      storeName: value,
      storeSlug: shopData.storeSlug || generateSlug(value),
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <UnifiedCard className="p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Store Information</h3>
        
        <div className="space-y-4">
          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Store Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={shopData.storeName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Awesome Store"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
            />
          </div>

          {/* Store Slug */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Store URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-textSecondary">justforview.in/shop/</span>
              <input
                type="text"
                value={shopData.storeSlug}
                onChange={(e) =>
                  onChange({ ...shopData, storeSlug: generateSlug(e.target.value) })
                }
                placeholder="my-awesome-store"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-textSecondary mt-1">
              Auto-generated from store name. Can be customized.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Store Description
            </label>
            <textarea
              value={shopData.description}
              onChange={(e) =>
                onChange({ ...shopData, description: e.target.value })
              }
              rows={4}
              placeholder="Tell customers about your store..."
              disabled={loading}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none disabled:opacity-50"
            />
          </div>
        </div>
      </UnifiedCard>

      {/* Logo & Cover Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo */}
        <UnifiedCard className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Store Logo</h3>
          
          <div className="space-y-4">
            {shopData.logo && (
              <div className="flex justify-center">
                <img
                  src={shopData.logo}
                  alt="Store Logo"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-border"
                />
              </div>
            )}

            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo || loading}
                className="hidden"
              />
              <div className="w-full">
                <UnifiedButton
                  variant="outline"
                  icon={uploadingLogo ? <Loader2 className="animate-spin" /> : <Upload />}
                  disabled={uploadingLogo || loading}
                  className="w-full pointer-events-none"
                  onClick={(e) => e.preventDefault()}
                >
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </UnifiedButton>
              </div>
            </label>

            <p className="text-xs text-textSecondary text-center">
              Recommended: Square image, 512x512px
            </p>
          </div>
        </UnifiedCard>

        {/* Cover Image */}
        <UnifiedCard className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Cover Image</h3>
          
          <div className="space-y-4">
            {shopData.coverImage && (
              <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-border">
                <img
                  src={shopData.coverImage}
                  alt="Cover Image"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploadingCover || loading}
                className="hidden"
              />
              <div className="w-full">
                <UnifiedButton
                  variant="outline"
                  icon={uploadingCover ? <Loader2 className="animate-spin" /> : <Upload />}
                  disabled={uploadingCover || loading}
                  className="w-full pointer-events-none"
                  onClick={(e) => e.preventDefault()}
                >
                  {uploadingCover ? "Uploading..." : "Upload Cover"}
                </UnifiedButton>
              </div>
            </label>

            <p className="text-xs text-textSecondary text-center">
              Recommended: 1200x400px or 3:1 ratio
            </p>
          </div>
        </UnifiedCard>
      </div>

      {/* Store Status */}
      <UnifiedCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text mb-1">Store Status</h3>
            <p className="text-sm text-textSecondary">
              Make your store visible to customers
            </p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={shopData.isActive}
              onChange={(e) =>
                onChange({ ...shopData, isActive: e.target.checked })
              }
              disabled={loading}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>
      </UnifiedCard>
    </div>
  );
}
