/**
 * Demo Seed Page Component Tests
 *
 * Tests:
 * - Component rendering
 * - Environment protection
 * - Collection selection
 * - Load/Delete actions
 * - Response display
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DemoSeedPage from "../page";

// Mock fetch
global.fetch = jest.fn();

describe("DemoSeedPage Component", () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: async () => ({
        success: true,
        message: "Success",
        details: { created: 10, updated: 5, errors: 0, collections: ["users"] },
      }),
    } as Response);
  });

  describe("Environment Protection", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
    });

    it("should show access denied in production", () => {
      (process.env as any).NODE_ENV = "production";

      render(<DemoSeedPage />);

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(
        screen.getByText(/only accessible in development mode/i),
      ).toBeInTheDocument();
    });

    it("should render full interface in development", () => {
      (process.env as any).NODE_ENV = "development";

      render(<DemoSeedPage />);

      expect(screen.getByText(/Seed Data Manager/i)).toBeInTheDocument();
      expect(screen.getByText(/Load All Seed Data/i)).toBeInTheDocument();
      expect(screen.getByText(/Delete All Seed Data/i)).toBeInTheDocument();
    });
  });

  describe("Rendering", () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = "development";
    });

    it("should render all collection checkboxes", () => {
      render(<DemoSeedPage />);

      expect(screen.getByLabelText("users")).toBeInTheDocument();
      expect(screen.getByLabelText("categories")).toBeInTheDocument();
      expect(screen.getByLabelText("products")).toBeInTheDocument();
      expect(screen.getByLabelText("orders")).toBeInTheDocument();
      expect(screen.getByLabelText("reviews")).toBeInTheDocument();
      expect(screen.getByLabelText("bids")).toBeInTheDocument();
      expect(screen.getByLabelText("coupons")).toBeInTheDocument();
      expect(screen.getByLabelText("carouselSlides")).toBeInTheDocument();
      expect(screen.getByLabelText("homepageSections")).toBeInTheDocument();
      expect(screen.getByLabelText("siteSettings")).toBeInTheDocument();
      expect(screen.getByLabelText("faqs")).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      render(<DemoSeedPage />);

      expect(
        screen.getByRole("button", { name: /Load All Seed Data/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Load Selected/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Delete All Seed Data/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Delete Selected/i }),
      ).toBeInTheDocument();
    });

    it("should render select/deselect all buttons", () => {
      render(<DemoSeedPage />);

      expect(
        screen.getAllByRole("button", { name: /\bSelect All\b/i })[0],
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: /\bDeselect All\b/i })[0],
      ).toBeInTheDocument();
    });
  });

  describe("Collection Selection", () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = "development";
    });

    it("should toggle individual collection selection", () => {
      render(<DemoSeedPage />);

      const usersCheckbox = screen.getByLabelText("users") as HTMLInputElement;

      expect(usersCheckbox.checked).toBe(false);

      fireEvent.click(usersCheckbox);
      expect(usersCheckbox.checked).toBe(true);

      fireEvent.click(usersCheckbox);
      expect(usersCheckbox.checked).toBe(false);
    });

    it("should select all collections", () => {
      render(<DemoSeedPage />);

      const [selectAllButton] = screen.getAllByRole("button", {
        name: /\bSelect All\b/i,
      });
      fireEvent.click(selectAllButton);

      const usersCheckbox = screen.getByLabelText("users") as HTMLInputElement;
      const categoriesCheckbox = screen.getByLabelText(
        "categories",
      ) as HTMLInputElement;

      expect(usersCheckbox.checked).toBe(true);
      expect(categoriesCheckbox.checked).toBe(true);
    });

    it("should deselect all collections", () => {
      render(<DemoSeedPage />);

      // First select all
      const [selectAllButton] = screen.getAllByRole("button", {
        name: /\bSelect All\b/i,
      });
      fireEvent.click(selectAllButton);

      // Then deselect all
      const [deselectAllButton] = screen.getAllByRole("button", {
        name: /\bDeselect All\b/i,
      });
      fireEvent.click(deselectAllButton);

      const usersCheckbox = screen.getByLabelText("users") as HTMLInputElement;
      expect(usersCheckbox.checked).toBe(false);
    });
  });

  describe("Load Actions", () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = "development";
      // Mock window.confirm
      global.confirm = jest.fn(() => true);
    });

    it("should load all seed data", async () => {
      render(<DemoSeedPage />);

      const loadAllButton = screen.getByRole("button", {
        name: /Load All Seed Data/i,
      });

      fireEvent.click(loadAllButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const [url, options] = mockFetch.mock.calls[0] ?? [];
        expect(url).toBe("/api/demo/seed");
        const body = JSON.parse((options as RequestInit)?.body as string);
        expect(body.action).toBe("load");
        expect(body.collections).toEqual(
          expect.arrayContaining(["users", "categories"]),
        );
      });
    });

    it("should load selected collections only", async () => {
      render(<DemoSeedPage />);

      // Select specific collections
      const usersCheckbox = screen.getByLabelText("users");
      const productsCheckbox = screen.getByLabelText("products");
      fireEvent.click(usersCheckbox);
      fireEvent.click(productsCheckbox);

      const loadSelectedButton = screen.getByRole("button", {
        name: /Load Selected/i,
      });

      fireEvent.click(loadSelectedButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const [url, options] = mockFetch.mock.calls[0] ?? [];
        expect(url).toBe("/api/demo/seed");
        const body = JSON.parse((options as RequestInit)?.body as string);
        expect(body.action).toBe("load");
        expect(body.collections).toEqual(["users", "products"]);
      });
    });

    it("should disable load selected when no collections selected", () => {
      render(<DemoSeedPage />);

      const loadSelectedButton = screen.getByRole("button", {
        name: /Load Selected/i,
      });

      expect(loadSelectedButton).toBeDisabled();
    });

    it("should show loading state during operation", async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  json: async () => ({ success: true, message: "Done" }),
                } as Response),
              100,
            ),
          ),
      );

      render(<DemoSeedPage />);

      const loadAllButton = screen.getByRole("button", {
        name: /Load All Seed Data/i,
      });

      fireEvent.click(loadAllButton);

      expect(
        screen.getAllByRole("button", { name: /Processing/i }).length,
      ).toBeGreaterThan(0);

      await waitFor(() => {
        expect(
          screen.queryAllByRole("button", { name: /Processing/i }).length,
        ).toBe(0);
      });
    });
  });

  describe("Delete Actions", () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = "development";
      global.confirm = jest.fn(() => true);
    });

    it("should require confirmation for delete all", async () => {
      global.confirm = jest.fn(() => false);

      render(<DemoSeedPage />);

      const deleteAllButton = screen.getByRole("button", {
        name: /Delete All Seed Data/i,
      });

      fireEvent.click(deleteAllButton);

      expect(global.confirm).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should delete all seed data after confirmation", async () => {
      global.confirm = jest.fn(() => true);

      render(<DemoSeedPage />);

      const deleteAllButton = screen.getByRole("button", {
        name: /Delete All Seed Data/i,
      });

      fireEvent.click(deleteAllButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const [url, options] = mockFetch.mock.calls[0] ?? [];
        expect(url).toBe("/api/demo/seed");
        const body = JSON.parse((options as RequestInit)?.body as string);
        expect(body.action).toBe("delete");
        expect(Array.isArray(body.collections)).toBe(true);
      });
    });

    it("should delete selected collections only", async () => {
      global.confirm = jest.fn(() => true);

      render(<DemoSeedPage />);

      // Select specific collections
      const usersCheckbox = screen.getByLabelText("users");
      fireEvent.click(usersCheckbox);

      const deleteSelectedButton = screen.getByRole("button", {
        name: /Delete Selected/i,
      });

      fireEvent.click(deleteSelectedButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const [url, options] = mockFetch.mock.calls[0] ?? [];
        expect(url).toBe("/api/demo/seed");
        const body = JSON.parse((options as RequestInit)?.body as string);
        expect(body.action).toBe("delete");
        expect(body.collections).toEqual(["users"]);
      });
    });

    it("should disable delete selected when no collections selected", () => {
      render(<DemoSeedPage />);

      const deleteSelectedButton = screen.getByRole("button", {
        name: /Delete Selected/i,
      });

      expect(deleteSelectedButton).toBeDisabled();
    });
  });

  describe("Response Display", () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = "development";
      global.confirm = jest.fn(() => true);
    });

    it("should display success message", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          success: true,
          message: "Successfully loaded seed data",
          details: {
            created: 100,
            updated: 50,
            errors: 0,
            collections: ["users", "products"],
          },
        }),
      } as Response);

      render(<DemoSeedPage />);

      const loadAllButton = screen.getByRole("button", {
        name: /Load All Seed Data/i,
      });
      fireEvent.click(loadAllButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Success/i, { selector: "strong" }),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Successfully loaded seed data/i),
        ).toBeInTheDocument();
      });
    });

    it("should display error message", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          success: false,
          message: "An error occurred",
        }),
      } as Response);

      render(<DemoSeedPage />);

      const loadAllButton = screen.getByRole("button", {
        name: /Load All Seed Data/i,
      });
      fireEvent.click(loadAllButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Error/i, { selector: "strong" }),
        ).toBeInTheDocument();
        expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
      });
    });

    it("should display operation details", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          success: true,
          message: "Success",
          details: {
            created: 100,
            updated: 50,
            errors: 2,
            collections: ["users", "products"],
          },
        }),
      } as Response);

      render(<DemoSeedPage />);

      const loadAllButton = screen.getByRole("button", {
        name: /Load All Seed Data/i,
      });
      fireEvent.click(loadAllButton);

      await waitFor(() => {
        expect(
          screen.getAllByText((_, element) => {
            const text = element?.textContent ?? "";
            return text.includes("Created") && text.includes("100");
          }).length,
        ).toBeGreaterThan(0);
        expect(
          screen.getAllByText((_, element) => {
            const text = element?.textContent ?? "";
            return text.includes("Updated") && text.includes("50");
          }).length,
        ).toBeGreaterThan(0);
        expect(
          screen.getAllByText((_, element) => {
            const text = element?.textContent ?? "";
            return text.includes("Errors") && text.includes("2");
          }).length,
        ).toBeGreaterThan(0);
      });
    });

    it("should display processed collections", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          success: true,
          message: "Success",
          details: {
            created: 10,
            updated: 0,
            errors: 0,
            collections: ["users", "products", "categories"],
          },
        }),
      } as Response);

      render(<DemoSeedPage />);

      const loadAllButton = screen.getByRole("button", {
        name: /Load All Seed Data/i,
      });
      fireEvent.click(loadAllButton);

      await waitFor(() => {
        expect(screen.getByText("users")).toBeInTheDocument();
        expect(screen.getByText("products")).toBeInTheDocument();
        expect(screen.getByText("categories")).toBeInTheDocument();
      });
    });

    it("should display skipped count for delete operations", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          success: true,
          message: "Deleted 100 documents, skipped 50 (not found)",
          details: {
            deleted: 100,
            skipped: 50,
            errors: 0,
            collections: ["users"],
          },
        }),
      } as Response);

      render(<DemoSeedPage />);

      const deleteAllButton = screen.getByRole("button", {
        name: /Delete All Seed Data/i,
      });
      fireEvent.click(deleteAllButton);

      await waitFor(() => {
        expect(screen.getByText(/Deleted.*100/i)).toBeInTheDocument();
        expect(screen.getByText(/Skipped.*50/i)).toBeInTheDocument();
      });
    });

    it("should hide updated/skipped counts when zero", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          success: true,
          message: "Success",
          details: {
            created: 100,
            updated: 0,
            skipped: 0,
            errors: 0,
            collections: ["users"],
          },
        }),
      } as Response);

      render(<DemoSeedPage />);

      const loadAllButton = screen.getByRole("button", {
        name: /Load All Seed Data/i,
      });
      fireEvent.click(loadAllButton);

      await waitFor(() => {
        expect(
          screen.getAllByText((_, element) => {
            const text = element?.textContent ?? "";
            return text.includes("Created") && text.includes("100");
          }).length,
        ).toBeGreaterThan(0);
        expect(screen.queryByText(/Updated/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Skipped/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = "development";
      global.confirm = jest.fn(() => true);
    });

    it("should handle fetch errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<DemoSeedPage />);

      const loadAllButton = screen.getByRole("button", {
        name: /Load All Seed Data/i,
      });
      fireEvent.click(loadAllButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Error/i, { selector: "strong" }),
        ).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it("should handle non-JSON responses", async () => {
      mockFetch.mockResolvedValue({
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as unknown as Response);

      render(<DemoSeedPage />);

      const loadAllButton = screen.getByRole("button", {
        name: /Load All Seed Data/i,
      });
      fireEvent.click(loadAllButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Error/i, { selector: "strong" }),
        ).toBeInTheDocument();
      });
    });
  });
});
