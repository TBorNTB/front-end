"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ArrowRight, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { categoryService, CategoryItem } from '@/lib/api/services/category-services';

// Define Topic interface inline
interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  projectCount: number;
  articleCount: number;
}

const createSlugFromName = (name: string): string => {
  const koreanToSlugMap: Record<string, string> = {
    '웹 해킹': 'web-hacking',
    '리버싱': 'reversing',
    '시스템 해킹': 'system-hacking',
    '디지털 포렌식': 'digital-forensics',
    '네트워크 보안': 'network-security',
    'IoT보안': 'iot-security',
    '암호학': 'cryptography',
  };

  if (koreanToSlugMap[name]) {
    return koreanToSlugMap[name];
  }

  if (/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  return name.toLowerCase().replace(/\s+/g, '-');
};

// API 응답을 Topic 형식으로 변환
const transformApiResponseToTopics = (apiCategories: CategoryItem[]): Topic[] => {
  return apiCategories
    .map((category) => {
      const slug = createSlugFromName(category.name);

      return {
        id: `topic-${category.id}`,
        name: category.name, // API 응답의 name을 제목으로 사용
        slug: slug,
        description: category.description || '',
        type: category.name,
        projectCount: 0, // API에서 제공되지 않으면 기본값 0
        articleCount: 0, // API에서 제공되지 않으면 기본값 0
      };
    });
};

const normalizeTopics = (topics: any[]): Topic[] => {
  return topics.map((topic) => {
    const name = typeof topic?.name === 'string' ? topic.name : '';
    const slug = typeof topic?.slug === 'string' && topic.slug.trim() !== ''
      ? topic.slug
      : createSlugFromName(name);

    return {
      id: String(topic?.id ?? `topic-${slug || name}`),
      name,
      slug,
      description: typeof topic?.description === 'string' ? topic.description : '',
      type: typeof topic?.type === 'string' ? topic.type : name,
      projectCount: typeof topic?.projectCount === 'number' ? topic.projectCount : 0,
      articleCount: typeof topic?.articleCount === 'number' ? topic.articleCount : 0,
    };
  });
};

interface TopicsSectionProps {
  showHeader?: boolean;
  className?: string;
  topics?: any[]; // Accept both Topic and LandingTopic types (same structure)
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
  const [topicsData, setTopicsData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // API에서 카테고리 데이터 가져오기
  useEffect(() => {
    console.log('Topics component received:', externalTopics);
    
    // 외부에서 topics가 전달되면 사용
    if (externalTopics && Array.isArray(externalTopics) && externalTopics.length > 0) {
      console.log('Using external topics with length:', externalTopics.length);
      setTopicsData(normalizeTopics(externalTopics));
      setLoading(false);
      return;
    }

    // No external topics, use API
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        const transformedTopics = transformApiResponseToTopics(response.categories);
        setTopicsData(transformedTopics);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setTopicsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [externalTopics]);
  
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

  const handleTopicClick = (slug: string, topicName: string) => {
    const safeSlug = slug?.trim() ? slug : createSlugFromName(topicName);
    router.push(`/topics?category=${safeSlug}`);
  };

  const getCurrentItems = (): Topic[] => {
    const startIndex = currentIndex * itemsPerPage;
    return topicsData.slice(startIndex, startIndex + itemsPerPage);
  };

  // 로딩 상태
  if (loading) {
    return (
      <section id="topics" className={`section bg-background ${className}`}>
        <div className="container">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card bg-white animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="topics" className={`section bg-background ${className}`}>
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
              const IconComponent: LucideIcon = Shield;
              const colorClass = 'bg-primary';
              
              return (
                <div
                  key={topic.id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => handleTopicClick(topic.slug, topic.name)}
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
                      <h3 className="text-lg font-bold text-primary group-hover:text-primary-800 transition-colors flex-1 line-clamp-2">
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
