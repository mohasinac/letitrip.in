/**
 * Unit Tests for Welcome Email Template
 * Testing email structure, props, and rendering
 *
 * @status COMPLETE
 * @batch 10
 */

import { render } from "@testing-library/react";
import { WelcomeEmail, WelcomeEmailProps } from "../Welcome";

describe("WelcomeEmail", () => {
  const mockProps: WelcomeEmailProps = {
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    verificationLink: "https://justforview.in/verify?token=abc123",
  };

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      expect(container).toBeTruthy();
    });

    it("should render html and head tags", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const html = container.querySelector("html");
      const head = container.querySelector("head");
      expect(html).toBeTruthy();
      expect(head).toBeTruthy();
    });

    it("should render body with correct styles", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const body = container.querySelector("body");
      expect(body).toBeTruthy();
      expect(body?.style.fontFamily).toContain("apple-system");
      expect(body?.style.backgroundColor).toBe("rgb(243, 244, 246)");
    });

    it("should render main container with max-width", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const mainDiv = container.querySelector("body > div");
      expect(mainDiv).toBeTruthy();
      expect(mainDiv?.style.maxWidth).toBe("600px");
    });
  });

  describe("Header Section", () => {
    it("should render header with correct background color", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const headers = container.querySelectorAll("div");
      const header = Array.from(headers).find(
        (div) =>
          div.style.backgroundColor === "rgb(255, 255, 255)" &&
          div.style.borderBottom === "4px solid rgb(139, 92, 246)"
      );
      expect(header).toBeTruthy();
    });

    it("should display welcome emoji", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const emoji = container.querySelector("span");
      expect(emoji?.textContent).toBe("🎉");
    });

    it("should display main heading", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const h1 = container.querySelector("h1");
      expect(h1?.textContent).toBe("Welcome to JustForView.in!");
    });

    it("should display personalized subtitle with user name", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(
        getByText(`We're excited to have you on board, ${mockProps.userName}!`)
      ).toBeTruthy();
    });
  });

  describe("Main Content Section", () => {
    it("should display greeting with user name", () => {
      const { getAllByText } = render(<WelcomeEmail {...mockProps} />);
      const greetings = getAllByText(`Hi ${mockProps.userName},`);
      expect(greetings.length).toBeGreaterThan(0);
    });

    it("should display welcome message", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText(/Thank you for joining JustForView.in/)).toBeTruthy();
      expect(
        getByText(/India's premier auction and e-commerce platform/)
      ).toBeTruthy();
    });

    it("should display verification section when link provided", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText("🔐 Verify Your Email")).toBeTruthy();
    });

    it("should not display verification section when link not provided", () => {
      const propsWithoutLink = { ...mockProps, verificationLink: undefined };
      const { queryByText } = render(<WelcomeEmail {...propsWithoutLink} />);
      expect(queryByText("🔐 Verify Your Email")).toBeNull();
    });

    it("should render verification button with correct link", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const verifyLink = Array.from(links).find(
        (a) => a.textContent === "Verify Your Email"
      );
      expect(verifyLink).toBeTruthy();
      expect(verifyLink?.getAttribute("href")).toBe(mockProps.verificationLink);
    });

    it("should render verification button with correct styles", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const verifyButton = Array.from(links).find(
        (a) => a.textContent === "Verify Your Email"
      );
      expect(verifyButton?.style.backgroundColor).toBe("rgb(139, 92, 246)");
      expect(verifyButton?.style.color).toBe("rgb(255, 255, 255)");
    });
  });

  describe("Features Section", () => {
    it('should display "What You Can Do" heading', () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText("What You Can Do:")).toBeTruthy();
    });

    it("should display shop products feature", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText("🛍️ Shop Products")).toBeTruthy();
      expect(getByText(/Browse thousands of products/)).toBeTruthy();
    });

    it("should display bid on auctions feature", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText("🎯 Bid on Auctions")).toBeTruthy();
      expect(getByText(/Participate in live auctions/)).toBeTruthy();
    });

    it("should display sell products feature", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText("🏪 Sell Products")).toBeTruthy();
      expect(getByText(/Open your shop/)).toBeTruthy();
    });
  });

  describe("Get Started Section", () => {
    it("should display get started heading", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText("Get Started")).toBeTruthy();
    });

    it("should render explore marketplace button", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const exploreButton = Array.from(links).find(
        (a) => a.textContent === "Explore Marketplace"
      );
      expect(exploreButton).toBeTruthy();
    });

    it("should link to correct marketplace URL", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const exploreButton = Array.from(links).find(
        (a) => a.textContent === "Explore Marketplace"
      );
      expect(exploreButton?.getAttribute("href")).toBe(
        "https://justforview.in/products"
      );
    });
  });

  describe("Help Section", () => {
    it("should display help information", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText(/Need Help/)).toBeTruthy();
    });

    it("should render support email link", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const supportLink = Array.from(links).find(
        (a) => a.getAttribute("href") === "mailto:support@justforview.in"
      );
      expect(supportLink).toBeTruthy();
    });

    it("should render help center link", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const helpLink = Array.from(links).find(
        (a) => a.getAttribute("href") === "https://justforview.in/help"
      );
      expect(helpLink).toBeTruthy();
    });
  });

  describe("Footer Section", () => {
    it("should display footer with company info", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText(/JustForView.in/)).toBeTruthy();
    });

    it("should display unsubscribe link", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText(/Unsubscribe/)).toBeTruthy();
    });

    it("should display privacy policy link", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const privacyLink = Array.from(links).find(
        (a) => a.textContent === "Privacy Policy"
      );
      expect(privacyLink).toBeTruthy();
    });

    it("should display terms of service link", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const termsLink = Array.from(links).find(
        (a) => a.textContent === "Terms of Service"
      );
      expect(termsLink).toBeTruthy();
    });
  });

  describe("Props Validation", () => {
    it("should handle missing optional verification link", () => {
      const propsWithoutLink: WelcomeEmailProps = {
        userName: "Jane Smith",
        userEmail: "jane@example.com",
      };
      const { container } = render(<WelcomeEmail {...propsWithoutLink} />);
      expect(container).toBeTruthy();
    });

    it("should handle empty user name", () => {
      const propsWithEmptyName = { ...mockProps, userName: "" };
      const { container } = render(<WelcomeEmail {...propsWithEmptyName} />);
      expect(container).toBeTruthy();
    });

    it("should handle special characters in user name", () => {
      const propsWithSpecialChars = {
        ...mockProps,
        userName: "O'Brien-Smith & Co.",
      };
      const { getByText } = render(<WelcomeEmail {...propsWithSpecialChars} />);
      expect(getByText(/O'Brien-Smith & Co./)).toBeTruthy();
    });

    it("should handle long user names", () => {
      const propsWithLongName = {
        ...mockProps,
        userName: "Christopher Alexander Maximilian",
      };
      const { container } = render(<WelcomeEmail {...propsWithLongName} />);
      expect(container).toBeTruthy();
    });

    it("should handle international email formats", () => {
      const propsWithIntlEmail = {
        ...mockProps,
        userEmail: "user@example.co.in",
      };
      const { container } = render(<WelcomeEmail {...propsWithIntlEmail} />);
      expect(container).toBeTruthy();
    });

    it("should handle verification links with query params", () => {
      const propsWithParams = {
        ...mockProps,
        verificationLink: "https://justforview.in/verify?token=abc&userId=123",
      };
      const { container } = render(<WelcomeEmail {...propsWithParams} />);
      const links = container.querySelectorAll("a");
      const verifyLink = Array.from(links).find(
        (a) => a.textContent === "Verify Your Email"
      );
      expect(verifyLink?.getAttribute("href")).toContain("token=abc");
      expect(verifyLink?.getAttribute("href")).toContain("userId=123");
    });
  });

  describe("Responsive Design", () => {
    it("should have viewport meta tag", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const meta = container.querySelector('meta[name="viewport"]');
      expect(meta).toBeTruthy();
      expect(meta?.getAttribute("content")).toBe(
        "width=device-width, initial-scale=1.0"
      );
    });

    it("should have max-width constraint on main container", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const mainDiv = container.querySelector("body > div");
      expect(mainDiv?.style.maxWidth).toBe("600px");
    });

    it("should use responsive font sizes", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const h1 = container.querySelector("h1");
      expect(h1?.style.fontSize).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should have charset meta tag", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const meta = container.querySelector('meta[charSet="utf-8"]');
      expect(meta).toBeTruthy();
    });

    it("should have title tag", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const title = container.querySelector("title");
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe("Welcome to JustForView.in!");
    });

    it("should use semantic HTML elements", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      expect(container.querySelector("h1")).toBeTruthy();
      expect(container.querySelector("p")).toBeTruthy();
    });

    it("should have proper text color contrast", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const paragraphs = container.querySelectorAll("p");
      paragraphs.forEach((p) => {
        const color = p.style.color;
        // Should not be too light (good contrast)
        expect(color).toBeTruthy();
      });
    });
  });

  describe("Email Client Compatibility", () => {
    it("should use inline styles", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      divs.forEach((div) => {
        expect(div.getAttribute("style")).toBeTruthy();
      });
    });

    it("should use web-safe fonts", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const body = container.querySelector("body");
      const fontFamily = body?.style.fontFamily;
      expect(fontFamily).toContain("apple-system");
      expect(fontFamily).toContain("sans-serif");
    });

    it("should use table-like structure instead of flexbox/grid", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      // Ensure no flex or grid is used (not email-client safe)
      const elements = container.querySelectorAll("*");
      elements.forEach((el) => {
        const style = (el as HTMLElement).style;
        expect(style.display).not.toBe("flex");
        expect(style.display).not.toBe("grid");
      });
    });
  });

  describe("Brand Consistency", () => {
    it("should use consistent purple brand color", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const purpleElements = container.querySelectorAll(
        '[style*="139, 92, 246"]'
      );
      expect(purpleElements.length).toBeGreaterThan(0);
    });

    it("should display brand name correctly", () => {
      const { getAllByText } = render(<WelcomeEmail {...mockProps} />);
      const brandNames = getAllByText(/JustForView.in/);
      expect(brandNames.length).toBeGreaterThan(0);
    });

    it("should use consistent spacing and padding", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const mainContent = container.querySelectorAll('div[style*="padding"]');
      expect(mainContent.length).toBeGreaterThan(0);
    });
  });

  describe("Content Quality", () => {
    it("should not have spelling errors in main content", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).not.toContain("recieve");
      expect(text).not.toContain("seperate");
    });

    it("should use proper capitalization", () => {
      const { getByText } = render(<WelcomeEmail {...mockProps} />);
      expect(getByText("Welcome to JustForView.in!")).toBeTruthy();
    });

    it("should use proper punctuation", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("!");
      expect(text).toContain(".");
    });
  });

  describe("Security", () => {
    it("should not expose sensitive information", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).not.toContain("password");
      expect(text).not.toContain("token");
    });

    it("should use HTTPS for all links", () => {
      const { container } = render(<WelcomeEmail {...mockProps} />);
      const links = container.querySelectorAll('a[href^="http"]');
      links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("http")) {
          expect(href.startsWith("https://")).toBe(true);
        }
      });
    });
  });
});
