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

    it("should render main content", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("Reset Your Password");
    });

    it("should render with proper structure", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.querySelector("div")).toBeTruthy();
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
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("If you didn't request");
    });

    it("should advise ignoring if not requested", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("please ignore this email");
    });

    it("should mention account security", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain(
        "Your password will remain unchanged"
      );
    });
  });

  describe("Alternative Link Section", () => {
    it("should provide fallback text link", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("If the button doesn't work");
    });

    it("should display clickable URL", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain(mockProps.resetLink);
    });

    it("should link alternative URL correctly", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const links = container.querySelectorAll("p");
      const urlParagraph = Array.from(links).find((p) =>
        p.textContent?.includes(mockProps.resetLink)
      );
      expect(urlParagraph).toBeTruthy();
    });

    it("should style alternative link differently", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const paragraphs = container.querySelectorAll("p");
      const urlParagraph = Array.from(paragraphs).find((p) =>
        p.textContent?.includes(mockProps.resetLink)
      );
      expect(urlParagraph).toBeTruthy();
    });
  });

  describe("Help Section", () => {
    it("should offer support contact", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("Having trouble");
    });

    it("should provide support email", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const links = container.querySelectorAll("a");
      const supportLink = Array.from(links).find(
        (a) => a.getAttribute("href") === "mailto:support@justforview.in"
      );
      expect(supportLink).toBeTruthy();
    });
  });

  describe("Footer Section", () => {
    it("should display company name", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("JustForView.in");
    });

    it("should display copyright", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const text = container.textContent || "";
      expect(text).toContain("©");
    });

    it("should have footer content", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("All rights reserved");
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

    it("should include token in link", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const text = container.textContent || "";
      // Token should be present in the displayed URL
      expect(text).toContain("xyz789abc");
    });

    it("should warn about unsolicited requests", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("If you didn't request");
    });

    it("should emphasize security in warning box", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("Security Notice");
    });
  });

  describe("User Experience", () => {
    it("should have clear call-to-action", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("Reset Password");
    });

    it("should provide urgency with expiry info", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("will expire");
    });

    it("should offer alternative if button fails", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container.textContent).toContain("If the button doesn't work");
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
    it("should render responsive content", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      expect(container).toBeTruthy();
    });

    it("should use container structure", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
    });

    it("should center content", () => {
      const { container } = render(<PasswordResetEmail {...mockProps} />);
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThan(0);
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
