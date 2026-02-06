/**
 * Tests for RoleGate component
 *
 * Coverage:
 * - Role-based rendering
 * - Multiple role support
 * - Fallback rendering
 * - AdminOnly wrapper
 * - ModeratorOnly wrapper
 * - User authentication check
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { RoleGate, AdminOnly, ModeratorOnly } from "../RoleGate";
import * as hooks from "@/hooks";

// Mock useAuth hook
jest.mock("@/hooks", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = hooks.useAuth as jest.MockedFunction<typeof hooks.useAuth>;

const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

/** Helper to mock useAuth with refreshUser included */
const mockAuth = (user: any, loading = false) => {
  mockUseAuth.mockReturnValue({ user, loading, refreshUser: mockRefreshUser });
};

describe("RoleGate Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Role-Based Rendering", () => {
    it("renders children when user has required role", () => {
      mockAuth({ uid: "123", role: "admin", email: "admin@test.com" });

      render(
        <RoleGate allowedRoles="admin">
          <div>Admin content</div>
        </RoleGate>,
      );

      expect(screen.getByText("Admin content")).toBeInTheDocument();
    });

    it("does not render children when user lacks required role", () => {
      mockAuth({ uid: "123", role: "user", email: "user@test.com" });

      render(
        <RoleGate allowedRoles="admin">
          <div>Admin content</div>
        </RoleGate>,
      );

      expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
    });

    it("renders fallback when user lacks required role", () => {
      mockAuth({ uid: "123", role: "user", email: "user@test.com" });

      render(
        <RoleGate allowedRoles="admin" fallback={<div>Access denied</div>}>
          <div>Admin content</div>
        </RoleGate>,
      );

      expect(screen.getByText("Access denied")).toBeInTheDocument();
      expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
    });
  });

  describe("Multiple Roles", () => {
    it("renders children when user has any of the allowed roles", () => {
      mockAuth({ uid: "123", role: "moderator", email: "mod@test.com" });

      render(
        <RoleGate allowedRoles={["admin", "moderator"]}>
          <div>Staff content</div>
        </RoleGate>,
      );

      expect(screen.getByText("Staff content")).toBeInTheDocument();
    });

    it("does not render when user has none of the allowed roles", () => {
      mockAuth({ uid: "123", role: "user", email: "user@test.com" });

      render(
        <RoleGate allowedRoles={["admin", "moderator"]}>
          <div>Staff content</div>
        </RoleGate>,
      );

      expect(screen.queryByText("Staff content")).not.toBeInTheDocument();
    });
  });

  describe("Unauthenticated Users", () => {
    it("renders fallback when user is not authenticated", () => {
      mockAuth(null);

      render(
        <RoleGate allowedRoles="admin" fallback={<div>Please login</div>}>
          <div>Admin content</div>
        </RoleGate>,
      );

      expect(screen.getByText("Please login")).toBeInTheDocument();
      expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
    });

    it("renders null when no fallback provided and user not authenticated", () => {
      mockAuth(null);

      const { container } = render(
        <RoleGate allowedRoles="admin">
          <div>Admin content</div>
        </RoleGate>,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("All Role Types", () => {
    it("renders for user role", () => {
      mockAuth({ uid: "123", role: "user", email: "user@test.com" });

      render(
        <RoleGate allowedRoles="user">
          <div>User content</div>
        </RoleGate>,
      );

      expect(screen.getByText("User content")).toBeInTheDocument();
    });

    it("renders for seller role", () => {
      mockAuth({ uid: "123", role: "seller", email: "seller@test.com" });

      render(
        <RoleGate allowedRoles="seller">
          <div>Seller content</div>
        </RoleGate>,
      );

      expect(screen.getByText("Seller content")).toBeInTheDocument();
    });

    it("renders for moderator role", () => {
      mockAuth({ uid: "123", role: "moderator", email: "mod@test.com" });

      render(
        <RoleGate allowedRoles="moderator">
          <div>Moderator content</div>
        </RoleGate>,
      );

      expect(screen.getByText("Moderator content")).toBeInTheDocument();
    });

    it("renders for admin role", () => {
      mockAuth({ uid: "123", role: "admin", email: "admin@test.com" });

      render(
        <RoleGate allowedRoles="admin">
          <div>Admin content</div>
        </RoleGate>,
      );

      expect(screen.getByText("Admin content")).toBeInTheDocument();
    });
  });
});

describe("AdminOnly Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children for admin users", () => {
    mockAuth({ uid: "123", role: "admin", email: "admin@test.com" });

    render(
      <AdminOnly>
        <div>Admin only content</div>
      </AdminOnly>,
    );

    expect(screen.getByText("Admin only content")).toBeInTheDocument();
  });

  it("does not render children for non-admin users", () => {
    mockAuth({ uid: "123", role: "user", email: "user@test.com" });

    render(
      <AdminOnly>
        <div>Admin only content</div>
      </AdminOnly>,
    );

    expect(screen.queryByText("Admin only content")).not.toBeInTheDocument();
  });

  it("renders fallback for non-admin users", () => {
    mockAuth({ uid: "123", role: "user", email: "user@test.com" });

    render(
      <AdminOnly fallback={<div>Admin access required</div>}>
        <div>Admin only content</div>
      </AdminOnly>,
    );

    expect(screen.getByText("Admin access required")).toBeInTheDocument();
  });
});

describe("ModeratorOnly Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children for moderators", () => {
    mockAuth({ uid: "123", role: "moderator", email: "mod@test.com" });

    render(
      <ModeratorOnly>
        <div>Moderator content</div>
      </ModeratorOnly>,
    );

    expect(screen.getByText("Moderator content")).toBeInTheDocument();
  });

  it("renders children for admins", () => {
    mockAuth({ uid: "123", role: "admin", email: "admin@test.com" });

    render(
      <ModeratorOnly>
        <div>Moderator content</div>
      </ModeratorOnly>,
    );

    expect(screen.getByText("Moderator content")).toBeInTheDocument();
  });

  it("does not render for regular users", () => {
    mockAuth({ uid: "123", role: "user", email: "user@test.com" });

    render(
      <ModeratorOnly>
        <div>Moderator content</div>
      </ModeratorOnly>,
    );

    expect(screen.queryByText("Moderator content")).not.toBeInTheDocument();
  });

  it("does not render for sellers", () => {
    mockAuth({ uid: "123", role: "seller", email: "seller@test.com" });

    render(
      <ModeratorOnly>
        <div>Moderator content</div>
      </ModeratorOnly>,
    );

    expect(screen.queryByText("Moderator content")).not.toBeInTheDocument();
  });

  it("renders fallback for unauthorized users", () => {
    mockAuth({ uid: "123", role: "user", email: "user@test.com" });

    render(
      <ModeratorOnly fallback={<div>Moderator access required</div>}>
        <div>Moderator content</div>
      </ModeratorOnly>,
    );

    expect(screen.getByText("Moderator access required")).toBeInTheDocument();
  });
});
