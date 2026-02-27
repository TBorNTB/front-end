// app/(main)/articles/page.tsx
'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Article = {
  topicSlug: string;
  id: string;
  content: {
    title: string;
    summary: string;
    content: string;
    category: string;
  };
  thumbnailUrl: string;
  writerId: string;
  participantIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
};
import TitleBanner from '@/components/layout/TitleBanner';
import ContentFilterBar from '@/components/layout/TopSection';
import CategoryFilter from '@/components/layout/CategoryFilter';
import ArticleCard from './_components/ArticleCard';
import { searchCSKnowledge, getCSKnowledgeSuggestion, type CSKnowledgeSearchResponse } from '@/lib/api/services/elastic-services';
import { categoryService, type CategoryItem } from '@/lib/api/services/category-services';
import { CategoryType, CategoryDisplayNames, CategorySlugs } from '@/types/services/category';

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

// 카테고리 slug를 API 형식으로 변환 (API는 한글 카테고리 이름을 받음)
const convertSlugToApiCategory = (slug: string, categories: Category[]): string | undefined => {
  if (slug === 'all') return undefined;
  
  // categories 배열에서 해당 slug의 카테고리 찾기
  const category = categories.find(cat => cat.slug === slug);
  if (category) {
    // API는 한글 카테고리 이름을 받으므로 name을 그대로 사용
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
  const [articlesData, setArticlesData] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
  const sortOptions = ['최신순', '인기순'];

  // 카테고리 목록 API 호출
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getCategories();
        
        // API 응답을 Category 형식으로 변환
        const transformedCategories: Category[] = [
          ...response.categories.map((apiCategory: CategoryItem) => {
            const type = getCategoryTypeByName(apiCategory.name);
            const slug = type ? CategorySlugs[type] : createSlugFromName(apiCategory.name, apiCategory.id);
            
            return {
              name: apiCategory.name, // API는 한글 카테고리 이름을 받으므로 name을 그대로 사용
              slug: slug,
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
  const convertSortToApiType = (sortBy: string): 'LATEST' | 'POPULAR' => {
    switch (sortBy) {
      case '인기순':
        return 'POPULAR';
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

  // Load articles from API
  useEffect(() => {
    const load = async () => {
      try {
        setArticlesLoading(true);
        setArticlesError(null);
        // Articles are loaded via search when filters change, no initial load needed
        setArticlesData([]);
      } catch (err) {
        console.error('Failed to load articles', err);
        setArticlesError('아티클을 불러오는 데 실패했습니다.');
      } finally {
        setArticlesLoading(false);
      }
    };

    load();
  }, []);

  // 필터링
  let filteredArticles = articlesData.filter((article) => {
    const matchesCategory =
      selectedCategory === 'all' || article.content.category === selectedCategory || article.topicSlug === selectedCategory;
    const matchesSearch =
      article.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // 정렬 (원래 디자인 상, 아직 날짜 파싱이 없으므로 no-op)
  filteredArticles = filteredArticles.sort((a, b) => {
    switch (sortBy) {
      case '인기순':
        return (b.likeCount || 0) - (a.likeCount || 0);
      case '최신순':
      default:
        return 0;
    }
  });

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
        keyword: searchTerm,
        sortBy,
        page: page - 1,
      });
      
      const results = await searchCSKnowledge({
        keyword: searchTerm && searchTerm.trim() ? searchTerm.trim() : undefined,
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
  }, [selectedCategory, categories, searchTerm, sortBy, page]);

  // 게시글 조회 API 호출 (카테고리, 정렬, 페이지, 검색어 변경 시 자동 실행)
  useEffect(() => {
    // 카테고리가 로드된 후에만 검색 실행
    if (!categoriesLoading) {
      // 검색어가 변경되면 페이지를 1로 리셋
      if (searchTerm) {
        setPage(1);
      }
      performSearch();
    }
  }, [categoriesLoading, performSearch, searchTerm]);

  // 검색 결과를 Article 형식으로 변환
  const apiResultsAsArticles: Array<{
    id: number;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    topicSlug: string;
    author: { nickname: string; bio?: string; avatarUrl?: string; username?: string; realname?: string };
    date: string;
    readTime: string;
    views: number;
    likes: number;
    comments: number;
    tags: string[];
    image: string;
  }> = searchResults?.content.map((item) => ({
    id: Number(item.id),
    title: item.title,
    excerpt: item.description || (item.content?.length > 100 ? item.content.substring(0, 100) + '...' : item.content || ''),
    content: item.content,
    category: item.category || (selectedCategory !== 'all' 
      ? categories.find((cat) => cat.slug === selectedCategory)?.name || ''
      : 'CS 지식'),
    topicSlug: selectedCategory !== 'all' ? selectedCategory : 'all',
    author: {
      nickname: item.writer?.nickname || item.writer?.realname || '작성자',
      bio: item.writer?.realname || '',
      username: item.writer?.username,
      realname: item.writer?.realname,
      avatarUrl: item.writer?.profileImageUrl || '',
    },
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR'),
    readTime: '5분',
    views: item.viewCount || 0,
    likes: item.likeCount || 0,
    comments: 0,
    tags: [],
    image: item.thumbnailUrl || '', // Use thumbnailUrl if available, otherwise empty string triggers placeholder
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
      <TitleBanner
        title="CS지식"
        description="동아리의 모든 지식과 경험을 이곳에서 찾아보세요"
        backgroundImage="/images/BgHeader.png"
      />
      <main className="w-full px-3 sm:px-4 lg:px-10 py-10">
        {articlesLoading && (
          <div className="text-center py-8 text-gray-700">아티클을 불러오는 중...</div>
        )}
        {articlesError && !articlesLoading && (
          <div className="text-center py-8 text-red-500">{articlesError}</div>
        )}

        <ContentFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isSearching={isSearching}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          onSuggestionSelect={(suggestion) => {
            setSearchTerm(suggestion);
            setShowSuggestions(false);
          }}
          onSuggestionsShow={setShowSuggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          viewMode={viewMode as 'grid' | 'list'}
          onViewModeChange={(mode) => setViewMode(mode)}
          sortBy={sortBy}
          sortOptions={['최신순', '인기순']}
          onSortChange={setSortBy}
          showViewMode={true}
          showSort={true}
          showCreateButton={true}
          createButtonText="새 글 쓰기"
          createButtonHref="/articles/create"
          placeholderText="찾고자 할 컨텐츠를 작성해주세요"
        />

        {/* 본문 영역: 좌측 카테고리 + 우측 리스트 (디자인 유지) */}
        <section className="flex gap-8">
          {/* 왼쪽 카테고리 패널 */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            {categoriesLoading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="px-3 py-2 text-sm text-gray-700 text-center">
                  로딩 중...
                </div>
              </div>
            ) : (
              <CategoryFilter
                categories={categories.map(cat => ({
                  id: cat.slug,
                  name: cat.name,
                }))}
                selectedCategory={selectedCategory}
                onCategoryChange={(slug) => {
                  setSelectedCategory(slug);
                  setPage(1);
                  const params = new URLSearchParams(searchParams.toString());
                  if (slug === 'all') {
                    params.delete('topic');
                  } else {
                    params.set('topic', slug);
                  }
                  router.push(`/articles?${params.toString()}`);
                }}
                title="카테고리"
              />
            )}
          </aside>

          <div className="flex-1">
            {/* 결과 수 + 필터 (같은 라인) */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700">
                  총{' '}
                  <span className="font-semibold text-primary-600">
                    {totalArticles}
                  </span>
                  개의 글
                  {searchTerm && ` (검색어: "${searchTerm}")`}
                  {currentTopicName && ` (주제: ${currentTopicName})`}
                </p>
                {isSearching && (
                  <span className="text-xs text-gray-700">검색 중...</span>
                )}
                {searchError && (
                  <span className="text-xs text-red-500">{searchError}</span>
                )}
              </div>
            </div>

            {/* 검색 중 로딩 */}
            {isSearching && (
              <div className="text-center py-12">
                <p className="text-gray-700">검색 중...</p>
              </div>
            )}

            {/* 카드 리스트 */}
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
                  article={article}
                  viewMode={viewMode}
                />
              ))}
            </div>

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

                <span className="text-sm text-gray-700">
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
                <p className="text-gray-700 text-lg mb-4">
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

