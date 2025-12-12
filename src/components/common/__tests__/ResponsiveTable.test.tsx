import { render, screen } from "@testing-library/react";
import { ResponsiveTable } from "../ResponsiveTable";

describe("ResponsiveTable Component", () => {
  const mockTableContent = (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>John Doe</td>
          <td>john@example.com</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jane Smith</td>
          <td>jane@example.com</td>
        </tr>
      </tbody>
    </table>
  );

  describe("Basic Rendering", () => {
    it("should render table content", () => {
      render(<ResponsiveTable>{mockTableContent}</ResponsiveTable>);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    it("should render with sticky first column by default", () => {
      const { container } = render(
        <ResponsiveTable>{mockTableContent}</ResponsiveTable>
      );
      const wrapper = container.querySelector(".sticky-first-col");
      expect(wrapper).toBeInTheDocument();
    });

    it("should render without sticky first column when disabled", () => {
      const { container } = render(
        <ResponsiveTable stickyFirstColumn={false}>
          {mockTableContent}
        </ResponsiveTable>
      );
      const wrapper = container.querySelector(".sticky-first-col");
      expect(wrapper).not.toBeInTheDocument();
    });

    it("should have overflow-x-auto wrapper", () => {
      const { container } = render(
        <ResponsiveTable>{mockTableContent}</ResponsiveTable>
      );
      const scrollWrapper = container.querySelector(".overflow-x-auto");
      expect(scrollWrapper).toBeInTheDocument();
    });

    it("should have border and rounded corners", () => {
      const { container } = render(
        <ResponsiveTable>{mockTableContent}</ResponsiveTable>
      );
      const outerWrapper = container.firstChild as HTMLElement;
      expect(outerWrapper).toHaveClass(
        "rounded-lg",
        "border",
        "border-gray-200"
      );
    });
  });

  describe("Sticky First Column", () => {
    it("should apply sticky-first-col class when enabled", () => {
      const { container } = render(
        <ResponsiveTable stickyFirstColumn={true}>
          {mockTableContent}
        </ResponsiveTable>
      );
      expect(container.querySelector(".sticky-first-col")).toBeInTheDocument();
    });

    it("should not apply sticky-first-col class when disabled", () => {
      const { container } = render(
        <ResponsiveTable stickyFirstColumn={false}>
          {mockTableContent}
        </ResponsiveTable>
      );
      expect(
        container.querySelector(".sticky-first-col")
      ).not.toBeInTheDocument();
    });
  });

  describe("Dark Mode Support", () => {
    it("should include dark mode classes in wrapper", () => {
      const { container } = render(
        <ResponsiveTable>{mockTableContent}</ResponsiveTable>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });
  });

  describe("Complex Table Content", () => {
    it("should render table with multiple columns", () => {
      const complexTable = (
        <table>
          <thead>
            <tr>
              <th>Col1</th>
              <th>Col2</th>
              <th>Col3</th>
              <th>Col4</th>
              <th>Col5</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data1</td>
              <td>Data2</td>
              <td>Data3</td>
              <td>Data4</td>
              <td>Data5</td>
            </tr>
          </tbody>
        </table>
      );
      render(<ResponsiveTable>{complexTable}</ResponsiveTable>);
      expect(screen.getByText("Col5")).toBeInTheDocument();
      expect(screen.getByText("Data5")).toBeInTheDocument();
    });

    it("should render table with many rows", () => {
      const manyRowsTable = (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 50 }, (_, i) => (
              <tr key={i}>
                <td>{i}</td>
                <td>Row {i}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
      render(<ResponsiveTable>{manyRowsTable}</ResponsiveTable>);
      expect(screen.getByText("Row 49")).toBeInTheDocument();
    });

    it("should render empty table", () => {
      const emptyTable = (
        <table>
          <thead>
            <tr>
              <th>Column</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      );
      render(<ResponsiveTable>{emptyTable}</ResponsiveTable>);
      expect(screen.getByText("Column")).toBeInTheDocument();
    });

    it("should render table with checkboxes", () => {
      const tableWithCheckboxes = (
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input type="checkbox" />
              </td>
              <td>Item</td>
            </tr>
          </tbody>
        </table>
      );
      const { container } = render(
        <ResponsiveTable>{tableWithCheckboxes}</ResponsiveTable>
      );
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null children gracefully", () => {
      expect(() =>
        render(<ResponsiveTable>{null}</ResponsiveTable>)
      ).not.toThrow();
    });

    it("should handle undefined children gracefully", () => {
      expect(() =>
        render(<ResponsiveTable>{undefined}</ResponsiveTable>)
      ).not.toThrow();
    });

    it("should handle non-table content", () => {
      const divContent = <div>Not a table</div>;
      render(<ResponsiveTable>{divContent}</ResponsiveTable>);
      expect(screen.getByText("Not a table")).toBeInTheDocument();
    });

    it("should handle stickyFirstColumn=undefined", () => {
      const { container } = render(
        <ResponsiveTable stickyFirstColumn={undefined}>
          {mockTableContent}
        </ResponsiveTable>
      );
      // Should default to true
      expect(container.querySelector(".sticky-first-col")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should have white background", () => {
      const { container } = render(
        <ResponsiveTable>{mockTableContent}</ResponsiveTable>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("bg-white");
    });

    it("should have overflow hidden", () => {
      const { container } = render(
        <ResponsiveTable>{mockTableContent}</ResponsiveTable>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("overflow-hidden");
    });

    it("should have min-w-full on inner wrapper", () => {
      const { container } = render(
        <ResponsiveTable>{mockTableContent}</ResponsiveTable>
      );
      const innerWrapper = container.querySelector(".min-w-full");
      expect(innerWrapper).toBeInTheDocument();
    });

    it("should have inline-block display", () => {
      const { container } = render(
        <ResponsiveTable>{mockTableContent}</ResponsiveTable>
      );
      const innerWrapper = container.querySelector(".inline-block");
      expect(innerWrapper).toBeInTheDocument();
    });
  });

  describe("Multiple Instances", () => {
    it("should support multiple tables independently", () => {
      const table1 = (
        <table>
          <tbody>
            <tr>
              <td>Table 1</td>
            </tr>
          </tbody>
        </table>
      );
      const table2 = (
        <table>
          <tbody>
            <tr>
              <td>Table 2</td>
            </tr>
          </tbody>
        </table>
      );

      render(
        <div>
          <ResponsiveTable stickyFirstColumn={true}>{table1}</ResponsiveTable>
          <ResponsiveTable stickyFirstColumn={false}>{table2}</ResponsiveTable>
        </div>
      );

      expect(screen.getByText("Table 1")).toBeInTheDocument();
      expect(screen.getByText("Table 2")).toBeInTheDocument();
    });
  });
});
