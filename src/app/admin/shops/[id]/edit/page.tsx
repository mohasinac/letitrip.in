"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Trash2,
  Ban,
  CheckCircle,
  Store,
  Package,
  Star,
  Users,
  Eye,
  Edit,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { shopsService } from "@/services/shops.service";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import MediaUploader from "@/components/media/MediaUploader";
import SlugInput from "@/components/common/SlugInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Shop, Product } from "@/types";

export default function AdminEditShopPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  const { user, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [shopStats, setShopStats] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [activeTab, setActiveTab] = useState<
    "info" | "products" | "performance"
  >("info");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    email: "",
    phone: "",
    location: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    gst: "",
    pan: "",
    returnPolicy: "",
    shippingPolicy: "",
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
    },
    upiId: "",
  });

  // Media upload for logo/banner
  const {
    uploadMedia: uploadLogo,
    isUploading: isUploadingLogo,
    clearTracking: clearLogoTracking,
  } = useMediaUploadWithCleanup({
    onUploadSuccess: (url) => {
      setShop((prev) => (prev ? { ...prev, logo: url } : null));
    },
  });

  const {
    uploadMedia: uploadBanner,
    isUploading: isUploadingBanner,
    clearTracking: clearBannerTracking,
  } = useMediaUploadWithCleanup({
    onUploadSuccess: (url) => {
      setShop((prev) => (prev ? { ...prev, banner: url } : null));
    },
  });

  useEffect(() => {
    if (user && isAdmin) {
      loadShopData();
    }
  }, [user, isAdmin, shopId]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load shop by slug (shopId is actually slug in route)
      const shopData = await shopsService.getBySlug(shopId);
      setShop(shopData);

      // Load shop products
      const productsData = await shopsService.getShopProducts(shopId, {
        page: 1,
        limit: 10,
      });
      setShopProducts(productsData.data || []);

      // Load shop stats
      try {
        const statsData = await shopsService.getStats(shopId);
        setShopStats(statsData);
      } catch (err) {
        console.log("Stats not available");
      }

      // Populate form
      setFormData({
        name: shopData.name,
        slug: shopData.slug,
        description: shopData.description || "",
        email: shopData.email || "",
        phone: shopData.phone || "",
        location: shopData.location || "",
        address: {
          line1: shopData.address?.line1 || "",
          line2: shopData.address?.line2 || "",
          city: shopData.address?.city || "",
          state: shopData.address?.state || "",
          pincode: shopData.address?.pincode || "",
          country: shopData.address?.country || "India",
        },
        website: shopData.website || "",
        facebook: shopData.facebook || "",
        instagram: shopData.instagram || "",
        twitter: shopData.twitter || "",
        gst: shopData.gst || "",
        pan: shopData.pan || "",
        returnPolicy: shopData.returnPolicy || "",
        shippingPolicy: shopData.shippingPolicy || "",
        bankDetails: {
          accountHolderName: shopData.bankDetails?.accountHolderName || "",
          accountNumber: shopData.bankDetails?.accountNumber || "",
          ifscCode: shopData.bankDetails?.ifscCode || "",
          bankName: shopData.bankDetails?.bankName || "",
          branchName: shopData.bankDetails?.branchName || "",
        },
        upiId: shopData.upiId || "",
      });
    } catch (error) {
      console.error("Failed to load shop:", error);
      setError(error instanceof Error ? error.message : "Failed to load shop");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (files: any[]) => {
    if (files.length > 0) {
      await uploadLogo(files[0].file, "shop", shopId);
    }
  };

  const handleBannerUpload = async (files: any[]) => {
    if (files.length > 0) {
      await uploadBanner(files[0].file, "shop", shopId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const updateData = {
        ...formData,
        logo: shop?.logo,
        banner: shop?.banner,
      };

      await shopsService.update(shop!.slug, updateData);

      clearLogoTracking();
      clearBannerTracking();
      router.push("/admin/shops");
    } catch (error) {
      console.error("Failed to update shop:", error);
      alert("Failed to update shop");
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!shop) return;
    try {
      await shopsService.verify(shop.slug, {
        isVerified: !shop.isVerified,
      });
      await loadShopData();
    } catch (error) {
      console.error("Failed to verify shop:", error);
      alert("Failed to update verification status");
    }
  };

  const handleFeature = async () => {
    if (!shop) return;
    try {
      await shopsService.setFeatureFlags(shop.slug, {
        isFeatured: !shop.isFeatured,
        showOnHomepage: shop.showOnHomepage,
      });
      await loadShopData();
    } catch (error) {
      console.error("Failed to feature shop:", error);
      alert("Failed to update feature status");
    }
  };

  const handleBan = async () => {
    if (!shop) return;
    try {
      await shopsService.ban(shop.slug, {
        isBanned: !shop.isBanned,
        banReason: !shop.isBanned ? banReason : undefined,
      });
      await loadShopData();
      setShowBanDialog(false);
      setBanReason("");
    } catch (error) {
      console.error("Failed to ban shop:", error);
      alert("Failed to update ban status");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await shopsService.delete(shop!.slug);
      router.push("/admin/shops");
    } catch (error) {
      console.error("Failed to delete shop:", error);
      alert("Failed to delete shop. It may have active products or orders.");
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error || "Shop not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              <div className="flex gap-2">
                {shop.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
                {shop.isBanned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    <Ban className="h-3 w-3" />
                    Banned
                  </span>
                )}
                {shop.isFeatured && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                    Featured
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Manage shop information and settings
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/shops/${shop.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            View Shop
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {shop.productCount}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {shop.rating.toFixed(1)}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {shop.reviewCount}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Followers</p>
              <p className="text-2xl font-bold text-gray-900">
                {shop.follower_count || 0}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleVerify}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              shop.isVerified
                ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            {shop.isVerified ? "Remove Verification" : "Verify Shop"}
          </button>
          <button
            onClick={handleFeature}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              shop.isFeatured
                ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                : "bg-yellow-600 text-white hover:bg-yellow-700"
            }`}
          >
            <Star className="h-4 w-4" />
            {shop.isFeatured ? "Remove Featured" : "Set Featured"}
          </button>
          <button
            onClick={() => setShowBanDialog(true)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              shop.isBanned
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            <Ban className="h-4 w-4" />
            {shop.isBanned ? "Unban Shop" : "Ban Shop"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "info"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Shop Information
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "products"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Products ({shop.productCount})
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "performance"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Performance
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shop Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <SlugInput
                      value={formData.slug}
                      sourceText={formData.name}
                      onChange={(slug) => setFormData({ ...formData, slug })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Tell customers about your shop..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="City, State"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={formData.address.line1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            line1: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.address.line2}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            line2: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              state: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={formData.address.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              pincode: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Social Links
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://example.com"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.facebook}
                      onChange={(e) =>
                        setFormData({ ...formData, facebook: e.target.value })
                      }
                      placeholder="https://facebook.com/..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      placeholder="https://instagram.com/..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={formData.twitter}
                      onChange={(e) =>
                        setFormData({ ...formData, twitter: e.target.value })
                      }
                      placeholder="https://twitter.com/..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Business Details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={formData.gst}
                      onChange={(e) =>
                        setFormData({ ...formData, gst: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={(e) =>
                        setFormData({ ...formData, pan: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Bank Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails.accountHolderName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: {
                            ...formData.bankDetails,
                            accountHolderName: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.accountNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankDetails: {
                              ...formData.bankDetails,
                              accountNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.ifscCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankDetails: {
                              ...formData.bankDetails,
                              ifscCode: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.bankName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankDetails: {
                              ...formData.bankDetails,
                              bankName: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.branchName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankDetails: {
                              ...formData.bankDetails,
                              branchName: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) =>
                        setFormData({ ...formData, upiId: e.target.value })
                      }
                      placeholder="example@upi"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Policies
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Policy
                    </label>
                    <textarea
                      rows={4}
                      value={formData.returnPolicy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          returnPolicy: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Describe your return policy..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Policy
                    </label>
                    <textarea
                      rows={4}
                      value={formData.shippingPolicy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shippingPolicy: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Describe your shipping policy..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Shop Logo */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Shop Logo
                </h2>
                {shop.logo && (
                  <div className="mb-4">
                    <img
                      src={shop.logo}
                      alt="Shop Logo"
                      className="w-full h-32 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <MediaUploader
                  onFilesAdded={handleLogoUpload}
                  accept="image"
                  maxFiles={1}
                  files={[]}
                />
              </div>

              {/* Shop Banner */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Shop Banner
                </h2>
                {shop.banner && (
                  <div className="mb-4">
                    <img
                      src={shop.banner}
                      alt="Shop Banner"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <MediaUploader
                  onFilesAdded={handleBannerUpload}
                  accept="image"
                  maxFiles={1}
                  files={[]}
                />
              </div>

              {/* Seller Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Seller Details
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Owner ID:</span>
                    <p className="font-medium truncate">{shop.ownerId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="font-medium">
                      {new Date(shop.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <p className="font-medium">
                      {new Date(shop.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || isUploadingLogo || isUploadingBanner}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "products" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Shop Products ({shop.productCount})
              </h2>
              <Link
                href={`/admin/products?shopId=${shop.id}`}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {shopProducts.length > 0 ? (
              shopProducts.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>₹{product.price.toLocaleString()}</span>
                        <span>Stock: {product.stockCount}</span>
                        <StatusBadge status={product.status} />
                      </div>
                    </div>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-lg p-2 text-purple-600 hover:bg-purple-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No products found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Metrics
            </h2>
            {shopStats ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{shopStats.totalRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shopStats.totalOrders || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{shopStats.averageOrderValue?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shopStats.conversionRate?.toFixed(2) || 0}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Performance metrics not available
              </p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <p className="text-sm text-gray-500">
              Activity logs coming soon...
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Shop"
        description="Are you sure you want to delete this shop? This action cannot be undone and will affect all shop products, orders, and data."
        onConfirm={handleDelete}
        onClose={() => setShowDeleteDialog(false)}
        variant="danger"
        confirmLabel="Delete Shop"
        loading={deleting}
      />

      {/* Ban Confirmation */}
      <ConfirmDialog
        isOpen={showBanDialog}
        title={shop.isBanned ? "Unban Shop" : "Ban Shop"}
        description={
          shop.isBanned
            ? "Are you sure you want to unban this shop? They will be able to sell products again."
            : "Are you sure you want to ban this shop? They will not be able to sell products."
        }
        onConfirm={handleBan}
        onClose={() => {
          setShowBanDialog(false);
          setBanReason("");
        }}
        variant={shop.isBanned ? "default" : "danger"}
        confirmLabel={shop.isBanned ? "Unban" : "Ban"}
      >
        {!shop.isBanned && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ban Reason (Optional)
            </label>
            <textarea
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Why is this shop being banned?"
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
