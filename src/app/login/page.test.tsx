/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./page";

// Mock the AuthContext
const mockLogin = jest.fn();
const mockAuthContextValue = {
  user: null,
  isAuthenticated: false,
  login: mockLogin,
  logout: jest.fn(),
  register: jest.fn(),
  loading: false,
};

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthContextValue,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    mockLogin.mockResolvedValueOnce({});

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("shows error on login failure", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("validates required fields", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // HTML5 validation should prevent submission
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
