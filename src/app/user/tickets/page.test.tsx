import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserTicketsPage from "./page";
import { supportService } from "@/services/support.service";
import type { SupportTicketFE } from "@/types/frontend/support-ticket.types";

// Mock dependencies
jest.mock("@/services/support.service", () => ({
  supportService: {
    listTickets: jest.fn(),
  },
}));

jest.mock("@/components/auth/AuthGuard", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockTickets = [
  {
    id: "ticket1",
    userId: "user123",
    subject: "Order delivery issue",
    description: "My order hasn't arrived yet",
    category: "order-issue",
    status: "open",
    priority: "high",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "ticket2",
    userId: "user123",
    subject: "Product question",
    description: "What is the warranty period?",
    category: "product-question",
    status: "resolved",
    priority: "normal",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "ticket3",
    userId: "user123",
    subject: "Refund request",
    description: "I want to return my purchase",
    category: "return-refund",
    status: "in-progress",
    priority: "urgent",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-21"),
  },
] as any as SupportTicketFE[];

describe("UserTicketsPage", () => {
  const mockListTickets = supportService.listTickets as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockListTickets.mockResolvedValue({
      data: mockTickets,
      pagination: {
        hasNextPage: false,
        totalCount: 3,
      },
    });
  });

  describe("Basic Rendering", () => {
    it("should render page title", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      });
    });

    it("should render Create New Ticket button", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("Create New Ticket")).toBeInTheDocument();
      });
    });

    it("should link to ticket creation page", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const link = screen.getByText("Create New Ticket").closest("a");
        expect(link).toHaveAttribute("href", "/support/ticket");
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner initially", () => {
      mockListTickets.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: [], pagination: {} }), 100)
          )
      );
      render(<UserTicketsPage />);
      expect(screen.getByText("Loading tickets...")).toBeInTheDocument();
    });

    it("should show spinner animation", () => {
      mockListTickets.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: [], pagination: {} }), 100)
          )
      );
      render(<UserTicketsPage />);
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("should hide loading after data loads", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(
          screen.queryByText("Loading tickets...")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Tickets List", () => {
    it("should display all tickets", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("Order delivery issue")).toBeInTheDocument();
        expect(screen.getByText("Product question")).toBeInTheDocument();
        expect(screen.getByText("Refund request")).toBeInTheDocument();
      });
    });

    it("should display ticket descriptions", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(
          screen.getByText("My order hasn't arrived yet")
        ).toBeInTheDocument();
        expect(
          screen.getByText("What is the warranty period?")
        ).toBeInTheDocument();
      });
    });

    it("should display ticket creation dates", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("1/15/2024")).toBeInTheDocument();
        expect(screen.getByText("1/10/2024")).toBeInTheDocument();
        expect(screen.getByText("1/20/2024")).toBeInTheDocument();
      });
    });

    it("should make tickets clickable", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const ticketCard = screen
          .getByText("Order delivery issue")
          .closest("div");
        expect(ticketCard).toHaveClass("cursor-pointer");
      });
    });
  });

  describe("Status Badges", () => {
    it("should display open status badge", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("open")).toBeInTheDocument();
      });
    });

    it("should display resolved status badge", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("resolved")).toBeInTheDocument();
      });
    });

    it("should display in-progress status badge", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("in-progress")).toBeInTheDocument();
      });
    });

    it("should apply correct colors to status badges", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const openBadge = screen.getByText("open");
        expect(openBadge).toHaveClass("bg-blue-100", "text-blue-800");
      });
    });
  });

  describe("Category Labels", () => {
    it("should display category labels", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("Order Issue")).toBeInTheDocument();
        expect(screen.getByText("Product Question")).toBeInTheDocument();
        expect(screen.getByText("Return/Refund")).toBeInTheDocument();
      });
    });

    it("should apply styling to category badges", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const categoryBadge = screen.getByText("Order Issue");
        expect(categoryBadge).toHaveClass("bg-gray-100");
      });
    });
  });

  describe("Priority Badges", () => {
    it("should display urgent priority badge", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("Urgent")).toBeInTheDocument();
      });
    });

    it("should display high priority badge", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("High")).toBeInTheDocument();
      });
    });

    it("should apply correct colors to priority badges", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const urgentBadge = screen.getByText("Urgent");
        expect(urgentBadge).toHaveClass("bg-red-100", "text-red-800");
      });
    });

    it("should not show priority badge for normal priority", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const normalBadges = screen.queryAllByText("Normal");
        expect(normalBadges).toHaveLength(0);
      });
    });
  });

  describe("Filter by Status", () => {
    it("should render status filter dropdown", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("Filter by Status")).toBeInTheDocument();
      });
    });

    it("should have all status options", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const select = screen.getByLabelText("Filter by Status");
        expect(
          within(select as HTMLElement).getByText("All Statuses")
        ).toBeInTheDocument();
        expect(
          within(select as HTMLElement).getByText("Open")
        ).toBeInTheDocument();
        expect(
          within(select as HTMLElement).getByText("Resolved")
        ).toBeInTheDocument();
      });
    });

    it("should filter tickets by status", async () => {
      const user = userEvent.setup();
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      });

      mockListTickets.mockClear();
      const select = screen.getByLabelText("Filter by Status");
      await user.selectOptions(select, "open");

      await waitFor(() => {
        expect(mockListTickets).toHaveBeenCalledWith(
          expect.objectContaining({ status: "open" })
        );
      });
    });
  });

  describe("Filter by Category", () => {
    it("should render category filter dropdown", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("Filter by Category")).toBeInTheDocument();
      });
    });

    it("should have all category options", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const select = screen.getByLabelText("Filter by Category");
        expect(
          within(select as HTMLElement).getByText("All Categories")
        ).toBeInTheDocument();
        expect(
          within(select as HTMLElement).getByText("Order Issue")
        ).toBeInTheDocument();
        expect(
          within(select as HTMLElement).getByText("Product Question")
        ).toBeInTheDocument();
      });
    });

    it("should filter tickets by category", async () => {
      const user = userEvent.setup();
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      });

      mockListTickets.mockClear();
      const select = screen.getByLabelText("Filter by Category");
      await user.selectOptions(select, "order-issue");

      await waitFor(() => {
        expect(mockListTickets).toHaveBeenCalledWith(
          expect.objectContaining({ category: "order-issue" })
        );
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no tickets", async () => {
      mockListTickets.mockResolvedValue({
        data: [],
        pagination: { hasNextPage: false },
      });
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(screen.getByText("No Support Tickets")).toBeInTheDocument();
      });
    });

    it("should show appropriate message for first time", async () => {
      mockListTickets.mockResolvedValue({
        data: [],
        pagination: { hasNextPage: false },
      });
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(
          screen.getByText("You haven't created any support tickets yet")
        ).toBeInTheDocument();
      });
    });

    it("should show create ticket button in empty state", async () => {
      mockListTickets.mockResolvedValue({
        data: [],
        pagination: { hasNextPage: false },
      });
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Create Your First Ticket")
        ).toBeInTheDocument();
      });
    });

    it("should show different message when filtered", async () => {
      const user = userEvent.setup();
      mockListTickets.mockResolvedValue({
        data: [],
        pagination: { hasNextPage: false },
      });
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      });

      const select = screen.getByLabelText("Filter by Status");
      await user.selectOptions(select, "open");

      await waitFor(() => {
        expect(
          screen.getByText("No tickets match your filters")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Pagination", () => {
    it("should show pagination controls when tickets exist", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText("Previous")).toBeInTheDocument();
        expect(screen.getByText("Next")).toBeInTheDocument();
      });
    });

    it("should display current page number", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText(/Page 1/)).toBeInTheDocument();
      });
    });

    it("should display ticket count", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(screen.getByText(/3 tickets/)).toBeInTheDocument();
      });
    });

    it("should disable Previous button on first page", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const prevButton = screen.getByText("Previous").closest("button");
        expect(prevButton).toBeDisabled();
      });
    });

    it("should disable Next button when no more pages", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const nextButton = screen.getByText("Next").closest("button");
        expect(nextButton).toBeDisabled();
      });
    });

    it("should enable Next button when hasNextPage is true", async () => {
      mockListTickets.mockResolvedValue({
        data: mockTickets,
        pagination: { hasNextPage: true, nextCursor: "cursor123" },
      });
      render(<UserTicketsPage />);

      await waitFor(() => {
        const nextButton = screen.getByText("Next").closest("button");
        expect(nextButton).not.toBeDisabled();
      });
    });

    it("should handle next page click", async () => {
      const user = userEvent.setup();
      mockListTickets.mockResolvedValue({
        data: mockTickets,
        pagination: { hasNextPage: true, nextCursor: "cursor123" },
      });
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      });

      const nextButton = screen.getByText("Next").closest("button");
      mockListTickets.mockClear();

      if (nextButton) {
        await user.click(nextButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/Page 2/)).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message", async () => {
      mockListTickets.mockRejectedValue(new Error("Failed to load"));
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load")).toBeInTheDocument();
      });
    });

    it("should log error to console", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockListTickets.mockRejectedValue(new Error("Network error"));
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error fetching tickets:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it("should show error in red banner", async () => {
      mockListTickets.mockRejectedValue(new Error("Failed to load"));
      render(<UserTicketsPage />);

      await waitFor(() => {
        const errorBanner = screen.getByText("Failed to load").closest("div");
        expect(errorBanner).toHaveClass("bg-red-50", "border-red-200");
      });
    });
  });

  describe("Styling & Layout", () => {
    it("should apply responsive layout", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const main = document.querySelector("main");
        expect(main).toHaveClass("container", "mx-auto");
      });
    });

    it("should apply hover effects to ticket cards", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const card = screen.getByText("Order delivery issue").closest("div");
        expect(card).toHaveClass("hover:shadow-md");
      });
    });

    it("should render chevron icon on tickets", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        const svgs = document.querySelectorAll("svg");
        expect(svgs.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Integration", () => {
    it("should call listTickets on mount", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(mockListTickets).toHaveBeenCalledTimes(1);
      });
    });

    it("should pass correct parameters to listTickets", async () => {
      render(<UserTicketsPage />);
      await waitFor(() => {
        expect(mockListTickets).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "",
            category: "",
            startAfter: null,
            limit: 20,
          })
        );
      });
    });

    it("should refetch on filter change", async () => {
      const user = userEvent.setup();
      render(<UserTicketsPage />);

      await waitFor(() => {
        expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      });

      mockListTickets.mockClear();
      const select = screen.getByLabelText("Filter by Status");
      await user.selectOptions(select, "open");

      await waitFor(() => {
        expect(mockListTickets).toHaveBeenCalledTimes(1);
      });
    });
  });
});
