import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Search } from "@/components";

describe("Search", () => {
  const onClose = jest.fn();

  it("renders input when open", () => {
    render(<Search isOpen={true} onClose={onClose} />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { container } = render(<Search isOpen={false} onClose={onClose} />);
    expect(container.firstChild).toBeNull();
  });

  it("invokes onClose from close button", () => {
    render(<Search isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close search"));
    expect(onClose).toHaveBeenCalled();
  });
});
