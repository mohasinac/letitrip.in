import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SupportTicketPage from "../ticket/page";

describe("CreateTicket page", () => {
  it("renders create ticket form", () => {
    render(<SupportTicketPage />);
    expect(screen.getByText(/Create Support Ticket/i)).toBeInTheDocument();
  });

  it("shows validation error for short subject", () => {
    render(<SupportTicketPage />);
    fireEvent.change(
      screen.getByPlaceholderText("Brief description of your issue"),
      { target: { value: "Hi" } },
    );
    fireEvent.change(
      screen.getByPlaceholderText(
        "Describe your issue in detail (minimum 10 characters)",
      ),
      { target: { value: "Short desc" } },
    );
    fireEvent.click(screen.getByText(/Submit Ticket/i));
    expect(
      screen.getByText(/Subject must be at least 3 characters/i),
    ).toBeInTheDocument();
  });
});
