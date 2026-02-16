'use client';

import { cn } from '@/lib/utils';
import Image, { ImageProps } from 'next/image';
import React, { useEffect, useState, useRef } from 'react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt?: string;
  fallbackSrc?: string;
  showPlaceholder?: boolean;
  type?: 'avatar' | 'article' | 'project' | 'news';
}

// URL 유효성 검사 함수 (더 엄격한 검증)
const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  
  // 빈 문자열이나 잘못된 값 체크
  if (trimmed === '' || 
      trimmed === 'string' || 
      trimmed === 'null' || 
      trimmed === 'undefined' ||
      trimmed.toLowerCase() === 'null' ||
      trimmed.toLowerCase() === 'undefined') {
    return false;
  }
  
  // 상대 경로는 유효함 (/, /images/...)
  if (trimmed.startsWith('/')) return true;
  
  // 절대 URL 검사
  try {
    const parsedUrl = new URL(trimmed);
    // http 또는 https 프로토콜만 허용
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  className,
  showPlaceholder = true,
  type = 'avatar',
  onError,
  ...props
}) => {
  // Smart default fallback based on type
  const getDefaultFallback = () => {
    if (fallbackSrc) return fallbackSrc;
    
    switch (type) {
      case 'article':
        return '/images/placeholder/article.png';
      case 'project':
        return '/images/placeholder/project.png';
      case 'news':
        return '/images/placeholder/news.png';
      case 'avatar':
      default:
        return '/images/placeholder/default-avatar.svg';
    }
  };
  
  const defaultFallback = getDefaultFallback();
  // 유효한 URL인지 확인
  const validSrc = isValidUrl(src) ? src : null;
  const initialSrc = validSrc || defaultFallback;
  // 로컬 파일은 로딩 상태 건너뛰기
  const isLocalFile = initialSrc.startsWith('/');

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  // 초기 로딩 상태: 유효한 src가 있고 로컬 파일이 아닐 때만 로딩 상태
  const [isLoading, setIsLoading] = useState(validSrc ? !isLocalFile : false);
  // 초기 에러 상태: 유효한 src가 없으면 에러 상태
  const [hasError, setHasError] = useState(!validSrc);
  
  // 이전 src 값을 추적하여 불필요한 업데이트 방지
  const prevSrcRef = useRef<string>(src);

  // Reset states when src changes (API 응답이 늦게 도착하는 경우 대비)
  useEffect(() => {
    // src가 실제로 변경되었을 때만 업데이트
    if (prevSrcRef.current === src) return;
    
    const newValidSrc = isValidUrl(src) ? src : null;
    const newSrc = newValidSrc || defaultFallback;
    const newIsLocalFile = newSrc.startsWith('/');

    // src prop이 변경될 때만 상태 업데이트 (무한 루프 방지)
    setImgSrc(newSrc);
    // 유효한 src가 없으면 즉시 로딩 완료 상태로 설정하여 깜빡임 방지
    setIsLoading(newValidSrc ? !newIsLocalFile : false);
    setHasError(!newValidSrc);
    
    // 이전 src 값 업데이트
    prevSrcRef.current = src;
  }, [src, defaultFallback]);
  
  // 이미지 로드 실패를 감지하기 위한 추가 useEffect (타임아웃 단축)
  useEffect(() => {
    if (!validSrc || hasError || imgSrc === defaultFallback) return;
    
    // 이미지가 로드되지 않는 경우를 대비한 타임아웃 (5초로 단축)
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn(`Image loading timeout: ${imgSrc}, falling back`);
        setImgSrc(defaultFallback);
        setHasError(true);
        setIsLoading(false);
      }
    }, 5000); // 5초 타임아웃
    
    return () => clearTimeout(timeout);
  }, [validSrc, hasError, isLoading, imgSrc, defaultFallback]);

  const handleError = React.useCallback((error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 에러 발생 시 즉시 fallback으로 전환 (404 포함)
    const target = error.currentTarget;
    const currentSrc = target?.src || imgSrc;
    
    // 현재 src가 fallback이 아니고, 유효한 URL이었던 경우에만 fallback으로 전환
    if (currentSrc && currentSrc !== defaultFallback && isValidUrl(src)) {
      // 무한 루프 방지: 이미 fallback으로 전환 중이면 무시
      if (!hasError) {
        setImgSrc(defaultFallback);
        setHasError(true);
        setIsLoading(false);
      }
    }
    onError?.(error);
  }, [imgSrc, defaultFallback, src, hasError, onError]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If no valid src provided and showPlaceholder is false, don't render anything
  // 하지만 avatar 타입의 경우 항상 fallback을 보여줌 (빈 화면 방지)
  if (!validSrc && !showPlaceholder && type !== 'avatar') {
    return null;
  }
  
  // avatar 타입이거나 유효한 src가 없으면 항상 fallback 이미지를 보여줌
  const finalSrc = validSrc || defaultFallback;

  // Ensure we have either fill or width/height
  const hasSize = props.fill || (props.width && props.height);
  const shouldUseFill = !hasSize ? true : props.fill;
  
  // Remove width/height if using fill
  const imageProps = { ...props };
  if (shouldUseFill) {
    delete imageProps.width;
    delete imageProps.height;
    delete imageProps.fill;
  }

  // 유효한 src가 없으면 로딩 상태를 false로 설정하여 깜빡임 방지
  const shouldShowLoading = isLoading && validSrc && !hasError;
  const displaySrc = imgSrc || defaultFallback;

  return (
    <div className="relative overflow-hidden w-full h-full">
      {shouldShowLoading && showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10">
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
        src={displaySrc}
        alt={alt || 'Image'}
        className={cn(
          'transition-opacity duration-200 object-cover',
          shouldShowLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized
        fill={shouldUseFill}
        {...imageProps}
        // 이미지가 로드되지 않을 경우를 대비한 추가 속성
        loading="lazy"
        // 404 에러를 확실히 감지하기 위한 추가 속성
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
