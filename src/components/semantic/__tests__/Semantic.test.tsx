import { render, screen } from "@testing-library/react";
import {
  Section,
  Article,
  Main,
  Aside,
  Nav,
  BlockHeader,
  BlockFooter,
  Ul,
  Ol,
  Li,
} from "@/components";

describe("Section", () => {
  it("renders a <section> element", () => {
    const { container } = render(<Section>content</Section>);
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(<Section className="py-12">content</Section>);
    expect(container.firstChild).toHaveClass("py-12");
  });

  it("renders children", () => {
    render(<Section>hello section</Section>);
    expect(screen.getByText("hello section")).toBeInTheDocument();
  });

  it("forwards extra HTML attributes", () => {
    const { container } = render(<Section id="about">content</Section>);
    expect(container.querySelector("#about")).toBeInTheDocument();
  });
});

describe("Article", () => {
  it("renders an <article> element", () => {
    const { container } = render(<Article>article content</Article>);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(
      <Article className="prose">article content</Article>,
    );
    expect(container.firstChild).toHaveClass("prose");
  });

  it("renders children", () => {
    render(<Article>blog post body</Article>);
    expect(screen.getByText("blog post body")).toBeInTheDocument();
  });
});

describe("Main", () => {
  it("renders a <main> element", () => {
    const { container } = render(<Main>main content</Main>);
    expect(container.querySelector("main")).toBeInTheDocument();
  });

  it("forwards className and id", () => {
    const { container } = render(
      <Main id="main-content" className="flex-1">
        content
      </Main>,
    );
    const el = container.querySelector("main");
    expect(el).toHaveAttribute("id", "main-content");
    expect(el).toHaveClass("flex-1");
  });
});

describe("Aside", () => {
  it("renders an <aside> element", () => {
    const { container } = render(<Aside>sidebar</Aside>);
    expect(container.querySelector("aside")).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(<Aside className="w-64">sidebar</Aside>);
    expect(container.firstChild).toHaveClass("w-64");
  });
});

describe("Nav", () => {
  it("renders a <nav> element", () => {
    const { container } = render(<Nav aria-label="Main navigation">links</Nav>);
    expect(container.querySelector("nav")).toBeInTheDocument();
  });

  it("sets the aria-label attribute", () => {
    const { container } = render(<Nav aria-label="Breadcrumb">crumbs</Nav>);
    expect(container.querySelector("nav")).toHaveAttribute(
      "aria-label",
      "Breadcrumb",
    );
  });

  it("forwards className and renders children", () => {
    const { container } = render(
      <Nav aria-label="Footer nav" className="flex gap-4">
        nav link
      </Nav>,
    );
    expect(container.firstChild).toHaveClass("flex", "gap-4");
    expect(screen.getByText("nav link")).toBeInTheDocument();
  });
});

describe("BlockHeader", () => {
  it("renders a <header> element", () => {
    const { container } = render(<BlockHeader>heading area</BlockHeader>);
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(
      <BlockHeader className="mb-4">heading area</BlockHeader>,
    );
    expect(container.firstChild).toHaveClass("mb-4");
  });
});

describe("BlockFooter", () => {
  it("renders a <footer> element", () => {
    const { container } = render(<BlockFooter>footer area</BlockFooter>);
    expect(container.querySelector("footer")).toBeInTheDocument();
  });

  it("forwards className and children", () => {
    const { container } = render(
      <BlockFooter className="mt-4 flex gap-2">updated at</BlockFooter>,
    );
    expect(container.firstChild).toHaveClass("mt-4", "flex", "gap-2");
    expect(screen.getByText("updated at")).toBeInTheDocument();
  });
});

describe("Ul", () => {
  it("renders a <ul> element", () => {
    const { container } = render(
      <Ul>
        <li>item</li>
      </Ul>,
    );
    expect(container.querySelector("ul")).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(
      <Ul className="space-y-2">
        <li>item</li>
      </Ul>,
    );
    expect(container.firstChild).toHaveClass("space-y-2");
  });
});

describe("Ol", () => {
  it("renders an <ol> element", () => {
    const { container } = render(
      <Ol>
        <li>step</li>
      </Ol>,
    );
    expect(container.querySelector("ol")).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(
      <Ol className="list-decimal pl-4">
        <li>step</li>
      </Ol>,
    );
    expect(container.firstChild).toHaveClass("list-decimal", "pl-4");
  });
});

describe("Li", () => {
  it("renders a <li> element", () => {
    const { container } = render(<Li>list item</Li>);
    expect(container.querySelector("li")).toBeInTheDocument();
  });

  it("forwards className and children", () => {
    render(<Li className="flex items-center">list item text</Li>);
    const li = screen.getByText("list item text").closest("li");
    expect(li).toHaveClass("flex", "items-center");
  });

  it("passes value attribute for ordered list context", () => {
    const { container } = render(<Li value={3}>step 3</Li>);
    expect(container.querySelector("li")).toHaveAttribute("value", "3");
  });
});
