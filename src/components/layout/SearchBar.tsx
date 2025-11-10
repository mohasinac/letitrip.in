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
      null,
    );
    const [selectedCategoryName, setSelectedCategoryName] =
      useState<string>("All Categories");
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
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
      // Handle search logic here
      console.log(
        "Search:",
        searchQuery,
        "Category:",
        selectedCategoryId || "all",
      );
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch(e as any);
      }
    };

    const handleCategoryChange = (
      categoryId: string | null,
      category: Category | null,
    ) => {
      setSelectedCategoryId(categoryId);
      setSelectedCategoryName(category?.name || "All Categories");
    };

    // Don't render if not visible
    if (!isVisible) {
      return null;
    }

    return (
      <div
        id="search-bar"
        ref={searchBarRef}
        className="bg-yellow-50 py-6 px-4 border-b border-yellow-200"
      >
        <div className="container mx-auto">
          <form
            onSubmit={handleSearch}
            className="flex gap-0 max-w-full lg:max-w-6xl mx-auto"
          >
            {/* Merged Category Selector and Search Input */}
            <div className="flex-1 flex h-[50px] bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-500">
              {/* Category Selector */}
              <div className="flex-shrink-0 min-w-[70px] lg:min-w-[200px] border-r border-gray-300">
                {loadingCategories ? (
                  <div className="h-full px-3 lg:px-5 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Loading...</span>
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
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a brand name, item name or item URL for search..."
                  className="w-full h-full px-4 pr-32 border-0 focus:outline-none text-gray-900 font-medium placeholder:text-gray-500 placeholder:text-sm bg-transparent"
                />
                {/* Search Button Inside Input */}
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 flex items-center gap-2 font-bold"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="h-[50px] ml-2 text-gray-600 hover:text-gray-900 px-2 flex items-center justify-center transition-colors"
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
        </div>
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
