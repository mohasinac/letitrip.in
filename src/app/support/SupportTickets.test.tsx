import React from "react";
import { render, screen } from "@testing-library/react";
import SupportTicketPage from "./ticket/page";

jest.mock("@/services/support.service", () => ({
  supportService: {
    list: jest.fn().mockResolvedValue({
      data: [{ id: "ticket-1", subject: "Test Ticket", status: "open" }],
    }),
  },
}));

describe("SupportTickets page", () => {
  it("renders support ticket creation form", async () => {
    render(<SupportTicketPage />);
    expect(
      await screen.findByText(/Create Support Ticket/i),
    ).toBeInTheDocument();
  });
});
