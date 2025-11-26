import React from "react";
import { render, screen } from "@testing-library/react";
import HistoryPage from "./page";

describe("HistoryPage", () => {
  describe("Basic Rendering", () => {
    it("should render page title", () => {
      render(<HistoryPage />);
      expect(screen.getByText("History")).toBeInTheDocument();
    });

    it("should render main element with correct id", () => {
      render(<HistoryPage />);
      expect(screen.getByRole("main")).toHaveAttribute(
        "id",
        "user-history-page"
      );
    });

    it("should render container with proper classes", () => {
      render(<HistoryPage />);
      const main = screen.getByRole("main");
      expect(main).toHaveClass("container", "mx-auto", "px-4", "py-8");
    });
  });

  describe("Empty State", () => {
    it("should display no history message", () => {
      render(<HistoryPage />);
      expect(screen.getByText("No history available")).toBeInTheDocument();
    });

    it("should render empty state in white card", () => {
      render(<HistoryPage />);
      const card = screen.getByText("No history available").parentElement;
      expect(card).toHaveClass("bg-white", "rounded-lg", "border");
    });

    it("should center empty state text", () => {
      render(<HistoryPage />);
      const card = screen.getByText("No history available").parentElement;
      expect(card).toHaveClass("text-center");
    });

    it("should apply proper padding to empty state", () => {
      render(<HistoryPage />);
      const card = screen.getByText("No history available").parentElement;
      expect(card).toHaveClass("p-8");
    });
  });

  describe("Typography", () => {
    it("should render title with correct styles", () => {
      render(<HistoryPage />);
      const title = screen.getByText("History");
      expect(title).toHaveClass(
        "text-3xl",
        "font-bold",
        "text-gray-800",
        "mb-6"
      );
    });

    it("should render empty message with gray color", () => {
      render(<HistoryPage />);
      const message = screen.getByText("No history available");
      expect(message).toHaveClass("text-gray-600");
    });
  });

  describe("Layout & Structure", () => {
    it("should render as main element", () => {
      render(<HistoryPage />);
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should contain single heading", () => {
      render(<HistoryPage />);
      const headings = screen.getAllByRole("heading");
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent("History");
    });

    it("should have proper page structure", () => {
      const { container } = render(<HistoryPage />);
      expect(container.querySelector("main > h1")).toBeInTheDocument();
      expect(container.querySelector("main > div")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have main landmark", () => {
      render(<HistoryPage />);
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      render(<HistoryPage />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("History");
    });

    it("should be navigable by screen readers", () => {
      const { container } = render(<HistoryPage />);
      expect(
        container.querySelector("main#user-history-page")
      ).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should apply responsive container", () => {
      render(<HistoryPage />);
      const main = screen.getByRole("main");
      expect(main).toHaveClass("container", "mx-auto");
    });

    it("should have responsive padding", () => {
      render(<HistoryPage />);
      const main = screen.getByRole("main");
      expect(main).toHaveClass("px-4", "py-8");
    });
  });

  describe("Snapshot Testing", () => {
    it("should match snapshot", () => {
      const { container } = render(<HistoryPage />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
