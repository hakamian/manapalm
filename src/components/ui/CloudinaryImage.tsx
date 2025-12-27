
import React, { useState, useEffect } from 'react';
import { CloudinaryService, ImageOptions } from '../../services/cloudinaryService';

interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement>, ImageOptions {
    src: string;
    alt: string;
    className?: string;
}

/**
 * Professional Cloudinary Image Component
 * Uses CloudinaryService for delivery and handles fallback to raw URLs.
 */
const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
    src,
    alt,
    width,
    height,
    quality,
    format,
    crop,
    gravity,
    version,
    className = '',
    ...props
}) => {
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
    const [displaySrc, setDisplaySrc] = useState<string>('');

    useEffect(() => {
        // Generate optimized URL on mount or prop change
        const optimized = CloudinaryService.getDeliveryUrl(src, {
            width, height, quality, format, crop, gravity, version
        });
        setDisplaySrc(optimized);
        setStatus('loading');
    }, [src, width, height, quality, format, crop, gravity, version]);

    const handleError = () => {
        // If the optimized URL failed, try the original raw URL
        if (displaySrc !== src) {
            console.warn(`[CloudinaryImage] Optimization failed for ${src}. Falling back to original.`);
            setDisplaySrc(src);
        } else {
            console.error(`[CloudinaryImage] Permanent failure for ${src}`);
            setStatus('error');
        }
    };

    const handleLoad = () => {
        setStatus('success');
    };

    return (
        <div className={`relative overflow-hidden bg-gray-800/50 ${className} ${status === 'loading' ? 'animate-pulse' : ''}`}>
            {status === 'error' ? (
                <div className="flex flex-col items-center justify-center p-4 h-full text-gray-500 bg-gray-900/40">
                    <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] text-center opacity-50">بارگذاری تصویر ناموفق بود</span>
                </div>
            ) : (
                <img
                    src={displaySrc}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'success' ? 'opacity-100' : 'opacity-0'}`}
                    {...props}
                />
            )}

            {/* Glossy overlay effect for professional feel */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-30"></div>
        </div>
    );
};

export default CloudinaryImage;
