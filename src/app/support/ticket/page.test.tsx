import { render, screen, fireEvent } from "@testing-library/react";
import SupportTicketPage from "./page";

describe("SupportTicketPage", () => {
  it("renders form and submits valid ticket", async () => {
    render(<SupportTicketPage />);
    expect(screen.getByText(/Create Support Ticket/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Subject/i), {
      target: { value: "Test subject" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "This is a valid description for the ticket." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit Ticket/i }));
    // No error should be shown
    expect(screen.queryByText(/must be at least/)).not.toBeInTheDocument();
  });

  it("shows error for short subject", () => {
    render(<SupportTicketPage />);
    fireEvent.change(screen.getByLabelText(/Subject/i), {
      target: { value: "ab" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "This is a valid description for the ticket." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit Ticket/i }));
    expect(
      screen.getByText(/Subject must be at least 3 characters/i),
    ).toBeInTheDocument();
  });

  it("shows error for short description", () => {
    render(<SupportTicketPage />);
    fireEvent.change(screen.getByLabelText(/Subject/i), {
      target: { value: "Valid subject" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit Ticket/i }));
    expect(
      screen.getByText(/Description must be at least 10 characters/i),
    ).toBeInTheDocument();
  });
});
