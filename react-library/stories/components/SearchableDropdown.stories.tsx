import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  SearchableDropdown,
  type DropdownOption,
} from "../../src/components/search/SearchableDropdown";

const meta: Meta<typeof SearchableDropdown> = {
  title: "Components/Search/SearchableDropdown",
  component: SearchableDropdown,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible dropdown with search, multi-select, async options, keyboard navigation, and grouping. Framework-agnostic with dependency injection.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "multi"],
      description: "Selection mode",
    },
    searchable: {
      control: "boolean",
      description: "Enable search functionality",
    },
    clearable: {
      control: "boolean",
      description: "Show clear button",
    },
    disabled: {
      control: "boolean",
      description: "Disable the dropdown",
    },
    loading: {
      control: "boolean",
      description: "Show loading state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchableDropdown>;

// Sample data
const fruitOptions: DropdownOption[] = [
  { value: "apple", label: "Apple", description: "A red or green fruit" },
  { value: "banana", label: "Banana", description: "A yellow curved fruit" },
  { value: "orange", label: "Orange", description: "A citrus fruit" },
  { value: "grape", label: "Grape", description: "Small round fruits" },
  { value: "mango", label: "Mango", description: "A tropical fruit" },
  { value: "strawberry", label: "Strawberry", description: "A red berry" },
];

const countryOptions: DropdownOption[] = [
  { value: "us", label: "United States", group: "North America" },
  { value: "ca", label: "Canada", group: "North America" },
  { value: "mx", label: "Mexico", group: "North America" },
  { value: "uk", label: "United Kingdom", group: "Europe" },
  { value: "fr", label: "France", group: "Europe" },
  { value: "de", label: "Germany", group: "Europe" },
  { value: "jp", label: "Japan", group: "Asia" },
  { value: "cn", label: "China", group: "Asia" },
  { value: "in", label: "India", group: "Asia" },
];

// Interactive wrapper
const DropdownWrapper = (props: any) => {
  const [value, setValue] = useState<any>(null);
  return (
    <div className="w-96">
      <SearchableDropdown {...props} value={value} onChange={setValue} />
      {value && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: {JSON.stringify(value)}
        </p>
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <DropdownWrapper options={fruitOptions} placeholder="Select a fruit..." />
  ),
};

export const WithLabel: Story = {
  render: () => (
    <DropdownWrapper
      options={fruitOptions}
      label="Favorite Fruit"
      placeholder="Select a fruit..."
      helperText="Choose your favorite fruit from the list"
    />
  ),
};

export const Required: Story = {
  render: () => (
    <DropdownWrapper
      options={fruitOptions}
      label="Favorite Fruit"
      required
      placeholder="Select a fruit..."
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <DropdownWrapper
      options={fruitOptions}
      label="Favorite Fruit"
      error="This field is required"
      placeholder="Select a fruit..."
    />
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <DropdownWrapper
      mode="multi"
      options={fruitOptions}
      placeholder="Select fruits..."
    />
  ),
};

export const MultiSelectWithChips: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["apple", "banana", "orange"]);
    return (
      <div className="w-96">
        <SearchableDropdown
          mode="multi"
          options={fruitOptions}
          value={value}
          onChange={(v) => setValue(v as string[])}
          placeholder="Select fruits..."
          chipVariant="filled"
        />
      </div>
    );
  },
};

export const GroupedOptions: Story = {
  render: () => (
    <DropdownWrapper
      options={countryOptions}
      placeholder="Select a country..."
    />
  ),
};

export const NotSearchable: Story = {
  render: () => (
    <DropdownWrapper
      options={fruitOptions}
      searchable={false}
      placeholder="Select a fruit..."
    />
  ),
};

export const NotClearable: Story = {
  render: () => (
    <DropdownWrapper
      options={fruitOptions}
      clearable={false}
      placeholder="Select a fruit..."
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const [value] = useState("apple");
    return (
      <div className="w-96">
        <SearchableDropdown
          options={fruitOptions}
          value={value}
          onChange={() => {}}
          disabled
          placeholder="Select a fruit..."
        />
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => (
    <DropdownWrapper options={fruitOptions} loading placeholder="Loading..." />
  ),
};

export const WithIcons: Story = {
  render: () => {
    const options: DropdownOption[] = [
      {
        value: "profile",
        label: "Profile",
        description: "View your profile",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        value: "settings",
        label: "Settings",
        description: "Configure your account",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        value: "logout",
        label: "Logout",
        description: "Sign out of your account",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L13.586 6 15 7.414z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ];

    return (
      <DropdownWrapper options={options} placeholder="Select an action..." />
    );
  },
};

export const AsyncSearch: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    const handleSearch = async (
      query: string
    ): Promise<DropdownOption<string>[]> => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const allOptions = [
        { value: "react", label: "React", description: "A JavaScript library" },
        { value: "vue", label: "Vue", description: "Progressive framework" },
        {
          value: "angular",
          label: "Angular",
          description: "Platform for web apps",
        },
        {
          value: "svelte",
          label: "Svelte",
          description: "Cybernetically enhanced",
        },
      ];

      return allOptions.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );
    };

    return (
      <div className="w-96">
        <SearchableDropdown
          options={[]}
          value={value}
          onChange={(v) => setValue(v as string)}
          onSearch={handleSearch}
          placeholder="Search frameworks..."
          searchPlaceholder="Type to search..."
        />
        {value && (
          <p className="mt-2 text-sm text-gray-600">Selected: {value}</p>
        )}
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => (
    <DropdownWrapper options={fruitOptions} placeholder="Select a fruit..." />
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

export const InteractiveDemo: Story = {
  render: () => {
    const [single, setSingle] = useState<string | null>(null);
    const [multi, setMulti] = useState<string[]>([]);

    return (
      <div className="w-96 space-y-6">
        <div>
          <SearchableDropdown
            label="Single Select"
            options={fruitOptions}
            value={single}
            onChange={(v) => setSingle(v as string)}
            placeholder="Select one fruit..."
            helperText="You can select one option"
          />
        </div>

        <div>
          <SearchableDropdown
            mode="multi"
            label="Multi Select"
            options={fruitOptions}
            value={multi}
            onChange={(v) => setMulti(v as string[])}
            placeholder="Select multiple fruits..."
            helperText="You can select multiple options"
            chipVariant="filled"
          />
        </div>

        <div>
          <SearchableDropdown
            label="Grouped"
            options={countryOptions}
            value={null}
            onChange={() => {}}
            placeholder="Select a country..."
          />
        </div>
      </div>
    );
  },
};
