import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock auth context
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));
const mockUseAuth = require("@/contexts/AuthContext").useAuth;

// Mock auth service
jest.mock("@/services/auth.service");
const mockAuthService = require("@/services/auth.service").authService;

// Import page after mocks
const SettingsPage = require("./page").default;

describe("SettingsPage", () => {
  const mockUser = {
    id: "user-123",
    uid: "user-123",
    email: "test@example.com",
    displayName: "John Doe",
    photoURL: null,
    phoneNumber: "+91-9876543210",
    role: "USER",
    status: "ACTIVE",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    initials: "JD",
    bio: null,
    location: null,
    emailVerified: true,
    phoneVerified: true,
    isVerified: true,
    shopId: null,
    shopName: null,
    shopSlug: null,
    hasShop: false,
    totalOrders: 5,
    totalSpent: 15000,
    totalSales: 0,
    totalProducts: 0,
    totalAuctions: 0,
    rating: 4.5,
    reviewCount: 3,
    formattedTotalSpent: "₹15,000",
    formattedTotalSales: "₹0",
    ratingStars: 5,
    ratingDisplay: "4.5 (3 reviews)",
    notifications: {
      email: true,
      push: true,
      orderUpdates: true,
      auctionUpdates: false,
      promotions: true,
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    lastLoginAt: new Date("2024-01-15"),
    memberSince: "Member since Jan 2024",
    lastLoginDisplay: "Last seen today",
    accountAge: "2 weeks",
    isActive: true,
    isBlocked: false,
    isSuspended: false,
    isAdmin: false,
    isSeller: false,
    isUser: true,
    badges: ["Verified"],
    metadata: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  describe("Authentication", () => {
    it("redirects to login when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      render(<SettingsPage />);

      expect(mockPush).toHaveBeenCalledWith("/login?redirect=/user/settings");
    });

    it("does not redirect when user is authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
      });

      render(<SettingsPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Form Loading", () => {
    it("loads user data into form", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
      });

      render(<SettingsPage />);

      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
      });
    });

    it("submits form successfully", async () => {
      mockAuthService.updateProfile.mockResolvedValue({});

      render(<SettingsPage />);

      const nameInput = screen.getByDisplayValue("John Doe");
      const emailInput = screen.getByDisplayValue("test@example.com");
      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });

      fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
      fireEvent.change(emailInput, { target: { value: "jane@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.updateProfile).toHaveBeenCalledWith({
          fullName: "Jane Doe",
          email: "jane@example.com",
        });
      });

      expect(
        screen.getByText("Profile updated successfully!"),
      ).toBeInTheDocument();
    });

    it("handles form submission error", async () => {
      mockAuthService.updateProfile.mockRejectedValue(
        new Error("Update failed"),
      );

      render(<SettingsPage />);

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Update failed")).toBeInTheDocument();
      });
    });

    it("shows loading state during submission", async () => {
      mockAuthService.updateProfile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<SettingsPage />);

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      fireEvent.click(submitButton);

      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    });
  });

  describe("Account Actions", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isAuthenticated: true,
      });
    });

    it("navigates to addresses page", () => {
      render(<SettingsPage />);

      const addressesButton = screen.getByRole("button", {
        name: /manage addresses/i,
      });
      fireEvent.click(addressesButton);

      expect(mockPush).toHaveBeenCalledWith("/user/addresses");
    });

    it("navigates to logout page", () => {
      render(<SettingsPage />);

      const logoutButton = screen.getByRole("button", { name: /log out/i });
      fireEvent.click(logoutButton);

      expect(mockPush).toHaveBeenCalledWith("/logout");
    });
  });
});
