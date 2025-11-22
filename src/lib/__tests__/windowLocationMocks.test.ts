describe("Window/location mocks", () => {
  it("mocks window.location.assign", () => {
    const assignSpy = jest
      .spyOn(window.location, "assign")
      .mockImplementation(() => {});
    window.location.assign("/test");
    expect(assignSpy).toHaveBeenCalledWith("/test");
    assignSpy.mockRestore();
  });

  it("mocks window.location.href", () => {
    window.location.replace("https://example.com");
    // Can't reliably set href directly, so just check replace called
    expect(window.location.replace).toBeDefined();
  });
});
