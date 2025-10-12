/**
 * @type {import('next-export-optimize-images').Config}
 */
const config = {
  // Output directory
  outDir: 'out',

  formats: ['avif', 'webp'],

  // Quality settings for different formats
  quality: {
    webp: 85,
    png: 90,
    jpeg: 90
  },

  // Only generate the exact sizes we need for web mini apps thumbnails
  sizes: [300, 600],

  // Cache directory for faster rebuilds
  cacheDir: '.next/cache/images',

  // Sharp optimization options
  sharpOptions: {
    // Optimize for size vs quality balance
    effort: 6,
    // Enable progressive JPEGs for better perceived loading
    progressive: true
  },

  // Enable lossy compression for better file sizes
  enableLossless: false,

  // Convert PNG to WebP only
  convertFormat: [
    ['png', 'webp'],
    ['jpg', 'webp'],
    ['jpeg', 'webp']
  ]
};

export default config;
