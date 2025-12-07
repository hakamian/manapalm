
import React, { useState } from 'react';
import { getOptimizedImageUrl, getCloudinarySrcSet } from '../../utils/imageOptimizer';
import { PhotoIcon } from '../icons';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number; // Desired width for optimization
  height?: number; // Desired height for optimization
  className?: string;
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1"
  objectFit?: 'cover' | 'contain' | 'fill';
  priority?: boolean; // If true, eager load. If false (default), lazy load.
}

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  aspectRatio,
  objectFit = 'cover',
  priority = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate optimized URL if it's Cloudinary, otherwise use raw src
  const optimizedSrc = getOptimizedImageUrl(src, { width, height });
  const srcSet = getCloudinarySrcSet(src);

  const style: React.CSSProperties = {
    objectFit,
    ...(aspectRatio ? { aspectRatio } : {}),
  };

  return (
    <div className={`relative overflow-hidden bg-stone-800 ${className}`} style={aspectRatio ? { aspectRatio } : undefined}>
      
      {/* Placeholder / Skeleton while loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-800 animate-pulse z-0">
          <PhotoIcon className="w-8 h-8 text-stone-600 opacity-50" />
        </div>
      )}

      {/* Fallback on Error */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-800 text-stone-500 z-10">
          <PhotoIcon className="w-10 h-10 mb-2" />
          <span className="text-xs">تصویر در دسترس نیست</span>
        </div>
      )}

      <img
        src={optimizedSrc}
        srcSet={srcSet}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoading(false)}
        onError={() => {
            setIsLoading(false);
            setHasError(true);
        }}
        className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={style}
        {...props}
      />
    </div>
  );
};

export default SmartImage;
