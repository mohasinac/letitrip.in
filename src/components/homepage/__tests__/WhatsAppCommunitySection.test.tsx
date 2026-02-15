import { render, screen } from "@testing-library/react";
import { WhatsAppCommunitySection } from "../WhatsAppCommunitySection";

// Mock useApiQuery
const mockUseApiQuery = jest.fn();
jest.mock("@/hooks", () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
}));

// Mock Button component
jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

const mockWhatsAppData = [
  {
    id: "whatsapp-1",
    type: "whatsapp-community",
    enabled: true,
    config: {
      title: "Join Our WhatsApp Community",
      description: "Connect with thousands of shoppers",
      buttonText: "Join Group Now",
      groupLink: "https://chat.whatsapp.com/test-group",
      memberCount: 15000,
      benefits: [
        "Exclusive deals and early access",
        "Product launch notifications",
        "Community support from members",
        "Tips and tricks from experts",
      ],
    },
  },
];

describe("WhatsAppCommunitySection", () => {
  beforeEach(() => {
    mockUseApiQuery.mockReset();
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders loading skeleton when loading", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<WhatsAppCommunitySection />);
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  // ====================================
  // No Data / Disabled State
  // ====================================
  describe("No Data / Disabled State", () => {
    it("returns null when no config", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<WhatsAppCommunitySection />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when config is disabled", () => {
      // When disabled, API returns empty array (filtered by enabled=true query param)
      mockUseApiQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { container } = render(<WhatsAppCommunitySection />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when settings are empty", () => {
      mockUseApiQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { container } = render(<WhatsAppCommunitySection />);
      expect(container.innerHTML).toBe("");
    });
  });

  // ====================================
  // Content Rendering
  // ====================================
  describe("Content Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockWhatsAppData,
        isLoading: false,
      });
    });

    it('renders "Join Our WhatsApp Community" heading', () => {
      render(<WhatsAppCommunitySection />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Join Our WhatsApp Community",
      );
    });

    it("renders WhatsApp icon", () => {
      render(<WhatsAppCommunitySection />);
      expect(screen.getByText("💬")).toBeInTheDocument();
    });

    it("renders member count", () => {
      render(<WhatsAppCommunitySection />);
      expect(screen.getByText(/15,000/)).toBeInTheDocument();
    });

    it("renders all 4 benefits", () => {
      render(<WhatsAppCommunitySection />);
      expect(
        screen.getByText("Exclusive deals and early access"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Product launch notifications"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Community support from members"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Tips and tricks from experts"),
      ).toBeInTheDocument();
    });

    it('renders "Join Group Now" CTA button', () => {
      render(<WhatsAppCommunitySection />);
      expect(screen.getByText("Join Group Now")).toBeInTheDocument();
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("uses h2 for section heading", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockWhatsAppData,
        isLoading: false,
      });
      render(<WhatsAppCommunitySection />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("renders as a section element", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockWhatsAppData,
        isLoading: false,
      });
      const { container } = render(<WhatsAppCommunitySection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });
});
