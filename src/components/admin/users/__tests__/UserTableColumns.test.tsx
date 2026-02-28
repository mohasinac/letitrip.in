import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { useUserTableColumns } from "@/components";
import type { AdminUser } from "@/components";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockUser: AdminUser = {
  id: "user-1",
  uid: "user-1",
  email: "admin@example.com",
  displayName: "Admin User",
  role: "admin",
  disabled: false,
  emailVerified: true,
  photoURL: null,
  createdAt: "2025-01-01",
};

describe("useUserTableColumns", () => {
  it("renders view and ban action buttons", () => {
    const onView = jest.fn();
    const onToggleBan = jest.fn();

    function TestComponent() {
      const { actions } = useUserTableColumns(onView, onToggleBan);
      return <div>{actions(mockUser)}</div>;
    }

    render(<TestComponent />);
    fireEvent.click(screen.getByRole("button", { name: "view" }));
    expect(onView).toHaveBeenCalledWith(mockUser);

    fireEvent.click(screen.getByRole("button", { name: "banUser" }));
    expect(onToggleBan).toHaveBeenCalledWith(mockUser);
  });

  it("shows unbanUser for disabled users", () => {
    const disabledUser = { ...mockUser, disabled: true };

    function TestComponent() {
      const { actions } = useUserTableColumns(jest.fn(), jest.fn());
      return <div>{actions(disabledUser)}</div>;
    }

    render(<TestComponent />);
    expect(screen.getByRole("button", { name: "unbanUser" })).toBeTruthy();
  });

  it("shows emailNotVerified for unverified emails", () => {
    const unverifiedUser = { ...mockUser, emailVerified: false };

    function TestComponent() {
      const { columns } = useUserTableColumns(jest.fn(), jest.fn());
      const emailCol = columns.find((c) => c.key === "email");
      return <div>{emailCol?.render?.(unverifiedUser)}</div>;
    }

    render(<TestComponent />);
    expect(screen.getByText("emailNotVerified")).toBeTruthy();
  });

  it("returns 6 columns", () => {
    function TestComponent() {
      const { columns } = useUserTableColumns(jest.fn(), jest.fn());
      return <span data-testid="count">{columns.length}</span>;
    }
    render(<TestComponent />);
    expect(screen.getByTestId("count").textContent).toBe("6");
  });
});
