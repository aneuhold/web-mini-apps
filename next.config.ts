import { NextConfig } from 'next';
import withExportImages from 'next-export-optimize-images';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {},
  // Emit a fully static site to the `out/` directory on build.
  // See: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
  output: 'export',
  // With next-export-optimize-images, we can use optimized images with static exports
  images: {
    // Only the specific sizes we need for our web mini apps thumbnails
    imageSizes: [300, 600],
    // Override default deviceSizes to prevent huge images
    deviceSizes: [300, 600],
    // Enable modern formats for better performance
    formats: ['image/avif', 'image/webp']
  },
  // Helps on static hosts by ensuring directory-style URLs map to index.html
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, '../')
};

export default withExportImages(nextConfig);
