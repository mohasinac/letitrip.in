import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileAdminSidebar } from "./MobileAdminSidebar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/admin"),
}));

describe("MobileAdminSidebar", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    document.body.style.overflow = "";
  });

  it("renders nothing when closed", () => {
    render(<MobileAdminSidebar isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders sidebar when open", () => {
    render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("renders main navigation items", () => {
    render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Content Management")).toBeInTheDocument();
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  it("expands section when clicked", async () => {
    render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);

    // Content Management is a collapsible section
    await userEvent.click(screen.getByText("Content Management"));

    // Should now show child items
    expect(screen.getByText("Homepage Settings")).toBeInTheDocument();
    expect(screen.getByText("Hero Slides")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);

    await userEvent.click(screen.getByRole("button", { name: /close menu/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", async () => {
    render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);

    const overlay = document.querySelector('[aria-hidden="true"]');
    if (overlay) {
      await userEvent.click(overlay);
    }
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll when open", () => {
    render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(
      <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<MobileAdminSidebar isOpen={false} onClose={mockOnClose} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("renders back to site link", () => {
    render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText("Back to Site")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);

    const sidebar = screen.getByRole("dialog");
    expect(sidebar).toHaveAttribute("aria-modal", "true");
    expect(sidebar).toHaveAttribute("aria-label", "Admin navigation");
  });
});
