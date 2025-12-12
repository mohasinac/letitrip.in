import { render, screen } from "@testing-library/react";
import { SearchableDropdown } from "../SearchableDropdown";
import { StateSelector } from "../StateSelector";

// Mock SearchableDropdown
jest.mock("../SearchableDropdown", () => ({
  SearchableDropdown: jest.fn(({ label, value, placeholder }) => (
    <div data-testid="searchable-dropdown">
      <label>{label}</label>
      <div data-testid="dropdown-value">{value || placeholder}</div>
    </div>
  )),
}));

const MockedSearchableDropdown = SearchableDropdown as jest.MockedFunction<
  typeof SearchableDropdown
>;

describe("StateSelector", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without errors", () => {
      render(<StateSelector {...defaultProps} />);
      expect(screen.getByTestId("searchable-dropdown")).toBeInTheDocument();
    });

    it("renders with default label 'State'", () => {
      render(<StateSelector {...defaultProps} />);
      expect(screen.getByText("State")).toBeInTheDocument();
    });

    it("renders with default placeholder", () => {
      render(<StateSelector {...defaultProps} />);
      expect(screen.getByText("Select state")).toBeInTheDocument();
    });

    it("passes SearchableDropdown component", () => {
      render(<StateSelector {...defaultProps} />);
      expect(MockedSearchableDropdown).toHaveBeenCalled();
    });
  });

  describe("Props Passing", () => {
    it("passes value to SearchableDropdown", () => {
      render(<StateSelector {...defaultProps} value="Maharashtra" />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ value: "Maharashtra" }),
        expect.anything()
      );
    });

    it("passes onChange handler", () => {
      const onChange = jest.fn();
      render(<StateSelector {...defaultProps} onChange={onChange} />);

      const onChangeArg = MockedSearchableDropdown.mock.calls[0][0].onChange;
      onChangeArg("Karnataka");

      expect(onChange).toHaveBeenCalledWith("Karnataka");
    });

    it("passes disabled prop", () => {
      render(<StateSelector {...defaultProps} disabled={true} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: true }),
        expect.anything()
      );
    });

    it("passes required prop", () => {
      render(<StateSelector {...defaultProps} required={true} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ required: true }),
        expect.anything()
      );
    });

    it("passes error prop", () => {
      render(<StateSelector {...defaultProps} error="State is required" />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ error: "State is required" }),
        expect.anything()
      );
    });

    it("passes custom label", () => {
      render(<StateSelector {...defaultProps} label="Select Your State" />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ label: "Select Your State" }),
        expect.anything()
      );
    });

    it("passes custom placeholder", () => {
      render(<StateSelector {...defaultProps} placeholder="Choose state..." />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ placeholder: "Choose state..." }),
        expect.anything()
      );
    });

    it("passes className", () => {
      render(<StateSelector {...defaultProps} className="custom-class" />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ className: "custom-class" }),
        expect.anything()
      );
    });

    it("passes id prop", () => {
      render(<StateSelector {...defaultProps} id="state-select" />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ id: "state-select" }),
        expect.anything()
      );
    });

    it("passes name prop", () => {
      render(<StateSelector {...defaultProps} name="state" />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ name: "state" }),
        expect.anything()
      );
    });
  });

  describe("SearchableDropdown Configuration", () => {
    it("sets mode to 'single'", () => {
      render(<StateSelector {...defaultProps} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ mode: "single" }),
        expect.anything()
      );
    });

    it("enables searchable", () => {
      render(<StateSelector {...defaultProps} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ searchable: true }),
        expect.anything()
      );
    });

    it("enables clearable", () => {
      render(<StateSelector {...defaultProps} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ clearable: true }),
        expect.anything()
      );
    });

    it("sets search placeholder", () => {
      render(<StateSelector {...defaultProps} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ searchPlaceholder: "Search states..." }),
        expect.anything()
      );
    });

    it("sets no results text", () => {
      render(<StateSelector {...defaultProps} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ noResultsText: "No states found" }),
        expect.anything()
      );
    });

    it("passes options array with all Indian states", () => {
      render(<StateSelector {...defaultProps} />);
      const options = MockedSearchableDropdown.mock.calls[0][0].options;

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it("options have correct structure (value and label)", () => {
      render(<StateSelector {...defaultProps} />);
      const options = MockedSearchableDropdown.mock.calls[0][0].options;

      options.forEach((option: any) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
      });
    });

    it("option values match labels", () => {
      render(<StateSelector {...defaultProps} />);
      const options = MockedSearchableDropdown.mock.calls[0][0].options;

      options.forEach((option: any) => {
        expect(option.value).toBe(option.label);
      });
    });
  });

  describe("Default Values", () => {
    it("disabled defaults to false", () => {
      render(<StateSelector {...defaultProps} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: false }),
        expect.anything()
      );
    });

    it("required defaults to false", () => {
      render(<StateSelector {...defaultProps} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ required: false }),
        expect.anything()
      );
    });

    it("className defaults to empty string", () => {
      render(<StateSelector {...defaultProps} />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ className: "" }),
        expect.anything()
      );
    });
  });

  describe("Change Handler", () => {
    it("converts onChange value to string", () => {
      const onChange = jest.fn();
      render(<StateSelector {...defaultProps} onChange={onChange} />);

      const onChangeHandler =
        MockedSearchableDropdown.mock.calls[0][0].onChange;
      onChangeHandler(123); // Pass non-string

      expect(onChange).toHaveBeenCalledWith("123");
    });

    it("handles string values correctly", () => {
      const onChange = jest.fn();
      render(<StateSelector {...defaultProps} onChange={onChange} />);

      const onChangeHandler =
        MockedSearchableDropdown.mock.calls[0][0].onChange;
      onChangeHandler("Tamil Nadu");

      expect(onChange).toHaveBeenCalledWith("Tamil Nadu");
    });

    it("handles empty string", () => {
      const onChange = jest.fn();
      render(<StateSelector {...defaultProps} onChange={onChange} />);

      const onChangeHandler =
        MockedSearchableDropdown.mock.calls[0][0].onChange;
      onChangeHandler("");

      expect(onChange).toHaveBeenCalledWith("");
    });

    it("handles null value", () => {
      const onChange = jest.fn();
      render(<StateSelector {...defaultProps} onChange={onChange} />);

      const onChangeHandler =
        MockedSearchableDropdown.mock.calls[0][0].onChange;
      onChangeHandler(null);

      expect(onChange).toHaveBeenCalledWith("null");
    });

    it("handles undefined value", () => {
      const onChange = jest.fn();
      render(<StateSelector {...defaultProps} onChange={onChange} />);

      const onChangeHandler =
        MockedSearchableDropdown.mock.calls[0][0].onChange;
      onChangeHandler(undefined);

      expect(onChange).toHaveBeenCalledWith("undefined");
    });
  });

  describe("State Updates", () => {
    it("updates value when prop changes", () => {
      const { rerender } = render(
        <StateSelector {...defaultProps} value="Gujarat" />
      );

      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ value: "Gujarat" }),
        expect.anything()
      );

      rerender(<StateSelector {...defaultProps} value="Kerala" />);

      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ value: "Kerala" }),
        expect.anything()
      );
    });

    it("handles rapid value changes", () => {
      const { rerender } = render(<StateSelector {...defaultProps} value="" />);

      const states = ["Maharashtra", "Karnataka", "Delhi", "Punjab"];
      states.forEach((state) => {
        rerender(<StateSelector {...defaultProps} value={state} />);
      });

      expect(MockedSearchableDropdown).toHaveBeenLastCalledWith(
        expect.objectContaining({ value: "Punjab" }),
        expect.anything()
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles very long state names", () => {
      const longValue = "A".repeat(100);
      render(<StateSelector {...defaultProps} value={longValue} />);

      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ value: longValue }),
        expect.anything()
      );
    });

    it("handles special characters in value", () => {
      render(<StateSelector {...defaultProps} value="Test & Value" />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ value: "Test & Value" }),
        expect.anything()
      );
    });

    it("handles empty className", () => {
      render(<StateSelector {...defaultProps} className="" />);
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ className: "" }),
        expect.anything()
      );
    });

    it("handles multiple class names", () => {
      render(
        <StateSelector {...defaultProps} className="class1 class2 class3" />
      );
      expect(MockedSearchableDropdown).toHaveBeenCalledWith(
        expect.objectContaining({ className: "class1 class2 class3" }),
        expect.anything()
      );
    });
  });

  describe("Multiple Instances", () => {
    it("renders multiple selectors independently", () => {
      render(
        <>
          <StateSelector value="Maharashtra" onChange={jest.fn()} />
          <StateSelector value="Karnataka" onChange={jest.fn()} />
        </>
      );

      expect(MockedSearchableDropdown).toHaveBeenCalledTimes(2);
    });

    it("each instance has independent onChange", () => {
      const onChange1 = jest.fn();
      const onChange2 = jest.fn();

      render(
        <>
          <StateSelector value="State1" onChange={onChange1} />
          <StateSelector value="State2" onChange={onChange2} />
        </>
      );

      const onChangeHandler1 =
        MockedSearchableDropdown.mock.calls[0][0].onChange;
      const onChangeHandler2 =
        MockedSearchableDropdown.mock.calls[1][0].onChange;

      onChangeHandler1("New State 1");
      expect(onChange1).toHaveBeenCalledWith("New State 1");
      expect(onChange2).not.toHaveBeenCalled();

      onChangeHandler2("New State 2");
      expect(onChange2).toHaveBeenCalledWith("New State 2");
    });

    it("each instance can have different props", () => {
      render(
        <>
          <StateSelector
            value="State1"
            onChange={jest.fn()}
            disabled={true}
            required={false}
          />
          <StateSelector
            value="State2"
            onChange={jest.fn()}
            disabled={false}
            required={true}
          />
        </>
      );

      expect(MockedSearchableDropdown.mock.calls[0][0]).toMatchObject({
        value: "State1",
        disabled: true,
        required: false,
      });

      expect(MockedSearchableDropdown.mock.calls[1][0]).toMatchObject({
        value: "State2",
        disabled: false,
        required: true,
      });
    });
  });

  describe("Component Export", () => {
    it("exports StateSelector as named export", () => {
      expect(StateSelector).toBeDefined();
      expect(typeof StateSelector).toBe("function");
    });
  });

  describe("Integration", () => {
    it("maintains all props through rerenders", () => {
      const { rerender } = render(
        <StateSelector
          value="Initial"
          onChange={jest.fn()}
          disabled={false}
          required={true}
          error="Error 1"
          label="Label 1"
          placeholder="Placeholder 1"
          className="class1"
          id="id1"
          name="name1"
        />
      );

      rerender(
        <StateSelector
          value="Updated"
          onChange={jest.fn()}
          disabled={true}
          required={false}
          error="Error 2"
          label="Label 2"
          placeholder="Placeholder 2"
          className="class2"
          id="id2"
          name="name2"
        />
      );

      expect(MockedSearchableDropdown).toHaveBeenLastCalledWith(
        expect.objectContaining({
          value: "Updated",
          disabled: true,
          required: false,
          error: "Error 2",
          label: "Label 2",
          placeholder: "Placeholder 2",
          className: "class2",
          id: "id2",
          name: "name2",
        }),
        expect.anything()
      );
    });
  });
});
