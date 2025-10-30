/**
 * Image Processing Utilities
 * Handles SVG/PNG background removal, resizing, and cropping
 */

/**
 * Remove background from an image using canvas manipulation
 * Works best with solid color backgrounds
 */
export async function removeBackground(
  file: File,
  tolerance: number = 10
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Sample corner pixels to determine background color
        const cornerSamples = [
          { x: 0, y: 0 },
          { x: canvas.width - 1, y: 0 },
          { x: 0, y: canvas.height - 1 },
          { x: canvas.width - 1, y: canvas.height - 1 },
        ];
        
        // Get average background color from corners
        let bgR = 0, bgG = 0, bgB = 0;
        cornerSamples.forEach(({ x, y }) => {
          const i = (y * canvas.width + x) * 4;
          bgR += pixels[i];
          bgG += pixels[i + 1];
          bgB += pixels[i + 2];
        });
        bgR = Math.floor(bgR / cornerSamples.length);
        bgG = Math.floor(bgG / cornerSamples.length);
        bgB = Math.floor(bgB / cornerSamples.length);
        
        // Remove background by making similar pixels transparent
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Calculate color distance
          const distance = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );
          
          // If color is similar to background, make it transparent
          if (distance < tolerance) {
            pixels[i + 3] = 0; // Set alpha to 0
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize image to fit within target dimensions while maintaining aspect ratio
 * Similar to LinkedIn/Facebook profile picture cropping
 */
export async function resizeImage(
  file: File | Blob,
  targetSize: number = 300,
  fitMode: 'contain' | 'cover' = 'contain'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, targetSize, targetSize);
        
        let sourceX = 0, sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        let destX = 0, destY = 0;
        let destWidth = targetSize;
        let destHeight = targetSize;
        
        if (fitMode === 'contain') {
          // Fit image inside target size, maintaining aspect ratio
          const scale = Math.min(targetSize / img.width, targetSize / img.height);
          destWidth = img.width * scale;
          destHeight = img.height * scale;
          destX = (targetSize - destWidth) / 2;
          destY = (targetSize - destHeight) / 2;
        } else {
          // Cover entire target size, cropping if necessary
          const scale = Math.max(targetSize / img.width, targetSize / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          
          sourceWidth = targetSize / scale;
          sourceHeight = targetSize / scale;
          sourceX = (img.width - sourceWidth) / 2;
          sourceY = (img.height - sourceHeight) / 2;
        }
        
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          destX, destY, destWidth, destHeight
        );
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Process SVG file - optimize and resize
 */
export async function processSVG(
  file: File,
  targetSize: number = 300
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const svgText = e.target?.result as string;
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');
        
        if (!svgElement) {
          reject(new Error('Invalid SVG file'));
          return;
        }
        
        // Set viewBox and dimensions
        const viewBox = svgElement.getAttribute('viewBox') || `0 0 ${targetSize} ${targetSize}`;
        svgElement.setAttribute('viewBox', viewBox);
        svgElement.setAttribute('width', targetSize.toString());
        svgElement.setAttribute('height', targetSize.toString());
        
        // Remove background elements (common patterns)
        const backgroundSelectors = [
          'rect[fill="white"]',
          'rect[fill="#ffffff"]',
          'rect[fill="#fff"]',
          'rect[opacity="0"]',
          'path[fill="white"]',
          'path[fill="#ffffff"]',
        ];
        
        backgroundSelectors.forEach(selector => {
          const elements = svgElement.querySelectorAll(selector);
          elements.forEach(el => {
            const parent = el.parentNode;
            if (parent && el.getBoundingClientRect) {
              const rect = el.getBoundingClientRect();
              // Remove if it's likely a background (large, at origin)
              if (rect.width > targetSize * 0.8 && rect.height > targetSize * 0.8) {
                parent.removeChild(el);
              }
            }
          });
        });
        
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Create circular crop preview (like profile pictures)
 */
export function createCircularPreview(
  imageUrl: string,
  canvasElement: HTMLCanvasElement,
  size: number = 300
): void {
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;
  
  const img = new Image();
  img.onload = () => {
    canvasElement.width = size;
    canvasElement.height = size;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // Draw image
    const scale = Math.max(size / img.width, size / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (size - scaledWidth) / 2;
    const y = (size - scaledHeight) / 2;
    
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    ctx.restore();
    
    // Draw border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  };
  
  img.src = imageUrl;
}

/**
 * Convert any image format to PNG with transparency
 */
export async function convertToPNG(file: File): Promise<Blob> {
  if (file.type === 'image/svg+xml') {
    return processSVG(file);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a PNG, JPG, SVG, or WebP image' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true };
}
