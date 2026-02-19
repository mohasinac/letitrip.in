import { getMediaTableColumns, type MediaOperation } from "@/components";

describe("getMediaTableColumns", () => {
  const mockOnDownload = jest.fn();
  const columns = getMediaTableColumns(mockOnDownload);

  describe("Column definitions", () => {
    it("returns correct number of columns", () => {
      expect(columns).toHaveLength(5);
    });

    it("includes type column", () => {
      const typeColumn = columns.find((c) => c.key === "type");
      expect(typeColumn).toBeDefined();
      expect(typeColumn?.header).toBe("Operation Type");
    });

    it("includes status column", () => {
      const statusColumn = columns.find((c) => c.key === "status");
      expect(statusColumn).toBeDefined();
      expect(statusColumn?.header).toBe("Status");
    });

    it("includes format column", () => {
      const formatColumn = columns.find((c) => c.key === "format");
      expect(formatColumn).toBeDefined();
      expect(formatColumn?.header).toBe("Format");
    });

    it("includes createdAt column", () => {
      const createdColumn = columns.find((c) => c.key === "createdAt");
      expect(createdColumn).toBeDefined();
      expect(createdColumn?.header).toBe("Created");
    });

    it("includes actions column", () => {
      const actionsColumn = columns.find((c) => c.key === "actions");
      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.header).toBe("Actions");
    });
  });

  describe("MediaOperation type", () => {
    it("has required properties", () => {
      const mockOp: MediaOperation = {
        id: "test-1",
        type: "crop",
        sourceUrl: "https://example.com/image.jpg",
        status: "completed",
        outputUrl: "https://signed-url.example.com/cropped.jpg",
        format: "jpeg",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(mockOp.id).toBeDefined();
      expect(mockOp.type).toBeDefined();
      expect(mockOp.sourceUrl).toBeDefined();
      expect(mockOp.status).toBeDefined();
    });

    it("supports optional properties", () => {
      const mockOp: MediaOperation = {
        id: "test-2",
        type: "trim",
        sourceUrl: "https://example.com/video.mp4",
        status: "failed",
        format: "mp4",
        createdAt: new Date(),
        updatedAt: new Date(),
        error: "Download failed",
      };

      expect(mockOp.error).toBe("Download failed");
      expect(mockOp.outputUrl).toBeUndefined();
    });
  });
});
