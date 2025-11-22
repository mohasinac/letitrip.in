describe("LocalStorage mocks", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "value"),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it("mocks getItem", () => {
    expect(window.localStorage.getItem("key")).toBe("value");
  });

  it("mocks setItem", () => {
    window.localStorage.setItem("key", "newValue");
    expect(window.localStorage.setItem).toHaveBeenCalledWith("key", "newValue");
  });
});
