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

    it("should render html structure", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.querySelector("html")).toBeTruthy();
      expect(container.querySelector("head")).toBeTruthy();
      expect(container.querySelector("body")).toBeTruthy();
    });

    it("should have proper meta tags", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(container.querySelector('meta[charSet="utf-8"]')).toBeTruthy();
      expect(container.querySelector('meta[name="viewport"]')).toBeTruthy();
    });

    it("should have title", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const title = container.querySelector("title");
      expect(title?.textContent).toBe("Order Confirmation");
    });
  });

  describe("Header Section", () => {
    it("should display brand name", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText("JustForView.in")).toBeTruthy();
    });

    it("should have blue border accent", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const headers = container.querySelectorAll("div");
      const header = Array.from(headers).find(
        (div) => div.style.borderBottom === "4px solid rgb(59, 130, 246)"
      );
      expect(header).toBeTruthy();
    });
  });

  describe("Greeting Section", () => {
    it("should display personalized thank you message", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(
        getByText(`Thank you for your order, ${mockProps.customerName}!`)
      ).toBeTruthy();
    });

    it("should display order received message", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText(/We've received your order/)).toBeTruthy();
    });

    it("should mention shipping confirmation", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText(/You'll receive a shipping confirmation/)).toBeTruthy();
    });
  });

  describe("Order Details Section", () => {
    it("should display order ID", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText(mockProps.orderId)).toBeTruthy();
    });

    it("should display order date", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText(mockProps.orderDate)).toBeTruthy();
    });

    it("should label order details properly", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText("Order Details")).toBeTruthy();
      expect(getByText(/Order ID:/)).toBeTruthy();
      expect(getByText(/Order Date:/)).toBeTruthy();
    });
  });

  describe("Order Items Section", () => {
    it("should display all order items", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      mockProps.orderItems.forEach((item) => {
        expect(getByText(item.name)).toBeTruthy();
      });
    });

    it("should display item quantities", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText(/Qty: 1/)).toBeTruthy();
      expect(getByText(/Qty: 2/)).toBeTruthy();
    });

    it("should display item prices in INR", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("₹2,999.99");
      expect(text).toContain("₹1,250.00");
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
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText("Shipping Address")).toBeTruthy();
    });

    it("should display complete address", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText(/123 MG Road/)).toBeTruthy();
      expect(getByText(/Bangalore/)).toBeTruthy();
      expect(getByText(/Karnataka/)).toBeTruthy();
      expect(getByText(/560001/)).toBeTruthy();
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
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText(/Total:/)).toBeTruthy();
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
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText("Track Order")).toBeTruthy();
    });

    it("should link to correct tracking URL", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const trackingLink = Array.from(links).find(
        (a) => a.textContent === "Track Order"
      );
      expect(trackingLink?.getAttribute("href")).toBe(mockProps.trackingUrl);
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
      const trackingButton = Array.from(links).find(
        (a) => a.textContent === "Track Order"
      );
      expect(trackingButton?.style.backgroundColor).toBeTruthy();
      expect(trackingButton?.style.color).toBeTruthy();
    });
  });

  describe("Help Section", () => {
    it("should display customer support info", () => {
      const { getByText } = render(<OrderConfirmationEmail {...mockProps} />);
      expect(getByText(/Need help/)).toBeTruthy();
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
      const helpLink = Array.from(links).find((a) =>
        a.getAttribute("href")?.includes("/help")
      );
      expect(helpLink).toBeTruthy();
    });
  });

  describe("Footer Section", () => {
    it("should display company info", () => {
      const { getAllByText } = render(
        <OrderConfirmationEmail {...mockProps} />
      );
      const brandRefs = getAllByText(/JustForView.in/);
      expect(brandRefs.length).toBeGreaterThan(0);
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
      const { getByText } = render(
        <OrderConfirmationEmail {...propsWithOneItem} />
      );
      expect(getByText("Wireless Headphones")).toBeTruthy();
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
      const { getByText } = render(
        <OrderConfirmationEmail {...propsWithFreeItem} />
      );
      expect(getByText("Free Gift")).toBeTruthy();
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
      const { getByText } = render(
        <OrderConfirmationEmail {...propsWithSpecialChars} />
      );
      expect(getByText(/Phone Case \(Black & White\)/)).toBeTruthy();
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
      const { getByText } = render(
        <OrderConfirmationEmail {...propsWithDiffDate} />
      );
      expect(getByText("December 10, 2024")).toBeTruthy();
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
      const meta = container.querySelector('meta[name="viewport"]');
      expect(meta?.getAttribute("content")).toBe(
        "width=device-width, initial-scale=1.0"
      );
    });

    it("should use max-width container", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const mainDiv = container.querySelector("body > div");
      expect(mainDiv?.style.maxWidth).toBe("600px");
    });

    it("should use inline styles for email compatibility", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
      divs.forEach((div) => {
        expect(div.getAttribute("style")).toBeTruthy();
      });
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
      const body = container.querySelector("body");
      expect(body?.style.backgroundColor).toBeTruthy();
    });
  });

  describe("Email Client Compatibility", () => {
    it("should use web-safe fonts", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const body = container.querySelector("body");
      const fontFamily = body?.style.fontFamily;
      expect(fontFamily).toContain("sans-serif");
    });

    it("should avoid using flexbox/grid", () => {
      const { container } = render(<OrderConfirmationEmail {...mockProps} />);
      const elements = container.querySelectorAll("*");
      elements.forEach((el) => {
        const style = (el as HTMLElement).style;
        expect(style.display).not.toBe("flex");
        expect(style.display).not.toBe("grid");
      });
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
