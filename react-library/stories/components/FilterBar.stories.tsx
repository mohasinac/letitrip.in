import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { QuickFilter } from "../../src/components/search/FilterBar";
import { FilterBar } from "../../src/components/search/FilterBar";

const meta: Meta<typeof FilterBar> = {
  title: "Components/Search/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Horizontal filter bar with quick filters (select, checkbox, radio), result count, and active filter pills.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

const statusFilters: QuickFilter[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active", count: 45 },
      { label: "Pending", value: "pending", count: 12 },
      { label: "Completed", value: "completed", count: 78 },
      { label: "Cancelled", value: "cancelled", count: 5 },
    ],
  },
];

const categoryFilters: QuickFilter[] = [
  {
    key: "category",
    label: "Category",
    type: "checkbox",
    options: [
      { label: "Electronics", value: "electronics", count: 120 },
      { label: "Fashion", value: "fashion", count: 95 },
      { label: "Home", value: "home", count: 67 },
    ],
  },
];

const priceFilters: QuickFilter[] = [
  {
    key: "priceRange",
    label: "Price Range",
    type: "radio",
    options: [
      { label: "Under $50", value: "0-50", count: 34 },
      { label: "$50-$100", value: "50-100", count: 56 },
      { label: "$100-$200", value: "100-200", count: 43 },
      { label: "Over $200", value: "200+", count: 21 },
    ],
  },
];

const allFilters: QuickFilter[] = [
  ...statusFilters,
  ...categoryFilters,
  ...priceFilters,
];

export const Default: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    return (
      <FilterBar
        filters={statusFilters}
        values={values}
        onChange={(key, value) => setValues({ ...values, [key]: value })}
        onReset={() => setValues({})}
      />
    );
  },
};

export const WithResultCount: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    return (
      <FilterBar
        filters={statusFilters}
        values={values}
        onChange={(key, value) => setValues({ ...values, [key]: value })}
        onReset={() => setValues({})}
        resultCount={140}
      />
    );
  },
};

export const WithActiveFilters: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({
      status: "active",
      category: ["electronics", "fashion"],
    });
    return (
      <FilterBar
        filters={[...statusFilters, ...categoryFilters]}
        values={values}
        onChange={(key, value) => setValues({ ...values, [key]: value })}
        onReset={() => setValues({})}
        resultCount={85}
      />
    );
  },
};

export const CheckboxFilters: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    return (
      <FilterBar
        filters={categoryFilters}
        values={values}
        onChange={(key, value) => setValues({ ...values, [key]: value })}
        onReset={() => setValues({})}
        resultCount={282}
      />
    );
  },
};

export const RadioFilters: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    return (
      <FilterBar
        filters={priceFilters}
        values={values}
        onChange={(key, value) => setValues({ ...values, [key]: value })}
        onReset={() => setValues({})}
        resultCount={154}
      />
    );
  },
};

export const AllFilterTypes: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    return (
      <FilterBar
        filters={allFilters}
        values={values}
        onChange={(key, value) => setValues({ ...values, [key]: value })}
        onReset={() => setValues({})}
        resultCount={282}
      />
    );
  },
};

export const WithAdvancedToggle: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    return (
      <div>
        <FilterBar
          filters={statusFilters}
          values={values}
          onChange={(key, value) => setValues({ ...values, [key]: value })}
          onReset={() => setValues({})}
          showAdvanced={showAdvanced}
          onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
          resultCount={140}
        />
        {showAdvanced && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Advanced filters panel would go here...
            </p>
          </div>
        )}
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({
      status: "active",
      category: ["electronics"],
    });
    return (
      <div className="dark min-h-screen bg-gray-900 p-8">
        <FilterBar
          filters={allFilters}
          values={values}
          onChange={(key, value) => setValues({ ...values, [key]: value })}
          onReset={() => setValues({})}
          resultCount={85}
        />
      </div>
    );
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, any>>({});
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Calculate result count based on active filters
    const calculateResults = () => {
      let count = 282; // Base count
      if (values.status) count = Math.floor(count * 0.6);
      if (values.category?.length > 0)
        count = Math.floor(count * 0.4 * values.category.length);
      if (values.priceRange) count = Math.floor(count * 0.3);
      return Math.max(count, 0);
    };

    return (
      <div>
        <FilterBar
          filters={allFilters}
          values={values}
          onChange={(key, value) => {
            setValues({ ...values, [key]: value });
          }}
          onReset={() => setValues({})}
          showAdvanced={showAdvanced}
          onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
          resultCount={calculateResults()}
        />

        {showAdvanced && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">
                Advanced Filters
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Date Range
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Enter tags..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Current State:
          </h4>
          <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(
              { values, resultCount: calculateResults() },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    );
  },
};
