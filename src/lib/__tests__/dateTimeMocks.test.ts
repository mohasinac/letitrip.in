describe("Date/Time mocks", () => {
  it("mocks Date.now", () => {
    const now = 1700000000000;
    jest.spyOn(Date, "now").mockReturnValue(now);
    expect(Date.now()).toBe(now);
  });

  it("mocks new Date", () => {
    const date = new Date("2023-01-01T00:00:00Z");
    expect(date.toISOString()).toBe("2023-01-01T00:00:00.000Z");
  });
});
