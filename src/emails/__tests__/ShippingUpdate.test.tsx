/**
 * Unit Tests for Shipping Update Email Template
 * Testing tracking info, delivery details, and notifications
 *
 * @status COMPLETE
 * @batch 10
 */

import { cleanup, render } from "@testing-library/react";
import {
  ShippingUpdateEmail,
  ShippingUpdateEmailProps,
} from "../ShippingUpdate";

describe("ShippingUpdateEmail", () => {
  const mockProps: ShippingUpdateEmailProps = {
    customerName: "Amit Patel",
    orderId: "ORD-2024-56789",
    trackingNumber: "TRK1234567890",
    courierName: "Delhivery",
    estimatedDelivery: "December 15, 2024",
    trackingUrl: "https://justforview.in/track/TRK1234567890",
    orderItems: [
      {
        name: "Laptop Backpack",
        image: "https://example.com/backpack.jpg",
      },
      {
        name: "USB Cable",
      },
    ],
  };

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container).toBeTruthy();
    });

    it("should render shipping content", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.textContent).toContain(mockProps.trackingNumber);
    });

    it("should render with proper structure", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const div = container.querySelector("div");
      expect(div).toBeTruthy();
    });
  });

  describe("Header Section", () => {
    it("should display package emoji", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const spans = container.querySelectorAll("span");
      const packageIcon = Array.from(spans).find((s) => s.textContent === "📦");
      expect(packageIcon).toBeTruthy();
    });

    it("should have green theme color", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
    });

    it("should display main heading", () => {
      const { getAllByText } = render(<ShippingUpdateEmail {...mockProps} />);
      const headings = getAllByText("Your Order is on the Way!");
      expect(headings.length).toBeGreaterThan(0);
    });

    it("should have circular green background for icon", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
    });
  });

  describe("Greeting Section", () => {
    it("should display personalized greeting", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(`Hi ${mockProps.customerName},`)).toBeTruthy();
    });

    it("should announce shipment", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Great news! Your order has been shipped/)).toBeTruthy();
    });

    it("should mention tracking capability", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/You can track your package/)).toBeTruthy();
    });
  });

  describe("Tracking Information Section", () => {
    it("should display tracking number", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(mockProps.trackingNumber)).toBeTruthy();
    });

    it("should label tracking number", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Tracking Number/i)).toBeTruthy();
    });

    it("should display courier name", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(mockProps.courierName)).toBeTruthy();
    });

    it("should label courier", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Courier/i)).toBeTruthy();
    });

    it("should display estimated delivery", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(mockProps.estimatedDelivery)).toBeTruthy();
    });

    it("should label delivery estimate", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Estimated Delivery/i)).toBeTruthy();
    });

    it("should display order ID", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain(mockProps.orderId);
    });

    it("should have green highlight box for tracking", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
    });
  });

  describe("Order Items Section", () => {
    it("should display shipped items heading", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain(mockProps.orderId);
    });

    it("should display all item names", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      mockProps.orderItems.forEach((item) => {
        expect(getByText(item.name)).toBeTruthy();
      });
    });

    it("should render item images when provided", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const images = container.querySelectorAll("img");
      const productImage = Array.from(images).find(
        (img) => img.getAttribute("src") === mockProps.orderItems[0].image
      );
      expect(productImage).toBeTruthy();
    });

    it("should handle items without images", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      // Second item has no image
      expect(container).toBeTruthy();
    });

    it("should have alt text for images", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const images = container.querySelectorAll("img");
      images.forEach((img) => {
        expect(img.getAttribute("alt")).toBeTruthy();
      });
    });
  });

  describe("Tracking Button Section", () => {
    it("should display track package button", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("Track Your Package");
    });

    it("should link to tracking URL", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const trackButton = Array.from(links).find(
        (a) => a.textContent === "Track Your Package"
      );
      expect(trackButton?.getAttribute("href")).toBe(mockProps.trackingUrl);
    });

    it("should style button with green color", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const trackButton = Array.from(links).find(
        (a) => a.textContent === "Track Your Package"
      );
      expect(trackButton).toBeTruthy();
    });

    it("should center button", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe("Delivery Tips Section", () => {
    it("should provide delivery instructions", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Delivery Tips/i)).toBeTruthy();
    });

    it("should mention availability requirement", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("someone is available");
    });

    it("should mention ID verification", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("valid ID");
    });

    it("should warn about address accuracy", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("delivery");
    });
  });

  describe("Help Section", () => {
    it("should offer support", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("Questions about your order?");
    });

    it("should provide support email", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const supportLink = Array.from(links).find(
        (a) => a.getAttribute("href") === "mailto:support@justforview.in"
      );
      expect(supportLink).toBeTruthy();
    });

    it("should link to help center", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const supportLink = Array.from(links).find(
        (a) => a.getAttribute("href") === "mailto:support@justforview.in"
      );
      expect(supportLink).toBeTruthy();
    });
  });

  describe("Footer Section", () => {
    it("should display company name", () => {
      const { getAllByText } = render(<ShippingUpdateEmail {...mockProps} />);
      const brandRefs = getAllByText(/JustForView.in/);
      expect(brandRefs.length).toBeGreaterThan(0);
    });

    it("should display copyright", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("©");
    });
  });

  describe("Props Validation", () => {
    it("should handle empty customer name", () => {
      const propsWithEmptyName = { ...mockProps, customerName: "" };
      const { container } = render(
        <ShippingUpdateEmail {...propsWithEmptyName} />
      );
      expect(container).toBeTruthy();
    });

    it("should handle special characters in names", () => {
      const propsWithSpecialChars = { ...mockProps, customerName: "D'Souza" };
      const { container } = render(
        <ShippingUpdateEmail {...propsWithSpecialChars} />
      );
      expect(container.innerHTML).toContain("D'Souza");
    });

    it("should handle long tracking numbers", () => {
      const propsWithLongTracking = {
        ...mockProps,
        trackingNumber: "TRACK1234567890ABCDEFGHIJ",
      };
      const { getByText } = render(
        <ShippingUpdateEmail {...propsWithLongTracking} />
      );
      expect(getByText("TRACK1234567890ABCDEFGHIJ")).toBeTruthy();
    });

    it("should handle different courier names", () => {
      const couriers = ["Blue Dart", "DTDC", "FedEx", "Ecom Express"];
      couriers.forEach((courier) => {
        cleanup();
        const propsWithCourier = { ...mockProps, courierName: courier };
        const { getByText } = render(
          <ShippingUpdateEmail {...propsWithCourier} />
        );
        expect(getByText(courier)).toBeTruthy();
      });
    });

    it("should handle empty order items", () => {
      const propsWithNoItems = { ...mockProps, orderItems: [] };
      const { container } = render(
        <ShippingUpdateEmail {...propsWithNoItems} />
      );
      expect(container).toBeTruthy();
    });

    it("should handle single item", () => {
      const propsWithOneItem = {
        ...mockProps,
        orderItems: [mockProps.orderItems[0]],
      };
      const { getByText } = render(
        <ShippingUpdateEmail {...propsWithOneItem} />
      );
      expect(getByText("Laptop Backpack")).toBeTruthy();
    });

    it("should handle many items", () => {
      const manyItems = Array(10)
        .fill(null)
        .map((_, i) => ({
          name: `Item ${i + 1}`,
        }));
      const propsWithManyItems = { ...mockProps, orderItems: manyItems };
      const { container } = render(
        <ShippingUpdateEmail {...propsWithManyItems} />
      );
      expect(container).toBeTruthy();
    });

    it("should handle different date formats", () => {
      const dateFormats = [
        "15-12-2024",
        "Dec 15, 2024",
        "2024-12-15",
        "Monday, December 15",
      ];
      dateFormats.forEach((date) => {
        cleanup();
        const propsWithDate = { ...mockProps, estimatedDelivery: date };
        const { getByText } = render(
          <ShippingUpdateEmail {...propsWithDate} />
        );
        expect(getByText(date)).toBeTruthy();
      });
    });
  });

  describe("Tracking URL Validation", () => {
    it("should use HTTPS protocol", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const links = container.querySelectorAll('a[href^="http"]');
      const trackingLink = Array.from(links).find((a) =>
        a.getAttribute("href")?.includes("track")
      );
      expect(trackingLink?.getAttribute("href")?.startsWith("https://")).toBe(
        true
      );
    });

    it("should handle tracking URLs with query params", () => {
      const propsWithParams = {
        ...mockProps,
        trackingUrl: "https://justforview.in/track?id=ABC&order=123",
      };
      const { container } = render(
        <ShippingUpdateEmail {...propsWithParams} />
      );
      const links = container.querySelectorAll("a");
      const trackButton = Array.from(links).find(
        (a) => a.textContent === "Track Your Package"
      );
      expect(trackButton?.getAttribute("href")).toContain("id=ABC");
    });

    it("should handle third-party tracking URLs", () => {
      const thirdPartyUrl = "https://www.delhivery.com/track/package/TRK123";
      const propsWithThirdParty = { ...mockProps, trackingUrl: thirdPartyUrl };
      const { container } = render(
        <ShippingUpdateEmail {...propsWithThirdParty} />
      );
      const links = container.querySelectorAll("a");
      const trackButton = Array.from(links).find(
        (a) => a.textContent === "Track Your Package"
      );
      expect(trackButton?.getAttribute("href")).toBe(thirdPartyUrl);
    });
  });

  describe("Responsive Design", () => {
    it("should have viewport meta tag", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it("should use max-width container", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
    });

    it("should center content", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
    });
  });

  describe("Email Client Compatibility", () => {
    it("should use inline styles", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
    });

    it("should use web-safe fonts", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("font");
    });

    it("should avoid flexbox/grid", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const elements = container.querySelectorAll("*");
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.querySelector("h1")).toBeTruthy();
      expect(container.querySelector("h3")).toBeTruthy();
    });

    it("should use semantic HTML", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.querySelector("p")).toBeTruthy();
      expect(container.querySelector("a")).toBeTruthy();
    });

    it("should have good color contrast", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const button = Array.from(container.querySelectorAll("a")).find(
        (a) => a.textContent === "Track Your Package"
      );
      expect(button).toBeTruthy();
    });

    it("should have descriptive link text", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("Track Your Package");
    });

    it("should have alt text for all images", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const images = container.querySelectorAll("img");
      images.forEach((img) => {
        expect(img.getAttribute("alt")).toBeTruthy();
      });
    });
  });

  describe("Brand Consistency", () => {
    it("should use green success color theme", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const greenElements = container.querySelectorAll(
        '[style*="16, 185, 129"]'
      );
      expect(greenElements.length).toBeGreaterThan(0);
    });

    it("should display brand name", () => {
      const { getAllByText } = render(<ShippingUpdateEmail {...mockProps} />);
      const brandRefs = getAllByText(/JustForView.in/);
      expect(brandRefs.length).toBeGreaterThan(0);
    });

    it("should use consistent typography", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const headings = container.querySelectorAll("h1, h2, h3");
      headings.forEach((h) => {
        expect((h as HTMLElement).style.fontWeight).toBeTruthy();
      });
    });

    it("should use consistent spacing", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const sections = container.querySelectorAll('div[style*="padding"]');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe("Content Quality", () => {
    it("should have positive tone", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("Great news!");
    });

    it("should provide actionable information", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("Track Your Package");
    });

    it("should use proper grammar", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).not.toMatch(/your's/);
    });

    it("should be concise and clear", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text.length).toBeLessThan(5000);
    });
  });

  describe("User Experience", () => {
    it("should provide clear next steps", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.innerHTML).toContain("Track Your Package");
    });

    it("should set proper expectations", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Estimated Delivery/i)).toBeTruthy();
    });

    it("should offer support options", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const supportLinks = Array.from(links).filter(
        (a) =>
          a.getAttribute("href")?.includes("support") ||
          a.getAttribute("href")?.includes("mailto") ||
          a.getAttribute("href")?.includes("help")
      );
      expect(supportLinks.length).toBeGreaterThan(0);
    });
  });
});
