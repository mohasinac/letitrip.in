import { render, screen } from "@testing-library/react";
import AuthGuard from "./AuthGuard";
import { AuthContext } from "@/contexts/AuthContext";

function TestAuthProvider({ value, children }: any) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

describe("AuthGuard", () => {
  it("renders loading spinner when loading", () => {
    const mockAuth = { user: null, isAuthenticated: false, loading: true };
    render(
      <TestAuthProvider value={mockAuth}>
        <AuthGuard>
          <div>Protected</div>
        </AuthGuard>
      </TestAuthProvider>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("redirects to login if not authenticated", () => {
    const mockAuth = { user: null, isAuthenticated: false, loading: false };
    render(
      <TestAuthProvider value={mockAuth}>
        <AuthGuard>
          <div>Protected</div>
        </AuthGuard>
      </TestAuthProvider>
    );
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("renders children if authenticated and authorized", () => {
    const mockAuth = {
      user: { role: "admin" },
      isAuthenticated: true,
      loading: false,
    };
    render(
      <TestAuthProvider value={mockAuth}>
        <AuthGuard allowedRoles={["admin"]}>
          <div>Protected</div>
        </AuthGuard>
      </TestAuthProvider>
    );
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });
});
