/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactPage from "./page";
import { supportService } from "@/services/support.service";

// Mock the support service
jest.mock("@/services/support.service", () => ({
  supportService: {
    createTicket: jest.fn(),
  },
}));

describe("ContactPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the contact page correctly", () => {
    render(<ContactPage />);

    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
    expect(screen.getByText("Send us a Message")).toBeInTheDocument();
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    const mockCreateTicket = supportService.createTicket as jest.MockedFunction<
      typeof supportService.createTicket
    >;
    mockCreateTicket.mockResolvedValueOnce({} as any);

    render(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: "Test Subject" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Test message" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(mockCreateTicket).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        phone: "",
        subject: "Test Subject",
        message: "Test message",
        category: "general",
        priority: "medium",
      });
    });

    expect(screen.getByText("Message sent successfully!")).toBeInTheDocument();
  });

  it("shows error on form submission failure", async () => {
    const mockCreateTicket = supportService.createTicket as jest.MockedFunction<
      typeof supportService.createTicket
    >;
    mockCreateTicket.mockRejectedValueOnce(new Error("Failed to submit"));

    render(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: "Test Subject" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Test message" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to submit")).toBeInTheDocument();
    });
  });

  it("validates required fields", async () => {
    render(<ContactPage />);

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    // HTML5 validation should prevent submission without required fields
    expect(supportService.createTicket).not.toHaveBeenCalled();
  });
});
