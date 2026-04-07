import { resolveApiBaseUrl } from "@/lib/http/index";

describe("resolveApiBaseUrl", () => {
  it("uses browser origin when env base URL is empty", () => {
    expect(resolveApiBaseUrl("https://www.letitrip.in", "")).toBe(
      "https://www.letitrip.in",
    );
  });

  it("uses browser origin when env base URL is localhost on production host", () => {
    expect(
      resolveApiBaseUrl("https://www.letitrip.in", "http://localhost:3000"),
    ).toBe("https://www.letitrip.in");
  });

  it("keeps localhost base URL when browser host is local", () => {
    expect(
      resolveApiBaseUrl("http://localhost:3000", "http://localhost:3000"),
    ).toBe("http://localhost:3000");
  });

  it("keeps non-local configured URL on production host", () => {
    expect(
      resolveApiBaseUrl("https://www.letitrip.in", "https://api.letitrip.in"),
    ).toBe("https://api.letitrip.in");
  });
});
