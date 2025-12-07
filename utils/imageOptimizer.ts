
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
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
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

  // Set defaults
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;

  // Build transformation string
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformationString = transformations.join(',');

  // Inject transformation into URL
  // Matches: /image/upload/v12345/ or /image/upload/
  // We want to insert after /upload/
  const uploadRegex = /(\/image\/upload\/)(v[0-9]+\/)?/;
  
  if (url.match(uploadRegex)) {
    return url.replace(uploadRegex, `$1${transformationString}/$2`);
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
      const optimizedUrl = getOptimizedImageUrl(url, { width: w, crop: 'scale' });
      return `${optimizedUrl} ${w}w`;
    })
    .join(', ');
};
