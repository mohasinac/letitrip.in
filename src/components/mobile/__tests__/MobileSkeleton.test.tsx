import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import {
  AddressCardSkeleton,
  DashboardStatSkeleton,
  ListSkeleton,
  MobileSkeleton,
  OrderCardSkeleton,
  ProductCardSkeleton,
  TableRowSkeleton,
  UserCardSkeleton,
} from "../MobileSkeleton";

describe("MobileSkeleton - Loading State Component", () => {
  describe("Base MobileSkeleton Component", () => {
    it("should render with default variant (rectangular)", () => {
      const { container } = render(<MobileSkeleton />);
      const skeleton = container.firstChild;
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass("bg-gray-200");
    });

    it("should have progressbar role", () => {
      render(<MobileSkeleton />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should have aria-busy=true", () => {
      render(<MobileSkeleton />);
      const skeleton = screen.getByRole("progressbar");
      expect(skeleton).toHaveAttribute("aria-busy", "true");
    });

    it("should have aria-label='Loading...'", () => {
      render(<MobileSkeleton />);
      const skeleton = screen.getByRole("progressbar");
      expect(skeleton).toHaveAttribute("aria-label", "Loading...");
    });

    it("should apply pulse animation by default", () => {
      const { container } = render(<MobileSkeleton />);
      expect(container.firstChild).toHaveClass("animate-pulse");
    });
  });

  describe("Variants", () => {
    it("should render text variant", () => {
      const { container } = render(<MobileSkeleton variant="text" />);
      expect(container.firstChild).toHaveClass("rounded", "h-4");
    });

    it("should render circular variant", () => {
      const { container } = render(<MobileSkeleton variant="circular" />);
      expect(container.firstChild).toHaveClass("rounded-full");
    });

    it("should render rectangular variant", () => {
      const { container } = render(<MobileSkeleton variant="rectangular" />);
      expect(container.firstChild).toHaveClass("bg-gray-200");
      expect(container.firstChild).not.toHaveClass(
        "rounded-full",
        "rounded-lg"
      );
    });

    it("should render rounded variant", () => {
      const { container } = render(<MobileSkeleton variant="rounded" />);
      expect(container.firstChild).toHaveClass("rounded-lg");
    });
  });

  describe("Animation Types", () => {
    it("should render pulse animation", () => {
      const { container } = render(<MobileSkeleton animation="pulse" />);
      expect(container.firstChild).toHaveClass("animate-pulse");
    });

    it("should render wave animation", () => {
      const { container } = render(<MobileSkeleton animation="wave" />);
      expect(container.firstChild).toHaveClass("animate-shimmer");
    });

    it("should render no animation", () => {
      const { container } = render(<MobileSkeleton animation="none" />);
      expect(container.firstChild).not.toHaveClass(
        "animate-pulse",
        "animate-shimmer"
      );
    });
  });

  describe("Dimensions", () => {
    it("should accept string width", () => {
      const { container } = render(<MobileSkeleton width="100%" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe("100%");
    });

    it("should accept number width (converts to px)", () => {
      const { container } = render(<MobileSkeleton width={200} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe("200px");
    });

    it("should accept string height", () => {
      const { container } = render(<MobileSkeleton height="50px" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.height).toBe("50px");
    });

    it("should accept number height (converts to px)", () => {
      const { container } = render(<MobileSkeleton height={100} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.height).toBe("100px");
    });

    it("should accept both width and height", () => {
      const { container } = render(<MobileSkeleton width={150} height={75} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe("150px");
      expect(skeleton.style.height).toBe("75px");
    });
  });

  describe("Custom Styling", () => {
    it("should accept custom className", () => {
      const { container } = render(<MobileSkeleton className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should merge custom className with base classes", () => {
      const { container } = render(<MobileSkeleton className="w-full h-10" />);
      expect(container.firstChild).toHaveClass("w-full", "h-10", "bg-gray-200");
    });
  });

  describe("ProductCardSkeleton", () => {
    it("should render product card skeleton structure", () => {
      const { container } = render(<ProductCardSkeleton />);
      expect(container.querySelector(".bg-white")).toBeInTheDocument();
      expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
    });

    it("should have aspect-square image placeholder", () => {
      const { container } = render(<ProductCardSkeleton />);
      expect(container.querySelector(".aspect-square")).toBeInTheDocument();
    });

    it("should have border", () => {
      const { container } = render(<ProductCardSkeleton />);
      expect(container.querySelector(".border-gray-200")).toBeInTheDocument();
    });

    it("should have padding section (p-4)", () => {
      const { container } = render(<ProductCardSkeleton />);
      expect(container.querySelector(".p-4")).toBeInTheDocument();
    });

    it("should have space-y-3 for spacing", () => {
      const { container } = render(<ProductCardSkeleton />);
      expect(container.querySelector(".space-y-3")).toBeInTheDocument();
    });

    it("should render title skeleton (h-4 w-3/4)", () => {
      const { container } = render(<ProductCardSkeleton />);
      expect(container.querySelector(".h-4.w-3\\/4")).toBeInTheDocument();
    });

    it("should render price section skeleton", () => {
      const { container } = render(<ProductCardSkeleton />);
      expect(container.querySelector(".w-20")).toBeInTheDocument();
    });
  });

  describe("OrderCardSkeleton", () => {
    it("should render order card skeleton structure", () => {
      const { container } = render(<OrderCardSkeleton />);
      expect(container.querySelector(".bg-white")).toBeInTheDocument();
    });

    it("should have border-t for divider", () => {
      const { container } = render(<OrderCardSkeleton />);
      expect(container.querySelector(".border-t")).toBeInTheDocument();
    });

    it("should render order ID skeleton (h-4 w-32)", () => {
      const { container } = render(<OrderCardSkeleton />);
      expect(container.querySelector(".h-4.w-32")).toBeInTheDocument();
    });

    it("should render product thumbnail skeleton (h-16 w-16)", () => {
      const { container } = render(<OrderCardSkeleton />);
      expect(container.querySelector(".h-16.w-16")).toBeInTheDocument();
    });

    it("should have flex layout for items", () => {
      const { container } = render(<OrderCardSkeleton />);
      expect(container.querySelector(".flex.gap-3")).toBeInTheDocument();
    });

    it("should render status badge skeleton (h-6 w-16)", () => {
      const { container } = render(<OrderCardSkeleton />);
      expect(container.querySelector(".h-6.w-16")).toBeInTheDocument();
    });
  });

  describe("UserCardSkeleton", () => {
    it("should render user card skeleton structure", () => {
      const { container } = render(<UserCardSkeleton />);
      expect(container.querySelector(".bg-white")).toBeInTheDocument();
    });

    it("should render circular avatar skeleton (h-12 w-12)", () => {
      const { container } = render(<UserCardSkeleton />);
      const avatar = container.querySelector(".h-12.w-12");
      expect(avatar).toHaveClass("rounded-full");
    });

    it("should have gap-3 for spacing", () => {
      const { container } = render(<UserCardSkeleton />);
      expect(container.querySelector(".gap-3")).toBeInTheDocument();
    });

    it("should render name skeleton (h-4 w-32)", () => {
      const { container } = render(<UserCardSkeleton />);
      expect(container.querySelector(".h-4.w-32")).toBeInTheDocument();
    });

    it("should render email skeleton (h-3 w-48)", () => {
      const { container } = render(<UserCardSkeleton />);
      expect(container.querySelector(".h-3.w-48")).toBeInTheDocument();
    });

    it("should render status badge skeleton (h-6 w-16)", () => {
      const { container } = render(<UserCardSkeleton />);
      expect(container.querySelector(".h-6.w-16")).toBeInTheDocument();
    });
  });

  describe("AddressCardSkeleton", () => {
    it("should render address card skeleton structure", () => {
      const { container } = render(<AddressCardSkeleton />);
      expect(container.querySelector(".bg-white")).toBeInTheDocument();
    });

    it("should have space-y-2 for line spacing", () => {
      const { container } = render(<AddressCardSkeleton />);
      expect(container.querySelector(".space-y-2")).toBeInTheDocument();
    });

    it("should render label skeleton (h-4 w-24)", () => {
      const { container } = render(<AddressCardSkeleton />);
      expect(container.querySelector(".h-4.w-24")).toBeInTheDocument();
    });

    it("should render type badge skeleton (h-5 w-12)", () => {
      const { container } = render(<AddressCardSkeleton />);
      expect(container.querySelector(".h-5.w-12")).toBeInTheDocument();
    });

    it("should render address lines (h-3 with different widths)", () => {
      const { container } = render(<AddressCardSkeleton />);
      expect(container.querySelector(".h-3.w-full")).toBeInTheDocument();
      expect(container.querySelector(".h-3.w-3\\/4")).toBeInTheDocument();
      expect(container.querySelector(".h-3.w-1\\/2")).toBeInTheDocument();
    });
  });

  describe("DashboardStatSkeleton", () => {
    it("should render dashboard stat skeleton structure", () => {
      const { container } = render(<DashboardStatSkeleton />);
      expect(container.querySelector(".bg-white")).toBeInTheDocument();
    });

    it("should have flex layout with justify-between", () => {
      const { container } = render(<DashboardStatSkeleton />);
      expect(container.querySelector(".justify-between")).toBeInTheDocument();
    });

    it("should render label skeleton (h-3 w-20)", () => {
      const { container } = render(<DashboardStatSkeleton />);
      expect(container.querySelector(".h-3.w-20")).toBeInTheDocument();
    });

    it("should render value skeleton (h-6 w-16)", () => {
      const { container } = render(<DashboardStatSkeleton />);
      expect(container.querySelector(".h-6.w-16")).toBeInTheDocument();
    });

    it("should render circular icon skeleton (h-10 w-10)", () => {
      const { container } = render(<DashboardStatSkeleton />);
      const icon = container.querySelector(".h-10.w-10");
      expect(icon).toHaveClass("rounded-full");
    });
  });

  describe("TableRowSkeleton", () => {
    it("should render 4 columns by default", () => {
      const { container } = render(<TableRowSkeleton />);
      const skeletons = container.querySelectorAll('[role="progressbar"]');
      expect(skeletons.length).toBe(4);
    });

    it("should render custom number of columns", () => {
      const { container } = render(<TableRowSkeleton columns={6} />);
      const skeletons = container.querySelectorAll('[role="progressbar"]');
      expect(skeletons.length).toBe(6);
    });

    it("should have gap-4 spacing", () => {
      const { container } = render(<TableRowSkeleton />);
      expect(container.querySelector(".gap-4")).toBeInTheDocument();
    });

    it("should have border-b divider", () => {
      const { container } = render(<TableRowSkeleton />);
      expect(container.querySelector(".border-b")).toBeInTheDocument();
    });

    it("should have p-4 padding", () => {
      const { container } = render(<TableRowSkeleton />);
      expect(container.querySelector(".p-4")).toBeInTheDocument();
    });

    it("should render different column widths", () => {
      const { container } = render(<TableRowSkeleton />);
      expect(container.querySelector(".w-24")).toBeInTheDocument();
      expect(container.querySelector(".w-32")).toBeInTheDocument();
      expect(container.querySelector(".w-20")).toBeInTheDocument();
      expect(container.querySelector(".w-16")).toBeInTheDocument();
    });
  });

  describe("ListSkeleton", () => {
    it("should render 5 items by default", () => {
      const { container } = render(
        <ListSkeleton renderItem={() => <ProductCardSkeleton />} />
      );
      const items = container.querySelectorAll(".bg-white");
      expect(items.length).toBe(5);
    });

    it("should render custom count of items", () => {
      const { container } = render(
        <ListSkeleton count={3} renderItem={() => <ProductCardSkeleton />} />
      );
      const items = container.querySelectorAll(".bg-white");
      expect(items.length).toBe(3);
    });

    it("should have space-y-3 for item spacing", () => {
      const { container } = render(
        <ListSkeleton renderItem={() => <ProductCardSkeleton />} />
      );
      expect(container.querySelector(".space-y-3")).toBeInTheDocument();
    });

    it("should render custom renderItem component", () => {
      const { container } = render(
        <ListSkeleton renderItem={() => <OrderCardSkeleton />} />
      );
      // OrderCardSkeleton has border-t, ProductCardSkeleton doesn't
      expect(container.querySelector(".border-t")).toBeInTheDocument();
    });

    it("should render 10 items when specified", () => {
      const { container } = render(
        <ListSkeleton count={10} renderItem={() => <UserCardSkeleton />} />
      );
      const items = container.querySelectorAll(".bg-white");
      expect(items.length).toBe(10);
    });

    it("should handle single item (count=1)", () => {
      const { container } = render(
        <ListSkeleton count={1} renderItem={() => <ProductCardSkeleton />} />
      );
      const items = container.querySelectorAll(".bg-white");
      expect(items.length).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero width", () => {
      const { container } = render(<MobileSkeleton width={0} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe("0px");
    });

    it("should handle zero height", () => {
      const { container } = render(<MobileSkeleton height={0} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.height).toBe("0px");
    });

    it("should handle very large dimensions", () => {
      const { container } = render(
        <MobileSkeleton width={9999} height={9999} />
      );
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe("9999px");
      expect(skeleton.style.height).toBe("9999px");
    });

    it("should handle TableRowSkeleton with 1 column", () => {
      const { container } = render(<TableRowSkeleton columns={1} />);
      const skeletons = container.querySelectorAll('[role="progressbar"]');
      expect(skeletons.length).toBe(1);
    });

    it("should handle TableRowSkeleton with 10 columns", () => {
      const { container } = render(<TableRowSkeleton columns={10} />);
      const skeletons = container.querySelectorAll('[role="progressbar"]');
      expect(skeletons.length).toBe(10);
    });

    it("should handle ListSkeleton with count=0", () => {
      const { container } = render(
        <ListSkeleton count={0} renderItem={() => <ProductCardSkeleton />} />
      );
      const items = container.querySelectorAll(".bg-white");
      expect(items.length).toBe(0);
    });
  });

  describe("Accessibility", () => {
    it("should have progressbar role on all skeleton instances", () => {
      render(
        <div>
          <MobileSkeleton />
          <MobileSkeleton />
          <MobileSkeleton />
        </div>
      );
      const progressbars = screen.getAllByRole("progressbar");
      expect(progressbars.length).toBe(3);
    });

    it("should have aria-busy on all instances", () => {
      render(<ProductCardSkeleton />);
      const progressbars = screen.getAllByRole("progressbar");
      progressbars.forEach((pb) => {
        expect(pb).toHaveAttribute("aria-busy", "true");
      });
    });

    it("should have aria-label on all instances", () => {
      render(<UserCardSkeleton />);
      const progressbars = screen.getAllByRole("progressbar");
      progressbars.forEach((pb) => {
        expect(pb).toHaveAttribute("aria-label", "Loading...");
      });
    });
  });

  describe("Pre-built Component Integration", () => {
    it("should render ProductCardSkeleton in ListSkeleton", () => {
      const { container } = render(
        <ListSkeleton count={3} renderItem={() => <ProductCardSkeleton />} />
      );
      const aspectSquares = container.querySelectorAll(".aspect-square");
      expect(aspectSquares.length).toBe(3);
    });

    it("should render OrderCardSkeleton in ListSkeleton", () => {
      const { container } = render(
        <ListSkeleton count={2} renderItem={() => <OrderCardSkeleton />} />
      );
      const orderThumbnails = container.querySelectorAll(".h-16.w-16");
      expect(orderThumbnails.length).toBe(2);
    });

    it("should render UserCardSkeleton in ListSkeleton", () => {
      const { container } = render(
        <ListSkeleton count={4} renderItem={() => <UserCardSkeleton />} />
      );
      const avatars = container.querySelectorAll(".h-12.w-12");
      expect(avatars.length).toBe(4);
    });

    it("should render AddressCardSkeleton in ListSkeleton", () => {
      const { container } = render(
        <ListSkeleton count={2} renderItem={() => <AddressCardSkeleton />} />
      );
      const addressCards = container.querySelectorAll(".space-y-2");
      expect(addressCards.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Performance", () => {
    it("should handle rendering 50 items without crash", () => {
      expect(() => {
        render(
          <ListSkeleton count={50} renderItem={() => <ProductCardSkeleton />} />
        );
      }).not.toThrow();
    });

    it("should handle multiple skeleton types simultaneously", () => {
      expect(() => {
        render(
          <div>
            <ProductCardSkeleton />
            <OrderCardSkeleton />
            <UserCardSkeleton />
            <AddressCardSkeleton />
            <DashboardStatSkeleton />
            <TableRowSkeleton />
          </div>
        );
      }).not.toThrow();
    });
  });
});
