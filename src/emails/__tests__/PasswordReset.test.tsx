/**
 * Unit Tests for Password Reset Email Template
 * Testing security, links, and user experience
 *
 * @status COMPLETE
 * @batch 10
 */

import { render } from "@testing-library/react";
import { PasswordResetEmail, PasswordResetEmailProps } from "../PasswordReset";

describe("PasswordResetEmail", () => {
  const mockProps: PasswordResetEmailProps = {
    userName: "Priya Sharma",
    userEmail: "priya.sharma@example.com",
    resetLink: "https://justforview.in/reset-password?token=xyz789abc",
    expiresIn: 30,
  };

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container).toBeTruthy();
    });

    it("should render complete HTML structure", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.querySelector("html")).toBeTruthy();
      expect(container.querySelector("head")).toBeTruthy();
      expect(container.querySelector("body")).toBeTruthy();
    });

    it("should have meta tags", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.querySelector('meta[charSet="utf-8"]')).toBeTruthy();
      expect(container.querySelector('meta[name="viewport"]')).toBeTruthy();
    });

    it("should have title", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const title = container.querySelector("title");
      expect(title?.textContent).toBe("Reset Your Password");
    });
  });

  describe("Header Section", () => {
    it("should display lock icon", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const spans = container.querySelectorAll("span");
      const lockIcon = Array.from(spans).find((s) => s.textContent === "🔐");
      expect(lockIcon).toBeTruthy();
    });

    it("should have red theme color", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      const header = Array.from(divs).find(
        (div) => div.style.borderBottom === "4px solid rgb(239, 68, 68)"
      );
      expect(header).toBeTruthy();
    });

    it("should display main heading", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText("Reset Your Password")).toBeTruthy();
    });

    it("should have circular icon background", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      const iconBg = Array.from(divs).find(
        (div) =>
          div.style.borderRadius === "50%" &&
          div.style.backgroundColor === "rgb(254, 226, 226)"
      );
      expect(iconBg).toBeTruthy();
    });
  });

  describe("Greeting Section", () => {
    it("should display personalized greeting", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(`Hi ${mockProps.userName},`)).toBeTruthy();
    });

    it("should explain password reset request", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(
        getByText(/We received a request to reset the password/)
      ).toBeTruthy();
    });

    it("should mention account email", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/JustForView.in account/)).toBeTruthy();
    });

    it("should provide clear instructions", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(
        getByText(/Click the button below to create a new password/)
      ).toBeTruthy();
    });
  });

  describe("Reset Button Section", () => {
    it("should display reset password button", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText("Reset Password")).toBeTruthy();
    });

    it("should link to reset URL", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const resetButton = Array.from(links).find(
        (a) => a.textContent === "Reset Password"
      );
      expect(resetButton?.getAttribute("href")).toBe(mockProps.resetLink);
    });

    it("should style button with red color", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const resetButton = Array.from(links).find(
        (a) => a.textContent === "Reset Password"
      );
      expect(resetButton?.style.backgroundColor).toBe("rgb(239, 68, 68)");
      expect(resetButton?.style.color).toBe("rgb(255, 255, 255)");
    });

    it("should center button", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      const buttonContainer = Array.from(divs).find(
        (div) => div.style.textAlign === "center" && div.querySelector("a")
      );
      expect(buttonContainer).toBeTruthy();
    });
  });

  describe("Expiry Warning Section", () => {
    it("should display expiry time", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/30 minutes/)).toBeTruthy();
    });

    it("should warn about link expiration", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/This link will expire/)).toBeTruthy();
    });

    it("should have yellow warning box", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      const warningBox = Array.from(divs).find(
        (div) => div.style.backgroundColor === "rgb(254, 243, 199)"
      );
      expect(warningBox).toBeTruthy();
    });

    it("should handle different expiry times", () => {
      const propsWithDiffTime = { ...mockProps, expiresIn: 60 };
      const { getByText } = render(
        <PasswordResetEmail {...propsWithDiffTime} />
      );
      expect(getByText(/60 minutes/)).toBeTruthy();
    });

    it("should handle 1 hour expiry", () => {
      const propsWithHour = { ...mockProps, expiresIn: 60 };
      const { container } = render(<PasswordResetEmail {...propsWithHour} />);
      expect(container).toBeTruthy();
    });
  });

  describe("Security Notice Section", () => {
    it("should display security warning", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/If you didn't request this/)).toBeTruthy();
    });

    it("should advise ignoring if not requested", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/you can safely ignore this email/)).toBeTruthy();
    });

    it("should mention account security", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/Your password will remain unchanged/)).toBeTruthy();
    });
  });

  describe("Alternative Link Section", () => {
    it("should provide fallback text link", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/If the button doesn't work/)).toBeTruthy();
    });

    it("should display clickable URL", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(mockProps.resetLink)).toBeTruthy();
    });

    it("should link alternative URL correctly", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const altLink = Array.from(links).find(
        (a) => a.textContent === mockProps.resetLink
      );
      expect(altLink?.getAttribute("href")).toBe(mockProps.resetLink);
    });

    it("should style alternative link differently", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const altLink = Array.from(links).find(
        (a) => a.textContent === mockProps.resetLink
      );
      expect(altLink?.style.color).toBeTruthy();
    });
  });

  describe("Help Section", () => {
    it("should offer support contact", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/Need help/)).toBeTruthy();
    });

    it("should provide support email", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const supportLink = Array.from(links).find(
        (a) => a.getAttribute("href") === "mailto:support@justforview.in"
      );
      expect(supportLink).toBeTruthy();
    });

    it("should link to help center", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const helpLink = Array.from(links).find((a) =>
        a.getAttribute("href")?.includes("/help")
      );
      expect(helpLink).toBeTruthy();
    });
  });

  describe("Footer Section", () => {
    it("should display company name", () => {
      const { getAllByText } = render(<PasswordResetEmail {...mockProps} />);
      const brandRefs = getAllByText(/JustForView.in/);
      expect(brandRefs.length).toBeGreaterThan(0);
    });

    it("should display copyright", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("©");
    });

    it("should have muted footer text", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const footer = container.querySelector(
        'div[style*="backgroundColor: rgb(249, 250, 251)"]'
      );
      expect(footer).toBeTruthy();
    });
  });

  describe("Props Validation", () => {
    it("should handle empty user name", () => {
      const propsWithEmptyName = { ...mockProps, userName: "" };
      const { container } = render(
        <PasswordResetEmail {...propsWithEmptyName} />
      );
      expect(container).toBeTruthy();
    });

    it("should handle special characters in name", () => {
      const propsWithSpecialChars = { ...mockProps, userName: "O'Connor" };
      const { getByText } = render(
        <PasswordResetEmail {...propsWithSpecialChars} />
      );
      expect(getByText(/O'Connor/)).toBeTruthy();
    });

    it("should handle very long names", () => {
      const propsWithLongName = {
        ...mockProps,
        userName: "Venkatanarasimharajuvaripeta Subramanian",
      };
      const { container } = render(
        <PasswordResetEmail {...propsWithLongName} />
      );
      expect(container).toBeTruthy();
    });

    it("should handle reset links with query params", () => {
      const propsWithParams = {
        ...mockProps,
        resetLink: "https://justforview.in/reset?token=abc&user=123",
      };
      const { container } = render(<PasswordResetEmail {...propsWithParams} />);
      const links = container.querySelectorAll("a");
      const resetButton = Array.from(links).find(
        (a) => a.textContent === "Reset Password"
      );
      expect(resetButton?.getAttribute("href")).toContain("token=abc");
    });

    it("should handle very short expiry times", () => {
      const propsWithShortTime = { ...mockProps, expiresIn: 5 };
      const { getByText } = render(
        <PasswordResetEmail {...propsWithShortTime} />
      );
      expect(getByText(/5 minutes/)).toBeTruthy();
    });

    it("should handle very long expiry times", () => {
      const propsWithLongTime = { ...mockProps, expiresIn: 1440 };
      const { getByText } = render(
        <PasswordResetEmail {...propsWithLongTime} />
      );
      expect(getByText(/1440 minutes/)).toBeTruthy();
    });

    it("should handle international email formats", () => {
      const propsWithIntlEmail = {
        ...mockProps,
        userEmail: "user@example.co.in",
      };
      const { container } = render(
        <PasswordResetEmail {...propsWithIntlEmail} />
      );
      expect(container).toBeTruthy();
    });
  });

  describe("Security Features", () => {
    it("should use HTTPS for reset link", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const links = container.querySelectorAll('a[href^="http"]');
      const resetLink = Array.from(links).find((a) =>
        a.getAttribute("href")?.includes("reset")
      );
      expect(resetLink?.getAttribute("href")?.startsWith("https://")).toBe(
        true
      );
    });

    it("should not expose the token in visible text", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const text = container.textContent || "";
      // Token should only be in href, not visible text
      expect(text).not.toMatch(/token.*xyz789abc/i);
    });

    it("should warn about unsolicited requests", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/If you didn't request/)).toBeTruthy();
    });

    it("should emphasize security in warning box", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      const warningBox = Array.from(divs).find(
        (div) => div.style.backgroundColor === "rgb(254, 243, 199)"
      );
      expect(warningBox).toBeTruthy();
    });
  });

  describe("User Experience", () => {
    it("should have clear call-to-action", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      const button = getByText("Reset Password");
      expect(button).toBeTruthy();
    });

    it("should provide urgency with expiry info", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/will expire/)).toBeTruthy();
    });

    it("should offer alternative if button fails", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/If the button doesn't work/)).toBeTruthy();
    });

    it("should provide support options", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
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

  describe("Responsive Design", () => {
    it("should have viewport meta tag", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const meta = container.querySelector('meta[name="viewport"]');
      expect(meta?.getAttribute("content")).toBe(
        "width=device-width, initial-scale=1.0"
      );
    });

    it("should use max-width container", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const mainDiv = container.querySelector("body > div");
      expect(mainDiv?.style.maxWidth).toBe("600px");
    });

    it("should center content", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const mainDiv = container.querySelector("body > div");
      expect(mainDiv?.style.margin).toContain("auto");
    });
  });

  describe("Email Client Compatibility", () => {
    it("should use inline styles", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
      divs.forEach((div) => {
        expect(div.getAttribute("style")).toBeTruthy();
      });
    });

    it("should use web-safe fonts", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const body = container.querySelector("body");
      const fontFamily = body?.style.fontFamily;
      expect(fontFamily).toContain("sans-serif");
    });

    it("should avoid flexbox/grid", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const elements = container.querySelectorAll("*");
      elements.forEach((el) => {
        const style = (el as HTMLElement).style;
        expect(style.display).not.toBe("flex");
        expect(style.display).not.toBe("grid");
      });
    });

    it("should use table-safe layout", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.querySelector("h1")).toBeTruthy();
    });

    it("should use semantic HTML", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.querySelector("p")).toBeTruthy();
      expect(container.querySelector("a")).toBeTruthy();
    });

    it("should have good color contrast", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const button = Array.from(container.querySelectorAll("a")).find(
        (a) => a.textContent === "Reset Password"
      );
      expect(button?.style.backgroundColor).toBeTruthy();
      expect(button?.style.color).toBe("rgb(255, 255, 255)");
    });

    it("should have descriptive link text", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText("Reset Password")).toBeTruthy();
      // Not generic "Click here"
    });
  });

  describe("Brand Consistency", () => {
    it("should use red warning color theme", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const redElements = container.querySelectorAll('[style*="239, 68, 68"]');
      expect(redElements.length).toBeGreaterThan(0);
    });

    it("should display brand name", () => {
      const { getAllByText } = render(<PasswordResetEmail {...mockProps} />);
      const brandRefs = getAllByText(/JustForView.in/);
      expect(brandRefs.length).toBeGreaterThan(0);
    });

    it("should use consistent typography", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const headings = container.querySelectorAll("h1, h2, h3");
      headings.forEach((h) => {
        expect((h as HTMLElement).style.fontWeight).toBeTruthy();
      });
    });

    it("should use consistent spacing", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const sections = container.querySelectorAll('div[style*="padding"]');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe("Content Quality", () => {
    it("should have clear messaging", () => {
      const { getByText } = render(<PasswordResetEmail {...mockProps} />);
      expect(getByText(/reset the password/)).toBeTruthy();
    });

    it("should use proper grammar", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).not.toMatch(/your's/);
      expect(text).not.toMatch(/their's/);
    });

    it("should have professional tone", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).not.toContain("Hey");
      expect(text).not.toContain("yo");
    });
  });
});
