"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Search, ChevronDown } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/constants/navigation";

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
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);

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
        setIsCategoryOpen(false);
      },
    }));

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle search logic here
      console.log("Search:", searchQuery, "Category:", selectedCategory);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch(e as any);
      }
    };

    const selectedCategoryName =
      PRODUCT_CATEGORIES.find((cat) => cat.id === selectedCategory)?.name ||
      "All Categories";

    const displayCategoryName =
      selectedCategory === "all" ? "All" : selectedCategoryName;

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
            className="flex gap-2 max-w-full lg:max-w-6xl mx-auto"
          >
            {/* Category Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="h-full bg-white border border-gray-300 rounded-l-lg px-3 lg:px-5 py-3 flex items-center gap-1 lg:gap-2 whitespace-nowrap hover:bg-gray-50 min-w-[70px] lg:min-w-[200px] justify-between"
              >
                <span className="text-sm font-semibold text-gray-900 truncate">
                  <span className="lg:hidden">{displayCategoryName}</span>
                  <span className="hidden lg:inline">
                    {selectedCategoryName}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700 flex-shrink-0" />
              </button>

              {/* Category Dropdown Menu */}
              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <div key={category.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-yellow-50 flex items-center justify-between ${
                          selectedCategory === category.id
                            ? "bg-yellow-100 font-bold text-gray-900"
                            : "font-medium text-gray-800"
                        }`}
                      >
                        <span>{category.name}</span>
                        {category.subcategories.length > 0 && (
                          <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                        )}
                      </button>

                      {/* Subcategories - Show on hover to the right */}
                      {category.subcategories.length > 0 && (
                        <div className="hidden group-hover:block absolute left-full top-0 ml-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-[60]">
                          {category.subcategories.map((sub, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(category.id);
                                setIsCategoryOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 font-medium hover:text-gray-900"
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 font-medium placeholder:text-gray-500 placeholder:text-sm"
              />
              {/* Search Button Inside Input */}
              <button
                type="submit"
                className="absolute right-0 top-0 h-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 rounded-r-lg flex items-center gap-2 font-bold"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 px-2 flex items-center justify-center transition-colors"
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
  }
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
