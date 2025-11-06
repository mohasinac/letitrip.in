"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/constants/navigation";

export default function SearchBar() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Search:", searchQuery, "Category:", selectedCategory);
  };

  const selectedCategoryName =
    PRODUCT_CATEGORIES.find((cat) => cat.id === selectedCategory)?.name ||
    "All Categories";

  return (
    <div className="bg-yellow-50 py-4 px-4">
      <div className="container mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-4xl mx-auto">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="h-full bg-white border border-gray-300 rounded-l-lg px-4 py-3 flex items-center gap-2 whitespace-nowrap hover:bg-gray-50 min-w-[180px] justify-between"
            >
              <span className="text-sm font-semibold text-gray-900">{selectedCategoryName}</span>
              <ChevronDown className="w-4 h-4 text-gray-700" />
            </button>

            {/* Category Dropdown Menu */}
            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {PRODUCT_CATEGORIES.map((category) => (
                  <div key={category.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-yellow-50 ${
                        selectedCategory === category.id
                          ? "bg-yellow-100 font-bold text-gray-900"
                          : "font-medium text-gray-800"
                      }`}
                    >
                      {category.name}
                    </button>
                    {category.subcategories.length > 0 && (
                      <div className="pl-4 border-l-2 border-gray-200 ml-4">
                        {category.subcategories.map((sub, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setIsCategoryOpen(false);
                            }}
                            className="w-full text-left px-4 py-1 text-sm text-gray-700 hover:bg-yellow-50 font-medium hover:text-gray-900"
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

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter a brand name, item name or item URL for search..."
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 font-medium placeholder:text-gray-500"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-3 rounded-r-lg flex items-center gap-2 font-bold"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Search Assistance Links */}
        <div className="flex items-center justify-center gap-4 mt-3 text-sm">
          <button className="flex items-center gap-1 text-gray-700 hover:text-yellow-700 font-medium">
            <span>📸</span>
            <span className="hidden sm:inline">Search assistant</span>
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-yellow-700 font-medium">
            <span>🔖</span>
            <span className="hidden sm:inline">Brand library</span>
          </button>
        </div>
      </div>
    </div>
  );
}
