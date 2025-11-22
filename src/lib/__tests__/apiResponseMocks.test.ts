// Example API response mock
describe("apiResponseMocks", () => {
  it("returns a successful response", () => {
    const response = { status: 200, data: { id: "1" } };
    expect(response.status).toBe(200);
    expect(response.data.id).toBe("1");
  });

  it("returns an error response", () => {
    const response = { status: 404, error: "Not found" };
    expect(response.status).toBe(404);
    expect(response.error).toBe("Not found");
  });
});
