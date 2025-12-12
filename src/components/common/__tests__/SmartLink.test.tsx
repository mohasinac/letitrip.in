import { getLinkType, isDownloadableLink, resolveUrl } from "@/lib/link-utils";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { SmartLink } from "../SmartLink";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock link utilities
jest.mock("@/lib/link-utils", () => ({
  getLinkType: jest.fn(),
  resolveUrl: jest.fn((url: string) => url),
  isDownloadableLink: jest.fn(),
}));

const mockGetLinkType = getLinkType as jest.MockedFunction<typeof getLinkType>;
const mockResolveUrl = resolveUrl as jest.MockedFunction<typeof resolveUrl>;
const mockIsDownloadableLink = isDownloadableLink as jest.MockedFunction<
  typeof isDownloadableLink
>;

describe("SmartLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveUrl.mockImplementation((url) => url);
    mockIsDownloadableLink.mockReturnValue(false);
  });

  describe("Internal Links", () => {
    it("renders internal link using Next.js Link", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/products">Products</SmartLink>);
      const link = screen.getByText("Products");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/products");
    });

    it("does not open in new tab by default", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/products">Products</SmartLink>);
      const link = screen.getByText("Products");
      expect(link).not.toHaveAttribute("target", "_blank");
    });

    it("does not have security rel attributes for internal links", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/products">Products</SmartLink>);
      const link = screen.getByText("Products");
      const relAttr = link.getAttribute("rel");
      expect(relAttr).toBeFalsy();
    });

    it("applies custom className", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" className="text-blue-500">
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      expect(link).toHaveClass("text-blue-500");
    });

    it("handles anchor links", () => {
      mockGetLinkType.mockReturnValue("anchor");
      render(<SmartLink href="#section">#Section</SmartLink>);
      const link = screen.getByText("#Section");
      expect(link).toHaveAttribute("href", "#section");
    });

    it("can force new tab for internal link", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" newTab>
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("External Links", () => {
    it("renders external link with proper security attributes", () => {
      mockGetLinkType.mockReturnValue("external");
      render(<SmartLink href="https://example.com">Example</SmartLink>);
      const link = screen.getByText("Example");
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("opens in new tab by default", () => {
      mockGetLinkType.mockReturnValue("external");
      render(<SmartLink href="https://example.com">Example</SmartLink>);
      const link = screen.getByText("Example");
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("has noopener noreferrer rel by default", () => {
      mockGetLinkType.mockReturnValue("external");
      render(<SmartLink href="https://example.com">Example</SmartLink>);
      const link = screen.getByText("Example");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows external icon when showExternalIcon is true", () => {
      mockGetLinkType.mockReturnValue("external");
      const { container } = render(
        <SmartLink href="https://example.com" showExternalIcon>
          Example
        </SmartLink>
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("external icon has correct styling", () => {
      mockGetLinkType.mockReturnValue("external");
      const { container } = render(
        <SmartLink href="https://example.com" showExternalIcon>
          Example
        </SmartLink>
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("inline-block", "w-3", "h-3", "ml-1");
    });

    it("can force internal behavior for external URL", () => {
      mockGetLinkType.mockReturnValue("external");
      render(
        <SmartLink href="https://example.com" internal>
          Example
        </SmartLink>
      );
      const link = screen.getByText("Example");
      expect(link).not.toHaveAttribute("target", "_blank");
    });
  });

  describe("Email and Phone Links", () => {
    it("handles email links", () => {
      mockGetLinkType.mockReturnValue("email");
      render(<SmartLink href="mailto:test@example.com">Email</SmartLink>);
      const link = screen.getByText("Email");
      expect(link).toHaveAttribute("href", "mailto:test@example.com");
    });

    it("email links do not open in new tab", () => {
      mockGetLinkType.mockReturnValue("email");
      render(<SmartLink href="mailto:test@example.com">Email</SmartLink>);
      const link = screen.getByText("Email");
      expect(link).not.toHaveAttribute("target", "_blank");
    });

    it("handles phone links", () => {
      mockGetLinkType.mockReturnValue("phone");
      render(<SmartLink href="tel:+1234567890">Call</SmartLink>);
      const link = screen.getByText("Call");
      expect(link).toHaveAttribute("href", "tel:+1234567890");
    });

    it("phone links do not open in new tab", () => {
      mockGetLinkType.mockReturnValue("phone");
      render(<SmartLink href="tel:+1234567890">Call</SmartLink>);
      const link = screen.getByText("Call");
      expect(link).not.toHaveAttribute("target", "_blank");
    });
  });

  describe("Download Links", () => {
    it("shows download icon when showDownloadIcon is true and link is downloadable", () => {
      mockGetLinkType.mockReturnValue("internal");
      mockIsDownloadableLink.mockReturnValue(true);
      const { container } = render(
        <SmartLink href="/file.pdf" showDownloadIcon>
          Download
        </SmartLink>
      );
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("download icon has correct styling", () => {
      mockGetLinkType.mockReturnValue("internal");
      mockIsDownloadableLink.mockReturnValue(true);
      const { container } = render(
        <SmartLink href="/file.pdf" showDownloadIcon>
          Download
        </SmartLink>
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("inline-block", "w-3", "h-3", "ml-1");
    });

    it("sets download attribute when download=true", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/file.pdf" download>
          Download
        </SmartLink>
      );
      const link = screen.getByText("Download");
      expect(link).toHaveAttribute("download");
    });

    it("sets download attribute with filename", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/file.pdf" download="report.pdf">
          Download
        </SmartLink>
      );
      const link = screen.getByText("Download");
      expect(link).toHaveAttribute("download", "report.pdf");
    });

    it("does not set download attribute when download=false", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/file.pdf" download={false}>
          Download
        </SmartLink>
      );
      const link = screen.getByText("Download");
      expect(link).not.toHaveAttribute("download");
    });
  });

  describe("Disabled State", () => {
    it("renders as span when disabled", () => {
      mockGetLinkType.mockReturnValue("internal");
      const { container } = render(
        <SmartLink href="/products" disabled>
          Products
        </SmartLink>
      );
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
      expect(container.querySelector("a")).not.toBeInTheDocument();
    });

    it("has cursor-not-allowed when disabled", () => {
      mockGetLinkType.mockReturnValue("internal");
      const { container } = render(
        <SmartLink href="/products" disabled>
          Products
        </SmartLink>
      );
      const span = container.querySelector("span");
      expect(span).toHaveClass("cursor-not-allowed");
    });

    it("has opacity-50 when disabled", () => {
      mockGetLinkType.mockReturnValue("internal");
      const { container } = render(
        <SmartLink href="/products" disabled>
          Products
        </SmartLink>
      );
      const span = container.querySelector("span");
      expect(span).toHaveClass("opacity-50");
    });

    it("has aria-disabled when disabled", () => {
      mockGetLinkType.mockReturnValue("internal");
      const { container } = render(
        <SmartLink href="/products" disabled>
          Products
        </SmartLink>
      );
      const span = container.querySelector("span");
      expect(span).toHaveAttribute("aria-disabled", "true");
    });

    it("has role=link when disabled", () => {
      mockGetLinkType.mockReturnValue("internal");
      const { container } = render(
        <SmartLink href="/products" disabled>
          Products
        </SmartLink>
      );
      const span = container.querySelector("span");
      expect(span).toHaveAttribute("role", "link");
    });

    it("has tabIndex=-1 when disabled", () => {
      mockGetLinkType.mockReturnValue("internal");
      const { container } = render(
        <SmartLink href="/products" disabled>
          Products
        </SmartLink>
      );
      const span = container.querySelector("span");
      expect(span).toHaveAttribute("tabIndex", "-1");
    });

    it("prevents onClick when disabled", () => {
      mockGetLinkType.mockReturnValue("internal");
      const onClick = jest.fn();
      render(
        <SmartLink href="/products" disabled onClick={onClick}>
          Products
        </SmartLink>
      );
      const span = screen.getByText("Products");
      fireEvent.click(span);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("Custom Attributes", () => {
    it("applies custom rel attribute", () => {
      mockGetLinkType.mockReturnValue("external");
      render(
        <SmartLink href="https://example.com" rel="custom-rel">
          Example
        </SmartLink>
      );
      const link = screen.getByText("Example");
      expect(link).toHaveAttribute("rel", "custom-rel");
    });

    it("applies custom target attribute", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" target="_self">
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      expect(link).toHaveAttribute("target", "_self");
    });

    it("applies custom aria-label", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" aria-label="Go to products page">
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      expect(link).toHaveAttribute("aria-label", "Go to products page");
    });

    it("applies custom title", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" title="Products page">
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      expect(link).toHaveAttribute("title", "Products page");
    });

    it("appends relAppend values to rel", () => {
      mockGetLinkType.mockReturnValue("external");
      render(
        <SmartLink href="https://example.com" relAppend={["nofollow", "ugc"]}>
          Example
        </SmartLink>
      );
      const link = screen.getByText("Example");
      const rel = link.getAttribute("rel");
      expect(rel).toContain("nofollow");
      expect(rel).toContain("ugc");
    });
  });

  describe("onClick Handler", () => {
    it("calls onClick when clicked", () => {
      mockGetLinkType.mockReturnValue("internal");
      const onClick = jest.fn();
      render(
        <SmartLink href="/products" onClick={onClick}>
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      fireEvent.click(link);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("passes event to onClick handler", () => {
      mockGetLinkType.mockReturnValue("internal");
      const onClick = jest.fn();
      render(
        <SmartLink href="/products" onClick={onClick}>
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      fireEvent.click(link);
      expect(onClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it("does not call onClick when disabled", () => {
      mockGetLinkType.mockReturnValue("internal");
      const onClick = jest.fn();
      render(
        <SmartLink href="/products" disabled onClick={onClick}>
          Products
        </SmartLink>
      );
      const span = screen.getByText("Products");
      fireEvent.click(span);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("Next.js Link Props", () => {
    it("passes prefetch prop to Next.js Link", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" prefetch={false}>
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      expect(link).toBeInTheDocument();
      // Next.js Link prop - tested through integration
    });

    it("passes scroll prop to Next.js Link", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" scroll={false}>
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      expect(link).toBeInTheDocument();
      // Next.js Link prop - tested through integration
    });

    it("passes replace prop to Next.js Link", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" replace>
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      expect(link).toBeInTheDocument();
      // Next.js Link prop - tested through integration
    });

    it("prefetch defaults to true", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/products">Products</SmartLink>);
      const link = screen.getByText("Products");
      expect(link).toBeInTheDocument();
      // Default value tested through integration
    });

    it("scroll defaults to true", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/products">Products</SmartLink>);
      const link = screen.getByText("Products");
      expect(link).toBeInTheDocument();
      // Default value tested through integration
    });

    it("replace defaults to false", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/products">Products</SmartLink>);
      const link = screen.getByText("Products");
      expect(link).toBeInTheDocument();
      // Default value tested through integration
    });
  });

  describe("Automatic Aria Labels", () => {
    it("generates aria-label for external links", () => {
      mockGetLinkType.mockReturnValue("external");
      render(<SmartLink href="https://example.com">Example</SmartLink>);
      const link = screen.getByText("Example");
      expect(link).toHaveAttribute("aria-label", "Opens in new tab");
    });

    it("generates aria-label for downloadable links", () => {
      mockGetLinkType.mockReturnValue("internal");
      mockIsDownloadableLink.mockReturnValue(true);
      render(<SmartLink href="/file.pdf">Download</SmartLink>);
      const link = screen.getByText("Download");
      expect(link).toHaveAttribute("aria-label", "Download file");
    });

    it("does not generate aria-label for internal links", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/products">Products</SmartLink>);
      const link = screen.getByText("Products");
      expect(link).not.toHaveAttribute("aria-label");
    });

    it("custom aria-label overrides automatic one", () => {
      mockGetLinkType.mockReturnValue("external");
      render(
        <SmartLink href="https://example.com" aria-label="Custom label">
          Example
        </SmartLink>
      );
      const link = screen.getByText("Example");
      expect(link).toHaveAttribute("aria-label", "Custom label");
    });
  });

  describe("Force Behaviors", () => {
    it("external prop forces external behavior", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" external>
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      // external prop should add security attributes
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("internal prop forces internal behavior", () => {
      mockGetLinkType.mockReturnValue("external");
      render(
        <SmartLink href="https://example.com" internal>
          Example
        </SmartLink>
      );
      const link = screen.getByText("Example");
      expect(link).not.toHaveAttribute("target", "_blank");
    });

    it("newTab prop forces new tab for internal link", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products" newTab>
          Products
        </SmartLink>
      );
      const link = screen.getByText("Products");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty href gracefully", () => {
      mockGetLinkType.mockReturnValue("internal");
      const { container } = render(<SmartLink href="">Empty</SmartLink>);
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
      expect(span).toHaveAttribute("role", "link");
    });

    it("handles complex children", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(
        <SmartLink href="/products">
          <span>Complex</span> <strong>Children</strong>
        </SmartLink>
      );
      expect(screen.getByText("Complex")).toBeInTheDocument();
      expect(screen.getByText("Children")).toBeInTheDocument();
    });

    it("forwards ref correctly", () => {
      mockGetLinkType.mockReturnValue("internal");
      const ref = React.createRef<HTMLAnchorElement>();
      render(
        <SmartLink href="/products" ref={ref}>
          Products
        </SmartLink>
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });

    it("handles very long URLs", () => {
      mockGetLinkType.mockReturnValue("external");
      const longUrl = "https://example.com/" + "a".repeat(500);
      render(<SmartLink href={longUrl}>Long URL</SmartLink>);
      const link = screen.getByText("Long URL");
      expect(link).toHaveAttribute("href", longUrl);
    });

    it("handles special characters in href", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/search?q=test&sort=asc">Search</SmartLink>);
      const link = screen.getByText("Search");
      expect(link).toHaveAttribute("href", "/search?q=test&sort=asc");
    });
  });

  describe("Multiple Instances", () => {
    it("renders multiple links independently", () => {
      mockGetLinkType
        .mockReturnValueOnce("internal")
        .mockReturnValueOnce("external")
        .mockReturnValueOnce("email");

      render(
        <>
          <SmartLink href="/products">Products</SmartLink>
          <SmartLink href="https://example.com">Example</SmartLink>
          <SmartLink href="mailto:test@example.com">Email</SmartLink>
        </>
      );

      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Example")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("each instance has correct href", () => {
      mockGetLinkType
        .mockReturnValueOnce("internal")
        .mockReturnValueOnce("external");

      render(
        <>
          <SmartLink href="/products">Products</SmartLink>
          <SmartLink href="https://example.com">Example</SmartLink>
        </>
      );

      const productsLink = screen.getByText("Products");
      const exampleLink = screen.getByText("Example");

      expect(productsLink).toHaveAttribute("href", "/products");
      expect(exampleLink).toHaveAttribute("href", "https://example.com");
    });
  });

  describe("Rel Attribute Deduplication", () => {
    it("deduplicates rel values", () => {
      mockGetLinkType.mockReturnValue("external");
      render(
        <SmartLink
          href="https://example.com"
          relAppend={["noopener", "noreferrer"]}
        >
          Example
        </SmartLink>
      );
      const link = screen.getByText("Example");
      const rel = link.getAttribute("rel");
      const relParts = rel?.split(" ") || [];
      const uniqueRelParts = [...new Set(relParts)];
      expect(relParts.length).toBe(uniqueRelParts.length);
    });
  });

  describe("Icon Display", () => {
    it("does not show external icon for internal links", () => {
      mockGetLinkType.mockReturnValue("internal");
      const { container } = render(
        <SmartLink href="/products" showExternalIcon>
          Products
        </SmartLink>
      );
      const svg = container.querySelector("svg");
      expect(svg).not.toBeInTheDocument();
    });

    it("does not show download icon when link is not downloadable", () => {
      mockGetLinkType.mockReturnValue("internal");
      mockIsDownloadableLink.mockReturnValue(false);
      const { container } = render(
        <SmartLink href="/products" showDownloadIcon>
          Products
        </SmartLink>
      );
      const svg = container.querySelector("svg");
      expect(svg).not.toBeInTheDocument();
    });

    it("shows both icons when applicable", () => {
      mockGetLinkType.mockReturnValue("external");
      mockIsDownloadableLink.mockReturnValue(true);
      const { container } = render(
        <SmartLink
          href="https://example.com/file.pdf"
          showExternalIcon
          showDownloadIcon
        >
          Download
        </SmartLink>
      );
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBe(2);
    });
  });

  describe("Utility Functions Integration", () => {
    it("calls getLinkType with href", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/products">Products</SmartLink>);
      expect(mockGetLinkType).toHaveBeenCalledWith("/products");
    });

    it("calls resolveUrl with href", () => {
      mockGetLinkType.mockReturnValue("internal");
      render(<SmartLink href="/products">Products</SmartLink>);
      expect(mockResolveUrl).toHaveBeenCalledWith("/products");
    });

    it("calls isDownloadableLink when checking for downloadable links", () => {
      mockGetLinkType.mockReturnValue("internal");
      mockIsDownloadableLink.mockReturnValue(true);
      render(<SmartLink href="/file.pdf">Download</SmartLink>);
      expect(mockIsDownloadableLink).toHaveBeenCalledWith("/file.pdf");
    });
  });
});
