import { render, screen, fireEvent } from "@testing-library/react";
import AdminUsersPage from "./page";

describe("AdminUsersPage", () => {
  it.skip("renders user management table", () => {
    render(<AdminUsersPage />);
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Role/i)).toBeInTheDocument();
  });

  it.skip("filters users by role", () => {
    render(<AdminUsersPage />);
    fireEvent.change(screen.getByLabelText(/Role/i), {
      target: { value: "admin" },
    });
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });
});
