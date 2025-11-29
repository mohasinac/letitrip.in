import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileSellerSidebar } from "./MobileSellerSidebar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/seller"),
}));

describe("MobileSellerSidebar", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    document.body.style.overflow = "";
  });

  it("renders nothing when closed", () => {
    render(<MobileSellerSidebar isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders sidebar when open", () => {
    render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Seller Hub")).toBeInTheDocument();
  });

  it("renders main navigation items", () => {
    render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("My Shops")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("renders quick action buttons", () => {
    render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);

    // Quick action buttons are in the header area
    const addProductLinks = screen.getAllByRole("link", {
      name: /add product/i,
    });
    expect(addProductLinks.length).toBeGreaterThan(0);
    // "Auction" is the quick action button label
    const auctionButtons = screen.getAllByRole("link", { name: /auction/i });
    expect(auctionButtons.length).toBeGreaterThan(0);
  });

  it("expands section when clicked", async () => {
    render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);

    // Products has children
    await userEvent.click(screen.getByText("Products"));

    // Should show child items - "All Products" is unique to the expanded section
    expect(screen.getByText("All Products")).toBeInTheDocument();
    // "Add Product" appears both in quick actions and expanded section
    const addProductItems = screen.getAllByText("Add Product");
    expect(addProductItems.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onClose when close button is clicked", async () => {
    render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);

    await userEvent.click(screen.getByRole("button", { name: /close menu/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", async () => {
    render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);

    const overlay = document.querySelector('[aria-hidden="true"]');
    if (overlay) {
      await userEvent.click(overlay);
    }
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll when open", () => {
    render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(
      <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<MobileSellerSidebar isOpen={false} onClose={mockOnClose} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("renders back to site link", () => {
    render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText("Back to Site")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);

    const sidebar = screen.getByRole("dialog");
    expect(sidebar).toHaveAttribute("aria-modal", "true");
    expect(sidebar).toHaveAttribute("aria-label", "Seller navigation");
  });
});
