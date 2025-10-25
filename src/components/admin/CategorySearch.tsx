import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Package, ChevronRight } from 'lucide-react';
import { Category } from '@/types';
import { CategoryService } from '@/lib/services/category.service';

interface CategorySearchProps {
  onSelect?: (category: Category) => void;
  leafOnly?: boolean;
  placeholder?: string;
  showProductCounts?: boolean;
  className?: string;
  value?: Category | null;
  disabled?: boolean;
}

interface SearchResult extends Category {
  fullPath: string;
  isLeaf: boolean;
  matchType: 'exact' | 'prefix' | 'partial';
  productCount?: number;
  inStockCount?: number;
}

export default function CategorySearch({
  onSelect,
  leafOnly = false,
  placeholder = "Search categories...",
  showProductCounts = false,
  className = "",
  value,
  disabled = false
}: CategorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await CategoryService.searchCategories(searchQuery, {
          limit: 20,
          leafOnly,
          withProductCounts: showProductCounts,
          includeInactive: false
        });

        if (result.success && result.data) {
          setSearchResults(result.data.categories as SearchResult[]);
          setIsOpen(true);
          setSelectedIndex(-1);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching categories:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, leafOnly, showProductCounts]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (category: SearchResult) => {
    setSearchQuery(category.fullPath);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(category);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const displayValue = useMemo(() => {
    if (value) {
      return value.name;
    }
    return searchQuery;
  }, [value, searchQuery]);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          value={displayValue}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchResults.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {searchResults.map((category, index) => (
            <div
              key={category.id}
              onClick={() => handleSelect(category)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Category Path */}
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    {category.fullPath.split(' > ').map((part, idx, arr) => (
                      <React.Fragment key={idx}>
                        <span className={idx === arr.length - 1 ? 'font-medium text-gray-900' : ''}>
                          {highlightMatch(part, searchQuery)}
                        </span>
                        {idx < arr.length - 1 && (
                          <ChevronRight className="mx-1 h-3 w-3 text-gray-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Category Description */}
                  {category.description && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {highlightMatch(category.description, searchQuery)}
                    </div>
                  )}

                  {/* Category Info */}
                  <div className="flex items-center gap-2 mt-2">
                    {/* Leaf/Parent Badge */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      category.isLeaf 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {category.isLeaf ? '🍃 Leaf' : '📁 Parent'}
                    </span>

                    {/* Match Type */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      category.matchType === 'exact' ? 'bg-green-100 text-green-800' :
                      category.matchType === 'prefix' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {category.matchType === 'exact' ? 'Exact' :
                       category.matchType === 'prefix' ? 'Starts with' : 'Contains'}
                    </span>

                    {/* Featured Badge */}
                    {category.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Counts */}
                {showProductCounts && (
                  <div className="ml-3 flex flex-col items-end">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-1" />
                      <span className="font-medium">{category.productCount || 0}</span>
                    </div>
                    {category.inStockCount !== undefined && (
                      <div className="text-xs text-green-600">
                        {category.inStockCount} in stock
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && searchQuery.length >= 2 && searchResults.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-center text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <div className="font-medium">No categories found</div>
            <div className="text-sm">
              Try a different search term or{' '}
              {leafOnly ? 'broaden your search to include parent categories' : 'check your spelling'}
            </div>
          </div>
        </div>
      )}

      {/* Search Help */}
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500">
            Type at least 2 characters to search...
          </div>
        </div>
      )}
    </div>
  );
}

// Example usage components
export function LeafCategorySelector({ onSelect, value, className }: {
  onSelect: (category: Category) => void;
  value?: Category | null;
  className?: string;
}) {
  return (
    <CategorySearch
      onSelect={onSelect}
      value={value}
      leafOnly={true}
      placeholder="Search for product categories..."
      showProductCounts={true}
      className={className}
    />
  );
}

export function CategorySelector({ onSelect, value, className }: {
  onSelect: (category: Category) => void;
  value?: Category | null;
  className?: string;
}) {
  return (
    <CategorySearch
      onSelect={onSelect}
      value={value}
      leafOnly={false}
      placeholder="Search all categories..."
      showProductCounts={true}
      className={className}
    />
  );
}
