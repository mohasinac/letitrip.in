import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  UnifiedFilterSidebar,
  type FilterSidebarSection,
} from "../../src/components/filters/UnifiedFilterSidebar";

const meta: Meta<typeof UnifiedFilterSidebar> = {
  title: "Components/Filters/UnifiedFilterSidebar",
  component: UnifiedFilterSidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Advanced unified filter sidebar with pending state, localStorage persistence, filter search, expand/collapse all, and mobile/desktop variants. Supports 9 field types: text, number, select, multiselect, checkbox, radio, date, daterange, range, and price range.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof UnifiedFilterSidebar>;

// Product filter sections
const productSections: FilterSidebarSection[] = [
  {
    id: "price",
    title: "Price Range",
    fields: [
      {
        id: "priceRange",
        label: "Price",
        type: "pricerange",
        placeholder: "Enter price range",
      },
    ],
  },
  {
    id: "category",
    title: "Category",
    collapsible: true,
    fields: [
      {
        id: "category",
        label: "Select Category",
        type: "select",
        options: [
          { label: "Electronics", value: "electronics", count: 145 },
          { label: "Fashion", value: "fashion", count: 203 },
          { label: "Home & Garden", value: "home", count: 87 },
          { label: "Sports", value: "sports", count: 56 },
          { label: "Books", value: "books", count: 234 },
        ],
      },
    ],
  },
  {
    id: "brands",
    title: "Brands",
    collapsible: true,
    fields: [
      {
        id: "brands",
        label: "Select Brands",
        type: "multiselect",
        options: [
          { label: "Apple", value: "apple", count: 45 },
          { label: "Samsung", value: "samsung", count: 38 },
          { label: "Sony", value: "sony", count: 27 },
          { label: "Nike", value: "nike", count: 62 },
          { label: "Adidas", value: "adidas", count: 51 },
        ],
      },
    ],
  },
  {
    id: "availability",
    title: "Availability",
    collapsible: true,
    fields: [
      {
        id: "inStock",
        label: "In Stock",
        type: "checkbox",
      },
      {
        id: "freeShipping",
        label: "Free Shipping",
        type: "checkbox",
      },
      {
        id: "onSale",
        label: "On Sale",
        type: "checkbox",
      },
    ],
  },
  {
    id: "rating",
    title: "Customer Rating",
    collapsible: true,
    fields: [
      {
        id: "rating",
        label: "Minimum Rating",
        type: "radio",
        options: [
          { label: "4 Stars & Up", value: "4" },
          { label: "3 Stars & Up", value: "3" },
          { label: "2 Stars & Up", value: "2" },
          { label: "Any Rating", value: "0" },
        ],
      },
    ],
  },
  {
    id: "condition",
    title: "Condition",
    collapsible: true,
    fields: [
      {
        id: "condition",
        label: "Select Condition",
        type: "checkbox",
        options: [
          { label: "New", value: "new" },
          { label: "Like New", value: "like-new" },
          { label: "Used", value: "used" },
          { label: "Refurbished", value: "refurbished" },
        ],
      },
    ],
  },
];

// Order filter sections
const orderSections: FilterSidebarSection[] = [
  {
    id: "status",
    title: "Order Status",
    fields: [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "All Orders", value: "", count: 247 },
          { label: "Pending", value: "pending", count: 34 },
          { label: "Processing", value: "processing", count: 12 },
          { label: "Shipped", value: "shipped", count: 45 },
          { label: "Delivered", value: "delivered", count: 143 },
          { label: "Cancelled", value: "cancelled", count: 13 },
        ],
      },
    ],
  },
  {
    id: "dateRange",
    title: "Date Range",
    collapsible: true,
    fields: [
      {
        id: "dateRange",
        label: "Order Date",
        type: "daterange",
      },
    ],
  },
  {
    id: "amount",
    title: "Order Amount",
    collapsible: true,
    fields: [
      {
        id: "minAmount",
        label: "Minimum Amount",
        type: "number",
        placeholder: "0",
      },
      {
        id: "maxAmount",
        label: "Maximum Amount",
        type: "number",
        placeholder: "10000",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment Method",
    collapsible: true,
    fields: [
      {
        id: "paymentMethod",
        label: "Method",
        type: "checkbox",
        options: [
          { label: "Credit Card", value: "credit-card" },
          { label: "Debit Card", value: "debit-card" },
          { label: "PayPal", value: "paypal" },
          { label: "Cash on Delivery", value: "cod" },
        ],
      },
    ],
  },
];

// Minimal filter sections
const minimalSections: FilterSidebarSection[] = [
  {
    id: "search",
    title: "Search",
    fields: [
      {
        id: "query",
        label: "Search",
        type: "text",
        placeholder: "Search...",
      },
    ],
  },
  {
    id: "status",
    title: "Status",
    fields: [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "All", value: "" },
          { label: "Active", value: "active", count: 45 },
          { label: "Inactive", value: "inactive", count: 12 },
        ],
      },
    ],
  },
];

export const Default: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Open Filters
            </button>
          </div>

          <UnifiedFilterSidebar
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            sections={minimalSections}
            values={values}
            onApply={(newValues) => {
              setValues(newValues);
              setIsOpen(false);
            }}
            onReset={() => setValues({})}
            variant="mobile"
          />
        </div>
      </div>
    );
  },
};

export const ProductFilters: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="w-80">
            <UnifiedFilterSidebar
              isOpen={true}
              onClose={() => {}}
              sections={productSections}
              values={values}
              onApply={setValues}
              onReset={() => setValues({})}
              variant="desktop"
              resultCount={725}
              title="Filter Products"
            />
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Product list would appear here...
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const WithActiveFilters: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({
      category: "electronics",
      brands: ["apple", "samsung"],
      inStock: true,
      rating: "4",
      priceRange: { min: 100, max: 500 },
    });

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="w-80">
            <UnifiedFilterSidebar
              isOpen={true}
              onClose={() => {}}
              sections={productSections}
              values={values}
              onApply={setValues}
              onReset={() => setValues({})}
              variant="desktop"
              resultCount={34}
              title="Filter Products"
            />
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Filtered Products (34 results)
            </h2>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>Category: Electronics</p>
              <p>Brands: Apple, Samsung</p>
              <p>In Stock Only</p>
              <p>Rating: 4 Stars & Up</p>
              <p>Price: ₹100 - ₹500</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const OrderFilters: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="w-80">
            <UnifiedFilterSidebar
              isOpen={true}
              onClose={() => {}}
              sections={orderSections}
              values={values}
              onApply={setValues}
              onReset={() => setValues({})}
              variant="desktop"
              resultCount={247}
              title="Filter Orders"
            />
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Orders
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Order list would appear here...
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const WithFilterSearch: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="w-80">
            <UnifiedFilterSidebar
              isOpen={true}
              onClose={() => {}}
              sections={productSections}
              values={values}
              onApply={setValues}
              onReset={() => setValues({})}
              variant="desktop"
              resultCount={725}
              title="Filter Products"
              showFilterSearch={true}
              filterSearchPlaceholder="Search filters..."
            />
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Try searching for "brand", "stock", or "rating" in the filter
              search...
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const WithInlineSearch: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState("");

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="w-80">
            <UnifiedFilterSidebar
              isOpen={true}
              onClose={() => {}}
              sections={productSections}
              values={values}
              onApply={setValues}
              onReset={() => setValues({})}
              variant="desktop"
              resultCount={725}
              title="Filter Products"
              showInlineSearch={true}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search products..."
            />
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Products
            </h2>
            {searchQuery && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Searching for: "{searchQuery}"
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              Product list would appear here...
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const MobileVariant: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Products (725)
            </h1>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
          </div>

          <UnifiedFilterSidebar
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            sections={productSections}
            values={values}
            onApply={(newValues) => {
              setValues(newValues);
              setIsOpen(false);
            }}
            onReset={() => setValues({})}
            variant="mobile"
            resultCount={725}
            title="Filter Products"
          />

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-600 dark:text-gray-400">
              Product list would appear here...
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const PendingState: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({
      category: "electronics",
    });
    const [loading, setLoading] = useState(false);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="w-80">
            <UnifiedFilterSidebar
              isOpen={true}
              onClose={() => {}}
              sections={productSections}
              values={values}
              onApply={async (newValues) => {
                setLoading(true);
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setValues(newValues);
                setLoading(false);
              }}
              onReset={() => setValues({})}
              variant="desktop"
              resultCount={145}
              title="Filter Products"
              loading={loading}
            />
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Change filters and click "Apply Filters" to see the pending state
              pattern in action...
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});

    return (
      <div className="dark">
        <div className="min-h-screen bg-gray-900 p-4">
          <div className="max-w-7xl mx-auto flex gap-6">
            <div className="w-80">
              <UnifiedFilterSidebar
                isOpen={true}
                onClose={() => {}}
                sections={productSections}
                values={values}
                onApply={setValues}
                onReset={() => setValues({})}
                variant="desktop"
                resultCount={725}
                title="Filter Products"
              />
            </div>
            <div className="flex-1 bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Products (Dark Mode)
              </h2>
              <p className="text-gray-400">Product list would appear here...</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
