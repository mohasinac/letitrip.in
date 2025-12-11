import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { FormField, FormGrid, FormRow, FormSection } from "../FormLayout";

describe("FormLayout - Form Layout Helper Components", () => {
  describe("FormField Component", () => {
    describe("Basic Rendering", () => {
      it("should render FormField with children", () => {
        render(
          <FormField>
            <label>Test Label</label>
            <input type="text" />
          </FormField>
        );
        expect(screen.getByText("Test Label")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      it("should render as div element", () => {
        const { container } = render(
          <FormField>
            <span>Content</span>
          </FormField>
        );
        expect(container.firstChild?.nodeName).toBe("DIV");
      });

      it("should have space-y-1 class", () => {
        const { container } = render(
          <FormField>
            <span>Content</span>
          </FormField>
        );
        expect(container.firstChild).toHaveClass("space-y-1");
      });

      it("should render multiple children with spacing", () => {
        render(
          <FormField>
            <label>Label</label>
            <input type="text" placeholder="Input" />
            <span>Helper text</span>
          </FormField>
        );
        expect(screen.getByText("Label")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Input")).toBeInTheDocument();
        expect(screen.getByText("Helper text")).toBeInTheDocument();
      });

      it("should accept custom className", () => {
        const { container } = render(
          <FormField className="custom-field">
            <span>Content</span>
          </FormField>
        );
        expect(container.firstChild).toHaveClass("custom-field");
      });

      it("should merge custom className with space-y-1", () => {
        const { container } = render(
          <FormField className="mb-4">
            <span>Content</span>
          </FormField>
        );
        expect(container.firstChild).toHaveClass("space-y-1", "mb-4");
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty children", () => {
        const { container } = render(<FormField />);
        expect(container.firstChild).toBeInTheDocument();
      });

      it("should handle complex nested children", () => {
        render(
          <FormField>
            <div>
              <label>Nested Label</label>
              <div>
                <input type="text" placeholder="Nested Input" />
              </div>
            </div>
          </FormField>
        );
        expect(screen.getByText("Nested Label")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Nested Input")).toBeInTheDocument();
      });
    });
  });

  describe("FormSection Component", () => {
    describe("Basic Rendering", () => {
      it("should render FormSection with children", () => {
        render(
          <FormSection>
            <h3>Section Title</h3>
            <div>Section Content</div>
          </FormSection>
        );
        expect(screen.getByText("Section Title")).toBeInTheDocument();
        expect(screen.getByText("Section Content")).toBeInTheDocument();
      });

      it("should render as div element", () => {
        const { container } = render(
          <FormSection>
            <span>Content</span>
          </FormSection>
        );
        expect(container.firstChild?.nodeName).toBe("DIV");
      });

      it("should have space-y-4 class", () => {
        const { container } = render(
          <FormSection>
            <span>Content</span>
          </FormSection>
        );
        expect(container.firstChild).toHaveClass("space-y-4");
      });

      it("should render multiple FormFields inside", () => {
        render(
          <FormSection>
            <FormField>
              <label>Field 1</label>
            </FormField>
            <FormField>
              <label>Field 2</label>
            </FormField>
            <FormField>
              <label>Field 3</label>
            </FormField>
          </FormSection>
        );
        expect(screen.getByText("Field 1")).toBeInTheDocument();
        expect(screen.getByText("Field 2")).toBeInTheDocument();
        expect(screen.getByText("Field 3")).toBeInTheDocument();
      });

      it("should accept custom className", () => {
        const { container } = render(
          <FormSection className="custom-section">
            <span>Content</span>
          </FormSection>
        );
        expect(container.firstChild).toHaveClass("custom-section");
      });

      it("should merge custom className with space-y-4", () => {
        const { container } = render(
          <FormSection className="mt-8">
            <span>Content</span>
          </FormSection>
        );
        expect(container.firstChild).toHaveClass("space-y-4", "mt-8");
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty children", () => {
        const { container } = render(<FormSection />);
        expect(container.firstChild).toBeInTheDocument();
      });

      it("should handle nested FormSections", () => {
        render(
          <FormSection>
            <h2>Parent Section</h2>
            <FormSection>
              <h3>Child Section</h3>
            </FormSection>
          </FormSection>
        );
        expect(screen.getByText("Parent Section")).toBeInTheDocument();
        expect(screen.getByText("Child Section")).toBeInTheDocument();
      });
    });
  });

  describe("FormGrid Component", () => {
    describe("Basic Rendering", () => {
      it("should render FormGrid with children", () => {
        render(
          <FormGrid>
            <div>Grid Item 1</div>
            <div>Grid Item 2</div>
          </FormGrid>
        );
        expect(screen.getByText("Grid Item 1")).toBeInTheDocument();
        expect(screen.getByText("Grid Item 2")).toBeInTheDocument();
      });

      it("should render as div element", () => {
        const { container } = render(
          <FormGrid>
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild?.nodeName).toBe("DIV");
      });

      it("should have grid class", () => {
        const { container } = render(
          <FormGrid>
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild).toHaveClass("grid");
      });

      it("should have gap-4 class", () => {
        const { container } = render(
          <FormGrid>
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild).toHaveClass("gap-4");
      });
    });

    describe("Column Variants", () => {
      it("should default to 2 columns", () => {
        const { container } = render(
          <FormGrid>
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild).toHaveClass(
          "grid-cols-1",
          "md:grid-cols-2"
        );
      });

      it("should render 1 column layout", () => {
        const { container } = render(
          <FormGrid columns={1}>
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild).toHaveClass("grid-cols-1");
        // Should not have md: breakpoint for 1 column
        expect(container.firstChild?.className).not.toContain("md:grid-cols");
      });

      it("should render 2 column layout", () => {
        const { container } = render(
          <FormGrid columns={2}>
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild).toHaveClass(
          "grid-cols-1",
          "md:grid-cols-2"
        );
      });

      it("should render 3 column layout", () => {
        const { container } = render(
          <FormGrid columns={3}>
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild).toHaveClass(
          "grid-cols-1",
          "md:grid-cols-2",
          "lg:grid-cols-3"
        );
      });

      it("should render 4 column layout", () => {
        const { container } = render(
          <FormGrid columns={4}>
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild).toHaveClass(
          "grid-cols-1",
          "md:grid-cols-2",
          "lg:grid-cols-4"
        );
      });
    });

    describe("Responsive Behavior", () => {
      it("should have mobile-first grid-cols-1 for all layouts", () => {
        const columns = [1, 2, 3, 4] as const;
        columns.forEach((cols) => {
          const { container } = render(
            <FormGrid columns={cols}>
              <span>Content</span>
            </FormGrid>
          );
          expect(container.firstChild).toHaveClass("grid-cols-1");
        });
      });

      it("should have md:grid-cols-2 for 2+ columns", () => {
        const { container } = render(
          <FormGrid columns={2}>
            <span>Content</span>
          </FormGrid>
        );
        const gridElement = container.firstChild as HTMLElement;
        expect(gridElement.className).toContain("md:grid-cols-2");
      });

      it("should have lg:grid-cols-3 for 3 columns", () => {
        const { container } = render(
          <FormGrid columns={3}>
            <span>Content</span>
          </FormGrid>
        );
        const gridElement = container.firstChild as HTMLElement;
        expect(gridElement.className).toContain("lg:grid-cols-3");
      });

      it("should have lg:grid-cols-4 for 4 columns", () => {
        const { container } = render(
          <FormGrid columns={4}>
            <span>Content</span>
          </FormGrid>
        );
        const gridElement = container.firstChild as HTMLElement;
        expect(gridElement.className).toContain("lg:grid-cols-4");
      });
    });

    describe("Custom Styling", () => {
      it("should accept custom className", () => {
        const { container } = render(
          <FormGrid className="custom-grid">
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild).toHaveClass("custom-grid");
      });

      it("should merge custom className with grid classes", () => {
        const { container } = render(
          <FormGrid columns={2} className="mt-6">
            <span>Content</span>
          </FormGrid>
        );
        expect(container.firstChild).toHaveClass("mt-6", "grid", "gap-4");
      });
    });

    describe("Grid with FormFields", () => {
      it("should render FormFields in grid layout", () => {
        render(
          <FormGrid columns={2}>
            <FormField>
              <label>First Name</label>
            </FormField>
            <FormField>
              <label>Last Name</label>
            </FormField>
          </FormGrid>
        );
        expect(screen.getByText("First Name")).toBeInTheDocument();
        expect(screen.getByText("Last Name")).toBeInTheDocument();
      });

      it("should render many items in grid", () => {
        render(
          <FormGrid columns={3}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i}>Item {i + 1}</div>
            ))}
          </FormGrid>
        );
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 9")).toBeInTheDocument();
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty children", () => {
        const { container } = render(<FormGrid />);
        expect(container.firstChild).toBeInTheDocument();
      });

      it("should handle single child", () => {
        render(
          <FormGrid>
            <div>Single Item</div>
          </FormGrid>
        );
        expect(screen.getByText("Single Item")).toBeInTheDocument();
      });
    });
  });

  describe("FormRow Component", () => {
    describe("Basic Rendering", () => {
      it("should render FormRow with children", () => {
        render(
          <FormRow>
            <div>Row Item 1</div>
            <div>Row Item 2</div>
          </FormRow>
        );
        expect(screen.getByText("Row Item 1")).toBeInTheDocument();
        expect(screen.getByText("Row Item 2")).toBeInTheDocument();
      });

      it("should render as div element", () => {
        const { container } = render(
          <FormRow>
            <span>Content</span>
          </FormRow>
        );
        expect(container.firstChild?.nodeName).toBe("DIV");
      });

      it("should have flex class", () => {
        const { container } = render(
          <FormRow>
            <span>Content</span>
          </FormRow>
        );
        expect(container.firstChild).toHaveClass("flex");
      });

      it("should have items-start class", () => {
        const { container } = render(
          <FormRow>
            <span>Content</span>
          </FormRow>
        );
        expect(container.firstChild).toHaveClass("items-start");
      });

      it("should have gap-4 class", () => {
        const { container } = render(
          <FormRow>
            <span>Content</span>
          </FormRow>
        );
        expect(container.firstChild).toHaveClass("gap-4");
      });

      it("should render multiple items horizontally", () => {
        render(
          <FormRow>
            <FormField>
              <label>Field 1</label>
            </FormField>
            <FormField>
              <label>Field 2</label>
            </FormField>
            <FormField>
              <label>Field 3</label>
            </FormField>
          </FormRow>
        );
        expect(screen.getByText("Field 1")).toBeInTheDocument();
        expect(screen.getByText("Field 2")).toBeInTheDocument();
        expect(screen.getByText("Field 3")).toBeInTheDocument();
      });

      it("should accept custom className", () => {
        const { container } = render(
          <FormRow className="custom-row">
            <span>Content</span>
          </FormRow>
        );
        expect(container.firstChild).toHaveClass("custom-row");
      });

      it("should merge custom className with flex classes", () => {
        const { container } = render(
          <FormRow className="justify-between">
            <span>Content</span>
          </FormRow>
        );
        expect(container.firstChild).toHaveClass(
          "justify-between",
          "flex",
          "items-start",
          "gap-4"
        );
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty children", () => {
        const { container } = render(<FormRow />);
        expect(container.firstChild).toBeInTheDocument();
      });

      it("should handle single child", () => {
        render(
          <FormRow>
            <div>Single Item</div>
          </FormRow>
        );
        expect(screen.getByText("Single Item")).toBeInTheDocument();
      });

      it("should handle many children", () => {
        render(
          <FormRow>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i}>Item {i + 1}</div>
            ))}
          </FormRow>
        );
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 5")).toBeInTheDocument();
      });
    });
  });

  describe("Component Combinations", () => {
    it("should combine FormSection with FormGrid", () => {
      render(
        <FormSection>
          <h3>Personal Information</h3>
          <FormGrid columns={2}>
            <FormField>
              <label>First Name</label>
            </FormField>
            <FormField>
              <label>Last Name</label>
            </FormField>
          </FormGrid>
        </FormSection>
      );
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("First Name")).toBeInTheDocument();
      expect(screen.getByText("Last Name")).toBeInTheDocument();
    });

    it("should combine FormSection with FormRow", () => {
      render(
        <FormSection>
          <h3>Actions</h3>
          <FormRow>
            <button>Save</button>
            <button>Cancel</button>
          </FormRow>
        </FormSection>
      );
      expect(screen.getByText("Actions")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should nest FormGrid inside FormRow", () => {
      render(
        <FormRow>
          <FormGrid columns={2}>
            <div>Grid Item 1</div>
            <div>Grid Item 2</div>
          </FormGrid>
          <div>Side Content</div>
        </FormRow>
      );
      expect(screen.getByText("Grid Item 1")).toBeInTheDocument();
      expect(screen.getByText("Grid Item 2")).toBeInTheDocument();
      expect(screen.getByText("Side Content")).toBeInTheDocument();
    });

    it("should create complex form layout", () => {
      render(
        <FormSection>
          <h2>Complete Form</h2>
          <FormGrid columns={2}>
            <FormField>
              <label>Name</label>
              <input type="text" placeholder="Name" />
            </FormField>
            <FormField>
              <label>Email</label>
              <input type="email" placeholder="Email" />
            </FormField>
          </FormGrid>
          <FormRow>
            <button>Submit</button>
            <button>Reset</button>
          </FormRow>
        </FormSection>
      );
      expect(screen.getByText("Complete Form")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("should handle multiple FormSections with different layouts", () => {
      render(
        <>
          <FormSection>
            <h3>Section 1</h3>
            <FormGrid columns={3}>
              <div>A</div>
              <div>B</div>
              <div>C</div>
            </FormGrid>
          </FormSection>
          <FormSection>
            <h3>Section 2</h3>
            <FormRow>
              <div>X</div>
              <div>Y</div>
            </FormRow>
          </FormSection>
        </>
      );
      expect(screen.getByText("Section 1")).toBeInTheDocument();
      expect(screen.getByText("Section 2")).toBeInTheDocument();
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("X")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should render FormField without crashing", () => {
      expect(() => {
        render(
          <FormField className="test">
            <span>Content</span>
          </FormField>
        );
      }).not.toThrow();
    });

    it("should render FormSection without crashing", () => {
      expect(() => {
        render(
          <FormSection className="test">
            <span>Content</span>
          </FormSection>
        );
      }).not.toThrow();
    });

    it("should render FormGrid without crashing", () => {
      expect(() => {
        render(
          <FormGrid columns={4} className="test">
            <span>Content</span>
          </FormGrid>
        );
      }).not.toThrow();
    });

    it("should render FormRow without crashing", () => {
      expect(() => {
        render(
          <FormRow className="test">
            <span>Content</span>
          </FormRow>
        );
      }).not.toThrow();
    });

    it("should handle large number of FormFields", () => {
      render(
        <FormSection>
          {Array.from({ length: 50 }, (_, i) => (
            <FormField key={i}>
              <label>Field {i}</label>
            </FormField>
          ))}
        </FormSection>
      );
      expect(screen.getByText("Field 0")).toBeInTheDocument();
      expect(screen.getByText("Field 49")).toBeInTheDocument();
    });

    it("should handle deeply nested components", () => {
      render(
        <FormSection>
          <FormGrid columns={2}>
            <FormField>
              <FormRow>
                <div>Nested</div>
                <div>Content</div>
              </FormRow>
            </FormField>
          </FormGrid>
        </FormSection>
      );
      expect(screen.getByText("Nested")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });
});
