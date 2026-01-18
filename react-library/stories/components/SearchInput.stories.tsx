"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchInput } from "../../src/components/search/SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/Search/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A reusable search input with icon, clear button, and optional debounce. Framework-agnostic with injectable icons.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Input size variant",
    },
    debounceMs: {
      control: "number",
      description: "Debounce delay in milliseconds (0 = no debounce)",
    },
    showClear: {
      control: "boolean",
      description: "Show clear button when input has value",
    },
    autoFocus: {
      control: "boolean",
      description: "Auto-focus the input on mount",
    },
    disabled: {
      control: "boolean",
      description: "Disable the input",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

// Interactive wrapper
const SearchInputWrapper = (props: any) => {
  const [value, setValue] = useState("");
  return (
    <div className="w-96">
      <SearchInput {...props} value={value} onChange={setValue} />
      {value && (
        <p className="mt-2 text-sm text-gray-600">Current value: {value}</p>
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <SearchInputWrapper placeholder="Search..." />,
};

export const Small: Story = {
  render: () => (
    <SearchInputWrapper size="sm" placeholder="Search products..." />
  ),
};

export const Medium: Story = {
  render: () => (
    <SearchInputWrapper size="md" placeholder="Search products..." />
  ),
};

export const Large: Story = {
  render: () => (
    <SearchInputWrapper size="lg" placeholder="Search products..." />
  ),
};

export const WithDebounce: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const [debouncedValue, setDebouncedValue] = useState("");

    return (
      <div className="w-96 space-y-2">
        <SearchInput
          value={value}
          onChange={(v) => {
            setValue(v);
            // Simulate debounced callback
            setTimeout(() => setDebouncedValue(v), 300);
          }}
          placeholder="Search with 300ms debounce..."
          debounceMs={300}
        />
        <div className="text-sm space-y-1">
          <p className="text-gray-600">Immediate value: {value}</p>
          <p className="text-gray-600">Debounced value: {debouncedValue}</p>
        </div>
      </div>
    );
  },
};

export const NoClearButton: Story = {
  render: () => (
    <SearchInputWrapper showClear={false} placeholder="Search (no clear)..." />
  ),
};

export const Disabled: Story = {
  render: () => {
    const [value] = useState("Disabled search");
    return (
      <div className="w-96">
        <SearchInput
          value={value}
          onChange={() => {}}
          disabled
          placeholder="Search..."
        />
      </div>
    );
  },
};

export const CustomPlaceholder: Story = {
  render: () => (
    <SearchInputWrapper placeholder="Type to search products, shops, categories..." />
  ),
};

export const MultipleVariants: Story = {
  render: () => {
    const [sm, setSm] = useState("");
    const [md, setMd] = useState("");
    const [lg, setLg] = useState("");

    return (
      <div className="w-96 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Small</label>
          <SearchInput
            size="sm"
            value={sm}
            onChange={setSm}
            placeholder="Small search..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Medium</label>
          <SearchInput
            size="md"
            value={md}
            onChange={setMd}
            placeholder="Medium search..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Large</label>
          <SearchInput
            size="lg"
            value={lg}
            onChange={setLg}
            placeholder="Large search..."
          />
        </div>
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => <SearchInputWrapper placeholder="Search in dark mode..." />,
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

