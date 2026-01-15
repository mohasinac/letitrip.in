import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "../../src/components/tables/DataTable";

const meta: Meta<typeof DataTable> = {
  title: "Components/Tables/DataTable",
  component: DataTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
}

const sampleUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "inactive",
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice@example.com",
    role: "Editor",
    status: "active",
    createdAt: "2024-04-05",
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "User",
    status: "active",
    createdAt: "2024-05-12",
  },
];

export const Default: Story = {
  args: {
    data: sampleUsers,
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "role", label: "Role", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "createdAt", label: "Created", sortable: true },
    ],
    keyExtractor: (row) => row.id.toString(),
  },
};

export const WithCustomRender: Story = {
  args: {
    data: sampleUsers,
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value: string) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              value === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {value}
          </span>
        ),
      },
      { key: "createdAt", label: "Created", sortable: true },
    ],
    keyExtractor: (row) => row.id.toString(),
  },
};

export const WithRowClick: Story = {
  args: {
    data: sampleUsers,
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "role", label: "Role", sortable: true },
    ],
    keyExtractor: (row) => row.id.toString(),
    onRowClick: (row) => alert(`Clicked on ${row.name}`),
  },
};

export const WithRowClassName: Story = {
  args: {
    data: sampleUsers,
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    keyExtractor: (row) => row.id.toString(),
    rowClassName: (row) => (row.status === "inactive" ? "opacity-50" : ""),
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "role", label: "Role", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    keyExtractor: (row) => row.id.toString(),
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "role", label: "Role", sortable: true },
    ],
    keyExtractor: (row) => row.id.toString(),
    emptyMessage: "No users found",
  },
};

export const WithColumnWidths: Story = {
  args: {
    data: sampleUsers,
    columns: [
      { key: "name", label: "Name", sortable: true, width: "30%" },
      { key: "email", label: "Email", sortable: true, width: "40%" },
      { key: "role", label: "Role", sortable: true, width: "15%" },
      { key: "status", label: "Status", sortable: true, width: "15%" },
    ],
    keyExtractor: (row) => row.id.toString(),
  },
};

export const CustomStyling: Story = {
  args: {
    data: sampleUsers,
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "role", label: "Role", sortable: true },
    ],
    keyExtractor: (row) => row.id.toString(),
    className: "border border-gray-300 dark:border-gray-700 rounded-lg",
  },
};

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const sampleProducts: Product[] = [
  { id: 1, name: "Laptop", price: 999.99, stock: 25, category: "Electronics" },
  { id: 2, name: "Mouse", price: 29.99, stock: 150, category: "Electronics" },
  { id: 3, name: "Keyboard", price: 79.99, stock: 80, category: "Electronics" },
  { id: 4, name: "Monitor", price: 299.99, stock: 45, category: "Electronics" },
  { id: 5, name: "Desk", price: 399.99, stock: 15, category: "Furniture" },
];

export const ProductTable: Story = {
  args: {
    data: sampleProducts,
    columns: [
      { key: "name", label: "Product", sortable: true },
      { key: "category", label: "Category", sortable: true },
      {
        key: "price",
        label: "Price",
        sortable: true,
        render: (value: number) => `₹${value.toFixed(2)}`,
      },
      {
        key: "stock",
        label: "Stock",
        sortable: true,
        render: (value: number) => (
          <span
            className={`font-medium ${
              value < 20
                ? "text-red-600 dark:text-red-400"
                : value < 50
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {value}
          </span>
        ),
      },
    ],
    keyExtractor: (row) => row.id.toString(),
  },
};
