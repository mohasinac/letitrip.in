import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BaseTable, BaseTableProps, TableColumn } from "./BaseTable";

interface TestData {
  id: number;
  name: string;
  email: string;
  status: string;
  age: number;
}

const mockData: TestData[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    age: 30,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    status: "inactive",
    age: 25,
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "active",
    age: 35,
  },
];

const mockColumns: TableColumn<TestData>[] = [
  { key: "name", label: "Name", width: "200px" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status", align: "center" },
  { key: "age", label: "Age", align: "right" },
];

const defaultProps: BaseTableProps<TestData> = {
  data: mockData,
  columns: mockColumns,
  keyExtractor: (row) => row.id.toString(),
};

describe("BaseTable", () => {
  describe("Basic Rendering", () => {
    it("renders table with data", () => {
      render(<BaseTable {...defaultProps} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getAllByText("active")[0]).toBeInTheDocument();
    });

    it("renders all column headers", () => {
      render(<BaseTable {...defaultProps} />);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
    });

    it("renders all rows", () => {
      render(<BaseTable {...defaultProps} />);

      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(4); // 1 header + 3 data rows
    });

    it("applies column width", () => {
      render(<BaseTable {...defaultProps} />);

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveStyle({ width: "200px" });
    });
  });

  describe("Loading State", () => {
    it("shows loading skeleton when isLoading is true", () => {
      render(<BaseTable {...defaultProps} isLoading={true} />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("shows correct number of skeleton rows", () => {
      render(<BaseTable {...defaultProps} isLoading={true} />);

      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(6); // 1 header + 5 skeleton rows
    });

    it("shows column headers in loading state", () => {
      render(<BaseTable {...defaultProps} isLoading={true} />);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("shows default empty message when no data", () => {
      render(<BaseTable {...defaultProps} data={[]} />);

      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("shows custom empty message", () => {
      render(
        <BaseTable {...defaultProps} data={[]} emptyMessage="No users found" />
      );

      expect(screen.getByText("No users found")).toBeInTheDocument();
    });

    it("renders empty state with proper styling", () => {
      render(<BaseTable {...defaultProps} data={[]} />);

      const emptyDiv = screen.getByText("No data available").closest("div");
      expect(emptyDiv).toHaveClass("text-center", "py-12", "bg-white");
    });
  });

  describe("Column Alignment", () => {
    it("applies left alignment by default", () => {
      render(<BaseTable {...defaultProps} />);

      const nameCell = screen.getByText("John Doe").closest("td");
      expect(nameCell).toHaveClass("text-left");
    });

    it("applies center alignment", () => {
      render(<BaseTable {...defaultProps} />);

      const statusCell = screen.getAllByText("active")[0].closest("td");
      expect(statusCell).toHaveClass("text-center");
    });

    it("applies right alignment", () => {
      render(<BaseTable {...defaultProps} />);

      const ageCell = screen.getByText("30").closest("td");
      expect(ageCell).toHaveClass("text-right");
    });
  });

  describe("Custom Rendering", () => {
    it("uses custom render function for column", () => {
      const customColumns: TableColumn<TestData>[] = [
        {
          key: "status",
          label: "Status",
          render: (value) => (
            <span className="badge">{value.toUpperCase()}</span>
          ),
        },
      ];

      render(<BaseTable {...defaultProps} columns={customColumns} />);

      expect(screen.getAllByText("ACTIVE")[0]).toBeInTheDocument();
      expect(screen.getAllByText("ACTIVE")[0].closest("span")).toHaveClass(
        "badge"
      );
    });

    it("passes row and index to render function", () => {
      const renderFn = jest.fn((value, row, index) => <span>{index + 1}</span>);
      const customColumns: TableColumn<TestData>[] = [
        { key: "name", label: "Name", render: renderFn },
      ];

      render(<BaseTable {...defaultProps} columns={customColumns} />);

      expect(renderFn).toHaveBeenCalledWith("John Doe", mockData[0], 0);
      expect(renderFn).toHaveBeenCalledWith("Jane Smith", mockData[1], 1);
    });

    it("uses custom headerRender function", () => {
      const customColumns: TableColumn<TestData>[] = [
        {
          key: "name",
          label: "Name",
          headerRender: () => <span className="custom-header">Full Name</span>,
        },
      ];

      render(<BaseTable {...defaultProps} columns={customColumns} />);

      expect(screen.getByText("Full Name")).toBeInTheDocument();
      expect(screen.getByText("Full Name").closest("span")).toHaveClass(
        "custom-header"
      );
    });
  });

  describe("Row Interactions", () => {
    it("calls onRowClick when row is clicked", () => {
      const onRowClick = jest.fn();
      render(<BaseTable {...defaultProps} onRowClick={onRowClick} />);

      fireEvent.click(screen.getByText("John Doe"));

      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it("applies hover styling when onRowClick is provided", () => {
      const onRowClick = jest.fn();
      render(<BaseTable {...defaultProps} onRowClick={onRowClick} />);

      const row = screen.getByText("John Doe").closest("tr");
      expect(row).toHaveClass("cursor-pointer", "hover:bg-gray-50");
    });

    it("does not apply hover styling without onRowClick", () => {
      render(<BaseTable {...defaultProps} />);

      const row = screen.getByText("John Doe").closest("tr");
      expect(row).not.toHaveClass("cursor-pointer");
    });

    it("applies custom row className", () => {
      const rowClassName = (row: TestData) =>
        row.status === "active" ? "bg-green-50" : "bg-red-50";

      render(<BaseTable {...defaultProps} rowClassName={rowClassName} />);

      const activeRow = screen.getByText("John Doe").closest("tr");
      const inactiveRow = screen.getByText("Jane Smith").closest("tr");

      expect(activeRow).toHaveClass("bg-green-50");
      expect(inactiveRow).toHaveClass("bg-red-50");
    });
  });

  describe("Sticky Features", () => {
    it("applies sticky header by default", () => {
      render(<BaseTable {...defaultProps} />);

      const thead = document.querySelector("thead");
      expect(thead).toHaveClass("sticky", "top-0", "z-20");
    });

    it("does not apply sticky header when stickyHeader is false", () => {
      render(<BaseTable {...defaultProps} stickyHeader={false} />);

      const thead = document.querySelector("thead");
      expect(thead).not.toHaveClass("sticky");
    });

    it("applies sticky first column when enabled", () => {
      render(<BaseTable {...defaultProps} stickyFirstColumn={true} />);

      const firstHeader = screen.getByText("Name").closest("th");
      expect(firstHeader).toHaveClass("sticky", "left-0", "z-30");
    });

    it("applies sticky first column to data cells", () => {
      render(<BaseTable {...defaultProps} stickyFirstColumn={true} />);

      const firstCell = screen.getByText("John Doe").closest("td");
      expect(firstCell).toHaveClass("sticky", "left-0", "z-10");
    });
  });

  describe("Compact Mode", () => {
    it("applies default padding when compact is false", () => {
      render(<BaseTable {...defaultProps} />);

      const cell = screen.getByText("John Doe").closest("td");
      expect(cell).toHaveClass("px-6", "py-4");
    });

    it("applies compact padding when compact is true", () => {
      render(<BaseTable {...defaultProps} compact={true} />);

      const cell = screen.getByText("John Doe").closest("td");
      expect(cell).toHaveClass("px-3", "py-2");
    });
  });

  describe("Sortable Columns", () => {
    it("applies cursor pointer to sortable column headers", () => {
      const sortableColumns: TableColumn<TestData>[] = [
        { key: "name", label: "Name", sortable: true },
      ];

      render(<BaseTable {...defaultProps} columns={sortableColumns} />);

      const header = screen.getByText("Name").closest("th");
      expect(header).toHaveClass("cursor-pointer", "hover:bg-gray-100");
    });

    it("does not apply cursor pointer to non-sortable headers", () => {
      render(<BaseTable {...defaultProps} />);

      const header = screen.getByText("Name").closest("th");
      expect(header).not.toHaveClass("cursor-pointer");
    });
  });

  describe("Key Extractor", () => {
    it("uses keyExtractor to generate unique keys", () => {
      const keyExtractor = jest.fn(
        (row: TestData, index: number) => `user-${row.id}`
      );

      render(<BaseTable {...defaultProps} keyExtractor={keyExtractor} />);

      expect(keyExtractor).toHaveBeenCalledTimes(mockData.length);
      expect(keyExtractor).toHaveBeenCalledWith(mockData[0], 0);
    });

    it("supports numeric keys from keyExtractor", () => {
      const keyExtractor = (row: TestData) => row.id;

      const { container } = render(
        <BaseTable {...defaultProps} keyExtractor={keyExtractor} />
      );

      expect(container.querySelector("tbody")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty columns array", () => {
      render(<BaseTable {...defaultProps} columns={[]} />);

      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(4); // Header + 3 data rows with no cells
    });

    it("handles missing values in data", () => {
      const dataWithMissing: TestData[] = [
        { id: 1, name: "John", email: "", status: "active", age: 0 },
      ];

      render(<BaseTable {...defaultProps} data={dataWithMissing} />);

      expect(screen.getByText("John")).toBeInTheDocument();
    });

    it("handles very long cell content", () => {
      const longData: TestData[] = [
        {
          id: 1,
          name: "A".repeat(100),
          email: "very.long.email.address@example.com",
          status: "active",
          age: 30,
        },
      ];

      render(<BaseTable {...defaultProps} data={longData} />);

      expect(screen.getByText("A".repeat(100))).toBeInTheDocument();
    });

    it("handles special characters in data", () => {
      const specialData: TestData[] = [
        {
          id: 1,
          name: "John <script>alert('xss')</script>",
          email: "test@example.com",
          status: "active",
          age: 30,
        },
      ];

      render(<BaseTable {...defaultProps} data={specialData} />);

      expect(screen.getByText(/John <script>/)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies container styling", () => {
      const { container } = render(<BaseTable {...defaultProps} />);

      const tableContainer = container.firstChild;
      expect(tableContainer).toHaveClass(
        "w-full",
        "overflow-x-auto",
        "bg-white",
        "rounded-lg",
        "border"
      );
    });

    it("applies table styling", () => {
      render(<BaseTable {...defaultProps} />);

      const table = document.querySelector("table");
      expect(table).toHaveClass("w-full");
    });

    it("applies header styling", () => {
      render(<BaseTable {...defaultProps} />);

      const thead = document.querySelector("thead");
      expect(thead).toHaveClass("bg-gray-50");
    });

    it("applies body styling", () => {
      render(<BaseTable {...defaultProps} />);

      const tbody = document.querySelector("tbody");
      expect(tbody).toHaveClass("bg-white", "divide-y", "divide-gray-200");
    });
  });
});
