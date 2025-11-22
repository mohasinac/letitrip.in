import React from "react";
import { render, screen } from "@testing-library/react";
import TermsOfService from "./page";

describe("TermsOfService page", () => {
  it("renders static terms content", () => {
    render(<TermsOfService />);
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
  });
});
