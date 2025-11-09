"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import MediaUploader from "@/components/media/MediaUploader";
import { apiService } from "@/services/api.service";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import RichTextEditor from "@/components/common/RichTextEditor";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link_url: string;
  cta_text: string;
  is_active: boolean;
}

export default function EditHeroSlidePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<HeroSlide | null>(null);

  useEffect(() => {
    loadSlide();
  }, [params.id]);

  const loadSlide = async () => {
    try {
      setLoading(true);
      const data = (await apiService.get(
        `/api/admin/hero-slides/${params.id}`
      )) as HeroSlide;
      setFormData(data);
    } catch (error) {
      console.error("Failed to load slide:", error);
      alert("Failed to load slide");
      router.push("/admin/hero-slides");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !formData.title || !formData.image_url) {
      alert("Title and image are required");
      return;
    }

    try {
      setSaving(true);
      await apiService.patch(`/api/admin/hero-slides/${params.id}`, formData);
      router.push("/admin/hero-slides");
    } catch (error) {
      console.error("Failed to update slide:", error);
      alert("Failed to update slide");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.delete(`/api/admin/hero-slides/${params.id}`);
      router.push("/admin/hero-slides");
    } catch (error) {
      console.error("Failed to delete slide:", error);
      alert("Failed to delete slide");
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Hero Slide
            </h1>
            <p className="text-gray-600 mt-1">Update hero carousel slide</p>
          </div>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            Delete Slide
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Main headline text"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle (Rich Text)
            </label>
            <RichTextEditor
              value={formData.subtitle}
              onChange={(value: string) =>
                setFormData({ ...formData, subtitle: value })
              }
              placeholder="Secondary text with formatting..."
              minHeight={120}
              tools={["bold", "italic", "underline", "link", "clear"]}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Rich Text)
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value: string) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Additional details with formatting..."
              minHeight={150}
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image <span className="text-red-500">*</span>
            </label>
            {formData.image_url && (
              <div className="mb-4">
                <img
                  src={formData.image_url}
                  alt="Current hero slide"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <MediaUploader
              accept="image"
              maxFiles={1}
              resourceType="shop"
              onFilesAdded={(files: any[]) => {
                if (files.length > 0) {
                  setFormData({
                    ...formData,
                    image_url: files[0].url || files[0].previewUrl,
                  });
                }
              }}
            />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link URL
            </label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) =>
                setFormData({ ...formData, link_url: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Where users go when they click the slide
            </p>
          </div>

          {/* CTA Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call-to-Action Text
            </label>
            <input
              type="text"
              value={formData.cta_text}
              onChange={(e) =>
                setFormData({ ...formData, cta_text: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Shop Now"
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Active (show on homepage)
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t">
          <button
            type="submit"
            disabled={saving || !formData.title || !formData.image_url}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Delete Confirmation */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Hero Slide"
          description={`Are you sure you want to delete "${formData.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
