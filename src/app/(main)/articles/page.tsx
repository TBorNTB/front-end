// app/(main)/articles/page.tsx
'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Search,
  Plus,
  Grid,
  List,
  ChevronDown,
} from 'lucide-react';
import ArticleCard from './_components/ArticleCard';
import { getCSKnowledgeSuggestion, searchCSKnowledge, type CSKnowledgeSearchResponse } from '@/lib/api/services/elastic';
import { categoryService, type CategoryItem } from '@/lib/api/services/category';
import { CategoryType, CategoryDisplayNames, CategorySlugs } from '@/app/(main)/topics/types/category';

const ARTICLES_PER_PAGE = 6;

interface Category {
  name: string;
  slug: string;
  apiCategory?: string; // API에 전달할 카테고리 형식 (예: 'WEB-HACKING')
}

// 카테고리 이름으로 CategoryType 찾기
const getCategoryTypeByName = (name: string): CategoryType | null => {
  const entry = Object.entries(CategoryDisplayNames).find(([_, displayName]) => displayName === name);
  return entry ? (entry[0] as CategoryType) : null;
};

// CategoryType을 API 형식으로 변환 (WEB_HACKING -> WEB-HACKING)
const convertCategoryTypeToApiFormat = (categoryType: CategoryType): string => {
  return categoryType.replace(/_/g, '-');
};

// 카테고리 이름에서 slug 생성
const createSlugFromName = (name: string, id: number): string => {
  // CategoryType 매핑이 있으면 해당 slug 사용
  const type = getCategoryTypeByName(name);
  if (type && CategorySlugs[type]) {
    return CategorySlugs[type];
  }
  
  // 영문/숫자만 있는 경우: 공백을 하이픈으로, 소문자 변환
  if (/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  // 한글이나 특수문자가 포함된 경우: ID 기반 slug 사용
  return `category-${id}`;
};

// 카테고리 slug를 API 형식으로 변환
const convertSlugToApiCategory = (slug: string, categories: Category[]): string | undefined => {
  if (slug === 'all') return undefined;
  
  // categories 배열에서 해당 slug의 apiCategory 찾기
  const category = categories.find(cat => cat.slug === slug);
  if (category) {
    // apiCategory가 있으면 사용, 없으면 카테고리 이름을 그대로 사용
    if (category.apiCategory) {
      return category.apiCategory;
    }
    // fallback: 카테고리 이름을 그대로 사용
    return category.name;
  }
  
  // 최종 fallback: slug를 그대로 사용
  return slug;
};

function ArticlesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([{ name: '전체', slug: 'all' }]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 실제 검색에 사용되는 검색어
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('최신순');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<CSKnowledgeSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  const currentUser: 'guest' | 'member' | 'admin' | null = 'member';
  const sortOptions = ['최신순', '인기순', '조회순'];

  // 카테고리 목록 API 호출
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getCategories();
        
        // API 응답을 Category 형식으로 변환
        const transformedCategories: Category[] = [
          { name: '전체', slug: 'all' }, // 전체 카테고리 추가
          ...response.categories.map((apiCategory: CategoryItem) => {
            const type = getCategoryTypeByName(apiCategory.name);
            const slug = type ? CategorySlugs[type] : createSlugFromName(apiCategory.name, apiCategory.id);
            // CategoryType이 있으면 변환된 형식 사용, 없으면 카테고리 이름을 그대로 사용
            const apiCategoryFormat = type 
              ? convertCategoryTypeToApiFormat(type) 
              : apiCategory.name;
            
            return {
              name: apiCategory.name,
              slug: slug,
              apiCategory: apiCategoryFormat,
            };
          }),
        ];
        
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // 에러 발생 시 기본 카테고리만 사용
        setCategories([{ name: '전체', slug: 'all' }]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 정렬 옵션을 API 형식으로 변환
  const convertSortToApiType = (sortBy: string): 'LATEST' | 'POPULAR' | 'VIEWS' => {
    switch (sortBy) {
      case '인기순':
        return 'POPULAR';
      case '조회순':
        return 'VIEWS';
      case '최신순':
      default:
        return 'LATEST';
    }
  };

  // URL 쿼리(topic, page) → state 초기화
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const pageParam = searchParams.get('page');

    if (topicParam) {
      setSelectedCategory(topicParam);
    }

    if (pageParam && !Number.isNaN(Number(pageParam))) {
      setPage(Math.max(1, Number(pageParam)));
    } else {
      setPage(1);
    }
  }, [searchParams]);

  // 검색어 suggestion API 호출
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || searchTerm.trim().length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const results = await getCSKnowledgeSuggestion({
          query: searchTerm.trim(),
        });
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    // 디바운싱: 300ms 후에 API 호출
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 외부 클릭 시 suggestion 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        suggestionsRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 검색 실행 함수
  const performSearch = useCallback(async () => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const apiCategory = convertSlugToApiCategory(selectedCategory, categories);
      console.log('Search params:', {
        selectedCategory,
        apiCategory,
        keyword: activeSearchTerm,
        sortBy,
        page: page - 1,
      });
      
      const results = await searchCSKnowledge({
        keyword: activeSearchTerm && activeSearchTerm.trim() ? activeSearchTerm.trim() : undefined,
        category: apiCategory,
        sortType: convertSortToApiType(sortBy),
        page: page - 1, // API는 0부터 시작하므로 -1
        size: ARTICLES_PER_PAGE,
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('검색 중 오류가 발생했습니다.');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, [selectedCategory, categories, activeSearchTerm, sortBy, page]);

  // 검색하기 버튼 클릭 핸들러
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setPage(1);
    setShowSuggestions(false);
  };

  // 게시글 조회 API 호출 (카테고리, 정렬, 페이지 변경 시 자동 실행, 검색어는 버튼 클릭 시에만)
  useEffect(() => {
    // 카테고리가 로드된 후에만 검색 실행
    if (!categoriesLoading) {
      performSearch();
    }
  }, [categoriesLoading, performSearch, selectedCategory, page, sortBy]);

  // 검색 결과를 Article 형식으로 변환
  const apiResultsAsArticles = searchResults?.content.map((item) => ({
    id: Number(item.id),
    title: item.title,
    excerpt: item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content,
    content: item.content,
    category: item.category || (selectedCategory !== 'all' 
      ? categories.find((cat) => cat.slug === selectedCategory)?.name || ''
      : 'CS 지식'),
    topicSlug: selectedCategory !== 'all' ? selectedCategory : 'all',
    author: '시스템',
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR'),
    readTime: '5분',
    views: item.viewCount || 0,
    likes: item.likeCount || 0,
    comments: 0,
    tags: [],
    image: '/api/placeholder/400/250',
  })) || [];

  // 페이지네이션 계산
  const totalArticles = searchResults?.totalElements || 0;
  const totalPages = searchResults?.totalPages || 1;
  const safePage = Math.min(page, totalPages);
  
  // API 결과 사용 (이미 페이지네이션된 결과)
  const currentArticles = apiResultsAsArticles;

  const currentTopicName =
    selectedCategory !== 'all'
      ? categories.find((cat) => cat.slug === selectedCategory)?.name || ''
      : '';

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setPage(1);
    router.push('/articles');
  };

  const changePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage === 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }

    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-10 py-10">
        {/* 상단 Hero 영역 – 기존 디자인 그대로 */}
        <section className="mb-8">
          <div className="w-full rounded-2xl bg-secondary-50 py-10 px-6 sm:px-10 flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-700 mb-3">
              CS지식
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
              동아리의 모든 지식과 경험을 이곳에서 찾아보세요
            </p>
          </div>
        </section>

        {/* 검색/뷰모드/새 글 쓰기 – 기존 디자인에 맞게 배치 */}
        <section className="flex flex-col md:flex-row gap-4 mb-6">
          {/* 검색 인풋 */}
          <div className="flex-1 relative">
            <div className="relative flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="찾고자 할 컨텐츠를 작성해주세요"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {/* 검색하기 버튼 */}
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-2 h-11 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSearching ? '검색 중...' : '검색하기'}
              </button>
            </div>

            {/* Suggestion 드롭다운 */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
              >
                {isLoadingSuggestions ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    검색 중...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-gray-400" />
                          <span>{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 오른쪽: 뷰모드 + 정렬 + 새 글쓰기 */}
          <div className="flex items-center justify-end gap-3">
            {/* 새 글 쓰기 버튼 (디자인 유지용) */}
            <Link href="/articles/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
              <Plus className="w-4 h-4" />
              새 글 쓰기
            </Link>
          </div>
        </section>

        {/* 본문 영역: 좌측 카테고리 + 우측 리스트 (디자인 유지) */}
        <section className="flex gap-8">
          {/* 왼쪽 카테고리 패널 */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                카테고리
              </h3>
              <div className="space-y-1">
                {categoriesLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    로딩 중...
                  </div>
                ) : (
                  categories.map((cat) => {
                    const isActive = selectedCategory === cat.slug;

                    return (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setPage(1);
                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );
                          if (cat.slug === 'all') {
                            params.delete('topic');
                          } else {
                            params.set('topic', cat.slug);
                          }
                          router.push(`/articles?${params.toString()}`);
                          // 카테고리 변경 시 selectedCategory가 변경되면 useEffect가 자동으로 검색 실행
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* 오른쪽 리스트 영역 */}
          <div className="flex-1">
            {/* 결과 수 + 필터 (같은 라인) */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  총{' '}
                  <span className="font-semibold text-primary-600">
                    {totalArticles}
                  </span>
                  개의 글
                  {activeSearchTerm && ` (검색어: "${activeSearchTerm}")`}
                  {currentTopicName && ` (주제: ${currentTopicName})`}
                </p>
                {isSearching && (
                  <span className="text-xs text-gray-400">검색 중...</span>
                )}
                {searchError && (
                  <span className="text-xs text-red-500">{searchError}</span>
                )}
              </div>

              {/* 오른쪽 필터/정렬/뷰모드 영역 */}
              <div className="flex items-center gap-3">
                {/* 뷰모드 토글 */}
                <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 flex items-center justify-center ${
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-500'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 flex items-center justify-center ${
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-500'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* 정렬 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown((prev) => !prev)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-700"
                  >
                    {sortBy}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showSortDropdown && (
                    <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                            sortBy === option ? 'text-primary-600 font-medium' : ''
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 검색 중 로딩 */}
            {isSearching && (
              <div className="text-center py-12">
                <p className="text-gray-500">검색 중...</p>
              </div>
            )}

            {/* 카드 리스트 */}
            {!isSearching && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6'
                    : 'space-y-6'
                }
              >
                {currentArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={{
                      ...article,
                      author: {
                        nickname: article.author,
                        bio: '',
                      },
                    }}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}


            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  disabled={safePage === 1}
                  onClick={() => changePage(safePage - 1)}
                  className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>

                <span className="text-sm text-gray-600">
                  {safePage} / {totalPages} 페이지
                </span>

                <button
                  disabled={safePage === totalPages}
                  onClick={() => changePage(safePage + 1)}
                  className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}

            {/* 결과 없음 */}
            {totalArticles === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  검색 조건에 맞는 글이 없습니다.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-primary hover:underline"
                >
                  필터 초기화
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ArticlesContent />
    </Suspense>
  );
}
