/**
 * UnifiedFilterSidebar with useUrlFilters Integration Example
 *
 * This example shows how to integrate UnifiedFilterSidebar with the useUrlFilters hook
 * for URL-based filtering with shareable links and browser history support.
 */

import { UnifiedFilterSidebar } from "@/components/common/UnifiedFilterSidebar";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useState } from "react";

export function FilteredListPageExample() {
  // Initialize useUrlFilters hook with initial values
  const { filters, updateFilter, resetFilters, activeFilterCount } =
    useUrlFilters({
      initialFilters: {
        category: "",
        status: "",
        priceRange: { min: "", max: "" },
        tags: [] as string[],
      },
      initialPage: 1,
      initialLimit: 20,
    });

  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Define filter sections configuration
  const filterSections = [
    {
      title: "Category",
      collapsible: false,
      fields: [
        {
          key: "category",
          label: "Category",
          type: "select" as const,
          options: [
            { value: "electronics", label: "Electronics", count: 120 },
            { value: "clothing", label: "Clothing", count: 85 },
            { value: "books", label: "Books", count: 65 },
          ],
        },
      ],
    },
    {
      title: "Status",
      collapsible: true,
      fields: [
        {
          key: "status",
          label: "Status",
          type: "checkbox" as const,
          options: [
            { value: "active", label: "Active", count: 150 },
            { value: "sold", label: "Sold", count: 45 },
            { value: "pending", label: "Pending", count: 20 },
          ],
        },
      ],
    },
    {
      title: "Price Range",
      collapsible: true,
      fields: [
        {
          key: "priceRange",
          label: "Price Range",
          type: "range" as const,
          min: 0,
          max: 10000,
          step: 100,
        },
      ],
    },
  ];

  /**
   * Method 1: Direct Integration (Recommended)
   * Pass filter values directly and call updateFilter on changes
   */
  return (
    <div className="flex">
      <UnifiedFilterSidebar
        sections={filterSections}
        // Use filters from URL
        values={filters}
        // Update URL when filter changes
        onChange={(key, value) => updateFilter(key, value)}
        // onApply is called when "Apply Filters" button is clicked
        // In URL mode, filters are already in URL, so just trigger data refetch
        onApply={() => {
          setIsLoading(true);
          // Refetch data with new filters from URL
          // fetchData(filters).finally(() => setIsLoading(false));
        }}
        // Reset both local state and URL
        onReset={resetFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        resultCount={0}
        isLoading={isLoading}
      />

      {/* Your list content here */}
      <div className="flex-1">
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Active filters: {activeFilterCount}
        </div>
        {/* List items */}
      </div>
    </div>
  );
}

/**
 * Method 2: With Pending Changes (Optional)
 * Use local state for pending changes, apply to URL only when button clicked
 */
export function FilteredListWithPendingChangesExample() {
  const { filters, updateFilter, resetFilters, setMultipleFilters } =
    useUrlFilters({
      initialFilters: {
        category: "",
        status: "",
      },
    });

  const [pendingFilters, setPendingFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filterSections = [
    /* ... */
  ] as any[];

  return (
    <div className="flex">
      <UnifiedFilterSidebar
        sections={filterSections}
        // Show pending changes, not yet in URL
        values={pendingFilters}
        // Update pending state
        onChange={(key, value) => {
          setPendingFilters((prev) => ({ ...prev, [key]: value }));
        }}
        // Apply all pending changes to URL at once
        onApply={(pending) => {
          if (pending) {
            // Batch update URL params
            setMultipleFilters(pending);
          }
          setIsLoading(true);
          // Refetch data
        }}
        // Reset both pending and URL
        onReset={() => {
          setPendingFilters({});
          resetFilters();
        }}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        isLoading={isLoading}
      />
    </div>
  );
}

/**
 * Method 3: Mobile Responsive with Filter Toggle
 */
export function MobileResponsiveFilterExample() {
  const { filters, updateFilter, resetFilters } = useUrlFilters({
    initialFilters: { category: "", status: "" },
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const filterSections = [
    /* ... */
  ] as any[];

  return (
    <div className="relative">
      {/* Mobile filter button */}
      {isMobile && (
        <button
          onClick={() => setShowFilters(true)}
          className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Show Filters
        </button>
      )}

      <div className="flex">
        <UnifiedFilterSidebar
          sections={filterSections}
          values={filters}
          onChange={(key, value) => updateFilter(key, value)}
          onApply={() => {
            /* refetch data */
          }}
          onReset={resetFilters}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          // Enable mobile mode for overlay behavior
          mobile={isMobile}
          searchable={true}
        />

        {/* List content */}
        <div className="flex-1">{/* ... */}</div>
      </div>
    </div>
  );
}

/**
 * Key Features of useUrlFilters Integration:
 *
 * 1. **Shareable URLs**: Filters are in URL, users can share/bookmark
 * 2. **Browser History**: Back/forward buttons work with filter changes
 * 3. **Deep Linking**: Can link directly to filtered views
 * 4. **State Persistence**: Filters persist across page refreshes
 * 5. **Debounced Updates**: URL updates are debounced to avoid excessive history entries
 * 6. **Active Filter Count**: Easy to show "X filters active" badge
 *
 * Best Practices:
 * - Use Method 1 for immediate filter application (better UX)
 * - Use Method 2 when you want batch filter application (API optimization)
 * - Always call resetFilters to clear both local and URL state
 * - Use activeFilterCount to show filter status in UI
 */
