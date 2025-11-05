"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Topic, CategoryType, CategoryHelpers } from '@/app/(main)/topics/types/category';
import { CategoryIcons, CategoryColors } from '@/app/(main)/topics/types/icon';

// Convert your category data to Topic format
const getTopicsData = (): Topic[] => {
  const baseTopics: Array<{
    type: CategoryType;
    projectCount: number;
    articleCount: number;
  }> = [
    { type: CategoryType.WEB_HACKING, projectCount: 24, articleCount: 18 },
    { type: CategoryType.SYSTEM_HACKING, projectCount: 31, articleCount: 22 },
    { type: CategoryType.CRYPTOGRAPHY, projectCount: 19, articleCount: 15 },
    { type: CategoryType.DIGITAL_FORENSICS, projectCount: 16, articleCount: 12 },
    { type: CategoryType.NETWORK_SECURITY, projectCount: 28, articleCount: 20 },
    { type: CategoryType.IOT_SECURITY, projectCount: 21, articleCount: 17 },
    { type: CategoryType.REVERSING, projectCount: 18, articleCount: 14 }
  ];

  return baseTopics.map((topic, index) => ({
    id: `topic-${index + 1}`,
    name: CategoryHelpers.getDisplayName(topic.type), // Korean name
    slug: CategoryHelpers.getSlug(topic.type),
    description: getCategoryDescription(topic.type),
    type: topic.type,
    projectCount: topic.projectCount,
    articleCount: topic.articleCount
  }));
};

// Korean descriptions for each category
const getCategoryDescription = (type: CategoryType): string => {
  const descriptions: Record<CategoryType, string> = {
    [CategoryType.WEB_HACKING]: 'SQL Injection, XSS, CSRF 등 웹 애플리케이션 보안 취약점 분석 및 대응',
    [CategoryType.REVERSING]: '바이너리 분석, 역공학 기술을 통한 소프트웨어 구조 분석 및 이해',
    [CategoryType.SYSTEM_HACKING]: 'Buffer Overflow, ROP 등 시스템 레벨 취약점 분석 및 익스플로잇 개발',
    [CategoryType.DIGITAL_FORENSICS]: '디지털 증거 수집 및 분석, 사고 대응을 위한 포렌식 기법',
    [CategoryType.NETWORK_SECURITY]: '네트워크 트래픽 분석, 침입 탐지 및 방화벽 보안 기술',
    [CategoryType.IOT_SECURITY]: '스마트 기기의 보안 취약점을 분석 및 대응',
    [CategoryType.CRYPTOGRAPHY]: '현대 암호학 이론, 암호 시스템 분석 및 보안 프로토콜 구현'
  };
  
  return descriptions[type];
};

interface TopicsSectionProps {
  showHeader?: boolean;
  className?: string;
  topics?: Topic[]; // Optional prop for external data
}

export default function TopicsSection({ 
  showHeader = true,
  className = "",
  topics: externalTopics
}: TopicsSectionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use external topics or fallback to static data
  const topicsData = externalTopics || getTopicsData();
  
  const itemsPerPage = 8; // 4x2 grid (4 columns, 2 rows)
  const totalPages = Math.ceil(topicsData.length / itemsPerPage);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && totalPages > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
      }, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, totalPages]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const handleTopicClick = (slug: string) => {
    router.push(`/topics?category=${slug}`);
  };

  const getCurrentItems = (): Topic[] => {
    const startIndex = currentIndex * itemsPerPage;
    return topicsData.slice(startIndex, startIndex + itemsPerPage);
  };

  return (
    <section className={`section bg-background ${className}`}>
      <div className="container">
        {/* Header Section */}
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              보안 학습 주제
            </h2>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              사이버 보안 전문 지식을 체계적으로 학습할 수 있는 주제들을 탐색하세요
            </p>
          </div>
        )}

        {/* Carousel Container */}
        <div className="relative">
          {/* Topics Grid - Updated to 4 columns */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {getCurrentItems().map((topic) => {
              const IconComponent = CategoryIcons[topic.type];
              const colorClass = CategoryColors[topic.type];
              
              return (
                <div
                  key={topic.id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => handleTopicClick(topic.slug)}
                >
                  {/* Card Container */}
                  <div className="card bg-white hover:shadow-xl hover:shadow-primary-500/20 border border-primary-100 hover:border-primary-300 transition-all duration-300 h-full">
                    
                    {/* Icon and Title Section */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`
                        w-12 h-12 rounded-xl ${colorClass} 
                        flex items-center justify-center
                        group-hover:scale-110 transition-transform duration-300
                        shadow-lg group-hover:shadow-xl flex-shrink-0
                      `}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-primary-800 group-hover:text-primary-600 transition-colors flex-1 line-clamp-2">
                        {topic.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-800 text-sm leading-relaxed mb-4 line-clamp-2">
                      {topic.description}
                    </p>

                    {/* Stats Section */}
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                        <span className="text-xs text-gray-800">
                          {topic.projectCount}개 프로젝트
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-secondary-500"></div>
                        <span className="text-xs text-gray-800">
                          {topic.articleCount}개 아티클
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-center pt-3 border-t border-primary-100 mt-auto">
                      <div className="flex items-center space-x-2 text-primary-600 group-hover:text-primary-700 transition-colors">
                        <span className="text-sm font-medium">학습보기</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows - Only show if more than one page */}
          {totalPages > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8
                         w-12 h-12 rounded-full bg-white border-2 border-primary-200 shadow-lg
                         hover:bg-primary-50 hover:border-primary-300 hover:shadow-xl
                         flex items-center justify-center text-primary-600 hover:text-primary-700
                         transition-all duration-200"
                aria-label="이전 주제들"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8
                         w-12 h-12 rounded-full bg-white border-2 border-primary-200 shadow-lg
                         hover:bg-primary-50 hover:border-primary-300 hover:shadow-xl
                         flex items-center justify-center text-primary-600 hover:text-primary-700
                         transition-all duration-200"
                aria-label="다음 주제들"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 space-x-3">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-primary-600 scale-125 shadow-md' 
                    : 'bg-primary-200 hover:bg-primary-400 hover:scale-110'
                }`}
                aria-label={`${index + 1}페이지로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
