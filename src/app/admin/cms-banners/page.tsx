"use client";

import { AdminNav } from "@/components/admin/AdminNav";
import { useEffect, useState } from "react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  active: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export default function BannersManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    active: true,
    order: 0,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cms/banners", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }

      const data = await response.json();
      setBanners(data.banners);
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError(err instanceof Error ? err.message : "Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/cms/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create banner");
      }

      setShowCreateModal(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create banner");
    }
  };

  const handleUpdate = async () => {
    if (!editingBanner) return;

    try {
      const response = await fetch(
        `/api/admin/cms/banners/${editingBanner.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update banner");
      }

      setEditingBanner(null);
      resetForm();
      fetchBanners();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const response = await fetch(`/api/admin/cms/banners/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete banner");
      }

      fetchBanners();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete banner");
    }
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      link: banner.link || "",
      active: banner.active,
      order: banner.order,
      startDate: banner.startDate || "",
      endDate: banner.endDate || "",
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      link: "",
      active: true,
      order: 0,
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            System Management
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <AdminNav />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Promotional Banners
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage homepage and promotional banners
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Create Banner
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Banners List */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 gap-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Banner Preview */}
                    <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Banner Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {banner.title}
                          </h3>
                          {banner.subtitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {banner.subtitle}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            banner.active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {banner.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Order:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {banner.order}
                          </span>
                        </div>
                        {banner.link && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Link:
                            </span>
                            <span className="ml-2 text-blue-600 dark:text-blue-400 truncate block">
                              {banner.link}
                            </span>
                          </div>
                        )}
                        {banner.startDate && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Start:
                            </span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {new Date(banner.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {banner.endDate && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              End:
                            </span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {new Date(banner.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {banners.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No banners created yet. Create your first banner to get
                    started.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingBanner) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingBanner ? "Edit Banner" : "Create New Banner"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Summer Sale 2026"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="Up to 50% off on electronics"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL *
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link URL
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="/products/electronics"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingBanner ? handleUpdate : handleCreate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {editingBanner ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingBanner(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
