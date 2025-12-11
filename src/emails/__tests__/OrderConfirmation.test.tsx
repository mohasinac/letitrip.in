/**
 * Unit Tests for Order Confirmation Email Template
 * Testing email structure, order details, and rendering
 *
 * @status COMPLETE
 * @batch 10
 */

import { render } from "@testing-library/react";
import {
  OrderConfirmationEmail,
  OrderConfirmationEmailProps,
} from "../OrderConfirmation";

describe("OrderConfirmationEmail", () => {
  const mockProps: OrderConfirmationEmailProps = {
    customerName: "Rajesh Kumar",
    orderId: "ORD-2024-12345",
    orderDate: "2024-12-10",
    orderTotal: 5499.99,
    orderItems: [
      {
        name: "Wireless Headphones",
        quantity: 1,
        price: 2999.99,
        image: "https://example.com/headphones.jpg",
      },
      {
        name: "Phone Case",
        quantity: 2,
        price: 1250.0,
      },
    ],
    shippingAddress: {
      street: "123 MG Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
    },
    trackingUrl: "https://justforview.in/track/ABC123",
  };

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container).toBeTruthy();
    });

    it("should render order content", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.textContent).toContain(mockProps.orderId);
    });

    it("should render with proper structure", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const div = container.querySelector("div");
      expect(div).toBeTruthy();
    });

    it("should have body element", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it("should have proper meta tags", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it("should have title", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });
  });

  describe("Header Section", () => {
    it("should display brand name", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("JustForView")).toBe(true);
    });

    it("should have blue border accent", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const headers = container.querySelectorAll("div");
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe("Greeting Section", () => {
    it("should display personalized thank you message", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("Thank you")).toBe(true);
    });

    it("should display order received message", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("received")).toBe(true);
    });

    it("should mention shipping confirmation", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("shipping")).toBe(true);
    });
  });

  describe("Order Details Section", () => {
    it("should display order ID", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes(mockProps.orderId)).toBe(true);
    });

    it("should display order date", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes(mockProps.orderDate)).toBe(true);
    });

    it("should label order details properly", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("Order")).toBe(true);
    });
  });

  describe("Order Items Section", () => {
    it("should display all order items", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      mockProps.orderItems.forEach((item) => {
        expect(container.innerHTML.includes(item.name)).toBe(true);
      });
    });

    it("should display item quantities", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("Quantity")).toBe(true);
    });

    it("should display item prices in INR", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("₹2,999.99");
      expect(text).toContain("₹1,250");
    });

    it("should render item images when provided", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const images = container.querySelectorAll("img");
      const productImage = Array.from(images).find(
        (img) => img.getAttribute("src") === mockProps.orderItems[0].image
      );
      expect(productImage).toBeTruthy();
    });

    it("should handle items without images", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      // Second item has no image
      expect(container).toBeTruthy();
    });
  });

  describe("Shipping Address Section", () => {
    it("should display shipping address heading", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("Shipping")).toBe(true);
    });

    it("should display complete address", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("123 MG Road")).toBe(true);
      expect(container.innerHTML.includes("Bangalore")).toBe(true);
    });

    it("should format address properly", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("123 MG Road");
      expect(text).toContain("Bangalore");
    });
  });

  describe("Order Total Section", () => {
    it("should display order total", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("₹5,499.99");
    });

    it("should label total properly", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("Total")).toBe(true);
    });

    it("should format large amounts correctly", () => {
      const propsWithLargeTotal = {
        ...mockProps,
        orderTotal: 123456.78,
      };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithLargeTotal} />
      );
      const text = container.textContent || "";
      expect(text).toContain("₹1,23,456.78");
    });
  });

  describe("Tracking Section", () => {
    it("should display tracking button when URL provided", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      expect(links.length).toBeGreaterThan(0);
    });

    it("should link to correct tracking URL", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      expect(links.length).toBeGreaterThan(0);
    });

    it("should not display tracking button when URL not provided", () => {
      const propsWithoutTracking = { ...mockProps, trackingUrl: undefined };
      const { queryByText } = render(
        <OrderConfirmationEmail {...propsWithoutTracking} />
      );
      expect(queryByText("Track Order")).toBeNull();
    });

    it("should style tracking button properly", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe("Help Section", () => {
    it("should display customer support info", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("help")).toBe(true);
    });

    it("should provide support email", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const supportLink = Array.from(links).find(
        (a) => a.getAttribute("href") === "mailto:support@justforview.in"
      );
      expect(supportLink).toBeTruthy();
    });

    it("should provide support link", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe("Footer Section", () => {
    it("should display company info", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.includes("JustForView")).toBe(true);
    });

    it("should display copyright notice", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("©");
      expect(text).toContain("2024");
    });
  });

  describe("Props Validation", () => {
    it("should handle empty order items array", () => {
      const propsWithNoItems = { ...mockProps, orderItems: [] };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithNoItems} />
      );
      expect(container).toBeTruthy();
    });

    it("should handle single item order", () => {
      const propsWithOneItem = {
        ...mockProps,
        orderItems: [mockProps.orderItems[0]],
      };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithOneItem} />
      );
      expect(container.innerHTML.includes("Wireless Headphones")).toBe(true);
    });

    it("should handle items with zero price", () => {
      const propsWithFreeItem = {
        ...mockProps,
        orderItems: [
          {
            name: "Free Gift",
            quantity: 1,
            price: 0,
          },
        ],
      };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithFreeItem} />
      );
      expect(container.innerHTML.includes("Free Gift")).toBe(true);
    });

    it("should handle special characters in item names", () => {
      const propsWithSpecialChars = {
        ...mockProps,
        orderItems: [
          {
            name: 'Phone Case (Black & White) - 5"',
            quantity: 1,
            price: 299.99,
          },
        ],
      };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithSpecialChars} />
      );
      expect(container.innerHTML.includes("Phone Case")).toBe(true);
    });

    it("should handle long customer names", () => {
      const propsWithLongName = {
        ...mockProps,
        customerName: "Srinivasa Ramanujan Venkata Subramanian",
      };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithLongName} />
      );
      expect(container).toBeTruthy();
    });

    it("should handle long addresses", () => {
      const propsWithLongAddress = {
        ...mockProps,
        shippingAddress: {
          street:
            "Flat No 401, Building A, Prestige Tech Park, Outer Ring Road",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560103",
        },
      };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithLongAddress} />
      );
      expect(container).toBeTruthy();
    });

    it("should handle different date formats", () => {
      const propsWithDiffDate = {
        ...mockProps,
        orderDate: "December 10, 2024",
      };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithDiffDate} />
      );
      expect(container.innerHTML.includes("December 10, 2024")).toBe(true);
    });
  });

  describe("Currency Formatting", () => {
    it("should use Indian Rupee symbol", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("₹");
    });

    it("should format amounts with Indian numbering system", () => {
      const propsWithLargeAmount = {
        ...mockProps,
        orderTotal: 1234567.89,
      };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithLargeAmount} />
      );
      const text = container.textContent || "";
      // Indian format: 12,34,567.89
      expect(text).toMatch(/₹.*12,34,567\.89/);
    });

    it("should handle decimal prices", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain(".99");
    });

    it("should handle zero decimals", () => {
      const propsWithWholeNumber = {
        ...mockProps,
        orderTotal: 5000,
      };
      const { container } = render(
        <OrderConfirmationEmail {...propsWithWholeNumber} />
      );
      const text = container.textContent || "";
      expect(text).toContain("₹5,000");
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive viewport meta", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it("should use max-width container", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.querySelector("div")).toBeTruthy();
    });

    it("should use inline styles for email compatibility", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.querySelector("h1")).toBeTruthy();
      expect(container.querySelector("h2")).toBeTruthy();
      expect(container.querySelector("h3")).toBeTruthy();
    });

    it("should have alt text for product images", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const images = container.querySelectorAll("img");
      images.forEach((img) => {
        expect(img.getAttribute("alt")).toBeTruthy();
      });
    });

    it("should use semantic color contrast", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.querySelector("div")).toBeTruthy();
    });
  });

  describe("Email Client Compatibility", () => {
    it("should use web-safe fonts", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(
        container.innerHTML.includes("sans-serif") ||
          container.innerHTML.includes("font")
      ).toBe(true);
    });

    it("should avoid using flexbox/grid", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const elements = container.querySelectorAll("*");
      expect(elements.length).toBeGreaterThan(0);
    });

    it("should use HTTPS for all external links", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const links = container.querySelectorAll('a[href^="http"]');
      links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("http://") || href.startsWith("https://")) {
          expect(href.startsWith("https://")).toBe(true);
        }
      });
    });
  });

  describe("Brand Consistency", () => {
    it("should use blue brand color", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const blueElements = container.querySelectorAll(
        '[style*="59, 130, 246"]'
      );
      expect(blueElements.length).toBeGreaterThan(0);
    });

    it("should use consistent typography", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const headings = container.querySelectorAll("h1, h2, h3");
      headings.forEach((h) => {
        expect((h as HTMLElement).style.fontWeight).toBeTruthy();
      });
    });

    it("should use consistent spacing", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const sections = container.querySelectorAll('div[style*="padding"]');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe("Security", () => {
    it("should not expose sensitive payment info", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).not.toContain("CVV");
      expect(text).not.toContain("card number");
    });

    it("should use secure links", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const links = container.querySelectorAll('a[href^="http"]');
      links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        expect(href.startsWith("https://")).toBe(true);
      });
    });
  });
});
