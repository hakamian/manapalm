
/**
 * Professional Cloudinary Service
 * Centralizes image delivery logic, optimization, and mapping.
 */

const CLOUD_NAME = 'dk2x11rvs';

export interface ImageOptions {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
    gravity?: string;
    version?: string | number;
}

export const CloudinaryService = {
    /**
     * Generates a clean Cloudinary URL with transformations.
     * Standardizes the handling of version numbers and folders.
     */
    getDeliveryUrl: (src: string, options: ImageOptions = {}) => {
        if (!src) return '';
        if (!src.includes('cloudinary.com')) return src;

        try {
            // 1. Parse the URL to get the public ID and current version
            // Path usually matches: .../upload/(v123/)?path/to/id(.ext)?
            const parts = src.split('/upload/');
            if (parts.length < 2) return src;

            const baseUrl = parts[0] + '/upload';
            let resourcePath = parts[1];

            // Remove leading version tag if present (v123/)
            if (resourcePath.startsWith('v')) {
                const firstSlash = resourcePath.indexOf('/');
                if (firstSlash !== -1) {
                    resourcePath = resourcePath.substring(firstSlash + 1);
                }
            }

            // 2. Build Transformations
            const {
                width,
                height,
                quality = 'auto',
                format = 'auto',
                crop = 'limit',
                gravity,
                version
            } = options;

            const transParts: string[] = [];
            if (width) transParts.push(`w_${width}`);
            if (height) transParts.push(`h_${height}`);
            if (crop) transParts.push(`c_${crop}`);
            if (gravity) transParts.push(`g_${gravity}`);
            if (quality) transParts.push(`q_${quality}`);
            if (format) transParts.push(`f_${format}`);

            const transStr = transParts.join(',');

            // 3. Reconstruct URL
            // We purposefully OMIT the version number here as it often causes 404s if stale
            // Cloudinary will serve the latest version automatically.
            const versionStr = version ? `v${version}/` : '';

            return `${baseUrl}/${transStr}/${versionStr}${resourcePath}`;
        } catch (e) {
            console.error('Error generating Cloudinary URL:', e);
            return src;
        }
    }
};
