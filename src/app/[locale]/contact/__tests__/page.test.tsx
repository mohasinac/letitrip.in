import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// contact/page.tsx is a thin wrapper around ContactForm + ContactInfoSidebar
jest.mock("@/components", () => ({
  ContactInfoSidebar: () => <div data-testid="contact-info-sidebar" />,
  ContactForm: () => (
    <div data-testid="contact-form">
      <input name="name" placeholder="Your name" />
      <input name="email" type="email" placeholder="Email" />
      <textarea name="message" placeholder="Message" />
      <button type="submit">Send Message</button>
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    CONTACT_PAGE: {
      TITLE: "Contact Us",
      SUBTITLE: "We'd love to hear from you",
    },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
    },
  },
}));

import ContactPage from "../page";

describe("ContactPage", () => {
  it("renders without crashing", () => {
    render(<ContactPage />);
    expect(document.body).toBeInTheDocument();
  });

  it("renders the page heading", () => {
    render(<ContactPage />);
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("renders name, email, and message fields", () => {
    render(<ContactPage />);
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Message")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<ContactPage />);
    expect(
      screen.getByRole("button", { name: "Send Message" }),
    ).toBeInTheDocument();
  });

  it("renders contact info sidebar", () => {
    render(<ContactPage />);
    expect(screen.getByTestId("contact-info-sidebar")).toBeInTheDocument();
  });
});
