import React from "react";
import { render, screen } from "@testing-library/react";
import {
  FormField,
  FormSection,
  FormGrid,
  FormRow,
  FormFieldProps,
  FormSectionProps,
  FormGridProps,
  FormRowProps,
} from "./FormLayout";

describe("FormField", () => {
  describe("Basic Rendering", () => {
    it("renders children", () => {
      render(
        <FormField>
          <label>Test Label</label>
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText("Test Label")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("applies default spacing class", () => {
      const { container } = render(
        <FormField>
          <div>Content</div>
        </FormField>
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("space-y-1");
    });

    it("applies custom className", () => {
      const { container } = render(
        <FormField className="custom-class">
          <div>Content</div>
        </FormField>
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("space-y-1", "custom-class");
    });

    it("renders multiple children", () => {
      render(
        <FormField>
          <label>Label</label>
          <input type="text" />
          <span>Helper text</span>
        </FormField>
      );

      expect(screen.getByText("Label")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByText("Helper text")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty children", () => {
      const { container } = render(<FormField>{null}</FormField>);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles single child", () => {
      render(
        <FormField>
          <input type="text" placeholder="Single input" />
        </FormField>
      );

      expect(screen.getByPlaceholderText("Single input")).toBeInTheDocument();
    });
  });
});

describe("FormSection", () => {
  describe("Basic Rendering", () => {
    it("renders children", () => {
      render(
        <FormSection>
          <FormField>
            <label>Field 1</label>
          </FormField>
          <FormField>
            <label>Field 2</label>
          </FormField>
        </FormSection>
      );

      expect(screen.getByText("Field 1")).toBeInTheDocument();
      expect(screen.getByText("Field 2")).toBeInTheDocument();
    });

    it("applies default spacing class", () => {
      const { container } = render(
        <FormSection>
          <div>Content</div>
        </FormSection>
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("space-y-4");
    });

    it("applies custom className", () => {
      const { container } = render(
        <FormSection className="custom-section">
          <div>Content</div>
        </FormSection>
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("space-y-4", "custom-section");
    });

    it("renders multiple form fields", () => {
      render(
        <FormSection>
          <input type="text" placeholder="Field 1" />
          <input type="text" placeholder="Field 2" />
          <input type="text" placeholder="Field 3" />
        </FormSection>
      );

      expect(screen.getByPlaceholderText("Field 1")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Field 2")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Field 3")).toBeInTheDocument();
    });
  });

  describe("Nested Usage", () => {
    it("works with nested FormFields", () => {
      render(
        <FormSection>
          <FormField>
            <label>Name</label>
            <input type="text" />
          </FormField>
          <FormField>
            <label>Email</label>
            <input type="email" />
          </FormField>
        </FormSection>
      );

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });
});

describe("FormGrid", () => {
  describe("Basic Rendering", () => {
    it("renders children in grid", () => {
      render(
        <FormGrid>
          <div>Column 1</div>
          <div>Column 2</div>
        </FormGrid>
      );

      expect(screen.getByText("Column 1")).toBeInTheDocument();
      expect(screen.getByText("Column 2")).toBeInTheDocument();
    });

    it("applies grid classes", () => {
      const { container } = render(
        <FormGrid>
          <div>Content</div>
        </FormGrid>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass("grid", "gap-4");
    });
  });

  describe("Column Configurations", () => {
    it("applies 2 columns by default", () => {
      const { container } = render(
        <FormGrid>
          <div>Content</div>
        </FormGrid>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2");
    });

    it("applies 1 column layout", () => {
      const { container } = render(
        <FormGrid columns={1}>
          <div>Content</div>
        </FormGrid>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass("grid-cols-1");
      expect(grid).not.toHaveClass("md:grid-cols-2");
    });

    it("applies 2 column layout", () => {
      const { container } = render(
        <FormGrid columns={2}>
          <div>Content</div>
        </FormGrid>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2");
    });

    it("applies 3 column layout", () => {
      const { container } = render(
        <FormGrid columns={3}>
          <div>Content</div>
        </FormGrid>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass(
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3"
      );
    });

    it("applies 4 column layout", () => {
      const { container } = render(
        <FormGrid columns={4}>
          <div>Content</div>
        </FormGrid>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass(
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-4"
      );
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <FormGrid className="custom-grid">
          <div>Content</div>
        </FormGrid>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass("custom-grid");
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(
        <FormGrid className="custom-grid" columns={3}>
          <div>Content</div>
        </FormGrid>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass("grid", "gap-4", "custom-grid");
    });
  });

  describe("Responsive Behavior", () => {
    it("renders responsive grid for form fields", () => {
      render(
        <FormGrid columns={2}>
          <FormField>
            <label>First Name</label>
            <input type="text" />
          </FormField>
          <FormField>
            <label>Last Name</label>
            <input type="text" />
          </FormField>
        </FormGrid>
      );

      expect(screen.getByText("First Name")).toBeInTheDocument();
      expect(screen.getByText("Last Name")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles single child", () => {
      render(
        <FormGrid columns={3}>
          <div>Single Item</div>
        </FormGrid>
      );

      expect(screen.getByText("Single Item")).toBeInTheDocument();
    });

    it("handles many children", () => {
      render(
        <FormGrid columns={4}>
          {[...Array(10)].map((_, i) => (
            <div key={i}>Item {i + 1}</div>
          ))}
        </FormGrid>
      );

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 10")).toBeInTheDocument();
    });
  });
});

describe("FormRow", () => {
  describe("Basic Rendering", () => {
    it("renders children in row", () => {
      render(
        <FormRow>
          <div>Left</div>
          <div>Right</div>
        </FormRow>
      );

      expect(screen.getByText("Left")).toBeInTheDocument();
      expect(screen.getByText("Right")).toBeInTheDocument();
    });

    it("applies flex layout classes", () => {
      const { container } = render(
        <FormRow>
          <div>Content</div>
        </FormRow>
      );

      const row = container.firstChild;
      expect(row).toHaveClass("flex", "items-start", "gap-4");
    });

    it("applies custom className", () => {
      const { container } = render(
        <FormRow className="custom-row">
          <div>Content</div>
        </FormRow>
      );

      const row = container.firstChild;
      expect(row).toHaveClass("flex", "items-start", "gap-4", "custom-row");
    });
  });

  describe("Layout Behavior", () => {
    it("arranges items horizontally", () => {
      render(
        <FormRow>
          <input type="text" placeholder="Field 1" />
          <input type="text" placeholder="Field 2" />
        </FormRow>
      );

      expect(screen.getByPlaceholderText("Field 1")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Field 2")).toBeInTheDocument();
    });

    it("works with buttons", () => {
      render(
        <FormRow>
          <button>Cancel</button>
          <button>Submit</button>
        </FormRow>
      );

      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("works with form fields side by side", () => {
      render(
        <FormRow>
          <FormField>
            <label>Start Date</label>
            <input type="date" />
          </FormField>
          <FormField>
            <label>End Date</label>
            <input type="date" />
          </FormField>
        </FormRow>
      );

      expect(screen.getByText("Start Date")).toBeInTheDocument();
      expect(screen.getByText("End Date")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles single child", () => {
      render(
        <FormRow>
          <div>Single Item</div>
        </FormRow>
      );

      expect(screen.getByText("Single Item")).toBeInTheDocument();
    });

    it("handles many children", () => {
      render(
        <FormRow>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
          <div>Item 4</div>
        </FormRow>
      );

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 4")).toBeInTheDocument();
    });
  });
});

describe("Form Layout Components Integration", () => {
  it("works together in a complete form", () => {
    render(
      <FormSection>
        <FormGrid columns={2}>
          <FormField>
            <label>First Name</label>
            <input type="text" />
          </FormField>
          <FormField>
            <label>Last Name</label>
            <input type="text" />
          </FormField>
        </FormGrid>
        <FormField>
          <label>Email</label>
          <input type="email" />
        </FormField>
        <FormRow>
          <button>Cancel</button>
          <button>Save</button>
        </FormRow>
      </FormSection>
    );

    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("handles nested sections", () => {
    render(
      <div>
        <FormSection>
          <h2>Personal Information</h2>
          <FormField>
            <label>Name</label>
            <input type="text" />
          </FormField>
        </FormSection>
        <FormSection>
          <h2>Contact Information</h2>
          <FormField>
            <label>Email</label>
            <input type="email" />
          </FormField>
        </FormSection>
      </div>
    );

    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
  });
});
