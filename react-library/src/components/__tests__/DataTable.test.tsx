import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type Column } from "../../components/tables/DataTable";

interface TestData {
  id: number;
  name: string;
  email: string;
  status: string;
}

const mockData: TestData[] = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "inactive" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "active" },
];

const mockColumns: Column<TestData>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "status", label: "Status", sortable: false },
];

describe("DataTable", () => {
  it("renders table with data", () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
        isLoading={true}
      />
    );

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty message when data is empty", () => {
    const emptyMessage = "No records found";
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
        emptyMessage={emptyMessage}
      />
    );

    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });

  it("renders default empty message when not provided", () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
      />
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("handles local sorting when no onSort prop provided", () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
      />
    );

    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader).toBeInTheDocument();

    // Click to sort ascending
    fireEvent.click(nameHeader!);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Bob Johnson");

    // Click again to sort descending
    fireEvent.click(nameHeader!);
    const rowsDescending = screen.getAllByRole("row");
    expect(rowsDescending[1]).toHaveTextContent("John Doe");
  });

  it("calls onSort callback when provided", () => {
    const onSort = vi.fn();
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
        onSort={onSort}
        sortKey="name"
        sortDirection="asc"
      />
    );

    const nameHeader = screen.getByText("Name").closest("th");
    fireEvent.click(nameHeader!);

    expect(onSort).toHaveBeenCalledWith("name", "desc");
  });

  it("uses controlled sort when sortKey and sortDirection provided", () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
        sortKey="name"
        sortDirection="desc"
      />
    );

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("John Doe");
  });

  it("renders custom content with render function", () => {
    const customColumns: Column<TestData>[] = [
      { key: "name", label: "Name" },
      {
        key: "status",
        label: "Status",
        render: (value: string) => (
          <span className="status-badge">{value.toUpperCase()}</span>
        ),
      },
    ];

    render(
      <DataTable
        data={mockData}
        columns={customColumns}
        keyExtractor={(row) => row.id.toString()}
      />
    );

    expect(screen.getAllByText("ACTIVE")).toHaveLength(2);
    expect(screen.getByText("INACTIVE")).toBeInTheDocument();
  });

  it("calls onRowClick when row is clicked", () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
        onRowClick={onRowClick}
      />
    );

    const firstRow = screen.getByText("John Doe").closest("tr");
    fireEvent.click(firstRow!);

    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it("applies rowClassName function", () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
        rowClassName={(row) =>
          row.status === "inactive" ? "inactive-row" : ""
        }
      />
    );

    const inactiveRow = screen.getByText("Jane Smith").closest("tr");
    expect(inactiveRow).toHaveClass("inactive-row");
  });

  it("applies custom className to table", () => {
    const { container } = render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
        className="custom-table"
      />
    );

    const table = container.querySelector("table");
    expect(table).toHaveClass("custom-table");
  });

  it("applies column widths", () => {
    const columnsWithWidth: Column<TestData>[] = [
      { key: "name", label: "Name", width: "40%" },
      { key: "email", label: "Email", width: "60%" },
    ];

    render(
      <DataTable
        data={mockData}
        columns={columnsWithWidth}
        keyExtractor={(row) => row.id.toString()}
      />
    );

    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader).toHaveStyle({ width: "40%" });
  });

  it("shows sort indicators for sortable columns", () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
        sortKey="name"
        sortDirection="asc"
      />
    );

    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.textContent).toContain("↑");
  });

  it("does not show sort indicator for non-sortable columns", () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
      />
    );

    const statusHeader = screen.getByText("Status").closest("th");
    expect(statusHeader?.textContent).not.toContain("↕");
  });

  it("handles empty columns array", () => {
    render(
      <DataTable
        data={mockData}
        columns={[]}
        keyExtractor={(row) => row.id.toString()}
      />
    );

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(4); // Header + 3 data rows with no cells
  });

  it("handles sorting with null/undefined values", () => {
    const dataWithNulls = [
      { id: 1, name: "John", email: null, status: "active" },
      { id: 2, name: "Jane", email: "jane@example.com", status: "active" },
      { id: 3, name: "Bob", email: undefined, status: "active" },
    ] as any;

    render(
      <DataTable
        data={dataWithNulls}
        columns={mockColumns}
        keyExtractor={(row) => row.id.toString()}
      />
    );

    const emailHeader = screen.getByText("Email").closest("th");
    fireEvent.click(emailHeader!);

    // Should not throw error
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  it("passes row and value to render function", () => {
    const renderFn = vi.fn((value, row) => <span>{value}</span>);
    const customColumns: Column<TestData>[] = [
      {
        key: "name",
        label: "Name",
        render: renderFn,
      },
    ];

    render(
      <DataTable
        data={mockData}
        columns={customColumns}
        keyExtractor={(row) => row.id.toString()}
      />
    );

    expect(renderFn).toHaveBeenCalledWith("John Doe", mockData[0]);
    expect(renderFn).toHaveBeenCalledWith("Jane Smith", mockData[1]);
    expect(renderFn).toHaveBeenCalledWith("Bob Johnson", mockData[2]);
  });
});
