/**
 * UserDetailDrawer Tests
 * Verifies UI_LABELS replaced with useTranslations('adminUsers').
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserDetailDrawer } from "../UserDetailDrawer";

jest.mock("next-intl", () => ({
  useTranslations: (_ns: string) => (key: string) => key,
}));
jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4", gap: { md: "gap-4" } },
    themed: {
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    typography: { caption: "text-xs", label: "text-sm font-medium" },
  },
}));
jest.mock("@/utils", () => ({ formatDateTime: (d: unknown) => String(d) }));
jest.mock("@/components", () => ({
  SideDrawer: ({ isOpen, title, children }: any) =>
    isOpen ? (
      <div data-testid="side-drawer" data-title={title}>
        {children}
      </div>
    ) : null,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  RoleBadge: ({ role }: any) => <span data-testid="role-badge">{role}</span>,
  StatusBadge: ({ label }: any) => (
    <span data-testid="status-badge">{label}</span>
  ),
}));

const mockUser = {
  id: "u1",
  uid: "u1",
  email: "test@example.com",
  displayName: "Test User",
  role: "user" as const,
  disabled: false,
  emailVerified: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  lastLoginAt: "2025-06-01T00:00:00.000Z",
  photoURL: null,
  metadata: { loginCount: 3 },
};

describe("UserDetailDrawer", () => {
  it("renders null when user is null", () => {
    const { container } = render(
      <UserDetailDrawer
        user={null}
        isOpen={true}
        onClose={jest.fn()}
        onRoleChange={jest.fn()}
        onToggleBan={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders drawer title from t('detail')", () => {
    render(
      <UserDetailDrawer
        user={mockUser}
        isOpen={true}
        onClose={jest.fn()}
        onRoleChange={jest.fn()}
        onToggleBan={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    const drawer = screen.getByTestId("side-drawer");
    expect(drawer.getAttribute("data-title")).toBe("detail");
  });

  it("renders ban user button from t('banUser') when not disabled", () => {
    render(
      <UserDetailDrawer
        user={mockUser}
        isOpen={true}
        onClose={jest.fn()}
        onRoleChange={jest.fn()}
        onToggleBan={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText("banUser")).toBeInTheDocument();
  });

  it("renders unban user button from t('unbanUser') when user is disabled", () => {
    render(
      <UserDetailDrawer
        user={{ ...mockUser, disabled: true }}
        isOpen={true}
        onClose={jest.fn()}
        onRoleChange={jest.fn()}
        onToggleBan={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText("unbanUser")).toBeInTheDocument();
  });

  it("renders delete user button from t('deleteUser')", () => {
    render(
      <UserDetailDrawer
        user={mockUser}
        isOpen={true}
        onClose={jest.fn()}
        onRoleChange={jest.fn()}
        onToggleBan={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText("deleteUser")).toBeInTheDocument();
  });

  it("does not render when isOpen=false", () => {
    render(
      <UserDetailDrawer
        user={mockUser}
        isOpen={false}
        onClose={jest.fn()}
        onRoleChange={jest.fn()}
        onToggleBan={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.queryByTestId("side-drawer")).not.toBeInTheDocument();
  });
});
