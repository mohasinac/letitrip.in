import React from "react";
import { render, screen } from "@testing-library/react";
import { DemoSeedView } from "../DemoSeedView";

// Mock the demoService to avoid API calls
jest.mock("@/services", () => ({
  demoService: {
    seed: jest.fn().mockResolvedValue({ success: true, message: "Done" }),
  },
}));

// Mock components used inside DemoSeedView
jest.mock("@/components", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  Badge: ({ children }: any) => <span>{children}</span>,
  Spinner: () => <span>Loading...</span>,
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div role="dialog">Confirm</div> : null,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
    },
  },
}));

describe("DemoSeedView", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      configurable: true,
    });
  });

  it("renders the Seed Data Manager heading in development mode", () => {
    render(<DemoSeedView />);
    expect(screen.getByText("Seed Data Manager")).toBeInTheDocument();
  });

  it("shows Access Denied when not in development mode", () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });
    render(<DemoSeedView />);
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("renders collection group headers", () => {
    render(<DemoSeedView />);
    expect(screen.getByText("Auth & Users")).toBeInTheDocument();
    expect(screen.getByText("Commerce")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Configuration")).toBeInTheDocument();
  });

  it("renders Select all and Clear buttons", () => {
    render(<DemoSeedView />);
    expect(screen.getByText("Select all")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });
});
