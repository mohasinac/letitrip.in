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

// Helper to get the last call's props
const getLastCallProps = () => {
  const calls = MockedSearchableDropdown.mock.calls;
  return calls[calls.length - 1]?.[0];
};

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
      expect(MockedSearchableDropdown).toHaveBeenCalled();
      const callProps = MockedSearchableDropdown.mock.calls[0][0];
      expect(callProps.value).toBe("Maharashtra");
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
      expect(getLastCallProps().disabled).toBe(true);
    });

    it("passes required prop", () => {
      render(<StateSelector {...defaultProps} required={true} />);
      expect(getLastCallProps().required).toBe(true);
    });

    it("passes error prop", () => {
      render(<StateSelector {...defaultProps} error="State is required" />);
      expect(getLastCallProps().error).toBe("State is required");
    });

    it("passes custom label", () => {
      render(<StateSelector {...defaultProps} label="Select Your State" />);
      expect(getLastCallProps().label).toBe("Select Your State");
    });

    it("passes custom placeholder", () => {
      render(<StateSelector {...defaultProps} placeholder="Choose state..." />);
      expect(getLastCallProps().placeholder).toBe("Choose state...");
    });

    it("passes className", () => {
      render(<StateSelector {...defaultProps} className="custom-class" />);
      expect(getLastCallProps().className).toBe("custom-class");
    });

    it("passes id prop", () => {
      render(<StateSelector {...defaultProps} id="state-select" />);
      expect(getLastCallProps().id).toBe("state-select");
    });

    it("passes name prop", () => {
      render(<StateSelector {...defaultProps} name="state" />);
      expect(getLastCallProps().name).toBe("state");
    });
  });

  describe("SearchableDropdown Configuration", () => {
    it("sets mode to 'single'", () => {
      render(<StateSelector {...defaultProps} />);
      expect(getLastCallProps().mode).toBe("single");
    });

    it("enables searchable", () => {
      render(<StateSelector {...defaultProps} />);
      expect(getLastCallProps().searchable).toBe(true);
    });

    it("enables clearable", () => {
      render(<StateSelector {...defaultProps} />);
      expect(getLastCallProps().clearable).toBe(true);
    });

    it("sets search placeholder", () => {
      render(<StateSelector {...defaultProps} />);
      expect(getLastCallProps().searchPlaceholder).toBe("Search states...");
    });

    it("sets no results text", () => {
      render(<StateSelector {...defaultProps} />);
      expect(getLastCallProps().noResultsText).toBe("No states found");
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
      expect(getLastCallProps().disabled).toBe(false);
    });

    it("required defaults to false", () => {
      render(<StateSelector {...defaultProps} />);
      expect(getLastCallProps().required).toBe(false);
    });

    it("className defaults to empty string", () => {
      render(<StateSelector {...defaultProps} />);
      expect(getLastCallProps().className).toBe("");
    });
  });

  describe("Change Handler", () => {
    it("passes onChange value as-is", () => {
      const onChange = jest.fn();
      render(<StateSelector {...defaultProps} onChange={onChange} />);

      const onChangeHandler =
        MockedSearchableDropdown.mock.calls[0][0].onChange;
      onChangeHandler(123); // Pass non-string (though component expects string)

      expect(onChange).toHaveBeenCalledWith(123);
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

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("handles undefined value", () => {
      const onChange = jest.fn();
      render(<StateSelector {...defaultProps} onChange={onChange} />);

      const onChangeHandler =
        MockedSearchableDropdown.mock.calls[0][0].onChange;
      onChangeHandler(undefined);

      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe("State Updates", () => {
    it("updates value when prop changes", () => {
      const { rerender } = render(
        <StateSelector {...defaultProps} value="Gujarat" />
      );

      expect(getLastCallProps().value).toBe("Gujarat");

      rerender(<StateSelector {...defaultProps} value="Kerala" />);

      expect(getLastCallProps().value).toBe("Kerala");
    });

    it("handles rapid value changes", () => {
      const { rerender } = render(<StateSelector {...defaultProps} value="" />);

      const states = ["Maharashtra", "Karnataka", "Delhi", "Punjab"];
      states.forEach((state) => {
        rerender(<StateSelector {...defaultProps} value={state} />);
      });

      expect(getLastCallProps().value).toBe("Punjab");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long state names", () => {
      const longValue = "A".repeat(100);
      render(<StateSelector {...defaultProps} value={longValue} />);

      expect(getLastCallProps().value).toBe(longValue);
    });

    it("handles special characters in value", () => {
      render(<StateSelector {...defaultProps} value="Test & Value" />);
      expect(getLastCallProps().value).toBe("Test & Value");
    });

    it("handles empty className", () => {
      render(<StateSelector {...defaultProps} className="" />);
      expect(getLastCallProps().className).toBe("");
    });

    it("handles multiple class names", () => {
      render(
        <StateSelector {...defaultProps} className="class1 class2 class3" />
      );
      expect(getLastCallProps().className).toBe("class1 class2 class3");
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

      const props = getLastCallProps();
      expect(props.value).toBe("Updated");
      expect(props.disabled).toBe(true);
      expect(props.required).toBe(false);
      expect(props.error).toBe("Error 2");
      expect(props.label).toBe("Label 2");
      expect(props.placeholder).toBe("Placeholder 2");
      expect(props.className).toBe("class2");
      expect(props.id).toBe("id2");
      expect(props.name).toBe("name2");
    });
  });
});
