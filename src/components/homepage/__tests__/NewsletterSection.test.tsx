import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { NewsletterSection } from "../NewsletterSection";

// Mock hooks
const mockMutate = jest.fn();
const mockUseApiMutation = jest.fn();
const mockUseMessage = jest.fn();

jest.mock("@/hooks", () => ({
  useApiMutation: (...args: unknown[]) => mockUseApiMutation(...args),
  useMessage: () => mockUseMessage(),
}));

// Mock @/components so Input and Button render as plain HTML elements
jest.mock("@/components", () => ({
  Button: ({
    children,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Input: ({
    onChange,
    value,
    disabled,
    placeholder,
    type,
    ...props
  }: {
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    value?: string;
    disabled?: boolean;
    placeholder?: string;
    type?: string;
    [key: string]: unknown;
  }) => (
    <input
      onChange={onChange}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      type={type || "text"}
    />
  ),
}));

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "Link";
  return MockLink;
});

describe("NewsletterSection", () => {
  beforeEach(() => {
    mockUseApiMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
    mockUseMessage.mockReturnValue({
      message: null,
      showSuccess: jest.fn(),
      showError: jest.fn(),
    });
    mockMutate.mockReset();
  });

  // ====================================
  // Rendering
  // ====================================
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<NewsletterSection />);
    });

    it("renders the Mail lucide icon svg", () => {
      const { container } = render(<NewsletterSection />);
      // lucide Mail renders as an svg
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("renders subscribe button", () => {
      render(<NewsletterSection />);
      expect(
        screen.getByRole("button", { name: /subscribe/i }),
      ).toBeInTheDocument();
    });

    it("renders email input", () => {
      render(<NewsletterSection />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders privacy policy link", () => {
      render(<NewsletterSection />);
      expect(
        screen.getByRole("link", { name: /privacy policy/i }),
      ).toBeInTheDocument();
    });
  });

  // ====================================
  // Form Validation
  // ====================================
  describe("Form Validation", () => {
    it("calls showError when submitted with empty email", async () => {
      const showError = jest.fn();
      mockUseMessage.mockReturnValue({
        message: null,
        showSuccess: jest.fn(),
        showError,
      });
      render(<NewsletterSection />);

      fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));
      await waitFor(() => expect(showError).toHaveBeenCalled());
    });

    it("calls showError when submitted with invalid email", async () => {
      const showError = jest.fn();
      mockUseMessage.mockReturnValue({
        message: null,
        showSuccess: jest.fn(),
        showError,
      });
      render(<NewsletterSection />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, {
        target: { value: "not-an-email" },
      });
      // Use fireEvent.submit to bypass jsdom's HTML5 email constraint validation
      fireEvent.submit(input.closest("form")!);
      await waitFor(() => expect(showError).toHaveBeenCalled());
    });

    it("calls mutate with email when form is valid", async () => {
      mockMutate.mockResolvedValue({});
      render(<NewsletterSection />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));
      await waitFor(() =>
        expect(mockMutate).toHaveBeenCalledWith({ email: "user@example.com" }),
      );
    });
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("disables input and button while loading", () => {
      mockUseApiMutation.mockReturnValue({
        mutate: mockMutate,
        isLoading: true,
      });
      render(<NewsletterSection />);
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("renders as a section element", () => {
      const { container } = render(<NewsletterSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });
});
