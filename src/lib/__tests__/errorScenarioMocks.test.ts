// Example error scenario mock
describe("errorScenarioMocks", () => {
  it("mocks a network error", () => {
    const error = new Error("Network error");
    expect(error.message).toBe("Network error");
  });

  it("mocks a validation error", () => {
    const error = { code: "VALIDATION_ERROR", message: "Invalid input" };
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid input");
  });
});
