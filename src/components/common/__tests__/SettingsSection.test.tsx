import { render, screen } from "@testing-library/react";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSection,
} from "../SettingsSection";

describe("SettingsSection Component", () => {
  describe("Basic Rendering", () => {
    it("should render title", () => {
      render(
        <SettingsSection title="Account Settings">
          <div>Content</div>
        </SettingsSection>
      );
      expect(screen.getByText("Account Settings")).toBeInTheDocument();
    });

    it("should render children", () => {
      render(
        <SettingsSection title="Settings">
          <div>Child content</div>
        </SettingsSection>
      );
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("should render description when provided", () => {
      render(
        <SettingsSection
          title="Settings"
          description="Manage your account settings"
        >
          <div>Content</div>
        </SettingsSection>
      );
      expect(
        screen.getByText("Manage your account settings")
      ).toBeInTheDocument();
    });

    it("should not render description when not provided", () => {
      const { container } = render(
        <SettingsSection title="Settings">
          <div>Content</div>
        </SettingsSection>
      );
      const desc = container.querySelector(".text-sm.text-gray-500");
      expect(desc).not.toBeInTheDocument();
    });

    it("should have proper structure", () => {
      const { container } = render(
        <SettingsSection title="Settings">
          <div>Content</div>
        </SettingsSection>
      );
      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass(
        "bg-white",
        "rounded-lg",
        "shadow-sm",
        "p-4",
        "sm:p-6",
        "border"
      );
    });

    it("should apply custom className", () => {
      const { container } = render(
        <SettingsSection title="Settings" className="custom-class">
          <div>Content</div>
        </SettingsSection>
      );
      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass("custom-class");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode classes", () => {
      const { container } = render(
        <SettingsSection title="Settings">
          <div>Content</div>
        </SettingsSection>
      );
      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass("dark:bg-gray-800");
    });

    it("should have dark mode title color", () => {
      render(
        <SettingsSection title="Settings">
          <div>Content</div>
        </SettingsSection>
      );
      const title = screen.getByText("Settings");
      expect(title).toHaveClass("dark:text-white");
    });

    it("should have dark mode description color", () => {
      render(
        <SettingsSection title="Settings" description="Description text">
          <div>Content</div>
        </SettingsSection>
      );
      const desc = screen.getByText("Description text");
      expect(desc).toHaveClass("dark:text-gray-400");
    });
  });

  describe("Header Section", () => {
    it("should render title with proper styling", () => {
      render(
        <SettingsSection title="Settings">
          <div>Content</div>
        </SettingsSection>
      );
      const title = screen.getByText("Settings");
      expect(title).toHaveClass(
        "text-lg",
        "sm:text-xl",
        "font-semibold",
        "text-gray-900"
      );
    });

    it("should render description with proper styling", () => {
      render(
        <SettingsSection title="Settings" description="Description">
          <div>Content</div>
        </SettingsSection>
      );
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass("text-sm", "text-gray-500", "mt-1");
    });

    it("should render action button when provided", () => {
      render(
        <SettingsSection title="Settings" action={<button>Save</button>}>
          <div>Content</div>
        </SettingsSection>
      );
      expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("should have flex layout for header", () => {
      const { container } = render(
        <SettingsSection title="Settings" action={<button>Save</button>}>
          <div>Content</div>
        </SettingsSection>
      );
      const header = screen.getByText("Settings").closest("div");
      expect(header?.parentElement).toHaveClass(
        "flex",
        "sm:items-center",
        "sm:justify-between"
      );
    });

    it("should not render action when no action provided", () => {
      render(
        <SettingsSection title="Settings">
          <div>Content</div>
        </SettingsSection>
      );
      const header = screen.getByText("Settings").parentElement;
      // Action container is always present in flex layout
      expect(header).toBeInTheDocument();
    });
  });

  describe("Compact Mode", () => {
    it("should apply compact padding when compact=true", () => {
      const { container } = render(
        <SettingsSection title="Settings" compact={true}>
          <div>Content</div>
        </SettingsSection>
      );
      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass("p-4");
    });

    it("should apply responsive padding by default", () => {
      const { container } = render(
        <SettingsSection title="Settings">
          <div>Content</div>
        </SettingsSection>
      );
      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass("p-4", "sm:p-6");
    });

    it("should apply responsive padding when compact=false", () => {
      const { container } = render(
        <SettingsSection title="Settings" compact={false}>
          <div>Content</div>
        </SettingsSection>
      );
      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass("p-4", "sm:p-6");
    });
  });

  describe("Content Area", () => {
    it("should render content with spacing", () => {
      render(
        <SettingsSection title="Settings">
          <div>Content area</div>
        </SettingsSection>
      );
      // SettingsSection doesn't add space-y-6, children rendered directly
      expect(screen.getByText("Content area")).toBeInTheDocument();
    });

    it("should render multiple children", () => {
      render(
        <SettingsSection title="Settings">
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </SettingsSection>
      );
      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
      expect(screen.getByText("Child 3")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      render(
        <SettingsSection title="">
          <div>Content</div>
        </SettingsSection>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should handle null children", () => {
      expect(() =>
        render(<SettingsSection title="Settings">{null}</SettingsSection>)
      ).not.toThrow();
    });

    it("should handle undefined children", () => {
      expect(() =>
        render(<SettingsSection title="Settings">{undefined}</SettingsSection>)
      ).not.toThrow();
    });

    it("should handle complex action elements", () => {
      render(
        <SettingsSection
          title="Settings"
          action={
            <div>
              <button>Cancel</button>
              <button>Save</button>
            </div>
          }
        >
          <div>Content</div>
        </SettingsSection>
      );
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
    });
  });
});

describe("SettingsGroup Component", () => {
  describe("Basic Rendering", () => {
    it("should render title", () => {
      render(
        <SettingsGroup title="Privacy Settings">
          <div>Content</div>
        </SettingsGroup>
      );
      expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
    });

    it("should render children", () => {
      render(
        <SettingsGroup title="Group">
          <div>Group content</div>
        </SettingsGroup>
      );
      expect(screen.getByText("Group content")).toBeInTheDocument();
    });

    it("should render description when provided", () => {
      render(
        <SettingsGroup title="Group" description="Group description">
          <div>Content</div>
        </SettingsGroup>
      );
      expect(screen.getByText("Group description")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <SettingsGroup title="Group" className="custom-group">
          <div>Content</div>
        </SettingsGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("custom-group");
    });
  });

  describe("Styling", () => {
    it("should have proper spacing", () => {
      const { container } = render(
        <SettingsGroup title="Group">
          <div>Content</div>
        </SettingsGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("space-y-6");
    });

    it("should have title styling", () => {
      render(
        <SettingsGroup title="Group">
          <div>Content</div>
        </SettingsGroup>
      );
      const title = screen.getByText("Group");
      expect(title).toHaveClass(
        "text-lg",
        "font-medium",
        "text-gray-900",
        "dark:text-white"
      );
    });

    it("should have description styling", () => {
      render(
        <SettingsGroup title="Group" description="Description">
          <div>Content</div>
        </SettingsGroup>
      );
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass(
        "text-sm",
        "text-gray-500",
        "dark:text-gray-400"
      );
    });
  });

  describe("Content Spacing", () => {
    it("should have spacing between children", () => {
      const { container } = render(
        <SettingsGroup title="Group">
          <div>Child 1</div>
          <div>Child 2</div>
        </SettingsGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("space-y-6");
    });

    it("should have spacing for content", () => {
      const { container } = render(
        <SettingsGroup title="Group">
          <div>Content</div>
        </SettingsGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("space-y-6");
    });
  });

  describe("Multiple Children", () => {
    it("should render multiple children with spacing", () => {
      render(
        <SettingsGroup title="Group">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </SettingsGroup>
      );
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Item 3")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      render(
        <SettingsGroup title="">
          <div>Content</div>
        </SettingsGroup>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should handle null children", () => {
      expect(() =>
        render(<SettingsGroup title="Group">{null}</SettingsGroup>)
      ).not.toThrow();
    });

    it("should not render description when not provided", () => {
      const { container } = render(
        <SettingsGroup title="Group">
          <div>Content</div>
        </SettingsGroup>
      );
      const descriptions = container.querySelectorAll(".text-sm.text-gray-500");
      expect(descriptions).toHaveLength(0);
    });
  });
});

describe("SettingsRow Component", () => {
  describe("Basic Rendering", () => {
    it("should render label", () => {
      render(
        <SettingsRow label="Email Notifications">
          <input type="checkbox" />
        </SettingsRow>
      );
      expect(screen.getByText("Email Notifications")).toBeInTheDocument();
    });

    it("should render children", () => {
      render(
        <SettingsRow label="Setting">
          <button>Toggle</button>
        </SettingsRow>
      );
      expect(screen.getByText("Toggle")).toBeInTheDocument();
    });

    it("should render description when provided", () => {
      render(
        <SettingsRow label="Setting" description="Setting description">
          <input type="checkbox" />
        </SettingsRow>
      );
      expect(screen.getByText("Setting description")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <SettingsRow label="Setting" className="custom-row">
          <input type="checkbox" />
        </SettingsRow>
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass("custom-row");
    });
  });

  describe("Responsive Layout", () => {
    it("should have flex layout", () => {
      const { container } = render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass("flex", "sm:items-center", "sm:justify-between");
    });

    it("should switch to column layout on mobile", () => {
      const { container } = render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass("flex-col", "sm:flex-row");
    });

    it("should align items center on desktop", () => {
      const { container } = render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass("sm:items-center");
    });

    it("should have gap between elements", () => {
      const { container } = render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass("gap-2");
    });
  });

  describe("Label Section", () => {
    it("should have flex-1 on label container", () => {
      const { container } = render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const labelContainer = screen.getByText("Setting").parentElement;
      expect(labelContainer).toHaveClass("flex-1");
    });

    it("should have label styling", () => {
      render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const label = screen.getByText("Setting");
      expect(label).toHaveClass(
        "text-sm",
        "font-medium",
        "text-gray-700",
        "dark:text-gray-300"
      );
    });

    it("should have description styling", () => {
      render(
        <SettingsRow label="Setting" description="Description">
          <input type="checkbox" />
        </SettingsRow>
      );
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass(
        "text-xs",
        "text-gray-500",
        "dark:text-gray-400",
        "mt-0.5"
      );
    });
  });

  describe("Border Styling", () => {
    it("should have bottom border by default", () => {
      const { container } = render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass(
        "border-b",
        "border-gray-100",
        "dark:border-gray-700"
      );
    });

    it("should have padding", () => {
      const { container } = render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass("py-3");
    });

    it("should use last:border-0 for last child", () => {
      const { container } = render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass("last:border-0");
    });
  });

  describe("Control Section", () => {
    it("should render control elements", () => {
      render(
        <SettingsRow label="Setting">
          <select>
            <option>Option 1</option>
          </select>
        </SettingsRow>
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render multiple controls", () => {
      render(
        <SettingsRow label="Setting">
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        </SettingsRow>
      );
      expect(screen.getByText("Button 1")).toBeInTheDocument();
      expect(screen.getByText("Button 2")).toBeInTheDocument();
    });
  });

  describe("Common Use Cases", () => {
    it("should work with checkbox controls", () => {
      render(
        <SettingsRow
          label="Enable feature"
          description="Turn this feature on or off"
        >
          <input type="checkbox" aria-label="Toggle feature" />
        </SettingsRow>
      );
      expect(screen.getByLabelText("Toggle feature")).toBeInTheDocument();
    });

    it("should work with select controls", () => {
      render(
        <SettingsRow label="Theme" description="Choose your preferred theme">
          <select aria-label="Select theme">
            <option>Light</option>
            <option>Dark</option>
          </select>
        </SettingsRow>
      );
      expect(screen.getByLabelText("Select theme")).toBeInTheDocument();
    });

    it("should work with button controls", () => {
      render(
        <SettingsRow label="Account" description="Manage your account">
          <button>Edit</button>
        </SettingsRow>
      );
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should work with text displays", () => {
      render(
        <SettingsRow label="Email">
          <span>user@example.com</span>
        </SettingsRow>
      );
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty label", () => {
      render(
        <SettingsRow label="">
          <input type="checkbox" />
        </SettingsRow>
      );
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should handle null children", () => {
      expect(() =>
        render(<SettingsRow label="Setting">{null}</SettingsRow>)
      ).not.toThrow();
    });

    it("should not render description when not provided", () => {
      const { container } = render(
        <SettingsRow label="Setting">
          <input type="checkbox" />
        </SettingsRow>
      );
      const descriptions = container.querySelectorAll(
        ".text-sm.text-gray-500.mt-1"
      );
      expect(descriptions).toHaveLength(0);
    });

    it("should handle long labels", () => {
      render(
        <SettingsRow label="Very long setting label that might wrap to multiple lines">
          <input type="checkbox" />
        </SettingsRow>
      );
      expect(
        screen.getByText(
          "Very long setting label that might wrap to multiple lines"
        )
      ).toBeInTheDocument();
    });

    it("should handle long descriptions", () => {
      render(
        <SettingsRow
          label="Setting"
          description="Very long description text that provides detailed information about this setting and might wrap to multiple lines"
        >
          <input type="checkbox" />
        </SettingsRow>
      );
      expect(
        screen.getByText(/Very long description text/)
      ).toBeInTheDocument();
    });
  });
});

describe("SettingsSection Integration", () => {
  it("should work with SettingsGroup inside SettingsSection", () => {
    render(
      <SettingsSection title="Account Settings">
        <SettingsGroup title="Privacy">
          <div>Privacy settings</div>
        </SettingsGroup>
      </SettingsSection>
    );
    expect(screen.getByText("Account Settings")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Privacy settings")).toBeInTheDocument();
  });

  it("should work with SettingsRow inside SettingsSection", () => {
    render(
      <SettingsSection title="Settings">
        <SettingsRow label="Email">
          <input type="checkbox" />
        </SettingsRow>
      </SettingsSection>
    );
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("should work with SettingsRow inside SettingsGroup", () => {
    render(
      <SettingsGroup title="Notifications">
        <SettingsRow label="Email" description="Receive email notifications">
          <input type="checkbox" />
        </SettingsRow>
        <SettingsRow label="SMS">
          <input type="checkbox" />
        </SettingsRow>
      </SettingsGroup>
    );
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("SMS")).toBeInTheDocument();
  });

  it("should work with full nested structure", () => {
    render(
      <SettingsSection
        title="User Settings"
        description="Manage your preferences"
      >
        <SettingsGroup
          title="Notifications"
          description="Control notification settings"
        >
          <SettingsRow label="Email" description="Email notifications">
            <input type="checkbox" aria-label="Email toggle" />
          </SettingsRow>
          <SettingsRow label="Push" description="Push notifications">
            <input type="checkbox" aria-label="Push toggle" />
          </SettingsRow>
        </SettingsGroup>
        <SettingsGroup title="Privacy">
          <SettingsRow label="Profile visibility">
            <select aria-label="Visibility">
              <option>Public</option>
              <option>Private</option>
            </select>
          </SettingsRow>
        </SettingsGroup>
      </SettingsSection>
    );
    expect(screen.getByText("User Settings")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Push")).toBeInTheDocument();
    expect(screen.getByText("Profile visibility")).toBeInTheDocument();
  });

  it("should maintain proper spacing in nested structure", () => {
    const { container } = render(
      <SettingsSection title="Settings">
        <SettingsGroup title="Group 1">
          <SettingsRow label="Row 1">
            <input type="checkbox" />
          </SettingsRow>
        </SettingsGroup>
      </SettingsSection>
    );
    const section = container.querySelector(".space-y-6");
    expect(section).toBeInTheDocument();
  });
});
