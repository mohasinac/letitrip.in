/**
 * Image Optimizer Utility
 * 
 * Handles image compression, format conversion, and thumbnail generation using sharp.
 * Optimizes images for web usage while maintaining acceptable quality.
 * 
 * Features:
 * - Automatic format detection and conversion
 * - WebP support for modern browsers
 * - Thumbnail generation
 * - Quality optimization
 * - File size reduction
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export interface ImageOptimizeOptions {
  /**
   * Output format (default: 'webp')
   */
  format?: 'webp' | 'jpeg' | 'png';

  /**
   * Quality (1-100, default: 80)
   */
  quality?: number;

  /**
   * Max width in pixels
   */
  maxWidth?: number;

  /**
   * Max height in pixels
   */
  maxHeight?: number;

  /**
   * Whether to maintain aspect ratio (default: true)
   */
  maintainAspectRatio?: boolean;

  /**
   * Output directory (default: same as input)
   */
  outputDir?: string;

  /**
   * Output filename (without extension)
   */
  outputName?: string;
}

export interface ThumbnailOptions {
  /**
   * Thumbnail width (default: 300)
   */
  width?: number;

  /**
   * Thumbnail height (default: auto)
   */
  height?: number;

  /**
   * Fit mode (default: 'cover')
   * - cover: Resize to cover dimensions, crop if needed
   * - contain: Resize to fit within dimensions
   * - fill: Resize to exact dimensions, distorting if needed
   */
  fit?: 'cover' | 'contain' | 'fill';

  /**
   * Position for crop (default: 'centre')
   */
  position?: 'top' | 'right' | 'bottom' | 'left' | 'centre';
}

/**
 * Image optimizer service
 */
export const imageOptimizer = {
  /**
   * Optimize an image file
   */
  async optimize(
    inputPath: string,
    options: ImageOptimizeOptions = {}
  ): Promise<{ path: string; size: number; width: number; height: number }> {
    try {
      const {
        format = 'webp',
        quality = 80,
        maxWidth,
        maxHeight,
        maintainAspectRatio = true,
        outputDir,
        outputName,
      } = options;

      // Read input file
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Resize if needed
      if (maxWidth || maxHeight) {
        image.resize({
          width: maxWidth,
          height: maxHeight,
          fit: maintainAspectRatio ? 'inside' : 'fill',
          withoutEnlargement: true,
        });
      }

      // Convert format and optimize
      switch (format) {
        case 'webp':
          image.webp({ quality, effort: 4 });
          break;
        case 'jpeg':
          image.jpeg({ quality, mozjpeg: true });
          break;
        case 'png':
          image.png({ quality, compressionLevel: 9 });
          break;
      }

      // Determine output path
      const inputDir = path.dirname(inputPath);
      const inputBasename = path.basename(inputPath, path.extname(inputPath));
      const outputDirectory = outputDir || inputDir;
      const filename = outputName || inputBasename;
      const outputPath = path.join(outputDirectory, `${filename}.${format}`);

      // Ensure output directory exists
      await fs.mkdir(outputDirectory, { recursive: true });

      // Save optimized image
      await image.toFile(outputPath);

      // Get output file stats
      const stats = await fs.stat(outputPath);
      const optimizedMetadata = await sharp(outputPath).metadata();

      return {
        path: outputPath,
        size: stats.size,
        width: optimizedMetadata.width || 0,
        height: optimizedMetadata.height || 0,
      };
    } catch (error) {
      console.error('[Image Optimizer] Optimization failed:', error);
      throw new Error(`Failed to optimize image: ${error}`);
    }
  },

  /**
   * Generate thumbnail from image
   */
  async generateThumbnail(
    inputPath: string,
    options: ThumbnailOptions = {}
  ): Promise<{ path: string; size: number; width: number; height: number }> {
    try {
      const {
        width = 300,
        height,
        fit = 'cover',
        position = 'centre',
      } = options;

      const image = sharp(inputPath);

      // Resize to thumbnail size
      image.resize({
        width,
        height,
        fit,
        position,
      });

      // Convert to WebP for smaller size
      image.webp({ quality: 80, effort: 4 });

      // Determine output path
      const inputDir = path.dirname(inputPath);
      const inputBasename = path.basename(inputPath, path.extname(inputPath));
      const outputPath = path.join(inputDir, `${inputBasename}-thumb.webp`);

      // Save thumbnail
      await image.toFile(outputPath);

      // Get output file stats
      const stats = await fs.stat(outputPath);
      const metadata = await sharp(outputPath).metadata();

      return {
        path: outputPath,
        size: stats.size,
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      console.error('[Image Optimizer] Thumbnail generation failed:', error);
      throw new Error(`Failed to generate thumbnail: ${error}`);
    }
  },

  /**
   * Batch optimize multiple images
   */
  async batchOptimize(
    inputPaths: string[],
    options: ImageOptimizeOptions = {}
  ): Promise<Array<{ path: string; size: number; width: number; height: number; error?: string }>> {
    const results = await Promise.allSettled(
      inputPaths.map((inputPath) => this.optimize(inputPath, options))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          path: inputPaths[index],
          size: 0,
          width: 0,
          height: 0,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
  },

  /**
   * Get image metadata without optimizing
   */
  async getMetadata(
    inputPath: string
  ): Promise<{
    format: string;
    width: number;
    height: number;
    size: number;
  }> {
    try {
      const metadata = await sharp(inputPath).metadata();
      const stats = await fs.stat(inputPath);

      return {
        format: metadata.format || 'unknown',
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: stats.size,
      };
    } catch (error) {
      console.error('[Image Optimizer] Failed to get metadata:', error);
      throw new Error(`Failed to get image metadata: ${error}`);
    }
  },

  /**
   * Calculate compression ratio
   */
  async getCompressionRatio(originalPath: string, optimizedPath: string): Promise<number> {
    try {
      const originalStats = await fs.stat(originalPath);
      const optimizedStats = await fs.stat(optimizedPath);

      const ratio = (1 - optimizedStats.size / originalStats.size) * 100;
      return Math.round(ratio * 100) / 100; // Round to 2 decimals
    } catch (error) {
      console.error('[Image Optimizer] Failed to calculate compression ratio:', error);
      return 0;
    }
  },

  /**
   * Optimize image from buffer (for API uploads)
   */
  async optimizeBuffer(
    buffer: Buffer,
    options: ImageOptimizeOptions = {}
  ): Promise<{ buffer: Buffer; width: number; height: number }> {
    try {
      const {
        format = 'webp',
        quality = 80,
        maxWidth,
        maxHeight,
        maintainAspectRatio = true,
      } = options;

      let image = sharp(buffer);

      // Resize if needed
      if (maxWidth || maxHeight) {
        image = image.resize({
          width: maxWidth,
          height: maxHeight,
          fit: maintainAspectRatio ? 'inside' : 'fill',
          withoutEnlargement: true,
        });
      }

      // Convert format and optimize
      switch (format) {
        case 'webp':
          image = image.webp({ quality, effort: 4 });
          break;
        case 'jpeg':
          image = image.jpeg({ quality, mozjpeg: true });
          break;
        case 'png':
          image = image.png({ quality, compressionLevel: 9 });
          break;
      }

      // Get buffer and metadata
      const optimizedBuffer = await image.toBuffer();
      const metadata = await sharp(optimizedBuffer).metadata();

      return {
        buffer: optimizedBuffer,
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      console.error('[Image Optimizer] Buffer optimization failed:', error);
      throw new Error(`Failed to optimize image buffer: ${error}`);
    }
  },
};

export default imageOptimizer;
