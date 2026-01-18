"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type {
  FilterSection,
  StorageAdapter,
} from "../../src/components/search/CollapsibleFilter";
import { CollapsibleFilter } from "../../src/components/search/CollapsibleFilter";

const meta: Meta<typeof CollapsibleFilter> = {
  title: "Components/Search/CollapsibleFilter",
  component: CollapsibleFilter,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Collapsible filter sidebar with expandable sections, search functionality, and optional state persistence.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CollapsibleFilter>;

const categorySections: FilterSection[] = [
  {
    id: "category",
    title: "Category",
    type: "checkbox",
    searchable: true,
    options: [
      { label: "Electronics", value: "electronics", count: 150 },
      { label: "Fashion", value: "fashion", count: 200 },
      { label: "Home & Garden", value: "home", count: 89 },
      { label: "Sports & Outdoors", value: "sports", count: 67 },
      { label: "Books", value: "books", count: 45 },
      { label: "Toys & Games", value: "toys", count: 34 },
      { label: "Automotive", value: "automotive", count: 28 },
      { label: "Health & Beauty", value: "health", count: 56 },
    ],
  },
];

const priceSections: FilterSection[] = [
  {
    id: "price",
    title: "Price Range",
    type: "radio",
    options: [
      { label: "Under $25", value: "0-25", count: 120 },
      { label: "$25 - $50", value: "25-50", count: 95 },
      { label: "$50 - $100", value: "50-100", count: 78 },
      { label: "$100 - $200", value: "100-200", count: 45 },
      { label: "Over $200", value: "200+", count: 23 },
    ],
  },
];

const brandSections: FilterSection[] = [
  {
    id: "brand",
    title: "Brand",
    type: "checkbox",
    searchable: true,
    options: [
      { label: "Samsung", value: "samsung", count: 45 },
      { label: "Apple", value: "apple", count: 67 },
      { label: "Sony", value: "sony", count: 34 },
      { label: "LG", value: "lg", count: 28 },
      { label: "Dell", value: "dell", count: 23 },
      { label: "HP", value: "hp", count: 19 },
    ],
  },
];

const ratingSections: FilterSection[] = [
  {
    id: "rating",
    title: "Customer Rating",
    type: "radio",
    options: [
      { label: "4★ and above", value: "4+", count: 234 },
      { label: "3★ and above", value: "3+", count: 356 },
      { label: "2★ and above", value: "2+", count: 412 },
      { label: "1★ and above", value: "1+", count: 445 },
    ],
  },
];

const allSections: FilterSection[] = [
  ...categorySections,
  ...priceSections,
  ...brandSections,
  ...ratingSections,
];

// Mock storage adapter for demo
const createMockStorage = (): StorageAdapter => {
  const storage = new Map<string, string>();
  return {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, value: string) => storage.set(key, value),
  };
};

export const Default: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={categorySections}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>
    );
  },
};

export const MultiSections: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={allSections}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>
    );
  },
};

export const WithActiveFilters: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
      category: ["electronics", "fashion"],
      price: "50-100",
      brand: ["apple", "samsung"],
    });
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={allSections}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={categorySections}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          searchThreshold={5}
        />
      </div>
    );
  },
};

export const WithoutSearch: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={categorySections}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          searchThreshold={100} // High threshold to disable search
        />
      </div>
    );
  },
};

export const WithoutCounts: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
      category: ["electronics"],
    });
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={allSections}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          showCounts={false}
        />
      </div>
    );
  },
};

export const ExpandedByDefault: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const expandedSections = allSections.map((section) => ({
      ...section,
      defaultExpanded: true,
    }));
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={expandedSections}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>
    );
  },
};

export const CollapsedByDefault: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const collapsedSections = allSections.map((section) => ({
      ...section,
      defaultExpanded: false,
    }));
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={collapsedSections}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>
    );
  },
};

export const WithStorage: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [storage] = useState(() => createMockStorage());
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={allSections}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          storage={storage}
          storageKey="demo-filter-state"
        />
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Expand/collapse state is persisted in mock storage. Try
            collapsing sections and they'll stay collapsed on re-render.
          </p>
        </div>
      </div>
    );
  },
};

export const RadioType: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={[...priceSections, ...ratingSections]}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>
    );
  },
};

export const CheckboxType: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    return (
      <div className="max-w-sm">
        <CollapsibleFilter
          sections={[...categorySections, ...brandSections]}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
      category: ["electronics"],
      brand: ["apple", "samsung"],
    });
    return (
      <div className="dark min-h-screen bg-gray-900 p-8">
        <div className="max-w-sm">
          <CollapsibleFilter
            sections={allSections}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
        </div>
      </div>
    );
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [storage] = useState(() => createMockStorage());

    // Calculate mock result count
    const calculateResults = () => {
      let count = 445; // Base count
      if (activeFilters.category?.length > 0)
        count = Math.floor(count * (0.3 * activeFilters.category.length));
      if (activeFilters.price) count = Math.floor(count * 0.4);
      if (activeFilters.brand?.length > 0)
        count = Math.floor(count * (0.2 * activeFilters.brand.length));
      if (activeFilters.rating) count = Math.floor(count * 0.6);
      return Math.max(count, 0);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CollapsibleFilter
            sections={allSections}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
            storage={storage}
            storageKey="interactive-demo"
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results
              </h3>
              <span className="text-sm text-gray-600">
                {calculateResults()} products found
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: Math.min(calculateResults(), 8) }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gray-100 rounded-lg h-32 mb-3"></div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Product {i + 1}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ${(Math.random() * 200).toFixed(2)}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Active Filters State:
            </h4>
            <pre className="text-xs bg-white p-4 rounded-lg overflow-auto border border-gray-200">
              {JSON.stringify(activeFilters, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  },
};

