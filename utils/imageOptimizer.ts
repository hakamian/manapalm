
/**
 * Cloudinary Image Optimizer Utility
 * 
 * This utility helps transform raw Cloudinary URLs into optimized versions
 * based on the requested dimensions and quality settings.
 */

interface TransformationOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'limit' | 'pad';
  gravity?: 'auto' | 'face' | 'center';
}

/**
 * Generates an optimized Cloudinary URL.
 * If the URL is not a Cloudinary URL, it returns the original URL.
 * 
 * @param url The raw image URL
 * @param options Transformation options (width, height, etc.)
 */
export const getOptimizedImageUrl = (url: string, options: TransformationOptions = {}): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Handle Cloudinary Console URLs which are not meant for public delivery
  if (url.includes('res-console.cloudinary.com')) {
    // Try to convert to delivery URL if possible, otherwise return as is (and it will likely fail)
    // res-console.cloudinary.com/cloud_name/thumbnails/v1/image/upload/v12345/BASE64_PUBLIC_ID/preview
    const consoleRegex = /res-console\.cloudinary\.com\/([^/]+)\/thumbnails\/v1\/image\/upload\/(v[0-9]+\/)?([^/]+)\/preview/;
    const match = url.match(consoleRegex);
    if (match) {
      const cloudName = match[1];
      const version = match[2] || '';
      const base64PublicId = match[3];
      try {
        const publicId = atob(base64PublicId.replace(/-/g, '+').replace(/_/g, '/'));
        return `https://res.cloudinary.com/${cloudName}/image/upload/${version}${publicId}`;
      } catch (e) {
        // Fallback: can't easily fix it
        return url;
      }
    }

    // Alternative console URL pattern sometimes seen:
    // .../image/upload/v1234/folder/image.jpg (but on console domain)
    // In this case, we just swap the hostname if it looks like a standard path structure.
    const strictDeliveryPathRegex = /\/image\/upload\/v[0-9]+\/.+/;
    if (strictDeliveryPathRegex.test(url)) {
      return url.replace('res-console.cloudinary.com', 'res.cloudinary.com');
    }

    return url;
  }

  // Set defaults - RELAXED to prevent 400 errors
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop,    // Removed default 'fill'
    gravity  // Removed default 'auto'
  } = options;

  // Build transformation string
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  // Only add crop/gravity if explicitly requested or if we have dimensions + explicit intent
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);

  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformationString = transformations.join(',');

  // Inject transformation into URL
  // Matches: /image/upload/v12345/ or /image/upload/
  // We want to insert after /upload/
  // Handle already existing transformations
  if (url.includes('/image/upload/') && !url.includes('/image/upload/' + transformationString)) {
    const uploadPath = '/image/upload/';
    const parts = url.split(uploadPath);
    if (parts.length === 2) {
      // Ensure no double slash if parts[1] already starts with v123/
      return `${parts[0]}${uploadPath}${transformationString}/${parts[1]}`;
    }
  }

  return url;
};

/**
 * Generates a responsive 'srcset' string for Cloudinary images.
 * Useful for modern responsive images in HTML.
 */
export const getCloudinarySrcSet = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return '';

  const widths = [320, 480, 640, 768, 1024, 1280];
  return widths
    .map(w => {
      // Use 'limit' crop which is safer than scale/fill for srccset
      const optimizedUrl = getOptimizedImageUrl(url, { width: w, crop: 'limit' });
      return `${optimizedUrl} ${w}w`;
    })
    .join(', ');
};
