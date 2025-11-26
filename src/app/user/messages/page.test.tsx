import React from "react";
import { render, screen } from "@testing-library/react";
import MessagesPage from "./page";

describe("MessagesPage", () => {
  describe("Basic Rendering", () => {
    it("should render page title", () => {
      render(<MessagesPage />);
      expect(screen.getByText("My Messages")).toBeInTheDocument();
    });

    it("should render main element with correct id", () => {
      render(<MessagesPage />);
      expect(screen.getByRole("main")).toHaveAttribute(
        "id",
        "user-messages-page"
      );
    });

    it("should render container with proper classes", () => {
      render(<MessagesPage />);
      const main = screen.getByRole("main");
      expect(main).toHaveClass("container", "mx-auto", "px-4", "py-8");
    });
  });

  describe("Empty State", () => {
    it("should display no messages text", () => {
      render(<MessagesPage />);
      expect(screen.getByText("No messages")).toBeInTheDocument();
    });

    it("should render empty state in white card", () => {
      render(<MessagesPage />);
      const card = screen.getByText("No messages").parentElement;
      expect(card).toHaveClass("bg-white", "rounded-lg", "border");
    });

    it("should center empty state text", () => {
      render(<MessagesPage />);
      const card = screen.getByText("No messages").parentElement;
      expect(card).toHaveClass("text-center");
    });

    it("should apply proper padding to empty state", () => {
      render(<MessagesPage />);
      const card = screen.getByText("No messages").parentElement;
      expect(card).toHaveClass("p-8");
    });
  });

  describe("Typography", () => {
    it("should render title with correct styles", () => {
      render(<MessagesPage />);
      const title = screen.getByText("My Messages");
      expect(title).toHaveClass(
        "text-3xl",
        "font-bold",
        "text-gray-800",
        "mb-6"
      );
    });

    it("should render empty message with gray color", () => {
      render(<MessagesPage />);
      const message = screen.getByText("No messages");
      expect(message).toHaveClass("text-gray-600");
    });
  });

  describe("Layout & Structure", () => {
    it("should render as main element", () => {
      render(<MessagesPage />);
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should contain single heading", () => {
      render(<MessagesPage />);
      const headings = screen.getAllByRole("heading");
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent("My Messages");
    });

    it("should have proper page structure", () => {
      const { container } = render(<MessagesPage />);
      expect(container.querySelector("main > h1")).toBeInTheDocument();
      expect(container.querySelector("main > div")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have main landmark", () => {
      render(<MessagesPage />);
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      render(<MessagesPage />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("My Messages");
    });

    it("should be navigable by screen readers", () => {
      const { container } = render(<MessagesPage />);
      expect(
        container.querySelector("main#user-messages-page")
      ).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should apply responsive container", () => {
      render(<MessagesPage />);
      const main = screen.getByRole("main");
      expect(main).toHaveClass("container", "mx-auto");
    });

    it("should have responsive padding", () => {
      render(<MessagesPage />);
      const main = screen.getByRole("main");
      expect(main).toHaveClass("px-4", "py-8");
    });
  });

  describe("Snapshot Testing", () => {
    it("should match snapshot", () => {
      const { container } = render(<MessagesPage />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
