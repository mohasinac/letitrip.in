import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResponsiveTable } from "../../components/tables/ResponsiveTable";

describe("ResponsiveTable", () => {
  it("renders children correctly", () => {
    render(
      <ResponsiveTable>
        <table>
          <thead>
            <tr>
              <th>Header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Cell")).toBeInTheDocument();
  });

  it("applies sticky-first-col class by default", () => {
    const { container } = render(
      <ResponsiveTable>
        <table>
          <tbody>
            <tr>
              <td>Test</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    const stickyDiv = container.querySelector(".sticky-first-col");
    expect(stickyDiv).toBeInTheDocument();
  });

  it("applies sticky-first-col class when stickyFirstColumn is true", () => {
    const { container } = render(
      <ResponsiveTable stickyFirstColumn={true}>
        <table>
          <tbody>
            <tr>
              <td>Test</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    const stickyDiv = container.querySelector(".sticky-first-col");
    expect(stickyDiv).toBeInTheDocument();
  });

  it("does not apply sticky-first-col class when stickyFirstColumn is false", () => {
    const { container } = render(
      <ResponsiveTable stickyFirstColumn={false}>
        <table>
          <tbody>
            <tr>
              <td>Test</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    const stickyDiv = container.querySelector(".sticky-first-col");
    expect(stickyDiv).not.toBeInTheDocument();
  });

  it("applies responsive container styles", () => {
    const { container } = render(
      <ResponsiveTable>
        <table>
          <tbody>
            <tr>
              <td>Test</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("bg-white");
    expect(wrapper).toHaveClass("dark:bg-gray-800");
    expect(wrapper).toHaveClass("rounded-lg");
    expect(wrapper).toHaveClass("border");
    expect(wrapper).toHaveClass("overflow-hidden");
  });

  it("applies overflow-x-auto for horizontal scrolling", () => {
    const { container } = render(
      <ResponsiveTable>
        <table>
          <tbody>
            <tr>
              <td>Test</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    const scrollContainer = container.querySelector(".overflow-x-auto");
    expect(scrollContainer).toBeInTheDocument();
  });

  it("renders multiple rows correctly", () => {
    render(
      <ResponsiveTable>
        <table>
          <tbody>
            <tr>
              <td>Row 1</td>
            </tr>
            <tr>
              <td>Row 2</td>
            </tr>
            <tr>
              <td>Row 3</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    expect(screen.getByText("Row 1")).toBeInTheDocument();
    expect(screen.getByText("Row 2")).toBeInTheDocument();
    expect(screen.getByText("Row 3")).toBeInTheDocument();
  });

  it("renders complex table structure", () => {
    render(
      <ResponsiveTable>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>john@example.com</td>
              <td>Admin</td>
            </tr>
            <tr>
              <td>Jane Smith</td>
              <td>jane@example.com</td>
              <td>User</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("handles empty table", () => {
    const { container } = render(
      <ResponsiveTable>
        <table>
          <tbody></tbody>
        </table>
      </ResponsiveTable>
    );

    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
    expect(table?.querySelector("tbody")).toBeInTheDocument();
  });

  it("renders JSX style tag for sticky column styles", () => {
    const { container } = render(
      <ResponsiveTable stickyFirstColumn={true}>
        <table>
          <tbody>
            <tr>
              <td>Test</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    const style = container.querySelector("style");
    expect(style).toBeInTheDocument();
    expect(style?.textContent).toContain("sticky-first-col");
  });

  it("applies min-w-full class to inner div", () => {
    const { container } = render(
      <ResponsiveTable>
        <table>
          <tbody>
            <tr>
              <td>Test</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    const innerDiv = container.querySelector(".min-w-full");
    expect(innerDiv).toBeInTheDocument();
    expect(innerDiv).toHaveClass("inline-block");
  });

  it("renders with nested DataTable component", () => {
    render(
      <ResponsiveTable>
        <div data-testid="nested-content">
          <table>
            <tbody>
              <tr>
                <td>Nested content</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ResponsiveTable>
    );

    expect(screen.getByTestId("nested-content")).toBeInTheDocument();
    expect(screen.getByText("Nested content")).toBeInTheDocument();
  });
});
