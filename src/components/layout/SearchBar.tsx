"use client";

import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Search } from "lucide-react";
import CategorySelector from "@/components/common/CategorySelector";
import type { Category } from "@/components/common/CategorySelector";
import { categoriesService } from "@/services/categories.service";
import {
  ContentTypeFilter,
  type ContentType,
  getContentTypePlaceholder,
} from "@/components/common/ContentTypeFilter";

export interface SearchBarRef {
  focusSearch: () => void;
  show: () => void;
  hide: () => void;
}

interface SearchBarProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(
  ({ isVisible = true, onClose }, ref) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
      null
    );
    const [selectedCategoryName, setSelectedCategoryName] =
      useState<string>("All Categories");
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [contentType, setContentType] = useState<ContentType>("all");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await categoriesService.list();
          // Transform to match CategorySelector's expected format
          const transformed = (
            Array.isArray(response) ? response : (response as any).data || []
          ).map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parent_id: cat.parentId || null,
            level: cat.level || 0,
            has_children: cat.hasChildren || cat.childCount > 0,
            is_active: cat.isActive !== false,
            product_count: cat.productCount,
          }));
          setCategories(transformed);
        } catch (error) {
          console.error("Failed to fetch categories:", error);
        } finally {
          setLoadingCategories(false);
        }
      };

      fetchCategories();
    }, []);

    useImperativeHandle(ref, () => ({
      focusSearch: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      },
      show: () => {
        searchInputRef.current?.focus();
      },
      hide: () => {
        setSearchQuery("");
      },
    }));

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      // Build search URL with query params
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }
      if (selectedCategoryId) {
        params.set("category", selectedCategoryId);
      }
      if (contentType !== "all") {
        params.set("type", contentType);
      }

      // Navigate to search results
      const searchUrl = `/search?${params.toString()}`;
      window.location.href = searchUrl;
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch(e as any);
      }
    };

    const handleCategoryChange = (
      categoryId: string | null,
      category: Category | null
    ) => {
      setSelectedCategoryId(categoryId);
      setSelectedCategoryName(category?.name || "All Categories");
    };

    const handleContentTypeChange = (type: ContentType) => {
      setContentType(type);
    };

    // Don't render if not visible
    if (!isVisible) {
      return null;
    }

    // Get dynamic placeholder based on content type
    const placeholder = getContentTypePlaceholder(contentType);

    return (
      <div
        id="search-bar"
        ref={searchBarRef}
        className="bg-yellow-50 dark:bg-gray-800 py-4 sm:py-6 px-4 border-b border-yellow-200 dark:border-gray-700"
      >
        <div className="container mx-auto max-w-full lg:max-w-6xl">
          <form onSubmit={handleSearch} className="flex gap-0">
            {/* Merged Category Selector and Search Input */}
            <div className="flex-1 flex h-[50px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-500">
              {/* Category Selector */}
              <div className="flex-shrink-0 min-w-[70px] lg:min-w-[200px] border-r border-gray-300 dark:border-gray-600">
                {loadingCategories ? (
                  <div className="h-full px-3 lg:px-5 flex items-center justify-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <CategorySelector
                    categories={categories}
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    placeholder="All Categories"
                    allowParentSelection={true}
                    className="h-full"
                  />
                )}
              </div>

              {/* Search Input with Button */}
              <div className="flex-1 relative flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="w-full h-full px-4 pr-24 md:pr-40 lg:pr-44 border-0 focus:outline-none text-gray-900 dark:text-white font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:text-sm bg-transparent"
                />

                {/* Content Type Filter (Desktop - Dropdown) */}
                <div className="hidden md:block absolute right-[100px] lg:right-[120px]">
                  <ContentTypeFilter
                    value={contentType}
                    onChange={handleContentTypeChange}
                    variant="dropdown"
                    size="sm"
                  />
                </div>

                {/* Search Button Inside Input */}
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 lg:px-6 flex items-center gap-2 font-bold"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden lg:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="h-[50px] ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 flex items-center justify-center transition-colors"
                aria-label="Close search"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </form>

          {/* Mobile Content Type Filter (Chips) */}
          <div className="md:hidden mt-3 overflow-x-auto -mx-4 px-4">
            <ContentTypeFilter
              value={contentType}
              onChange={handleContentTypeChange}
              variant="chips"
              size="sm"
            />
          </div>
        </div>
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
