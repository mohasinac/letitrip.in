/**
 * useMediaUpload Tests
 *
 * Verifies that useMediaUpload delegates to mediaService.upload()
 * and exposes an upload() convenience function.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useMediaUpload } from "../useMediaUpload";

jest.mock("@/hooks", () => ({
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (formData: unknown) => opts.mutationFn(formData),
    isLoading: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  mediaService: {
    upload: jest
      .fn()
      .mockResolvedValue({ url: "https://cdn.example.com/img.jpg" }),
  },
}));

const { useApiMutation } = require("@/hooks");
const { mediaService } = require("@/services");

describe("useMediaUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls mediaService.upload with the FormData when mutate is invoked", () => {
    const { result } = renderHook(() => useMediaUpload());
    const formData = new FormData();
    formData.append("file", new Blob(["data"], { type: "image/png" }));
    result.current.mutate(formData);
    expect(mediaService.upload).toHaveBeenCalledWith(formData);
  });

  it("wires mutationFn through useApiMutation", () => {
    renderHook(() => useMediaUpload());
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    );
  });

  it("returns mutation state from useApiMutation", () => {
    (useApiMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: true,
      error: null,
      data: undefined,
      reset: jest.fn(),
    });
    const { result } = renderHook(() => useMediaUpload());
    expect(result.current.isLoading).toBe(true);
  });

  it("returns uploaded url in data on success", () => {
    (useApiMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      error: null,
      data: { url: "https://cdn.example.com/img.jpg" },
      reset: jest.fn(),
    });
    const { result } = renderHook(() => useMediaUpload());
    expect(result.current.data).toEqual({
      url: "https://cdn.example.com/img.jpg",
    });
  });

  it("upload() builds FormData and returns the URL string", async () => {
    const mockMutate = jest
      .fn()
      .mockResolvedValue({ url: "https://cdn.example.com/img.jpg" });
    (useApiMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
    });
    const { result } = renderHook(() => useMediaUpload());
    const file = new File(["data"], "photo.png", { type: "image/png" });
    let url: string = "";
    await act(async () => {
      url = await result.current.upload(file, "products");
    });
    expect(url).toBe("https://cdn.example.com/img.jpg");
    const calledFormData: FormData = mockMutate.mock.calls[0][0];
    expect(calledFormData.get("file")).toBe(file);
    expect(calledFormData.get("folder")).toBe("products");
    expect(calledFormData.get("public")).toBe("true");
  });
});
