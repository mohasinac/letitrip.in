/**
 * @fileoverview TypeScript Module
 * @module src/lib/media/image-processor
 * @description This file contains functionality related to image-processor
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Image Processing Utilities
 * Handles image manipulation (crop, rotate, resize, filters)
 */

import type {
  EditorState,
  ImageProcessingOptions,
  CropArea,
} from "@/types/media";

/**
 * Resize image while maintaining aspect ratio
 */
/**
 * Performs resize image operation
 *
 * @param {File} file - The file
 * @param {ImageProcessingOptions} options - Configuration options
 *
 * @returns {Promise<any>} Promise resolving to resizeimage result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * resizeImage(file, options);
 */

/**
 * Performs resize image operation
 *
 * @returns {Promise<any>} Promise resolving to resizeimage result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * resizeImage();
 */

export async function resizeImage(
  /** File */
  file: File,
  /** Options */
  options: ImageProcessingOptions,
): Promise<Blob> {
  const {
    maxWidth,
    maxHeight,
    quality = 0.9,
    format = "jpeg",
    maintainAspectRatio = true,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate new dimensions
      if (maxWidth && width > maxWidth) {
        if (maintainAspectRatio) {
          height = (height * maxWidth) / width;
        }
        width = maxWidth;
      }

      if (maxHeight && height > maxHeight) {
        if (maintainAspectRatio) {
          width = (width * maxHeight) / height;
        }
        height = maxHeight;
      }

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        `image/${format}`,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

/**
 * Crop image
 */
/**
 * Performs crop image operation
 *
 * @returns {Promise<any>} Promise resolving to cropimage result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * cropImage();
 */

/**
 * Performs crop image operation
 *
 * @returns {Promise<any>} Promise resolving to cropimage result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * cropImage();
 */

export async function cropImage(
  /** File */
  file: File,
  /** Crop Area */
  cropArea: CropArea,
  /** Output Format */
  outputFormat: "jpeg" | "png" | "webp" = "jpeg",
  quality = 0.9,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Draw cropped portion
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        `image/${outputFormat}`,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

/**
 * Rotate image
 */
/**
 * Performs rotate image operation
 *
 * @returns {Promise<any>} Promise resolving to rotateimage result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * rotateImage();
 */

/**
 * Performs rotate image operation
 *
 * @returns {Promise<any>} Promise resolving to rotateimage result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * rotateImage();
 */

export async function rotateImage(
  /** File */
  file: File,
  /** Degrees */
  degrees: number,
  /** Output Format */
  outputFormat: "jpeg" | "png" | "webp" = "jpeg",
  quality = 0.9,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Swap dimensions for 90° and 270° rotations
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Rotate
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        `image/${outputFormat}`,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

/**
 * Flip image
 */
/**
 * Performs flip image operation
 *
 * @returns {Promise<any>} Promise resolving to flipimage result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * flipImage();
 */

/**
 * Performs flip image operation
 *
 * @returns {Promise<any>} Promise resolving to flipimage result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * flipImage();
 */

export async function flipImage(
  /** File */
  file: File,
  /** Horizontal */
  horizontal: boolean,
  /** Vertical */
  vertical: boolean,
  /** Output Format */
  outputFormat: "jpeg" | "png" | "webp" = "jpeg",
  quality = 0.9,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Apply flip transformations
      ctx.translate(
        horizontal ? canvas.width : 0,
        vertical ? canvas.height : 0,
      );
      ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        `image/${outputFormat}`,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

/**
 * Apply image filters and adjustments
 */
/**
 * Performs apply image edits operation
 *
 * @returns {Promise<any>} Promise resolving to applyimageedits result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * applyImageEdits();
 */

/**
 * Performs apply image edits operation
 *
 * @returns {Promise<any>} Promise resolving to applyimageedits result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * applyImageEdits();
 */

export async function applyImageEdits(
  /** File */
  file: File,
  /** Editor State */
  editorState: EditorState,
  /** Output Format */
  outputFormat: "jpeg" | "png" | "webp" = "jpeg",
  quality = 0.9,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Apply transformations
      ctx.save();

      // Flip
      if (editorState.flip.horizontal || editorState.flip.vertical) {
        ctx.translate(
          editorState.flip.horizontal ? canvas.width : 0,
          editorState.flip.vertical ? canvas.height : 0,
        );
        ctx.scale(
          editorState.flip.horizontal ? -1 : 1,
          editorState.flip.vertical ? -1 : 1,
        );
      }

      // Rotate
      if (editorState.rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((editorState.rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Draw image
      ctx.drawImage(img, 0, 0);

      ctx.restore();

      // Apply filters
      if (editorState.filter && editorState.filter !== "none") {
        applyFilter(ctx, canvas.width, canvas.height, editorState.filter);
      }

      // Apply brightness, contrast, saturation
      if (
        editorState.brightness !== 0 ||
        editorState.contrast !== 0 ||
        editorState.saturation !== 0
      ) {
        applyAdjustments(ctx, canvas.width, canvas.height, editorState);
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        `image/${outputFormat}`,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

/**
 * Apply CSS-like filters
 */
/**
 * Performs apply filter operation
 *
 * @returns {number} The applyfilter result
 */

/**
 * Performs apply filter operation
 *
 * @returns {number} The applyfilter result
 */

function applyFilter(
  /** Ctx */
  ctx: CanvasRenderingContext2D,
  /** Width */
  width: number,
  /** Height */
  height: number,
  /** Filter */
  filter: NonNullable<EditorState["filter"]>,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  switch (filter) {
    case "grayscale":
      for (let i = 0; i < data.length; i += 4) {
        /**
         * Performs avg operation
         *
         * @returns {any} The avg result
         */

        /**
         * Performs avg operation
         *
         * @returns {any} The avg result
         */

        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      break;

    case "sepia":
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
      break;

    case "vintage":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] + 30;
        data[i + 1] = data[i + 1] - 10;
        data[i + 2] = data[i + 2] - 20;
      }
      break;

    case "cold":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] - 20;
        data[i + 2] = data[i + 2] + 20;
      }
      break;

    case "warm":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] + 20;
        data[i + 1] = data[i + 1] + 10;
        data[i + 2] = data[i + 2] - 20;
      }
      break;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply brightness, contrast, saturation adjustments
 */
/**
 * Performs apply adjustments operation
 *
 * @returns {number} The applyadjustments result
 */

/**
 * Performs apply adjustments operation
 *
 * @returns {number} The applyadjustments result
 */

function applyAdjustments(
  /** Ctx */
  ctx: CanvasRenderingContext2D,
  /** Width */
  width: number,
  /** Height */
  height: number,
  /** Editor State */
  editorState: EditorState,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const brightness = editorState.brightness / 100;
  /**
   * Performs contrast operation
   *
   * @param {any} [editorState.contrast + 100) / 100;
  const saturation] - The editor state.contrast + 100) / 100;
  const saturation
   *
   * @returns {any} The contrast result
   */

  /**
   * Performs contrast operation
   *
   * @returns {any} The contrast result
   */

  const contrast = (editorState.contrast + 100) / 100;
  /**
   * Performs saturation operation
   *
   * @param {number} [editorState.saturation + 100) / 100;

  for (let i] - The editor state.saturation + 100) / 100;

  for (let i
   *
   * @returns {any} The saturation result
   */

  /**
   * Performs saturation operation
   *
   * @param {number} [editorState.saturation + 100) / 100;

  for (let i] - The editor state.saturation + 100) / 100;

  for (let i
   *
   * @returns {any} The saturation result
   */

  const saturation = (editorState.saturation + 100) / 100;

  for (let i = 0; i < data.length; i += 4) {
    // Brightness
    data[i] += 255 * brightness;
    data[i + 1] += 255 * brightness;
    data[i + 2] += 255 * brightness;

    // Contrast
    data[i] = (data[i] - 128) * contrast + 128;
    data[i + 1] = (data[i + 1] - 128) * contrast + 128;
    data[i + 2] = (data[i + 2] - 128) * contrast + 128;

    // Saturation
    const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = -gray * saturation + data[i] * (1 + saturation);
    data[i + 1] = -gray * saturation + data[i + 1] * (1 + saturation);
    data[i + 2] = -gray * saturation + data[i + 2] * (1 + saturation);

    // Clamp values
    data[i] = Math.max(0, Math.min(255, data[i]));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Convert blob to File
 */
/**
 * Performs blob to file operation
 *
 * @param {Blob} blob - The blob
 * @param {string} filename - The filename
 *
 * @returns {string} The blobtofile result
 *
 * @example
 * blobToFile(blob, "example");
 */

/**
 * Performs blob to file operation
 *
 * @param {Blob} blob - The blob
 * @param {string} filename - The filename
 *
 * @returns {string} The blobtofile result
 *
 * @example
 * blobToFile(blob, "example");
 */

export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}
