"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Star,
  StarOff,
  GripVertical,
  Save,
  RefreshCw,
  Package,
  Gavel,
  Store,
  Grid3X3,
  Loader2,
  AlertCircle,
  Eye,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { AdminPageHeader, LoadingSpinner, toast } from "@/components/admin";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";
import {
  homepageSettingsService,
  FeaturedItem,
} from "@/services/homepage-settings.service";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Section configuration interface
interface SectionConfig {
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  maxItems: number;
}

// Section configurations
const SECTIONS: SectionConfig[] = [
  {
    key: "products",
    title: "Featured Products",
    icon: <Package className="h-5 w-5" />,
    description: "Products showcased on the homepage",
    maxItems: 20,
  },
  {
    key: "auctions",
    title: "Featured Auctions",
    icon: <Gavel className="h-5 w-5" />,
    description: "Highlighted live and upcoming auctions",
    maxItems: 20,
  },
  {
    key: "shops",
    title: "Featured Shops",
    icon: <Store className="h-5 w-5" />,
    description: "Top shops displayed on homepage",
    maxItems: 10,
  },
  {
    key: "categories",
    title: "Featured Categories",
    icon: <Grid3X3 className="h-5 w-5" />,
    description: "Categories with promotional visibility",
    maxItems: 10,
  },
];

// Sortable Item Component
function SortableItem({
  item,
  onToggle,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  item: FeaturedItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "auction":
        return <Gavel className="h-4 w-4 text-purple-500" />;
      case "shop":
        return <Store className="h-4 w-4 text-green-500" />;
      case "category":
        return <Grid3X3 className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getViewLink = (type: string, itemId: string) => {
    switch (type) {
      case "product":
        return `/products/${itemId}`;
      case "auction":
        return `/auctions/${itemId}`;
      case "shop":
        return `/shops/${itemId}`;
      case "category":
        return `/categories/${itemId}`;
      default:
        return "#";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white rounded-lg border ${
        item.active
          ? "border-gray-200"
          : "border-gray-200 bg-gray-50 opacity-60"
      } hover:shadow-sm transition-shadow`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </button>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative">
        {item.image ? (
          <OptimizedImage
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getTypeIcon(item.type)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {getTypeIcon(item.type)}
          <span className="font-medium text-gray-900 truncate">
            {item.name}
          </span>
        </div>
        <p className="text-xs text-gray-500 capitalize">{item.type}</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onMoveUp(item.id)}
          disabled={isFirst}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <MoveUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMoveDown(item.id)}
          disabled={isLast}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <MoveDown className="h-4 w-4" />
        </button>
        <Link
          href={getViewLink(item.type, item.itemId)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <button
          onClick={() => onToggle(item.id)}
          className={`p-1.5 rounded ${
            item.active
              ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
              : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
          }`}
          title={item.active ? "Unfeature" : "Feature"}
        >
          {item.active ? (
            <Star className="h-4 w-4 fill-current" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Add Item Modal
function AddItemModal({
  isOpen,
  onClose,
  section,
  existingIds,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  section: SectionConfig | null;
  existingIds: string[];
  onAdd: (item: {
    type: string;
    itemId: string;
    name: string;
    image?: string;
  }) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const typeFromSection = (sectionKey: string): string => {
    switch (sectionKey) {
      case "products":
        return "product";
      case "auctions":
        return "auction";
      case "shops":
        return "shop";
      case "categories":
        return "category";
      default:
        return "product";
    }
  };

  const searchItems = async () => {
    if (!section || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const type = typeFromSection(section.key);
      let endpoint = "";

      switch (type) {
        case "product":
          endpoint = `/products?search=${encodeURIComponent(
            searchQuery
          )}&limit=20`;
          break;
        case "auction":
          endpoint = `/auctions?search=${encodeURIComponent(
            searchQuery
          )}&limit=20`;
          break;
        case "shop":
          endpoint = `/shops?search=${encodeURIComponent(
            searchQuery
          )}&limit=20`;
          break;
        case "category":
          endpoint = `/categories?search=${encodeURIComponent(
            searchQuery
          )}&limit=20`;
          break;
      }

      const response = await apiService.get<{ data: any[] }>(endpoint);
      // Filter out already featured items
      const filtered = (response.data || []).filter(
        (item: any) => !existingIds.includes(item.id || item.slug)
      );
      setResults(filtered);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to search items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && searchQuery.trim()) {
      const debounce = setTimeout(searchItems, 300);
      return () => clearTimeout(debounce);
    }
    return undefined;
  }, [searchQuery, section, isOpen]);

  if (!isOpen || !section) return null;

  const type = typeFromSection(section.key);

  const getItemName = (item: any): string => {
    return item.name || item.title || item.shopName || "Unnamed";
  };

  const getItemImage = (item: any): string | undefined => {
    if (item.images && item.images.length > 0) return item.images[0];
    if (item.image) return item.image;
    if (item.logo) return item.logo;
    return undefined;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Add to {section.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Search and select items to feature
          </p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${type}s...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery.trim()
                ? `No ${type}s found`
                : `Type to search for ${type}s`}
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((item) => (
                <button
                  key={item.id || item.slug}
                  onClick={() => {
                    onAdd({
                      type,
                      itemId: item.id || item.slug,
                      name: getItemName(item),
                      image: getItemImage(item),
                    });
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative">
                    {getItemImage(item) ? (
                      <Image
                        src={getItemImage(item)!}
                        alt={getItemName(item)}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {section.icon}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {getItemName(item)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {item.id || item.slug}
                    </p>
                  </div>
                  <Plus className="h-5 w-5 text-blue-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedSectionsPage() {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("products");
  const [items, setItems] = useState<Record<string, FeaturedItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadFeaturedItems();
  }, []);

  const loadFeaturedItems = async () => {
    try {
      setLoading(true);
      // Load featured items from homepage settings service
      const featuredItems = await homepageSettingsService.getFeaturedItems();

      // Initialize with empty arrays for each section
      const initialized: Record<string, FeaturedItem[]> = {};
      SECTIONS.forEach((section) => {
        initialized[section.key] = featuredItems[section.key] || [];
      });

      setItems(initialized);
    } catch (error) {
      console.error("Failed to load featured items:", error);
      // Initialize with empty arrays on error
      const initialized: Record<string, FeaturedItem[]> = {};
      SECTIONS.forEach((section) => {
        initialized[section.key] = [];
      });
      setItems(initialized);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      // Use service to update featured items (handles cache invalidation)
      await homepageSettingsService.updateFeaturedItems(items);
      setHasChanges(false);
      toast.success("Featured sections saved successfully!");
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prev) => {
        const sectionItems = [...(prev[activeSection] || [])];
        const oldIndex = sectionItems.findIndex((i) => i.id === active.id);
        const newIndex = sectionItems.findIndex((i) => i.id === over.id);

        const reordered = arrayMove(sectionItems, oldIndex, newIndex).map(
          (item, index) => ({
            ...item,
            position: index,
          })
        );

        return {
          ...prev,
          [activeSection]: reordered,
        };
      });
      setHasChanges(true);
    }
  };

  const handleAddItem = (item: {
    type: string;
    itemId: string;
    name: string;
    image?: string;
  }) => {
    const sectionItems = items[activeSection] || [];
    const section = SECTIONS.find((s) => s.key === activeSection);

    if (section && sectionItems.length >= section.maxItems) {
      toast.error(`Maximum ${section.maxItems} items allowed in this section`);
      return;
    }

    const newItem: FeaturedItem = {
      id: `${item.type}-${item.itemId}-${Date.now()}`,
      type: item.type as FeaturedItem["type"],
      itemId: item.itemId,
      name: item.name,
      image: item.image,
      position: sectionItems.length,
      section: activeSection,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => ({
      ...prev,
      [activeSection]: [...(prev[activeSection] || []), newItem],
    }));
    setHasChanges(true);
    setAddModalOpen(false);
    toast.success(`Added ${item.name} to featured`);
  };

  const handleToggleItem = (id: string) => {
    setItems((prev) => ({
      ...prev,
      [activeSection]: (prev[activeSection] || []).map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
    }));
    setHasChanges(true);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => ({
      ...prev,
      [activeSection]: (prev[activeSection] || []).filter(
        (item) => item.id !== id
      ),
    }));
    setHasChanges(true);
    setDeleteId(null);
    toast.success("Item removed from featured");
  };

  const handleMoveUp = (id: string) => {
    const sectionItems = items[activeSection] || [];
    const index = sectionItems.findIndex((i) => i.id === id);
    if (index > 0) {
      const reordered = arrayMove(sectionItems, index, index - 1).map(
        (item, idx) => ({
          ...item,
          position: idx,
        })
      );
      setItems((prev) => ({
        ...prev,
        [activeSection]: reordered,
      }));
      setHasChanges(true);
    }
  };

  const handleMoveDown = (id: string) => {
    const sectionItems = items[activeSection] || [];
    const index = sectionItems.findIndex((i) => i.id === id);
    if (index < sectionItems.length - 1) {
      const reordered = arrayMove(sectionItems, index, index + 1).map(
        (item, idx) => ({
          ...item,
          position: idx,
        })
      );
      setItems((prev) => ({
        ...prev,
        [activeSection]: reordered,
      }));
      setHasChanges(true);
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
    return <LoadingSpinner fullScreen message="Loading featured sections..." />;
  }

  const currentSection = SECTIONS.find((s) => s.key === activeSection);
  const sectionItems = items[activeSection] || [];
  const existingIds = sectionItems.map((item) => item.itemId);

  return (
    <>
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) handleRemoveItem(deleteId);
        }}
        title="Remove Featured Item"
        description="Are you sure you want to remove this item from featured sections?"
        variant="danger"
      />

      <AddItemModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        section={currentSection || null}
        existingIds={existingIds}
        onAdd={handleAddItem}
      />

      <div className="space-y-6">
        <AdminPageHeader
          title="Featured Sections"
          description="Manage featured items displayed on the homepage"
          actions={
            <>
              <button
                onClick={loadFeaturedItems}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={saveChanges}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          }
        />

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              You have unsaved changes. Click "Save Changes" to apply them.
            </p>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SECTIONS.map((section) => {
            const count = (items[section.key] || []).filter(
              (i) => i.active
            ).length;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeSection === section.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {section.icon}
                <span>{section.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeSection === section.key
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Section Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentSection?.title}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {currentSection?.description} •{" "}
                {sectionItems.filter((i) => i.active).length} of{" "}
                {currentSection?.maxItems} max items
              </p>
            </div>
            <button
              onClick={() => setAddModalOpen(true)}
              disabled={sectionItems.length >= (currentSection?.maxItems || 20)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          {/* Items List */}
          <div className="p-4">
            {sectionItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                  {currentSection?.icon}
                </div>
                <p className="font-medium text-gray-900">
                  No featured items yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Add items to feature them on the homepage
                </p>
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add First Item
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sectionItems.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {sectionItems.map((item, index) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        onToggle={handleToggleItem}
                        onRemove={(id) => setDeleteId(id)}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        isFirst={index === 0}
                        isLast={index === sectionItems.length - 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Quick Link to Homepage Settings */}
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Configure Section Display
            </p>
            <p className="text-sm text-gray-500">
              Adjust section visibility and limits in Homepage Settings
            </p>
          </div>
          <Link
            href="/admin/homepage"
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Homepage Settings →
          </Link>
        </div>
      </div>
    </>
  );
}
