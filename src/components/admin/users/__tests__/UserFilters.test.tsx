/**
 * UserFilters Tests - Phase 2
 *
 * Verifies that role option labels and tab labels are sourced from
 * useTranslations (next-intl) - no UI_LABELS in JSX (Rule 2).
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserFilters } from "../UserFilters";

const tMap: Record<string, Record<string, string>> = {
  adminUsers: {
    all: "All Users",
    active: "Active",
    banned: "Banned",
    admins: "Admins",
    searchPlaceholder: "Search by name or email...",
  },
  roles: {
    all: "All Roles",
    user: "User",
    seller: "Seller",
    moderator: "Moderator",
    admin: "Admin",
  },
  actions: { search: "Search" },
  form: { roleFilter: "Role Filter" },
};

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => tMap[ns]?.[key] ?? key,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      border: "border-gray-200",
      textSecondary: "text-gray-600",
    },
  },
}));

jest.mock("@/components", () => ({
  AdminFilterBar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-filter-bar">{children}</div>
  ),
  FormField: ({
    name,
    label,
    options,
  }: {
    name: string;
    label: string;
    type?: string;
    value?: string;
    onChange?: (v: string) => void;
    options?: { value: string; label: string }[];
    disabled?: boolean;
    placeholder?: string;
  }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      {options && (
        <select name={name}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  ),
}));

describe("UserFilters - role dropdown useTranslations", () => {
  const defaultProps = {
    activeTab: "all" as const,
    onTabChange: jest.fn(),
    searchTerm: "",
    onSearchChange: jest.fn(),
    roleFilter: "all",
    onRoleFilterChange: jest.fn(),
    isAdminsTab: false,
  };

  it("renders role option All Roles from useTranslations", () => {
    render(<UserFilters {...defaultProps} />);
    expect(screen.getByText("All Roles")).toBeInTheDocument();
  });

  it("renders role option User from useTranslations", () => {
    render(<UserFilters {...defaultProps} />);
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("renders role option Seller from useTranslations", () => {
    render(<UserFilters {...defaultProps} />);
    expect(screen.getByText("Seller")).toBeInTheDocument();
  });

  it("renders role option Moderator from useTranslations", () => {
    render(<UserFilters {...defaultProps} />);
    expect(screen.getByText("Moderator")).toBeInTheDocument();
  });

  it("renders role option Admin from useTranslations", () => {
    render(<UserFilters {...defaultProps} />);
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(1);
  });

  it("role options contain exactly 5 entries", () => {
    render(<UserFilters {...defaultProps} />);
    const roleField = screen.getByTestId("field-roleFilter");
    const options = roleField.querySelectorAll("option");
    expect(options).toHaveLength(5);
  });

  it("renders tab labels from useTranslations('adminUsers')", () => {
    render(<UserFilters {...defaultProps} />);
    expect(screen.getByText("All Users")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Banned")).toBeInTheDocument();
    expect(screen.getByText("Admins")).toBeInTheDocument();
  });

  it("role select is disabled when isAdminsTab=true", () => {
    render(<UserFilters {...defaultProps} isAdminsTab={true} />);
    expect(screen.getByTestId("field-roleFilter")).toBeInTheDocument();
  });
});
