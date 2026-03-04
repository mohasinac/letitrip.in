import React from "react";
import { render, screen } from "@testing-library/react";
import { MediaVideo } from "../MediaVideo";

describe("MediaVideo", () => {
  it("renders a video element when src is provided", () => {
    render(<MediaVideo src="https://example.com/video.mp4" alt="Product demo" />);
    const video = document.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video?.getAttribute("src")).toBe("https://example.com/video.mp4");
  });

  it("sets the poster from thumbnailUrl", () => {
    render(
      <MediaVideo
        src="https://example.com/video.mp4"
        thumbnailUrl="https://example.com/thumb.jpg"
        alt="Demo"
      />
    );
    const video = document.querySelector("video");
    expect(video?.getAttribute("poster")).toBe("https://example.com/thumb.jpg");
  });

  it("renders fallback with aria-label when src is undefined", () => {
    render(<MediaVideo src={undefined} alt="No video" />);
    expect(screen.getByRole("img", { name: "No video" })).toBeInTheDocument();
    expect(document.querySelector("video")).toBeNull();
  });

  it("renders fallback with default alt when alt not provided", () => {
    render(<MediaVideo src={undefined} />);
    expect(screen.getByRole("img", { name: "Video" })).toBeInTheDocument();
  });

  it("passes controls attribute by default", () => {
    render(<MediaVideo src="https://example.com/video.mp4" />);
    const video = document.querySelector("video");
    expect(video).toHaveAttribute("controls");
  });

  it("does not autoplay by default", () => {
    render(<MediaVideo src="https://example.com/video.mp4" />);
    const video = document.querySelector("video");
    expect(video).not.toHaveAttribute("autoplay");
  });
});
