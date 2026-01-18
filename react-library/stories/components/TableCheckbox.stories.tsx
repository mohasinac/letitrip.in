"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TableCheckbox } from "../../src/components/tables/TableCheckbox";

const meta: Meta<typeof TableCheckbox> = {
  title: "Components/Tables/TableCheckbox",
  component: TableCheckbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TableCheckbox>;

export const Unchecked: Story = {
  args: {
    checked: false,
    onChange: () => {},
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    onChange: () => {},
  },
};

export const Indeterminate: Story = {
  args: {
    checked: false,
    indeterminate: true,
    onChange: () => {},
    label: "Select all",
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
    onChange: () => {},
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    onChange: () => {},
  },
};

export const WithCustomLabel: Story = {
  args: {
    checked: false,
    onChange: () => {},
    label: "Select this item",
  },
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <TableCheckbox checked={checked} onChange={setChecked} />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Status: {checked ? "Checked" : "Unchecked"}
        </p>
      </div>
    );
  },
};

export const InteractiveWithIndeterminate: Story = {
  render: () => {
    const [checkedItems, setCheckedItems] = useState([false, false, false]);
    
    const allChecked = checkedItems.every(Boolean);
    const someChecked = checkedItems.some(Boolean) && !allChecked;
    
    const handleSelectAll = (checked: boolean) => {
      setCheckedItems([checked, checked, checked]);
    };
    
    const handleItemChange = (index: number) => (checked: boolean) => {
      const newItems = [...checkedItems];
      newItems[index] = checked;
      setCheckedItems(newItems);
    };
    
    return (
      <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <TableCheckbox
            checked={allChecked}
            indeterminate={someChecked}
            onChange={handleSelectAll}
            label="Select all"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select All
          </span>
        </div>
        
        {checkedItems.map((checked, index) => (
          <div key={index} className="flex items-center gap-3">
            <TableCheckbox
              checked={checked}
              onChange={handleItemChange(index)}
              label={`Select item ${index + 1}`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Item {index + 1}
            </span>
          </div>
        ))}
        
        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
          Selected: {checkedItems.filter(Boolean).length} of {checkedItems.length}
        </div>
      </div>
    );
  },
};

export const InTableContext: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    
    const items = [
      { id: 1, name: "Product 1", price: 99.99 },
      { id: 2, name: "Product 2", price: 149.99 },
      { id: 3, name: "Product 3", price: 79.99 },
    ];
    
    const allSelected = selectedIds.length === items.length;
    const someSelected = selectedIds.length > 0 && !allSelected;
    
    const handleSelectAll = (checked: boolean) => {
      setSelectedIds(checked ? items.map(item => item.id) : []);
    };
    
    const handleSelectItem = (id: number) => (checked: boolean) => {
      setSelectedIds(prev =>
        checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
      );
    };
    
    return (
      <div className="w-full max-w-2xl">
        <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="w-12 px-3 py-3">
                <TableCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                  label="Select all products"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <tr
                key={item.id}
                className={`${
                  selectedIds.includes(item.id)
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <td className="w-12 px-3 py-3">
                  <TableCheckbox
                    checked={selectedIds.includes(item.id)}
                    onChange={handleSelectItem(item.id)}
                    label={`Select ${item.name}`}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  ₹{item.price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {selectedIds.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-900 dark:text-blue-100">
            {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>
    );
  },
};

export const TouchFriendly: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Checkboxes have a minimum 44x44px touch target for mobile accessibility
      </p>
      <div className="flex gap-2 flex-wrap">
        <TableCheckbox checked={false} onChange={() => {}} />
        <TableCheckbox checked={true} onChange={() => {}} />
        <TableCheckbox checked={false} indeterminate={true} onChange={() => {}} />
      </div>
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
        Each checkbox wrapper is min-w-[44px] min-h-[44px] for WCAG 2.1 compliance
      </div>
    </div>
  ),
};

