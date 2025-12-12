import type { ShopFE } from "@/types/frontend/shop.types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShopAbout } from "../ShopAbout";

const mockShop: ShopFE = {
  id: "shop123",
  slug: "test-shop",
  name: "Test Shop",
  description: "This is a detailed shop description\nwith multiple lines",
  email: "contact@testshop.com",
  phone: "+919876543210",
  website: "https://www.testshop.com",
  city: "Mumbai",
  state: "Maharashtra",
  address: "123 Main Street, Andheri",
  createdAt: new Date("2020-06-15").toISOString(),
  policies: {
    returnPolicy: "30-day return policy for all items",
    shippingPolicy: "Free shipping on orders above ₹500",
  },
  logo: "https://example.com/logo.jpg",
  rating: 4.5,
  reviewCount: 100,
  productCount: 50,
  isVerified: true,
  updatedAt: new Date("2023-01-15").toISOString(),
  ownerId: "owner123",
  categories: [],
  status: "active",
};

describe("ShopAbout", () => {
  describe("Rendering", () => {
    it("renders About This Shop heading", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(
        screen.getByRole("heading", { name: "About This Shop" })
      ).toBeInTheDocument();
    });

    it("renders shop description", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(
        screen.getByText(/This is a detailed shop description/)
      ).toBeInTheDocument();
    });

    it("renders multiline description with whitespace preserved", () => {
      const { container } = render(<ShopAbout shop={mockShop} />);
      const description = container.querySelector(".whitespace-pre-wrap");
      expect(description).toBeInTheDocument();
      expect(description?.textContent).toContain("with multiple lines");
    });

    it("renders fallback text when description is missing", () => {
      const shopWithoutDescription = { ...mockShop, description: undefined };
      render(<ShopAbout shop={shopWithoutDescription} />);
      expect(screen.getByText("No description available.")).toBeInTheDocument();
    });

    it("renders establishment date when createdAt is provided", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(screen.getByText(/Established:/)).toBeInTheDocument();
      expect(screen.getByText(/June.*2020/)).toBeInTheDocument();
    });

    it("does not render establishment date when createdAt is missing", () => {
      const shopWithoutDate = { ...mockShop, createdAt: undefined };
      render(<ShopAbout shop={shopWithoutDate} />);
      expect(screen.queryByText(/Established:/)).not.toBeInTheDocument();
    });
  });

  describe("Location Section", () => {
    it("renders Location heading when location info is available", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(
        screen.getByRole("heading", { name: "Location" })
      ).toBeInTheDocument();
    });

    it("renders city and state", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(screen.getByText("Mumbai, Maharashtra")).toBeInTheDocument();
    });

    it("renders full address as secondary text", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(screen.getByText("123 Main Street, Andheri")).toBeInTheDocument();
    });

    it("renders only city when state is missing", () => {
      const shopWithCityOnly = { ...mockShop, state: undefined };
      render(<ShopAbout shop={shopWithCityOnly} />);
      expect(screen.getByText("Mumbai")).toBeInTheDocument();
    });

    it("does not render location section when city and address are missing", () => {
      const shopWithoutLocation = {
        ...mockShop,
        city: undefined,
        address: undefined,
      };
      render(<ShopAbout shop={shopWithoutLocation} />);
      expect(
        screen.queryByRole("heading", { name: "Location" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Contact Methods", () => {
    it("renders Contact Shop heading when contact methods are available", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(
        screen.getByRole("heading", { name: "Contact Shop" })
      ).toBeInTheDocument();
    });

    it("renders email contact method", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("contact@testshop.com")).toBeInTheDocument();
    });

    it("renders phone contact method", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(screen.getByText("Call")).toBeInTheDocument();
      expect(screen.getByText("+919876543210")).toBeInTheDocument();
    });

    it("renders website contact method", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(screen.getByText("Website")).toBeInTheDocument();
      expect(screen.getByText("https://www.testshop.com")).toBeInTheDocument();
    });

    it("renders email as mailto link", () => {
      render(<ShopAbout shop={mockShop} />);
      const emailLink = screen.getByRole("link", { name: /email/i });
      expect(emailLink).toHaveAttribute("href", "mailto:contact@testshop.com");
    });

    it("renders phone as tel link", () => {
      render(<ShopAbout shop={mockShop} />);
      const phoneLink = screen.getByRole("link", { name: /call/i });
      expect(phoneLink).toHaveAttribute("href", "tel:+919876543210");
    });

    it("renders website with target blank", () => {
      render(<ShopAbout shop={mockShop} />);
      const websiteLink = screen.getByRole("link", { name: /website/i });
      expect(websiteLink).toHaveAttribute("href", "https://www.testshop.com");
      expect(websiteLink).toHaveAttribute("target", "_blank");
      expect(websiteLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("does not render contact section when no contact methods are available", () => {
      const shopWithoutContact = {
        ...mockShop,
        email: undefined,
        phone: undefined,
        website: undefined,
      };
      render(<ShopAbout shop={shopWithoutContact} />);
      expect(
        screen.queryByRole("heading", { name: "Contact Shop" })
      ).not.toBeInTheDocument();
    });

    it("renders grid layout for multiple contact methods", () => {
      const { container } = render(<ShopAbout shop={mockShop} />);
      const grid = container.querySelector(".sm\\:grid-cols-3");
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Policies Accordion", () => {
    it("renders Shop Policies heading", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(
        screen.getByRole("heading", { name: "Shop Policies" })
      ).toBeInTheDocument();
    });

    it("renders Return Policy button", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(
        screen.getByRole("button", { name: /return policy/i })
      ).toBeInTheDocument();
    });

    it("renders Shipping Policy button", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(
        screen.getByRole("button", { name: /shipping policy/i })
      ).toBeInTheDocument();
    });

    it("shows Return Policy content by default", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(
        screen.getByText("30-day return policy for all items")
      ).toBeInTheDocument();
    });

    it("toggles policy content when clicking button", async () => {
      const user = userEvent.setup();
      render(<ShopAbout shop={mockShop} />);

      // Return policy is open by default
      expect(
        screen.getByText("30-day return policy for all items")
      ).toBeInTheDocument();

      // Click to close
      const returnButton = screen.getByRole("button", {
        name: /return policy/i,
      });
      await user.click(returnButton);

      // Should be closed
      expect(
        screen.queryByText("30-day return policy for all items")
      ).not.toBeInTheDocument();
    });

    it("opens shipping policy when clicked", async () => {
      const user = userEvent.setup();
      render(<ShopAbout shop={mockShop} />);

      const shippingButton = screen.getByRole("button", {
        name: /shipping policy/i,
      });
      await user.click(shippingButton);

      expect(
        screen.getByText("Free shipping on orders above ₹500")
      ).toBeInTheDocument();
    });

    it("closes other policies when opening a different one", async () => {
      const user = userEvent.setup();
      render(<ShopAbout shop={mockShop} />);

      // Return policy is open by default
      expect(
        screen.getByText("30-day return policy for all items")
      ).toBeInTheDocument();

      // Click shipping policy
      const shippingButton = screen.getByRole("button", {
        name: /shipping policy/i,
      });
      await user.click(shippingButton);

      // Return policy should be closed
      expect(
        screen.queryByText("30-day return policy for all items")
      ).not.toBeInTheDocument();
      // Shipping policy should be open
      expect(
        screen.getByText("Free shipping on orders above ₹500")
      ).toBeInTheDocument();
    });

    it("renders fallback text for missing return policy", () => {
      const shopWithoutPolicies = {
        ...mockShop,
        policies: undefined,
      };
      render(<ShopAbout shop={shopWithoutPolicies} />);
      expect(
        screen.getByText("No return policy specified.")
      ).toBeInTheDocument();
    });

    it("renders fallback text for missing shipping policy", async () => {
      const user = userEvent.setup();
      const shopWithoutPolicies = {
        ...mockShop,
        policies: undefined,
      };
      render(<ShopAbout shop={shopWithoutPolicies} />);

      const shippingButton = screen.getByRole("button", {
        name: /shipping policy/i,
      });
      await user.click(shippingButton);

      expect(
        screen.getByText("No shipping policy specified.")
      ).toBeInTheDocument();
    });

    it("shows chevron down when policy is closed", () => {
      render(<ShopAbout shop={mockShop} />);
      const shippingButton = screen.getByRole("button", {
        name: /shipping policy/i,
      });
      const chevronDown = shippingButton.querySelector(".lucide-chevron-down");
      expect(chevronDown).toBeInTheDocument();
    });

    it("shows chevron up when policy is open", () => {
      render(<ShopAbout shop={mockShop} />);
      const returnButton = screen.getByRole("button", {
        name: /return policy/i,
      });
      const chevronUp = returnButton.querySelector(".lucide-chevron-up");
      expect(chevronUp).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to containers", () => {
      const { container } = render(<ShopAbout shop={mockShop} />);
      const darkBg = container.querySelector(".dark\\:bg-gray-800");
      expect(darkBg).toBeInTheDocument();
    });

    it("applies dark mode classes to text elements", () => {
      const { container } = render(<ShopAbout shop={mockShop} />);
      const darkText = container.querySelector(".dark\\:text-gray-300");
      expect(darkText).toBeInTheDocument();
    });

    it("applies dark mode classes to borders", () => {
      const { container } = render(<ShopAbout shop={mockShop} />);
      const darkBorder = container.querySelector(".dark\\:border-gray-700");
      expect(darkBorder).toBeInTheDocument();
    });

    it("applies dark mode classes to headings", () => {
      render(<ShopAbout shop={mockShop} />);
      const heading = screen.getByRole("heading", { name: "About This Shop" });
      expect(heading.className).toContain("dark:text-white");
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive grid to contact methods", () => {
      const { container } = render(<ShopAbout shop={mockShop} />);
      const grid = container.querySelector(".sm\\:grid-cols-3");
      expect(grid).toBeInTheDocument();
    });

    it("applies responsive spacing to cards", () => {
      const { container } = render(<ShopAbout shop={mockShop} />);
      const spacing = container.querySelector(".space-y-6");
      expect(spacing).toBeInTheDocument();
    });
  });

  describe("Custom className", () => {
    it("applies custom className to root element", () => {
      const { container } = render(
        <ShopAbout shop={mockShop} className="custom-class" />
      );
      const root = container.querySelector(".custom-class");
      expect(root).toBeInTheDocument();
    });

    it("preserves default classes when custom className is provided", () => {
      const { container } = render(
        <ShopAbout shop={mockShop} className="custom-class" />
      );
      const root = container.querySelector(".space-y-6");
      expect(root).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic headings", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(
        screen.getByRole("heading", { name: "About This Shop" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Location" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Contact Shop" })
      ).toBeInTheDocument();
    });

    it("uses proper button type for policy toggles", () => {
      render(<ShopAbout shop={mockShop} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("provides descriptive link text for contact methods", () => {
      render(<ShopAbout shop={mockShop} />);
      expect(screen.getByRole("link", { name: /email/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /call/i })).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /website/i })
      ).toBeInTheDocument();
    });
  });
});
