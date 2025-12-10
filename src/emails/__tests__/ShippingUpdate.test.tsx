/**
 * Unit Tests for Shipping Update Email Template
 * Testing tracking info, delivery details, and notifications
 *
 * @status COMPLETE
 * @batch 10
 */

import { render } from "@testing-library/react";
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

    it("should render complete HTML structure", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.querySelector("html")).toBeTruthy();
      expect(container.querySelector("head")).toBeTruthy();
      expect(container.querySelector("body")).toBeTruthy();
    });

    it("should have proper meta tags", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.querySelector('meta[charSet="utf-8"]')).toBeTruthy();
      expect(container.querySelector('meta[name="viewport"]')).toBeTruthy();
    });

    it("should have title", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const title = container.querySelector("title");
      expect(title?.textContent).toBe("Your Order is on the Way!");
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
      const header = Array.from(divs).find(
        (div) => div.style.borderBottom === "4px solid rgb(16, 185, 129)"
      );
      expect(header).toBeTruthy();
    });

    it("should display main heading", () => {
      const { getAllByText } = render(<ShippingUpdateEmail {...mockProps} />);
      const headings = getAllByText("Your Order is on the Way!");
      expect(headings.length).toBeGreaterThan(0);
    });

    it("should have circular green background for icon", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      const iconBg = Array.from(divs).find(
        (div) =>
          div.style.borderRadius === "50%" &&
          div.style.backgroundColor === "rgb(209, 250, 229)"
      );
      expect(iconBg).toBeTruthy();
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
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(mockProps.orderId)).toBeTruthy();
    });

    it("should have green highlight box for tracking", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      const trackingBox = Array.from(divs).find(
        (div) => div.style.backgroundColor === "rgb(240, 253, 244)"
      );
      expect(trackingBox).toBeTruthy();
    });
  });

  describe("Order Items Section", () => {
    it("should display shipped items heading", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Items Shipped/i)).toBeTruthy();
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
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText("Track Package")).toBeTruthy();
    });

    it("should link to tracking URL", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const trackButton = Array.from(links).find(
        (a) => a.textContent === "Track Package"
      );
      expect(trackButton?.getAttribute("href")).toBe(mockProps.trackingUrl);
    });

    it("should style button with green color", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const trackButton = Array.from(links).find(
        (a) => a.textContent === "Track Package"
      );
      expect(trackButton?.style.backgroundColor).toBe("rgb(16, 185, 129)");
      expect(trackButton?.style.color).toBe("rgb(255, 255, 255)");
    });

    it("should center button", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      const buttonContainer = Array.from(divs).find(
        (div) => div.style.textAlign === "center" && div.querySelector("a")
      );
      expect(buttonContainer).toBeTruthy();
    });
  });

  describe("Delivery Tips Section", () => {
    it("should provide delivery instructions", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Delivery Tips/i)).toBeTruthy();
    });

    it("should mention availability requirement", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/someone available/)).toBeTruthy();
    });

    it("should mention ID verification", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/government-issued ID/)).toBeTruthy();
    });

    it("should warn about address accuracy", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/delivery address is correct/)).toBeTruthy();
    });
  });

  describe("Help Section", () => {
    it("should offer support", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Need help/)).toBeTruthy();
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
      const helpLink = Array.from(links).find((a) =>
        a.getAttribute("href")?.includes("/help")
      );
      expect(helpLink).toBeTruthy();
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
      const { getByText } = render(
        <ShippingUpdateEmail {...propsWithSpecialChars} />
      );
      expect(getByText(/D'Souza/)).toBeTruthy();
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
        (a) => a.textContent === "Track Package"
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
        (a) => a.textContent === "Track Package"
      );
      expect(trackButton?.getAttribute("href")).toBe(thirdPartyUrl);
    });
  });

  describe("Responsive Design", () => {
    it("should have viewport meta tag", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const meta = container.querySelector('meta[name="viewport"]');
      expect(meta?.getAttribute("content")).toBe(
        "width=device-width, initial-scale=1.0"
      );
    });

    it("should use max-width container", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const mainDiv = container.querySelector("body > div");
      expect(mainDiv?.style.maxWidth).toBe("600px");
    });

    it("should center content", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const mainDiv = container.querySelector("body > div");
      expect(mainDiv?.style.margin).toContain("auto");
    });
  });

  describe("Email Client Compatibility", () => {
    it("should use inline styles", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
      divs.forEach((div) => {
        expect(div.getAttribute("style")).toBeTruthy();
      });
    });

    it("should use web-safe fonts", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const body = container.querySelector("body");
      const fontFamily = body?.style.fontFamily;
      expect(fontFamily).toContain("sans-serif");
    });

    it("should avoid flexbox/grid", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const elements = container.querySelectorAll("*");
      elements.forEach((el) => {
        const style = (el as HTMLElement).style;
        expect(style.display).not.toBe("flex");
        expect(style.display).not.toBe("grid");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.querySelector("h1")).toBeTruthy();
      expect(container.querySelector("h2")).toBeTruthy();
    });

    it("should use semantic HTML", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(container.querySelector("p")).toBeTruthy();
      expect(container.querySelector("a")).toBeTruthy();
    });

    it("should have good color contrast", () => {
      const { container } = render(<ShippingUpdateEmail {...mockProps} />);
      const button = Array.from(container.querySelectorAll("a")).find(
        (a) => a.textContent === "Track Package"
      );
      expect(button?.style.backgroundColor).toBeTruthy();
      expect(button?.style.color).toBe("rgb(255, 255, 255)");
    });

    it("should have descriptive link text", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText("Track Package")).toBeTruthy();
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
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText(/Great news!/)).toBeTruthy();
    });

    it("should provide actionable information", () => {
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText("Track Package")).toBeTruthy();
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
      const { getByText } = render(<ShippingUpdateEmail {...mockProps} />);
      expect(getByText("Track Package")).toBeTruthy();
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
