import { fireEvent, render, screen } from "@testing-library/react";
import { AdvancedPagination } from "./AdvancedPagination";

describe("AdvancedPagination", () => {
  const mockOnPageChange = jest.fn();
  const mockOnPageSizeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders pagination info", () => {
    render(
      <AdvancedPagination
        currentPage={2}
        totalPages={10}
        pageSize={20}
        totalItems={200}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(
      screen.getByText("Showing 21 to 40 of 200 items"),
    ).toBeInTheDocument();
  });

  it("handles page navigation", () => {
    render(
      <AdvancedPagination
        currentPage={5}
        totalPages={10}
        pageSize={20}
        totalItems={200}
        onPageChange={mockOnPageChange}
      />,
    );

    // Next page
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(mockOnPageChange).toHaveBeenCalledWith(6);

    // Previous page
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);

    // First page
    fireEvent.click(screen.getByLabelText("First page"));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    // Last page
    fireEvent.click(screen.getByLabelText("Last page"));
    expect(mockOnPageChange).toHaveBeenCalledWith(10);
  });

  it("disables first/prev buttons on first page", () => {
    render(
      <AdvancedPagination
        currentPage={1}
        totalPages={10}
        pageSize={20}
        totalItems={200}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByLabelText("First page")).toBeDisabled();
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("disables last/next buttons on last page", () => {
    render(
      <AdvancedPagination
        currentPage={10}
        totalPages={10}
        pageSize={20}
        totalItems={200}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByLabelText("Last page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("handles page size change", () => {
    render(
      <AdvancedPagination
        currentPage={1}
        totalPages={10}
        pageSize={20}
        totalItems={200}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        showPageSizeSelector
      />,
    );

    const select = screen.getByLabelText(/per page/i);
    fireEvent.change(select, { target: { value: "50" } });
    expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("handles direct page input", () => {
    render(
      <AdvancedPagination
        currentPage={1}
        totalPages={10}
        pageSize={20}
        totalItems={200}
        onPageChange={mockOnPageChange}
        showPageInput
      />,
    );

    const input = screen.getByLabelText(/go to/i);
    fireEvent.change(input, { target: { value: "7" } });
    fireEvent.submit(input.closest("form")!);
    expect(mockOnPageChange).toHaveBeenCalledWith(7);
  });

  it("renders page numbers correctly", () => {
    render(
      <AdvancedPagination
        currentPage={5}
        totalPages={10}
        pageSize={20}
        totalItems={200}
        onPageChange={mockOnPageChange}
      />,
    );

    // Should show: 1 ... 4 5 6 ... 10
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("hides page size selector when showPageSizeSelector is false", () => {
    render(
      <AdvancedPagination
        currentPage={1}
        totalPages={10}
        pageSize={20}
        totalItems={200}
        onPageChange={mockOnPageChange}
        showPageSizeSelector={false}
      />,
    );

    expect(screen.queryByLabelText(/per page/i)).not.toBeInTheDocument();
  });

  it("returns null when totalPages is 1 and no page size selector", () => {
    const { container } = render(
      <AdvancedPagination
        currentPage={1}
        totalPages={1}
        pageSize={20}
        totalItems={10}
        onPageChange={mockOnPageChange}
        showPageSizeSelector={false}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
