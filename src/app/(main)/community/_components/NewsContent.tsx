"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsCard } from './NewsCard';
import ContentFilterBar from '@/components/layout/TopSection';
import CategoryFilter from '@/components/layout/CategoryFilter';
// News API Response Types
interface NewsSearchParams {
  keyword?: string;
  category?: string;
  postSortType?: string;
  size?: number;
  page?: number;
}

interface NewsSearchResponse {
  content: NewsItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  error?: string;
}

interface NewsItem {
  id: number;
  content: {
    title: string;
    summary: string;
    content: string;
    category: string;
  };
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  writer: {
    username: string;
    nickname: string;
    realname: string;
    profileImageUrl?: string;
  };
  participants?: Array<{
    username: string;
    nickname: string;
    realname: string;
    profileImageUrl?: string;
  }>;
}

/**
 * Fetch news from Elasticsearch API via API route
 */
const fetchNews = async (params: NewsSearchParams): Promise<NewsSearchResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Keyword: only append if provided and not empty
    if (params.keyword && params.keyword.trim() && params.keyword.trim() !== ' ') {
      queryParams.append('keyword', params.keyword.trim());
    }
    
    // Category: only append if a specific category is selected
    if (params.category && params.category !== 'all') {
      queryParams.append('category', params.category);
    }
    
    // Sort type: default to LATEST
    queryParams.append('postSortType', params.postSortType || 'LATEST');
    
    // Size and page: always include
    queryParams.append('size', (params.size || PAGE_SIZE).toString());
    queryParams.append('page', (params.page !== undefined ? params.page : 0).toString());

    const url = `/api/news/search?${queryParams.toString()}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
      const message = (errorData as { message?: string; error?: string })?.message
        || (errorData as { error?: string })?.error
        || response.statusText
        || `API error: ${response.status}`;

      return {
        content: [],
        page: params.page || 0,
        size: params.size || PAGE_SIZE,
        totalElements: 0,
        totalPages: 0,
        error: message,
      };
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching news:', error);
    return {
      content: [],
      page: params.page || 0,
      size: params.size || PAGE_SIZE,
      totalElements: 0,
      totalPages: 0,
      error: message,
    };
  }
};

/**
 * Fetch search suggestions from Elasticsearch API via API route
 */
const fetchElasticSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `/api/news/suggestions?query=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) {
      console.error('News suggestion API error:', response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching news suggestions:', error);
    return [];
  }
};

// 페이지 크기 설정
const PAGE_SIZE = 6;

const sortOptions = ['최신순', '인기순', '조회순'];

// 정렬 옵션을 API 형식으로 변환
const convertSortToApiType = (sortBy: string): string => {
  switch (sortBy) {
    case '최신순':
      return 'LATEST';
    case '인기순':
      return 'POPULAR';
    case '조회순':
      return 'VIEWS';
    default:
      return 'LATEST';
  }
};

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
    id: 1,
    content: {
      title: '2025년 신입생 OT 개최 안내',
      summary: '세종대학교 정보보안 동아리 SSG의 2025년 신입생 오리엔테이션이 개최됩니다.',
      content: '세종대학교 정보보안 동아리 SSG의 2025년 신입생 오리엔테이션이 개최됩니다. 많은 참여 부탁드립니다.',
      category: NewsCategoryType.OT
    },
    thumbnailUrl: undefined,
    tags: ['OT', '신입생', '안내'],
    createdAt: new Date(2025, 0, 15).toISOString(),
    updatedAt: new Date(2025, 0, 15).toISOString(),
    likeCount: 45,
    viewCount: 234,
    writer: {
      username: '관리자',
      nickname: '관리자',
      realname: '관리자',
    },
  },
  {
    id: 2,
    content: {
      title: '웹 해킹 스터디 3기 모집',
      summary: '웹 해킹 기초부터 실전까지 함께 공부하는 스터디를 모집합니다.',
      content: '웹 해킹 기초부터 실전까지 함께 공부하는 스터디를 모집합니다. 매주 화요일 오후 7시에 진행됩니다.',
      category: NewsCategoryType.STUDY
    },
    thumbnailUrl: undefined,
    tags: ['스터디', '웹해킹', '모집'],
    createdAt: new Date(2025, 0, 12).toISOString(),
    updatedAt: new Date(2025, 0, 12).toISOString(),
    likeCount: 32,
    viewCount: 189,
    writer: {
      username: '김민수',
      nickname: '김민수',
      realname: '김민수',
    },
  },
  {
    id: 3,
    content: {
      title: '리버싱 세미나 개최',
      summary: 'IDA Pro를 활용한 리버싱 기초 세미나가 개최됩니다.',
      content: 'IDA Pro를 활용한 리버싱 기초 세미나가 개최됩니다. 실습 위주로 진행되니 노트북을 지참해주세요.',
      category: NewsCategoryType.SEMINAR
    },
    thumbnailUrl: undefined,
    tags: ['세미나', '리버싱', 'IDA Pro'],
    createdAt: new Date(2025, 0, 10).toISOString(),
    updatedAt: new Date(2025, 0, 10).toISOString(),
    likeCount: 28,
    viewCount: 156,
    writer: {
      username: '박지영',
      nickname: '박지영',
      realname: '박지영',
    },
  },
  {
    id: 4,
    content: {
      title: '2025년 MT 일정 안내',
      summary: '2025년도 MT(Membership Training) 일정을 안내드립니다.',
      content: '2025년도 MT(Membership Training) 일정을 안내드립니다. 많은 참여 부탁드립니다.',
      category: NewsCategoryType.MT
    },
    thumbnailUrl: undefined,
    tags: ['MT', '일정', '안내'],
    createdAt: new Date(2025, 0, 8).toISOString(),
    updatedAt: new Date(2025, 0, 8).toISOString(),
    likeCount: 67,
    viewCount: 312,
    writer: {
      username: '이준호',
      nickname: '이준호',
      realname: '이준호',
    },
  },
  {
    id: 5,
    content: {
      title: '연합 세미나: 사이버 보안 트렌드',
      summary: '다른 대학 동아리와 함께하는 연합 세미나가 개최됩니다.',
      content: '다른 대학 동아리와 함께하는 연합 세미나가 개최됩니다. 최신 사이버 보안 트렌드에 대해 논의합니다.',
      category: NewsCategoryType.UNITED_SEMINAR
    },
    thumbnailUrl: undefined,
    tags: ['연합세미나', '보안트렌드'],
    createdAt: new Date(2025, 0, 5).toISOString(),
    updatedAt: new Date(2025, 0, 5).toISOString(),
    likeCount: 41,
    viewCount: 278,
    writer: {
      username: '정우현',
      nickname: '정우현',
      realname: '정우현',
    },
  },
  {
    id: 6,
    content: {
      title: 'DEF CON Korea 컨퍼런스 참가',
      summary: 'SSG 동아리원들이 DEF CON Korea 컨퍼런스에 참가합니다.',
      content: 'SSG 동아리원들이 DEF CON Korea 컨퍼런스에 참가합니다. 많은 관심 부탁드립니다.',
      category: NewsCategoryType.CONFERENCE
    },
    thumbnailUrl: undefined,
    tags: ['컨퍼런스', 'DEF CON'],
    createdAt: new Date(2025, 0, 3).toISOString(),
    updatedAt: new Date(2025, 0, 3).toISOString(),
    likeCount: 53,
    viewCount: 345,
    writer: {
      username: '강예린',
      nickname: '강예린',
      realname: '강예린',
    },
  },
  {
    id: 7,
    content: {
      title: 'CTF 대회 준비 스터디',
      summary: 'CTF 대회 준비를 위한 스터디가 시작됩니다.',
      content: 'CTF 대회 준비를 위한 스터디가 시작됩니다. Pwn, Web, Crypto 등 다양한 분야를 다룹니다.',
      category: NewsCategoryType.CTF
    },
    thumbnailUrl: undefined,
    tags: ['CTF', '대회', '스터디'],
    createdAt: new Date(2025, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
    likeCount: 39,
    viewCount: 267,
    writer: {
      username: '최수진',
      nickname: '최수진',
      realname: '최수진',
    },
  },
  {
    id: 8,
    content: {
      title: '시스템 해킹 스터디 모집',
      summary: '시스템 해킹 심화 스터디를 모집합니다.',
      content: '시스템 해킹 심화 스터디를 모집합니다. Buffer Overflow, ROP 등 고급 기법을 다룹니다.',
      category: NewsCategoryType.STUDY
    },
    thumbnailUrl: undefined,
    tags: ['스터디', '시스템해킹'],
    createdAt: new Date(2024, 11, 28).toISOString(),
    updatedAt: new Date(2024, 11, 28).toISOString(),
    likeCount: 24,
    viewCount: 145,
    writer: {
      username: '김민수',
      nickname: '김민수',
      realname: '김민수',
    },
  }
];

type NewsContentProps = { createHref?: string };

export default function NewsContent({ createHref = '/community/news/create' }: NewsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 실제 검색에 사용되는 검색어
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('최신순');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // URL 파라미터에서 초기값 설정
  useEffect(() => {
    const queryParam = searchParams.get('query');
    const pageParam = searchParams.get('page');
    const categoryParam = searchParams.get('category');
    
    if (queryParam) {
      setSearchTerm(queryParam);
      setActiveSearchTerm(queryParam);
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

  // News 데이터 가져오기 (카테고리, 정렬, 페이지 변경 시 자동 실행, 검색어는 버튼 클릭 시에만)
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchNews({
          keyword: activeSearchTerm && activeSearchTerm.trim() ? activeSearchTerm.trim() : undefined,
          category: selectedCategory,
          postSortType: convertSortToApiType(sortBy),
          page: currentPage,
          size: PAGE_SIZE
        });
        
        if (response.error) {
          setError(response.error);
          setNews([]);
          setTotalPages(0);
          setTotalElements(0);
        } else {
          setNews(response.content || []);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        }
      } catch (err) {
        console.error('Error loading news:', err);
        setError(err instanceof Error ? err.message : '뉴스를 불러오는 중 오류가 발생했습니다.');
        setNews([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [currentPage, activeSearchTerm, selectedCategory, sortBy]);

  // 검색어 입력 시 제안 가져오기
  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchTerm && searchTerm.trim().length > 0) {
        const suggestionsData = await fetchElasticSearchSuggestions(searchTerm);
        setSuggestions(suggestionsData);
        setShowSuggestions(suggestionsData.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // 검색하기 버튼 클릭 핸들러
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setCurrentPage(0);
    updateURL({ query: searchTerm, page: 0 });
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setActiveSearchTerm(suggestion);
    setCurrentPage(0);
    updateURL({ query: suggestion, page: 0 });
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
    
    router.push(`/community?${newSearchParams.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setSelectedCategory('all');
    setCurrentPage(0);
    updateURL({ query: '', category: 'all', page: 0 });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(0);
    updateURL({ category, page: 0 });
  };

  // 프로필 이미지 URL 검증 함수
  const getValidProfileImageUrl = (url: string | null | undefined): string => {
    if (!url || typeof url !== 'string') return '/images/placeholder/default-avatar.svg';
    const trimmed = url.trim();
    if (trimmed === '' || trimmed === 'string' || trimmed === 'null' || trimmed === 'undefined') {
      return '/images/placeholder/default-avatar.svg';
    }
    if (trimmed.startsWith('/')) return trimmed;
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return '/images/placeholder/default-avatar.svg';
    }
  };

  // News 데이터 변환
  const transformedNews = news.map((item) => ({
    id: item.id.toString(),
    title: item.content.title,
    summary: item.content.summary || item.content.content?.substring(0, 150) || '',
    content: item.content.content,
    thumbnailUrl: item.thumbnailUrl,
    writerId: item.writer?.nickname || item.writer?.realname || item.writer?.username || '작성자',
    writer: item.writer ? {
      username: item.writer.username || '',
      nickname: item.writer.nickname || 'Unknown',
      realname: item.writer.realname || '',
      avatar: getValidProfileImageUrl(item.writer.profileImageUrl)
    } : {
      username: '',
      nickname: 'Unknown',
      realname: '',
      avatar: '/images/placeholder/default-avatar.svg'
    },
    participants: (item.participants || []).map((participant: any) => ({
      username: participant.username || '',
      nickname: participant.nickname || 'Unknown',
      realname: participant.realname || '',
      avatar: getValidProfileImageUrl(participant.profileImageUrl)
    })),
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
        {(activeSearchTerm || selectedCategory !== 'all') && (
          <div className="flex-wrap items-center justify-center gap-2">
            {activeSearchTerm && (
              <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg border border-primary-200">
                <span className="text-sm">검색어:</span>
                <span className="font-semibold">{activeSearchTerm}</span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveSearchTerm('');
                    setCurrentPage(0);
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
            {(activeSearchTerm || selectedCategory !== 'all') && (
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
        }}
        onSearchSubmit={handleSearch}
        isSearching={loading}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSuggestionSelect={handleSuggestionClick}
        onSuggestionsShow={setShowSuggestions}
        isLoadingSuggestions={false}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        sortOptions={sortOptions}
        onSortChange={(nextSort) => {
          setSortBy(nextSort);
          setCurrentPage(0);
          updateURL({ page: 0 });
        }}
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
          <CategoryFilter
            categories={newsCategories.filter(cat => cat.value !== 'all').map(category => ({
              id: String(category.value),
              name: category.name,
            }))}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            title="카테고리"
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              총 <span className="font-semibold text-primary">{totalElements}</span>개의 뉴스
              {activeSearchTerm && ` (검색어: "${activeSearchTerm}")`}
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
                handleSearch();
              }}
              className="text-primary hover:underline"
            >
              다시 시도
            </button>
          </div>
        ) : transformedNews.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-600 text-xl mb-4">검색 결과가 없습니다.</div>
            {activeSearchTerm && (
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
