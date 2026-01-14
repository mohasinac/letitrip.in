import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuctionStatus } from "../AuctionStatus";
import { DateDisplay } from "../DateDisplay";
import { Price } from "../Price";
import { Rating } from "../Rating";

describe("Value Display Components", () => {
  describe("Price", () => {
    it("should render price component", () => {
      const { container } = render(<Price amount={1000} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render with zero value", () => {
      const { container } = render(<Price amount={0} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("DateDisplay", () => {
    it("should render formatted date", () => {
      const date = new Date("2024-01-15");
      const { container } = render(<DateDisplay date={date} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle invalid date", () => {
      const { container } = render(<DateDisplay date={new Date("invalid")} />);
      expect(screen.getByText("N/A")).toBeInTheDocument();
    });
  });

  describe("AuctionStatus", () => {
    it("should render auction status", () => {
      render(<AuctionStatus status="active" />);
      expect(screen.getByText("Live")).toBeInTheDocument();
    });

    it("should render ended status", () => {
      render(<AuctionStatus status="ended" />);
      expect(screen.getByText("Ended")).toBeInTheDocument();
    });
  });

  describe("Rating", () => {
    it("should render rating with stars", () => {
      render(<Rating value={4} />);
      // Should have rating display
      expect(screen.getByText(/4/)).toBeInTheDocument();
    });
  });
});
