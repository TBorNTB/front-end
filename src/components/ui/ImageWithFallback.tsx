'use client';

import { cn } from '@/lib/utils';
import Image, { ImageProps } from 'next/image';
import React, { useEffect, useState } from 'react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  showPlaceholder?: boolean;
}

// URL 유효성 검사 함수
const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url.trim() === '' || url === 'string' || url === 'null' || url === 'undefined') return false;
  
  // 상대 경로는 유효함 (/, /images/...)
  if (url.startsWith('/')) return true;
  
  // 절대 URL 검사
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = '/default-avatar.svg',
  alt,
  className,
  showPlaceholder = true,
  onError,
  ...props
}) => {
  // 유효한 URL인지 확인
  const validSrc = isValidUrl(src) ? src : null;
  const initialSrc = validSrc || fallbackSrc;
  // 로컬 파일은 로딩 상태 건너뛰기
  const isLocalFile = initialSrc.startsWith('/');

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [isLoading, setIsLoading] = useState(!isLocalFile);
  const [hasError, setHasError] = useState(!validSrc);

  // Reset states when src changes
  useEffect(() => {
    const newValidSrc = isValidUrl(src) ? src : null;
    const newSrc = newValidSrc || fallbackSrc;
    const newIsLocalFile = newSrc.startsWith('/');

    setImgSrc(newSrc);
    setIsLoading(!newIsLocalFile);
    setHasError(!newValidSrc);
  }, [src, fallbackSrc]);

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

  // If no valid src provided and showPlaceholder is false, don't render anything
  if (!validSrc && !showPlaceholder) {
    return null;
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
        unoptimized={imgSrc.endsWith('.svg')}
        {...props}
      />
    </div>
  );
};
