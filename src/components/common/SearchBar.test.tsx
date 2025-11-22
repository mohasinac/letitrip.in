import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  it("renders input and allows typing", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Search products, shops/i);
    fireEvent.change(input, { target: { value: "phone" } });
    expect(input).toHaveValue("phone");
  });

  it("shows recent searches from localStorage", () => {
    localStorage.setItem("recentSearches", JSON.stringify(["laptop", "shoes"]));
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Search products, shops/i);
    fireEvent.focus(input);
    expect(screen.getByText(/laptop/i)).toBeInTheDocument();
    expect(screen.getByText(/shoes/i)).toBeInTheDocument();
  });
});
