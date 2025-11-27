import { render, screen } from "@testing-library/react";
import PrivacyPolicyPage from "./page";

// Mock LegalPageLayout component
jest.mock("@/components/legal/LegalPageLayout", () => ({
  __esModule: true,
  default: ({ children, title, lastUpdated, version, effectiveDate }: any) => (
    <div data-testid="legal-layout">
      <header>
        <h1>{title}</h1>
        <p>Last Updated: {lastUpdated}</p>
        <p>Version: {version}</p>
        <p>Effective Date: {effectiveDate}</p>
      </header>
      <main>{children}</main>
    </div>
  ),
}));

describe("PrivacyPolicyPage", () => {
  it("should render Privacy Policy page", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("should display last updated date", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText(/November 7, 2025/i)).toBeInTheDocument();
  });

  it("should display version", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText(/Version: 2.0/i)).toBeInTheDocument();
  });

  it("should display effective date", () => {
    render(<PrivacyPolicyPage />);

    expect(
      screen.getByText(/Effective Date: November 1, 2025/i)
    ).toBeInTheDocument();
  });

  it("should render introduction section", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText("1. Introduction")).toBeInTheDocument();
  });

  it("should render information collection section", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText("2. Information We Collect")).toBeInTheDocument();
  });

  it("should render data usage section", () => {
    render(<PrivacyPolicyPage />);

    expect(
      screen.getByText("3. How We Use Your Information")
    ).toBeInTheDocument();
  });

  it("should render data sharing section", () => {
    render(<PrivacyPolicyPage />);

    expect(
      screen.getByText("4. How We Share Your Information")
    ).toBeInTheDocument();
  });

  it("should render security section", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText("5. Data Security")).toBeInTheDocument();
  });

  it("should render privacy rights section", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText("6. Your Privacy Rights")).toBeInTheDocument();
  });

  it("should render cookies section", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText("7. Cookies and Tracking")).toBeInTheDocument();
  });

  it("should render children's privacy section", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText("8. Children's Privacy")).toBeInTheDocument();
  });

  it("should render contact information", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText("13. Contact Information")).toBeInTheDocument();
    expect(screen.getByText(/privacy@letitrip.com/i)).toBeInTheDocument();
  });

  it("should render regulatory compliance section", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText("14. Regulatory Compliance")).toBeInTheDocument();
    const gdprElements = screen.getAllByText(/GDPR/i);
    expect(gdprElements.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CCPA/i)[0]).toBeInTheDocument();
  });

  it("should use LegalPageLayout", () => {
    const { container } = render(<PrivacyPolicyPage />);

    expect(
      container.querySelector('[data-testid="legal-layout"]')
    ).toBeInTheDocument();
  });
});
