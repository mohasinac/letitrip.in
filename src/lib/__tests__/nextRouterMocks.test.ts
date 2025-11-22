import { useRouter } from "next/router";

describe("Next.js router mocks", () => {
  it("mocks useRouter push", () => {
    const push = jest.fn();
    jest.spyOn(require("next/router"), "useRouter").mockReturnValue({ push });
    const router = useRouter();
    router.push("/test");
    expect(push).toHaveBeenCalledWith("/test");
  });
});
