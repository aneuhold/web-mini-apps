/**
 * Maximum dimensions for compressed images (roughly letter size at 150 DPI)
 */
const MAX_WIDTH = 1275; // 8.5 inches * 150 DPI
const MAX_HEIGHT = 1650; // 11 inches * 150 DPI

/**
 * JPEG quality for compression (0-1)
 */
const COMPRESSION_QUALITY = 0.85;

/**
 * Compresses an image file to a reasonable size for printing.
 * @param file - The image file to compress
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const widthRatio = MAX_WIDTH / width;
        const heightRatio = MAX_HEIGHT / height;
        const ratio = Math.min(widthRatio, heightRatio);

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create new file from blob
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          resolve(compressedFile);
        },
        'image/jpeg',
        COMPRESSION_QUALITY
      );

      // Clean up
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
}
