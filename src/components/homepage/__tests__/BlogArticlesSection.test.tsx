import { render, screen } from "@testing-library/react";
import { BlogArticlesSection } from "../BlogArticlesSection";

describe("BlogArticlesSection", () => {
  // ====================================
  // Rendering
  // ====================================
  describe("Rendering", () => {
    it("renders the section", () => {
      render(<BlogArticlesSection />);
      expect(screen.getByText("From Our Blog")).toBeInTheDocument();
    });

    it("renders the heading as h2", () => {
      render(<BlogArticlesSection />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("From Our Blog");
    });

    it("renders the subtitle", () => {
      render(<BlogArticlesSection />);
      expect(
        screen.getByText("Tips, guides, and stories from our community"),
      ).toBeInTheDocument();
    });

    it("renders as a section element", () => {
      const { container } = render(<BlogArticlesSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });

  // ====================================
  // Article Cards
  // ====================================
  describe("Article Cards", () => {
    it("renders all 4 article titles", () => {
      render(<BlogArticlesSection />);
      expect(
        screen.getByText("10 Tips for Finding Rare Collectibles"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("How to Authenticate Original Products"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Auction Strategies That Actually Work"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Seller Spotlight: Success Stories"),
      ).toBeInTheDocument();
    });

    it("renders all 4 article excerpts", () => {
      render(<BlogArticlesSection />);
      expect(
        screen.getByText(/Discover expert strategies/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Learn the key signs to verify/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Master the art of winning auctions/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Meet sellers who turned their passion/),
      ).toBeInTheDocument();
    });

    it("renders article category badges", () => {
      render(<BlogArticlesSection />);
      expect(screen.getByText("Collecting")).toBeInTheDocument();
      expect(screen.getByText("Guides")).toBeInTheDocument();
      expect(screen.getByText("Auctions")).toBeInTheDocument();
      expect(screen.getByText("Community")).toBeInTheDocument();
    });

    it("renders article read times", () => {
      render(<BlogArticlesSection />);
      expect(screen.getByText("5 min")).toBeInTheDocument();
      expect(screen.getByText("7 min")).toBeInTheDocument();
      expect(screen.getByText("6 min")).toBeInTheDocument();
      expect(screen.getByText("4 min")).toBeInTheDocument();
    });

    it("renders article headings as h3", () => {
      render(<BlogArticlesSection />);
      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings).toHaveLength(4);
    });
  });

  // ====================================
  // Article Images
  // ====================================
  describe("Article Images", () => {
    it("renders article thumbnails with correct alt text", () => {
      render(<BlogArticlesSection />);
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(4);
      expect(images[0]).toHaveAttribute(
        "alt",
        "10 Tips for Finding Rare Collectibles",
      );
      expect(images[1]).toHaveAttribute(
        "alt",
        "How to Authenticate Original Products",
      );
      expect(images[2]).toHaveAttribute(
        "alt",
        "Auction Strategies That Actually Work",
      );
      expect(images[3]).toHaveAttribute(
        "alt",
        "Seller Spotlight: Success Stories",
      );
    });

    it("renders images with lazy loading", () => {
      render(<BlogArticlesSection />);
      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("loading", "lazy");
      });
    });
  });

  // ====================================
  // Date Formatting
  // ====================================
  describe("Date Formatting", () => {
    it('formats dates in "Month Day, Year" format', () => {
      render(<BlogArticlesSection />);
      expect(screen.getByText("Feb 5, 2026")).toBeInTheDocument();
      expect(screen.getByText("Feb 3, 2026")).toBeInTheDocument();
      expect(screen.getByText("Feb 1, 2026")).toBeInTheDocument();
      expect(screen.getByText("Jan 28, 2026")).toBeInTheDocument();
    });
  });

  // ====================================
  // View All Button
  // ====================================
  describe("View All Button", () => {
    it('renders "View All Articles →" buttons', () => {
      render(<BlogArticlesSection />);
      const viewAllButtons = screen.getAllByText("View All Articles →");
      expect(viewAllButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ====================================
  // Article Interaction
  // ====================================
  describe("Article Interaction", () => {
    it("renders article cards as clickable buttons", () => {
      render(<BlogArticlesSection />);
      const buttons = screen.getAllByRole("button");
      // 4 article cards + at least 1 "View All" button
      expect(buttons.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("uses proper heading hierarchy (h2 for section, h3 for articles)", () => {
      render(<BlogArticlesSection />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
    });

    it("all article titles are visible", () => {
      render(<BlogArticlesSection />);
      expect(
        screen.getByText("10 Tips for Finding Rare Collectibles"),
      ).toBeVisible();
      expect(
        screen.getByText("Auction Strategies That Actually Work"),
      ).toBeVisible();
    });

    it("images have descriptive alt text", () => {
      render(<BlogArticlesSection />);
      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });
  });
});
