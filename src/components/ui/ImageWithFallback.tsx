'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  showPlaceholder?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = '/images/placeholder.jpg', // Default fallback image
  alt,
  className,
  showPlaceholder = true,
  onError,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleError = (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
    onError?.(error);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If no src provided and showPlaceholder is false, don't render anything
  if (!src && !showPlaceholder) {
    return null;
  }

  // If both src and fallbackSrc fail, show a placeholder div
  if (hasError && imgSrc === fallbackSrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600',
          className
        )}
        // Fix: Replace 'any' with proper type
        style={props.style}
        {...(props.width && { style: { width: props.width } })}
        {...(props.height && { style: { height: props.height } })}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-primary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium">이미지를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="text-gray-400">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};
