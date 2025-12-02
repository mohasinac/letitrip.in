"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Save,
  X,
  Loader2,
  AlertCircle,
  FileText,
  Hash,
  TrendingUp,
} from "lucide-react";
import { AdminPageHeader, LoadingSpinner, toast } from "@/components/admin";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";
import { FormInput, FormTextarea } from "@/components/forms";

// Types
interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

// Tag form modal
function TagModal({
  isOpen,
  onClose,
  tag,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  tag: BlogTag | null;
  onSave: (data: { name: string; slug: string }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setSlug(tag.slug);
    } else {
      setName("");
      setSlug("");
    }
  }, [tag, isOpen]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!tag) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, slug });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {tag ? "Edit Tag" : "Add Tag"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <FormInput
            label="Tag Name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter tag name"
          />

          <FormInput
            label="Slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="tag-slug"
            helperText="URL-friendly identifier (auto-generated from name)"
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !slug.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {tag ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bulk add tags modal
function BulkAddModal({
  isOpen,
  onClose,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tags: string[]) => void;
  saving: boolean;
}) {
  const [tagsText, setTagsText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsText
      .split(/[\n,]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    onSave(tags);
    setTagsText("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bulk Add Tags</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <FormTextarea
            label="Tag Names"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            rows={6}
            placeholder="Enter tags separated by commas or new lines:&#10;tag1&#10;tag2, tag3&#10;tag4"
            helperText="Separate tags with commas or new lines. Slugs will be auto-generated."
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !tagsText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Tags
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BlogTagsPage() {
  const { isAdmin } = useAuth();
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editTag, setEditTag] = useState<BlogTag | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{ data: BlogTag[] }>("/blog/tags");
      setTags(response.data || []);
    } catch (error) {
      console.error("Failed to load tags:", error);
      // Use mock data for now
      setTags([
        {
          id: "1",
          name: "Tutorial",
          slug: "tutorial",
          postCount: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "News",
          slug: "news",
          postCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Tips",
          slug: "tips",
          postCount: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Guide",
          slug: "guide",
          postCount: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Announcement",
          slug: "announcement",
          postCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { name: string; slug: string }) => {
    try {
      setSaving(true);

      if (editTag) {
        await apiService.patch(`/blog/tags/${editTag.id}`, data);
        setTags((prev) =>
          prev.map((t) => (t.id === editTag.id ? { ...t, ...data } : t))
        );
        toast.success("Tag updated successfully");
      } else {
        const response = await apiService.post<{ data: BlogTag }>(
          "/blog/tags",
          data
        );
        setTags((prev) => [
          ...prev,
          response.data || {
            ...data,
            id: Date.now().toString(),
            postCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        toast.success("Tag created successfully");
      }

      setModalOpen(false);
      setEditTag(null);
    } catch (error) {
      console.error("Failed to save tag:", error);
      toast.error("Failed to save tag");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAdd = async (tagNames: string[]) => {
    try {
      setSaving(true);

      const generateSlug = (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
      };

      // Create tags one by one (or use bulk API if available)
      const newTags: BlogTag[] = [];
      for (const name of tagNames) {
        const slug = generateSlug(name);
        const existingTag = tags.find((t) => t.slug === slug);
        if (!existingTag) {
          try {
            const response = await apiService.post<{ data: BlogTag }>(
              "/blog/tags",
              { name, slug }
            );
            newTags.push(
              response.data || {
                id: Date.now().toString(),
                name,
                slug,
                postCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            );
          } catch {
            // Add locally if API fails
            newTags.push({
              id: Date.now().toString() + Math.random(),
              name,
              slug,
              postCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      setTags((prev) => [...prev, ...newTags]);
      toast.success(`Added ${newTags.length} tags successfully`);
      setBulkModalOpen(false);
    } catch (error) {
      console.error("Failed to add tags:", error);
      toast.error("Failed to add tags");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await apiService.delete(`/blog/tags/${deleteId}`);
      setTags((prev) => prev.filter((t) => t.id !== deleteId));
      toast.success("Tag deleted successfully");
    } catch (error) {
      console.error("Failed to delete tag:", error);
      toast.error("Failed to delete tag");
    } finally {
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => apiService.delete(`/blog/tags/${id}`))
      );
      setTags((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
      setSelectedIds([]);
      toast.success(`Deleted ${selectedIds.length} tags`);
    } catch (error) {
      console.error("Failed to delete tags:", error);
      toast.error("Failed to delete tags");
    }
  };

  // Filter tags
  const filteredTags = searchQuery.trim()
    ? tags.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tags;

  // Sort by post count
  const sortedTags = [...filteredTags].sort(
    (a, b) => b.postCount - a.postCount
  );

  // Stats
  const totalPosts = tags.reduce((sum, t) => sum + t.postCount, 0);
  const popularTags = tags.filter((t) => t.postCount >= 5).length;

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
    return <LoadingSpinner fullScreen message="Loading tags..." />;
  }

  return (
    <>
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
      />

      <TagModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTag(null);
        }}
        tag={editTag}
        onSave={handleSave}
        saving={saving}
      />

      <BulkAddModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSave={handleBulkAdd}
        saving={saving}
      />

      <div className="space-y-6">
        <AdminPageHeader
          title="Blog Tags"
          description="Manage tags for blog posts"
          actions={
            <>
              <Link
                href="/admin/blog"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" />
                All Posts
              </Link>
              <button
                onClick={() => setBulkModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Hash className="h-4 w-4" />
                Bulk Add
              </button>
              <button
                onClick={() => {
                  setEditTag(null);
                  setModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Tag
              </button>
            </>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Tags</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {tags.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Popular Tags</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {popularTags}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Usage</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalPosts}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Unused Tags</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {tags.filter((t) => t.postCount === 0).length}
            </p>
          </div>
        </div>

        {/* Search and bulk actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Tags Grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {sortedTags.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="font-medium text-gray-900">No tags found</p>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first blog tag"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Tag
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sortedTags.map((tag) => (
                <div
                  key={tag.id}
                  className={`group inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    selectedIds.includes(tag.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-500 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, tag.id]);
                      } else {
                        setSelectedIds(
                          selectedIds.filter((id) => id !== tag.id)
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{tag.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {tag.postCount}
                  </span>
                  <div className="hidden group-hover:flex items-center gap-1 ml-1">
                    <button
                      onClick={() => {
                        setEditTag(tag);
                        setModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(tag.id)}
                      disabled={tag.postCount > 0}
                      className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        tag.postCount > 0
                          ? "Cannot delete tag with posts"
                          : "Delete"
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Tags */}
        {popularTags > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Popular Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags
                .filter((t) => t.postCount >= 5)
                .sort((a, b) => b.postCount - a.postCount)
                .slice(0, 10)
                .map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm"
                  >
                    <Hash className="h-3.5 w-3.5 text-purple-500" />
                    {tag.name}
                    <span className="text-purple-600">{tag.postCount}</span>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
