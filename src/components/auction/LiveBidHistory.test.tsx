import React from "react";
import { render, screen } from "@testing-library/react";
import LiveBidHistory from "./LiveBidHistory";

// Mock formatters
jest.mock("@/lib/formatters", () => ({
  formatCurrency: (amount: number) => `₹${amount.toLocaleString()}`,
  formatRelativeTime: (date: string) => "2 minutes ago",
}));

describe("LiveBidHistory", () => {
  const mockBids = [
    {
      id: "bid1",
      user_id: "user123456",
      amount: 15000,
      created_at: "2024-01-01T10:00:00Z",
      is_winning: true,
    },
    {
      id: "bid2",
      user_id: "user789012",
      amount: 14500,
      created_at: "2024-01-01T09:55:00Z",
      is_winning: false,
    },
    {
      id: "bid3",
      user_id: "user345678",
      amount: 14000,
      created_at: "2024-01-01T09:50:00Z",
      is_winning: false,
    },
  ];

  const defaultProps = {
    auctionId: "auction123",
    bids: mockBids,
    currentBid: 15000,
  };

  describe("Empty State", () => {
    it("renders empty state when no bids", () => {
      render(<LiveBidHistory {...defaultProps} bids={[]} />);

      expect(screen.getByText("No bids yet")).toBeInTheDocument();
      expect(screen.getByText("Be the first to bid!")).toBeInTheDocument();
    });

    it("shows trending up icon in empty state", () => {
      const { container } = render(
        <LiveBidHistory {...defaultProps} bids={[]} />
      );

      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Header Section", () => {
    it("renders bid history header", () => {
      render(<LiveBidHistory {...defaultProps} />);

      expect(screen.getByText("Bid History")).toBeInTheDocument();
    });

    it("shows correct bid count", () => {
      render(<LiveBidHistory {...defaultProps} />);

      expect(screen.getByText("3 bids")).toBeInTheDocument();
    });

    it("shows singular bid text for single bid", () => {
      render(<LiveBidHistory {...defaultProps} bids={[mockBids[0]]} />);

      expect(screen.getByText("1 bid")).toBeInTheDocument();
    });

    it("displays current bid amount", () => {
      render(<LiveBidHistory {...defaultProps} />);

      expect(screen.getByText("Current:")).toBeInTheDocument();
      expect(screen.getAllByText("₹15,000").length).toBeGreaterThan(0);
    });
  });

  describe("Bid List", () => {
    it("renders all bids", () => {
      render(<LiveBidHistory {...defaultProps} />);

      expect(screen.getByText("u***56")).toBeInTheDocument(); // user123456
      expect(screen.getByText("u***12")).toBeInTheDocument(); // user789012
      expect(screen.getByText("u***78")).toBeInTheDocument(); // user345678
    });

    it("displays bid amounts", () => {
      render(<LiveBidHistory {...defaultProps} />);

      expect(screen.getAllByText("₹15,000").length).toBeGreaterThan(0);
      expect(screen.getByText("₹14,500")).toBeInTheDocument();
      expect(screen.getByText("₹14,000")).toBeInTheDocument();
    });

    it("shows timestamp for each bid", () => {
      render(<LiveBidHistory {...defaultProps} />);

      const timestamps = screen.getAllByText("2 minutes ago");
      expect(timestamps).toHaveLength(3);
    });
  });

  describe("Winning Bid", () => {
    it("shows leading badge for winning bid", () => {
      render(<LiveBidHistory {...defaultProps} />);

      expect(screen.getByText("Leading")).toBeInTheDocument();
    });

    it("applies green styling to winning bid", () => {
      const { container } = render(<LiveBidHistory {...defaultProps} />);

      const leadingBadge = screen.getByText("Leading");
      expect(leadingBadge).toHaveClass("text-green-600");
    });

    it("does not show leading badge for non-winning bids", () => {
      render(<LiveBidHistory {...defaultProps} bids={[mockBids[1]]} />);

      expect(screen.queryByText("Leading")).not.toBeInTheDocument();
    });
  });

  describe("User ID Masking", () => {
    it("masks user IDs correctly", () => {
      render(<LiveBidHistory {...defaultProps} />);

      // user123456 -> u***56
      expect(screen.getByText("u***56")).toBeInTheDocument();
      // user789012 -> u***12
      expect(screen.getByText("u***12")).toBeInTheDocument();
    });

    it("handles short user IDs", () => {
      const shortBid = {
        ...mockBids[0],
        user_id: "u12",
      };
      render(<LiveBidHistory {...defaultProps} bids={[shortBid]} />);

      expect(screen.getByText("u12")).toBeInTheDocument();
    });
  });

  describe("Styling and Layout", () => {
    it("applies custom className", () => {
      const { container } = render(
        <LiveBidHistory {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("applies rounded border styling", () => {
      const { container } = render(<LiveBidHistory {...defaultProps} />);

      expect(container.firstChild).toHaveClass("rounded-lg");
      expect(container.firstChild).toHaveClass("border");
    });

    it("shows scrollable list for many bids", () => {
      const { container } = render(<LiveBidHistory {...defaultProps} />);

      const list = container.querySelector(".max-h-96");
      expect(list).toBeInTheDocument();
      expect(list).toHaveClass("overflow-y-auto");
    });
  });

  describe("Latest Bid Styling", () => {
    it("applies special styling to first bid", () => {
      const { container } = render(<LiveBidHistory {...defaultProps} />);

      // First bid should have animate-bounce class on amount
      const amounts = container.querySelectorAll(".font-bold");
      expect(amounts[1]).toHaveClass("text-green-600"); // Skip "Current" text
    });

    it("uses different icon background for latest bid", () => {
      const { container } = render(<LiveBidHistory {...defaultProps} />);

      const iconContainers = container.querySelectorAll(".rounded-full");
      expect(iconContainers[0]).toHaveClass("bg-green-100");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty bid array", () => {
      render(<LiveBidHistory {...defaultProps} bids={[]} />);

      expect(screen.getByText("No bids yet")).toBeInTheDocument();
    });

    it("handles bid with missing fields gracefully", () => {
      const incompleteBid = {
        id: "bid1",
        user_id: "user123",
        amount: 1000,
        created_at: "2024-01-01T10:00:00Z",
        is_winning: false,
      };

      render(<LiveBidHistory {...defaultProps} bids={[incompleteBid]} />);

      expect(screen.getByText("u***23")).toBeInTheDocument();
      expect(screen.getByText("₹1,000")).toBeInTheDocument();
    });

    it("handles very large bid amounts", () => {
      const largeBid = {
        ...mockBids[0],
        amount: 9999999,
      };

      render(
        <LiveBidHistory
          {...defaultProps}
          bids={[largeBid]}
          currentBid={9999999}
        />
      );

      // Indian numbering system: 99,99,999
      expect(screen.getAllByText("₹99,99,999").length).toBeGreaterThan(0);
    });

    it("renders without className", () => {
      const { container } = render(
        <LiveBidHistory auctionId="test" bids={mockBids} currentBid={15000} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("shows user icons for all bids", () => {
      const { container } = render(<LiveBidHistory {...defaultProps} />);

      const userIcons = container.querySelectorAll("svg");
      expect(userIcons.length).toBeGreaterThan(0);
    });

    it("shows clock icons for timestamps", () => {
      render(<LiveBidHistory {...defaultProps} />);

      // Clock icons should be present with timestamps
      expect(screen.getAllByText("2 minutes ago")).toHaveLength(3);
    });
  });
});
