"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  uploadStaticAsset,
  getStaticAssetsByType,
  deleteStaticAsset,
  updateStaticAsset,
  StaticAsset,
} from "@/services/static-assets";
// Icons will be inline SVGs

const ASSET_TYPES = [
  { value: "payment-logo", label: "Payment Logos" },
  { value: "icon", label: "Icons" },
  { value: "image", label: "Images" },
  { value: "document", label: "Documents" },
] as const;

export default function StaticAssetsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [assets, setAssets] = useState<StaticAsset[]>([]);
  const [selectedType, setSelectedType] =
    useState<StaticAsset["type"]>("payment-logo");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingAsset, setEditingAsset] = useState<StaticAsset | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadAssets();
  }, [user, selectedType]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await getStaticAssetsByType(selectedType);
      setAssets(data);
    } catch (error) {
      console.error("Error loading assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    try {
      setUploading(true);

      for (const file of Array.from(files)) {
        await uploadStaticAsset({
          name: file.name,
          file,
          type: selectedType,
          category:
            selectedType === "payment-logo" ? "payment-methods" : "default",
          userId: user.uid,
        });
      }

      await loadAssets();
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset? This action cannot be undone.")) return;

    try {
      await deleteStaticAsset(id);
      await loadAssets();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Delete failed");
    }
  };

  const handleUpdate = async (id: string, updates: Partial<StaticAsset>) => {
    try {
      await updateStaticAsset(id, updates);
      await loadAssets();
      setEditingAsset(null);
    } catch (error) {
      console.error("Error updating:", error);
      alert("Update failed");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Static Assets Manager
          </h1>
          <p className="mt-2 text-gray-600">
            Upload and manage payment logos, icons, and other static files with
            Firebase Storage CDN
          </p>
        </div>

        {/* Type Filter & Upload */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {ASSET_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedType === type.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>{uploading ? "Uploading..." : "Upload Files"}</span>
              <input
                type="file"
                multiple
                accept={
                  selectedType === "payment-logo"
                    ? "image/svg+xml,image/png"
                    : "image/*"
                }
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No assets found</p>
            <p className="text-gray-400 mt-2">
              Upload your first {selectedType.replace("-", " ")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Preview */}
                <div className="aspect-video bg-gray-100 flex items-center justify-center p-4">
                  {asset.contentType.startsWith("image/") ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <DocumentIcon className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">{asset.contentType}</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  {editingAsset?.id === asset.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingAsset.name}
                        onChange={(e) =>
                          setEditingAsset({
                            ...editingAsset,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdate(asset.id, { name: editingAsset.name })
                          }
                          className="flex-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingAsset(null)}
                          className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3
                        className="font-medium text-gray-900 truncate"
                        title={asset.name}
                      >
                        {asset.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {(asset.size / 1024).toFixed(1)} KB
                      </p>
                      {asset.category && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {asset.category}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => copyUrl(asset.url)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => setEditingAsset(asset)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            📦 CDN-Backed Storage
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>
              • All files are uploaded to Firebase Storage with automatic CDN
              distribution
            </li>
            <li>• Fast global delivery with edge caching</li>
            <li>• Secure URLs with Firebase Authentication integration</li>
            <li>• Copy CDN URLs and use them anywhere in your application</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}
