describe("Fetch API mocks", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("mocks a successful fetch response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", name: "Test" }),
    });
    const res = await fetch("/api/test");
    const data = await res.json();
    expect(res.ok).toBe(true);
    expect(data.id).toBe("1");
  });

  it("mocks a failed fetch response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Not found" }),
    });
    const res = await fetch("/api/test");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Not found");
  });
});
