"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, List, Search, ChevronDown, X, ChevronLeft, ChevronRight, Heart, Eye, Calendar, User, Plus } from 'lucide-react';
import { NewsCard } from './NewsCard';
import ContentFilterBar from '@/components/layout/ContentFilterBar';
import Link from 'next/link';
import { BASE_URL } from '@/lib/api/config';

// News API Response Types
interface NewsSearchParams {
  query?: string;
  size?: number;
  page?: number;
}

interface NewsSearchResponse {
  content: NewsItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface NewsItem {
  id: string;
  content: {
    title: string;
    summary: string;
    content: string;
    category?: string;
  };
  thumbnailPath?: string;
  writerId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
}

// News 검색 API 호출 함수
const fetchNews = async (params: NewsSearchParams): Promise<NewsSearchResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.query && params.query.trim()) {
      queryParams.append('query', params.query.trim());
    } else {
      queryParams.append('query', ' ');
    }
    
    if (params.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }
    
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }

    const url = `${BASE_URL}/elastic-service/api/elastic/news/search?${queryParams.toString()}`;
    
    console.log('Fetching news from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If not JSON, use the status text
        }
      } catch (e) {
        console.error('Could not read error response:', e);
      }
      
      // Return mock data when API fails
      console.warn('Using mock data due to API error:', errorMessage);
      return {
        content: mockNewsData,
        page: params.page || 0,
        size: params.size || PAGE_SIZE,
        totalElements: mockNewsData.length,
        totalPages: Math.ceil(mockNewsData.length / (params.size || PAGE_SIZE))
      };
    }

    const data: NewsSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    console.warn('Using mock data due to network error');
    return {
      content: mockNewsData,
      page: params.page || 0,
      size: params.size || PAGE_SIZE,
      totalElements: mockNewsData.length,
      totalPages: Math.ceil(mockNewsData.length / (params.size || PAGE_SIZE))
    };
  }
};

// Elasticsearch 검색 제안 API 호출 함수
const fetchElasticSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/elastic-service/api/elastic/news/suggestion?query=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Elasticsearch API error:', response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching Elasticsearch suggestions:', error);
    return [];
  }
};

// 페이지 크기 설정
const PAGE_SIZE = 6;

const sortOptions = ['최신순', '인기순', '조회순'];

// News 카테고리 정의
export enum NewsCategoryType {
  MT = 'MT',
  OT = 'OT',
  STUDY = 'STUDY',
  SEMINAR = 'SEMINAR',
  UNITED_SEMINAR = 'UNITED_SEMINAR',
  CONFERENCE = 'CONFERENCE',
  CTF = 'CTF'
}

export const NewsCategoryDisplayNames: Record<NewsCategoryType, string> = {
  [NewsCategoryType.MT]: 'MT',
  [NewsCategoryType.OT]: 'OT',
  [NewsCategoryType.STUDY]: '스터디',
  [NewsCategoryType.SEMINAR]: '세미나',
  [NewsCategoryType.UNITED_SEMINAR]: '연합 세미나',
  [NewsCategoryType.CONFERENCE]: '컨퍼런스',
  [NewsCategoryType.CTF]: 'CTF'
};

const newsCategories = [
  { name: '전체', value: 'all' },
  { name: 'MT', value: NewsCategoryType.MT },
  { name: 'OT', value: NewsCategoryType.OT },
  { name: '스터디', value: NewsCategoryType.STUDY },
  { name: '세미나', value: NewsCategoryType.SEMINAR },
  { name: '연합 세미나', value: NewsCategoryType.UNITED_SEMINAR },
  { name: '컨퍼런스', value: NewsCategoryType.CONFERENCE },
  { name: 'CTF', value: NewsCategoryType.CTF },
];

// 목 데이터 (예시용)
const mockNewsData: NewsItem[] = [
  {
    id: '1',
    content: {
      title: '2025년 신입생 OT 개최 안내',
      summary: '세종대학교 정보보안 동아리 SSG의 2025년 신입생 오리엔테이션이 개최됩니다.',
      content: '세종대학교 정보보안 동아리 SSG의 2025년 신입생 오리엔테이션이 개최됩니다. 많은 참여 부탁드립니다.',
      category: NewsCategoryType.OT
    },
    thumbnailPath: undefined,
    writerId: '관리자',
    tags: ['OT', '신입생', '안내'],
    createdAt: new Date(2025, 0, 15).toISOString(),
    updatedAt: new Date(2025, 0, 15).toISOString(),
    likeCount: 45,
    viewCount: 234
  },
  {
    id: '2',
    content: {
      title: '웹 해킹 스터디 3기 모집',
      summary: '웹 해킹 기초부터 실전까지 함께 공부하는 스터디를 모집합니다.',
      content: '웹 해킹 기초부터 실전까지 함께 공부하는 스터디를 모집합니다. 매주 화요일 오후 7시에 진행됩니다.',
      category: NewsCategoryType.STUDY
    },
    thumbnailPath: undefined,
    writerId: '김민수',
    tags: ['스터디', '웹해킹', '모집'],
    createdAt: new Date(2025, 0, 12).toISOString(),
    updatedAt: new Date(2025, 0, 12).toISOString(),
    likeCount: 32,
    viewCount: 189
  },
  {
    id: '3',
    content: {
      title: '리버싱 세미나 개최',
      summary: 'IDA Pro를 활용한 리버싱 기초 세미나가 개최됩니다.',
      content: 'IDA Pro를 활용한 리버싱 기초 세미나가 개최됩니다. 실습 위주로 진행되니 노트북을 지참해주세요.',
      category: NewsCategoryType.SEMINAR
    },
    thumbnailPath: undefined,
    writerId: '박지영',
    tags: ['세미나', '리버싱', 'IDA Pro'],
    createdAt: new Date(2025, 0, 10).toISOString(),
    updatedAt: new Date(2025, 0, 10).toISOString(),
    likeCount: 28,
    viewCount: 156
  },
  {
    id: '4',
    content: {
      title: '2025년 MT 일정 안내',
      summary: '2025년도 MT(Membership Training) 일정을 안내드립니다.',
      content: '2025년도 MT(Membership Training) 일정을 안내드립니다. 많은 참여 부탁드립니다.',
      category: NewsCategoryType.MT
    },
    thumbnailPath: undefined,
    writerId: '이준호',
    tags: ['MT', '일정', '안내'],
    createdAt: new Date(2025, 0, 8).toISOString(),
    updatedAt: new Date(2025, 0, 8).toISOString(),
    likeCount: 67,
    viewCount: 312
  },
  {
    id: '5',
    content: {
      title: '연합 세미나: 사이버 보안 트렌드',
      summary: '다른 대학 동아리와 함께하는 연합 세미나가 개최됩니다.',
      content: '다른 대학 동아리와 함께하는 연합 세미나가 개최됩니다. 최신 사이버 보안 트렌드에 대해 논의합니다.',
      category: NewsCategoryType.UNITED_SEMINAR
    },
    thumbnailPath: undefined,
    writerId: '정우현',
    tags: ['연합세미나', '보안트렌드'],
    createdAt: new Date(2025, 0, 5).toISOString(),
    updatedAt: new Date(2025, 0, 5).toISOString(),
    likeCount: 41,
    viewCount: 278
  },
  {
    id: '6',
    content: {
      title: 'DEF CON Korea 컨퍼런스 참가',
      summary: 'SSG 동아리원들이 DEF CON Korea 컨퍼런스에 참가합니다.',
      content: 'SSG 동아리원들이 DEF CON Korea 컨퍼런스에 참가합니다. 많은 관심 부탁드립니다.',
      category: NewsCategoryType.CONFERENCE
    },
    thumbnailPath: undefined,
    writerId: '강예린',
    tags: ['컨퍼런스', 'DEF CON'],
    createdAt: new Date(2025, 0, 3).toISOString(),
    updatedAt: new Date(2025, 0, 3).toISOString(),
    likeCount: 53,
    viewCount: 345
  },
  {
    id: '7',
    content: {
      title: 'CTF 대회 준비 스터디',
      summary: 'CTF 대회 준비를 위한 스터디가 시작됩니다.',
      content: 'CTF 대회 준비를 위한 스터디가 시작됩니다. Pwn, Web, Crypto 등 다양한 분야를 다룹니다.',
      category: NewsCategoryType.CTF
    },
    thumbnailPath: undefined,
    writerId: '최수진',
    tags: ['CTF', '대회', '스터디'],
    createdAt: new Date(2025, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
    likeCount: 39,
    viewCount: 267
  },
  {
    id: '8',
    content: {
      title: '시스템 해킹 스터디 모집',
      summary: '시스템 해킹 심화 스터디를 모집합니다.',
      content: '시스템 해킹 심화 스터디를 모집합니다. Buffer Overflow, ROP 등 고급 기법을 다룹니다.',
      category: NewsCategoryType.STUDY
    },
    thumbnailPath: undefined,
    writerId: '김민수',
    tags: ['스터디', '시스템해킹'],
    createdAt: new Date(2024, 11, 28).toISOString(),
    updatedAt: new Date(2024, 11, 28).toISOString(),
    likeCount: 24,
    viewCount: 145
  }
];

type NewsContentProps = { createHref?: string };

export default function NewsContent({ createHref = '/news/new' }: NewsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('최신순');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // URL 파라미터에서 초기값 설정
  useEffect(() => {
    const queryParam = searchParams.get('query');
    const pageParam = searchParams.get('page');
    const categoryParam = searchParams.get('category');
    
    if (queryParam) {
      setSearchTerm(queryParam);
    }
    
    if (categoryParam) {
      const validCategory = newsCategories.find(c => c.value === categoryParam);
      if (validCategory) {
        setSelectedCategory(categoryParam);
      }
    }
    
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page >= 0) {
        setCurrentPage(page);
      }
    }
  }, [searchParams]);

  // News 데이터 가져오기
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchNews({
          query: searchTerm || undefined,
          page: currentPage,
          size: PAGE_SIZE
        });
        
        // API 응답이 비어있거나 에러가 있으면 목 데이터 사용
        if (!response.content || response.content.length === 0) {
          setUseMockData(true);
          // 목 데이터 필터링
          let filteredMock = mockNewsData;
          
          if (selectedCategory !== 'all') {
            filteredMock = filteredMock.filter(item => item.content.category === selectedCategory);
          }
          
          if (searchTerm) {
            filteredMock = filteredMock.filter(item => 
              item.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.content.summary.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          // 페이지네이션 적용
          const startIndex = currentPage * PAGE_SIZE;
          const endIndex = startIndex + PAGE_SIZE;
          const paginatedMock = filteredMock.slice(startIndex, endIndex);
          
          setNews(paginatedMock);
          setTotalPages(Math.ceil(filteredMock.length / PAGE_SIZE));
          setTotalElements(filteredMock.length);
        } else {
          setUseMockData(false);
          setNews(response.content || []);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        }
      } catch (err) {
        console.error('Error loading news:', err);
        // 에러 발생 시 목 데이터 사용
        setUseMockData(true);
        let filteredMock = mockNewsData;
        
        if (selectedCategory !== 'all') {
          filteredMock = filteredMock.filter(item => item.content.category === selectedCategory);
        }
        
        if (searchTerm) {
          filteredMock = filteredMock.filter(item => 
            item.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.content.summary.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        const startIndex = currentPage * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedMock = filteredMock.slice(startIndex, endIndex);
        
        setNews(paginatedMock);
        setTotalPages(Math.ceil(filteredMock.length / PAGE_SIZE));
        setTotalElements(filteredMock.length);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [currentPage, searchTerm, selectedCategory]);

  // 검색어 입력 시 제안 가져오기
  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchTerm && searchTerm.trim().length > 0) {
        const suggestionsData = await fetchElasticSearchSuggestions(searchTerm);
        setSuggestions(suggestionsData);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // 외부 클릭 시 제안 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 정렬 옵션 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSortDropdown) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSortDropdown]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
    updateURL({ query: value, page: 0 });
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
    setShowSuggestions(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      updateURL({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateURL = (params: { query?: string; page?: number; category?: string }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    if (params.query !== undefined) {
      if (params.query) {
        newSearchParams.set('query', params.query);
      } else {
        newSearchParams.delete('query');
      }
    }
    
    if (params.category !== undefined) {
      if (params.category && params.category !== 'all') {
        newSearchParams.set('category', params.category);
      } else {
        newSearchParams.delete('category');
      }
    }
    
    if (params.page !== undefined) {
      if (params.page > 0) {
        newSearchParams.set('page', params.page.toString());
      } else {
        newSearchParams.delete('page');
      }
    }
    
    router.push(`/news?${newSearchParams.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setCurrentPage(0);
    updateURL({ query: '', category: 'all', page: 0 });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(0);
    updateURL({ category, page: 0 });
  };

  // News 데이터 변환
  const transformedNews = news.map((item) => ({
    id: item.id,
    title: item.content.title,
    summary: item.content.summary || item.content.content?.substring(0, 150) || '',
    content: item.content.content,
    thumbnailPath: item.thumbnailPath,
    writerId: item.writerId || '작성자',
    tags: item.tags || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    likeCount: item.likeCount || 0,
    viewCount: item.viewCount || 0,
    category: item.content.category
  }));

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="text-center mb-0">
        {(searchTerm || selectedCategory !== 'all') && (
          <div className="flex-wrap items-center justify-center gap-2">
            {searchTerm && (
              <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg border border-primary-200">
                <span className="text-sm">검색어:</span>
                <span className="font-semibold">{searchTerm}</span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    updateURL({ query: '', page: 0 });
                  }}
                  className="ml-2 hover:text-primary-900"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {selectedCategory !== 'all' && (
              <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg border border-primary-200">
                <span className="text-sm">카테고리:</span>
                <span className="font-semibold">{newsCategories.find(c => c.value === selectedCategory)?.name}</span>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentPage(0);
                    updateURL({ page: 0 });
                  }}
                  className="ml-2 hover:text-primary-900"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
              >
                전체 필터 초기화
              </button>
            )}
          </div>
        )}
      </div>

      {/* Top Controls - aligned with Articles styling */}
      <ContentFilterBar
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(0);
          updateURL({ query: value, page: 0 });
        }}
        isSearching={loading}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSuggestionSelect={handleSuggestionClick}
        onSuggestionsShow={setShowSuggestions}
        isLoadingSuggestions={false}
        viewMode={viewMode as 'grid' | 'list'}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        sortOptions={sortOptions}
        onSortChange={setSortBy}
        showViewMode={true}
        showSort={true}
        showCreateButton={true}
        createButtonText="새 글 쓰기"
        createButtonHref={createHref}
        placeholderText="뉴스 검색..."
      />

      {/* Main Content with Sidebar */}
      <div className="flex gap-8">
        {/* Sidebar Filter - aligned with Articles styling */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">카테고리</h3>
            <div className="space-y-1">
              {newsCategories.map((category) => {
                const isActive = selectedCategory === category.value;
                // 목 데이터에서 카운트 계산
                const categoryCount = category.value === 'all'
                  ? mockNewsData.length
                  : mockNewsData.filter(n => n.content.category === category.value).length;

                return (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryChange(category.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className={`${isActive ? 'text-primary-50' : 'text-gray-400'} text-xs`}>
                      {categoryCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              총 <span className="font-semibold text-primary">{totalElements}</span>개의 뉴스
              {searchTerm && ` (검색어: "${searchTerm}")`}
              {selectedCategory !== 'all' && ` (카테고리: ${newsCategories.find(c => c.value === selectedCategory)?.name})`}
            </p>
          </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-gray-600">뉴스를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                handleSearch(searchTerm);
              }}
              className="text-primary hover:underline"
            >
              다시 시도
            </button>
          </div>
        ) : transformedNews.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-600 text-xl mb-4">검색 결과가 없습니다.</div>
            {searchTerm && (
              <button 
                onClick={clearFilters}
                className="text-primary hover:underline"
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <>
            {/* News Grid/List */}
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
            }>
              {transformedNews.map((item) => (
                <NewsCard key={item.id} news={item} variant={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded flex items-center justify-center text-sm ${
                        currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
