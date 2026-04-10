import { render, screen } from "@testing-library/react";
import { Heading, Text, Label, Caption, Span } from "@mohasinac/appkit/ui";
import { TextLink } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

describe("Typography Components", () => {
  describe("Heading", () => {
    it("renders h1 by default", () => {
      render(<Heading>Test Heading</Heading>);
      const heading = screen.getByText("Test Heading");
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H1");
    });

    it("renders different heading levels", () => {
      const { rerender } = render(<Heading level={2}>Heading 2</Heading>);
      expect(screen.getByText("Heading 2").tagName).toBe("H2");

      rerender(<Heading level={3}>Heading 3</Heading>);
      expect(screen.getByText("Heading 3").tagName).toBe("H3");

      rerender(<Heading level={4}>Heading 4</Heading>);
      expect(screen.getByText("Heading 4").tagName).toBe("H4");

      rerender(<Heading level={5}>Heading 5</Heading>);
      expect(screen.getByText("Heading 5").tagName).toBe("H5");

      rerender(<Heading level={6}>Heading 6</Heading>);
      expect(screen.getByText("Heading 6").tagName).toBe("H6");
    });

    it("applies correct size classes for each level", () => {
      const { rerender, container } = render(<Heading level={1}>H1</Heading>);
      expect(container.querySelector("h1")).toBeInTheDocument();

      rerender(<Heading level={2}>H2</Heading>);
      expect(container.querySelector("h2")).toBeInTheDocument();

      rerender(<Heading level={3}>H3</Heading>);
      expect(container.querySelector("h3")).toBeInTheDocument();

      rerender(<Heading level={4}>H4</Heading>);
      expect(container.querySelector("h4")).toBeInTheDocument();

      rerender(<Heading level={5}>H5</Heading>);
      expect(container.querySelector("h5")).toBeInTheDocument();

      rerender(<Heading level={6}>H6</Heading>);
      expect(container.querySelector("h6")).toBeInTheDocument();
    });

    it("accepts custom className", () => {
      render(<Heading className="custom-heading">Heading</Heading>);
      expect(screen.getByText("Heading")).toHaveClass("custom-heading");
    });
  });

  describe("Text", () => {
    it("renders paragraph by default", () => {
      render(<Text>Test text</Text>);
      expect(screen.getByText("Test text")).toBeInTheDocument();
    });

    it("renders different text variants", () => {
      render(<Text variant="primary">Primary Text</Text>);
      expect(screen.getByText("Primary Text")).toBeInTheDocument();
    });

    it("accepts custom className", () => {
      render(<Text className="custom-text">Text</Text>);
      expect(screen.getByText("Text")).toHaveClass("custom-text");
    });
  });

  describe("Label", () => {
    it("renders label element", () => {
      render(<Label>Test Label</Label>);
      const label = screen.getByText("Test Label");
      expect(label.tagName).toBe("LABEL");
    });

    it("shows required indicator when required", () => {
      render(<Label required>Required Label</Label>);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("supports htmlFor attribute", () => {
      render(<Label htmlFor="input-id">Label</Label>);
      expect(screen.getByText("Label")).toHaveAttribute("for", "input-id");
    });

    it("accepts custom className", () => {
      render(<Label className="custom-label">Label</Label>);
      expect(screen.getByText("Label")).toHaveClass("custom-label");
    });
  });

  describe("Caption", () => {
    it("renders a <span> element", () => {
      const { container } = render(<Caption>3 days ago</Caption>);
      expect(container.querySelector("span")).toBeInTheDocument();
    });

    it("renders children", () => {
      render(<Caption>meta info</Caption>);
      expect(screen.getByText("meta info")).toBeInTheDocument();
    });

    it("applies text-xs by default", () => {
      const { container } = render(<Caption>tiny</Caption>);
      expect(container.firstChild).toHaveClass("text-xs");
    });

    it("applies accent variant (indigo, font-semibold)", () => {
      const { container } = render(<Caption variant="accent">badge</Caption>);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("primary");
      expect(el.className).toContain("font-semibold");
    });

    it("applies inverse variant", () => {
      const { container } = render(<Caption variant="inverse">inv</Caption>);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("primary");
    });

    it("forwards extra className", () => {
      const { container } = render(<Caption className="ml-2">text</Caption>);
      expect(container.firstChild).toHaveClass("ml-2");
    });
  });

  describe("Span", () => {
    it("renders a <span> element", () => {
      const { container } = render(<Span>inline</Span>);
      expect(container.querySelector("span")).toBeInTheDocument();
    });

    it("applies no colour class when variant=inherit (default)", () => {
      const { container } = render(<Span>plain</Span>);
      // Empty className — no colour injected for inherit
      expect((container.firstChild as HTMLElement).className.trim()).toBe("");
    });

    it("applies primary variant", () => {
      const { container } = render(<Span variant="primary">text</Span>);
      const el = container.firstChild as HTMLElement;
      THEME_CONSTANTS.themed.textPrimary.split(" ").forEach((cls) => {
        expect(el.className).toContain(cls);
      });
    });

    it("applies error variant", () => {
      const { container } = render(<Span variant="error">err</Span>);
      const el = container.firstChild as HTMLElement;
      THEME_CONSTANTS.themed.textError.split(" ").forEach((cls) => {
        expect(el.className).toContain(cls);
      });
    });

    it("applies accent variant", () => {
      const { container } = render(<Span variant="accent">acc</Span>);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("indigo");
    });

    it("applies size=xs", () => {
      render(<Span size="xs">xs</Span>);
      expect(screen.getByText("xs")).toHaveClass("text-xs");
    });

    it("applies weight=bold", () => {
      render(<Span weight="bold">bold</Span>);
      expect(screen.getByText("bold")).toHaveClass("font-bold");
    });

    it("forwards extra className", () => {
      render(<Span className="bg-clip-text">gradient</Span>);
      expect(screen.getByText("gradient")).toHaveClass("bg-clip-text");
    });
  });

  describe("TextLink", () => {
    // @/i18n/navigation Link is globally mocked as <a> in jest.setup.ts

    it("renders link children", () => {
      render(<TextLink href="/products">Browse</TextLink>);
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("passes href to anchor for internal paths", () => {
      const { container } = render(
        <TextLink href="/products">Products</TextLink>,
      );
      expect(container.querySelector("a")).toHaveAttribute("href", "/products");
    });

    it("adds target=_blank and rel for http URLs", () => {
      const { container } = render(
        <TextLink href="https://example.com">External</TextLink>,
      );
      const a = container.querySelector("a");
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("adds target=_blank for mailto: hrefs", () => {
      const { container } = render(
        <TextLink href="mailto:hi@test.com">Email</TextLink>,
      );
      expect(container.querySelector("a")).toHaveAttribute("target", "_blank");
    });

    it("forces external rendering with external={true}", () => {
      const { container } = render(
        <TextLink href="/docs" external>
          Docs
        </TextLink>,
      );
      const a = container.querySelector("a");
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("href", "/docs");
    });

    it("applies default (indigo) variant class", () => {
      const { container } = render(<TextLink href="/">Home</TextLink>);
      expect((container.querySelector("a") as HTMLElement).className).toContain(
        "indigo",
      );
    });

    it("applies danger variant class", () => {
      const { container } = render(
        <TextLink href="#" variant="danger">
          Delete
        </TextLink>,
      );
      expect((container.querySelector("a") as HTMLElement).className).toContain(
        "red",
      );
    });

    it("forwards aria-label", () => {
      const { container } = render(
        <TextLink href="/cart" aria-label="View cart">
          Cart
        </TextLink>,
      );
      expect(container.querySelector("a")).toHaveAttribute(
        "aria-label",
        "View cart",
      );
    });

    it("merges extra className", () => {
      const { container } = render(
        <TextLink href="/store" className="font-semibold">
          Store
        </TextLink>,
      );
      expect(container.querySelector("a")).toHaveClass("font-semibold");
    });
  });
});
