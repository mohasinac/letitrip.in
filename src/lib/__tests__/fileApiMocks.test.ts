describe("File API mocks", () => {
  it("mocks File constructor", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    expect(file.name).toBe("test.txt");
    expect(file.type).toBe("text/plain");
  });

  it("mocks FileReader", () => {
    const reader = new FileReader();
    expect(reader).toBeDefined();
  });
});
