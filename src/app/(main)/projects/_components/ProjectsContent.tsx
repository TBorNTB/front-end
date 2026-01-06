"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Github, Grid, List, Plus, Search, ChevronDown, X, ChevronLeft, ChevronRight, Heart, Eye } from 'lucide-react';
import { CategoryHelpers, CategoryType, CategoryDisplayNames } from '@/app/(main)/topics/types/category';
import Image from 'next/image';
import { BASE_URL } from '@/lib/api/config';
import { USE_MOCK_DATA } from '@/lib/api/env';
import { getProjects as getMockProjects, type Project } from '@/lib/mock-data';

// Elasticsearch API 호출 함수 - 검색 제안
const fetchElasticSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length === 0) {
    return [];

  }

  try {
    const response = await fetch(
      `${BASE_URL}/elastic-service/api/elastic/project/suggestion?query=${encodeURIComponent(query)}`,
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

// 프로젝트 상태 한글 → 영어 변환
const statusToEnglish = (status: string): string => {
  const statusMap: Record<string, string> = {
    '진행중': 'IN_PROGRESS',
    '완료': 'COMPLETED',
    '계획중': 'ARCHIVED'
  };
  return statusMap[status] || '';
};

// 정렬 한글 → 영어 변환
const sortToEnglish = (sort: string): string => {
  const sortMap: Record<string, string> = {
    '최신순': 'LATEST',
    '인기순': 'POPULAR',
    '이름순': 'NAME'
  };
  return sortMap[sort] || 'LATEST';
};

// 한글 카테고리 → 영어 대문자 변환 (API는 하이픈 형식 사용)
const categoryToEnglish = (categoryName: string): string | null => {
  const categoryType = CategoryHelpers.getTypeByDisplayName(categoryName);
  if (!categoryType) return null;
  // 언더스코어를 하이픈으로 변환 (예: WEB_HACKING -> WEB-HACKING)
  return categoryType.replace(/_/g, '-');
};

// 프로젝트 검색 API 호출 함수
interface ProjectSearchParams {
  query?: string;
  projectStatus?: string;
  categories?: string;
  projectSortType?: string;
  size?: number;
  page?: number;
}

interface ProjectSearchResponse {
  content: any[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const fetchProjects = async (params: ProjectSearchParams): Promise<ProjectSearchResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    // query 처리: 검색어가 있을 때만 전송, 없으면 생략
    // 사용자 예시를 보면 query=%20을 보내지만, 초기 로드 시에는 생략하는 게 맞을 수도 있음
    if (params.query && params.query.trim()) {
      queryParams.append('query', params.query.trim());
    } else {
      // 빈 값일 때는 공백으로 전송 (사용자 예시에 따르면)
      queryParams.append('query', ' ');
    }
    
    // projectStatus 처리: 빈 값이면 파라미터 생략, 있으면 각각 추가
    if (params.projectStatus && params.projectStatus.trim() !== '') {
      // 여러 개일 경우 각각 추가
      const statuses = params.projectStatus.split(',');
      statuses.forEach(status => {
        if (status.trim()) {
          queryParams.append('projectStatus', status.trim());
        }
      });
    }
    // 빈 값일 때는 파라미터를 전송하지 않음 (API가 빈 값을 받지 못함)
    
    // categories가 있으면 추가 (여러 개일 경우 각각 추가)
    if (params.categories) {
      const cats = params.categories.split(',');
      cats.forEach(cat => {
        if (cat.trim()) {
          queryParams.append('categories', cat.trim());
        }
      });
    }
    
    // projectSortType은 항상 전송 (기본값: LATEST)
    queryParams.append('projectSortType', params.projectSortType || 'LATEST');
    
    // size와 page는 항상 전송
    queryParams.append('size', (params.size || 12).toString());
    queryParams.append('page', (params.page || 0).toString());

    const url = `${BASE_URL}/elastic-service/api/elastic/project/search?${queryParams.toString()}`;
    
    // 디버깅을 위한 상세 로그
    const queryValue = params.query && params.query.trim() ? params.query.trim() : ' ';
    console.log('=== API Request Debug ===');
    console.log('Full URL:', url);
    console.log('Decoded URL:', decodeURIComponent(url));
    console.log('Params:', {
      query: queryValue,
      projectStatus: params.projectStatus || 'none',
      categories: params.categories || 'none',
      projectSortType: params.projectSortType || 'LATEST',
      size: params.size || 12,
      page: params.page || 0
    });
    console.log('========================');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      // 에러 응답 본문 읽기
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        console.error('API Error Text:', errorText);
      }
      throw new Error(errorMessage);
    }

    const data: ProjectSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      content: [],
      page: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0
    };
  }
};

const categories = ['웹 해킹', '리버싱', '시스템 해킹', '디지털 포렌식', '네트워크 보안', 'IoT보안', '암호학'];
const statuses = ['진행중', '완료', '계획중'];

// 페이지 크기 설정
const PAGE_SIZE = 6;

const getStatusColor = (status: string) => {
  switch (status) {
    case '완료': return 'bg-green-100 text-green-700 border-green-300';
    case '계획중': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case '진행중': return 'bg-blue-100 text-blue-700 border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// Avatar Stack Component
const AvatarStack = ({
  creator,
  contributors,
  maxVisible = 3
}: {
  creator: { name: string; avatar: string };
  contributors: { name: string; avatar: string }[];
  maxVisible?: number;
}) => {
  const visibleContributors = contributors.slice(0, maxVisible);
  const remainingCount = contributors.length - maxVisible;
  const otherContributorsCount = contributors.length - 1;

  const getCreatorText = () => {
    if (otherContributorsCount === 0) {
      return creator.name;
    } else {
      return `${creator.name} 등 ${contributors.length}명`;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {visibleContributors.map((contributor, index) => (
            <div
              key={index}
              className="relative inline-block"
              title={contributor.name}
            >
              <Image
                src={contributor.avatar}
                alt={contributor.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 hover:z-10 relative"
              />
            </div>
          ))}
          {remainingCount > 0 && (
            <div
              className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center relative"
              title={`+${remainingCount} more contributors`}
            >
              <span className="text-xs font-medium text-gray-600">+{remainingCount}</span>
            </div>
          )}
        </div>
      </div>
      <span className="text-xs text-gray-500">
        by {getCreatorText()}
      </span>
    </div>
  );
};

export default function ProjectsContent() {
  const searchParams = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['진행중']); // 기본값: 진행중
  const [searchTerm, setSearchTerm] = useState('');
  const [elasticSearchTerm, setElasticSearchTerm] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('최신순');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const sortOptions = ['최신순', '인기순', '이름순'];

  // Initialize filters from URL parameters
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      const topicType = CategoryHelpers.getTypeBySlug(topicParam);
      if (topicType) {
        const categoryName = CategoryHelpers.getDisplayName(topicType);
        setSelectedCategories([categoryName]);
      }
    }
  }, [searchParams]);

  // 프로젝트 검색 API 호출
  const loadProjects = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const defaultImageUrl = 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800';
      const getValidImageUrl = (url: string | null | undefined): string => {
        if (!url || typeof url !== 'string' || url.trim() === '') return defaultImageUrl;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
        return defaultImageUrl;
      };

      const categoriesParam = selectedCategories.length > 0
        ? selectedCategories.map(cat => categoryToEnglish(cat)).filter(Boolean).join(',')
        : undefined;
      const statusParam = selectedStatuses.length > 0
        ? selectedStatuses.map(status => statusToEnglish(status)).join(',')
        : undefined;
      const searchQuery = searchTerm.trim().toLowerCase();

      if (USE_MOCK_DATA) {
        const data = await getMockProjects();
        const filtered = data.filter((item: Project) => {
          const matchesCategory = categoriesParam
            ? item.projectCategories.some(cat => categoriesParam.split(',').includes(cat))
            : true;
          const matchesStatus = statusParam
            ? statusParam.split(',').includes(item.projectStatus)
            : true;
          const matchesSearch = searchQuery
            ? item.title.toLowerCase().includes(searchQuery) || item.description.toLowerCase().includes(searchQuery)
            : true;
          return matchesCategory && matchesStatus && matchesSearch;
        });

        const start = page * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);
        const transformedProjects = pageItems.map((item: Project) => ({
          id: item.id,
          title: item.title || '제목 없음',
          description: item.description || '',
          image: getValidImageUrl(item.thumbnailUrl),
          tags: item.projectTechStacks || [],
          category: item.projectCategories?.[0] ?
            CategoryDisplayNames[item.projectCategories[0] as CategoryType] || item.projectCategories[0] :
            '',
          topicSlug: item.projectCategories?.[0] ?
            CategoryHelpers.getSlug(item.projectCategories[0] as CategoryType) :
            '',
          status: item.projectStatus === 'IN_PROGRESS' ? '진행중' :
                  item.projectStatus === 'COMPLETED' ? '완료' :
                  item.projectStatus === 'ARCHIVED' || item.projectStatus === 'PLANNING' ? '계획중' : '진행중',
          stars: item.likeCount || 0,
          likeCount: item.likeCount || 0,
          viewCount: item.viewCount || 0,
          creator: { name: 'Unknown', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
          contributors: [],
          lastUpdate: item.updatedAt || item.createdAt || '',
          github: '',
          demo: null
        }));

        setProjects(transformedProjects);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
        setTotalElements(filtered.length);
        setCurrentPage(page);
        return;
      }

      const response = await fetchProjects({
        query: searchQuery || ' ',
        projectStatus: statusParam,
        categories: categoriesParam,
        projectSortType: sortToEnglish(sortBy),
        size: PAGE_SIZE,
        page: page
      });

      const transformedProjects = response.content.map((item: any) => ({
        id: item.id,
        title: item.title || '제목 없음',
        description: item.description || '',
        image: getValidImageUrl(item.thumbnailUrl),
        tags: item.projectTechStacks || [],
        category: item.projectCategories?.[0] ? 
          CategoryDisplayNames[item.projectCategories[0] as CategoryType] || item.projectCategories[0] : 
          '',
        topicSlug: item.projectCategories?.[0] ? 
          CategoryHelpers.getSlug(item.projectCategories[0] as CategoryType) : 
          '',
        status: item.projectStatus === 'IN_PROGRESS' ? '진행중' :
                item.projectStatus === 'COMPLETED' ? '완료' :
                item.projectStatus === 'ARCHIVED' ? '계획중' : '진행중',
        stars: item.likeCount || 0,
        likeCount: item.likeCount || 0,
        viewCount: item.viewCount || 0,
        creator: { name: 'Unknown', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
        contributors: [],
        lastUpdate: item.updatedAt || item.createdAt || '',
        github: '',
        demo: null
      }));

      setProjects(transformedProjects);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드 및 필터/정렬/검색 변경 시 API 호출
  useEffect(() => {
    // 검색어 debounce 처리
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchTerm.length > 0) {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(async () => {
        // 검색 제안 가져오기
        const suggestions = await fetchElasticSearchSuggestions(searchTerm);
        if (suggestions.length > 0 && typeof suggestions[0] === 'string') {
          setSearchSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setSearchSuggestions([]);
        }
        setIsSearching(false);
        // 검색어가 변경되면 첫 페이지로 이동
        setCurrentPage(0);
      }, 500);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      // 검색어가 비어있으면 첫 페이지로 이동
      setCurrentPage(0);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // 필터/정렬/페이지 변경 시 API 호출
  useEffect(() => {
    loadProjects(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedStatuses, sortBy, currentPage, searchTerm]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(0);
  };

  const handleStatusToggle = (status: string) => {
    // 라디오 버튼처럼 동작: 항상 하나만 선택, 같은 것을 다시 클릭해도 해제되지 않음
    setSelectedStatuses([status]);
    setCurrentPage(0);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses(['진행중']); // 필터 초기화 시에도 진행중 유지
    setSearchTerm('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setCurrentPage(0);
  };

  // 검색 제안 클릭 핸들러
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setCurrentPage(0);
    searchInputRef.current?.blur();
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 외부 클릭 시 드롭다운 닫기
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

  // API에서 받은 프로젝트를 그대로 사용 (필터링과 정렬은 API에서 처리)
  const filteredProjects = projects;

  // Get current topic name for breadcrumb
  const currentTopicName = searchParams.get('topic')
    ? CategoryHelpers.getDisplayName(CategoryHelpers.getTypeBySlug(searchParams.get('topic')!)!)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-3 sm:px-4 lg:px-10 py-10">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-black px-6 py-10 sm:px-10 flex justify-center bg-gradient-to-r from-primary-600/40 via-primary-500 to-secondary-500/10">
            <div className="relative z-10 text-center max-w-3xl">
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white">Projects</h1>
              <p className="mt-3 text-primary-100 text-base sm:text-lg">
                동아리 멤버들이 만들어낸 프로젝트를 만나보세요.
              </p>
            </div>
          </div>
        </section>

        {/* Search/View Mode/Create Button Section */}
        <section className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isSearching ? 'text-primary animate-pulse' : 'text-gray-400'}`} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="프로젝트 검색..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.length > 0) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && searchTerm.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                >
                  <div className="py-2">
                    {searchSuggestions.map((suggestion, index) => {
                      const parts = suggestion.split(new RegExp(`(${searchTerm})`, 'gi'));
                      return (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                        >
                          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="flex-1">
                            {parts.map((part, i) =>
                              part.toLowerCase() === searchTerm.toLowerCase() ? (
                                <span key={i} className="text-primary font-semibold">
                                  {part}
                                </span>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Create Button */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/projects/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
              <Plus className="w-4 h-4" />
              새 프로젝트
            </Link>
          </div>
        </section>

        {/* Main Content with Sidebar */}
        <section className="flex gap-8">
          {/* Sidebar Filter */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  필터
                </h3>
                {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    초기화
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-semibold text-gray-900 uppercase">프로젝트 상태</h4>
                {statuses.map((status) => (
                  <label key={status} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="projectStatus"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                      selectedStatuses.includes(status)
                        ? 'bg-primary border-primary'
                        : 'border-gray-300'
                    }`}>
                      {selectedStatuses.includes(status) && (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>

              {/* Category Filters */}
              <h4 className="text-xs font-semibold text-gray-900 uppercase mb-3">학습 주제</h4>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      selectedCategories.includes(category)
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-primary">{filteredProjects.length}</span>개의 프로젝트
                {searchTerm && ` (검색어: "${searchTerm}")`}
                {currentTopicName && ` (주제: ${currentTopicName})`}
              </p>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {sortBy}
                  <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          sortBy === option ? 'text-primary font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">프로젝트를 불러오는 중...</p>
              </div>
            )}

            {/* Project Grid/List based on viewMode */}
            {!isLoading && (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-6"
              }>
                {filteredProjects.map((project) => (
                  <div key={project.id} className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all duration-200 flex flex-col h-full ${
                    viewMode === 'list' ? 'flex-row' : ''
                  }`}>
                    {/* Image */}
                    <div className={`relative ${viewMode === 'list' ? 'w-56 flex-shrink-0 overflow-hidden' : 'overflow-hidden'}`}>
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={viewMode === 'list' ? 224 : 400}
                        height={viewMode === 'list' ? 224 : 240}
                        className={`w-full object-cover ${viewMode === 'list' ? 'h-full' : 'h-56'} group-hover:scale-105 transition-transform duration-200`}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm border border-gray-200 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          {project.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${
                        viewMode === 'list' ? 'text-lg' : 'text-base'
                      }`}>
                        {project.title}
                      </h3>
                      <p className={`text-sm text-gray-600 mb-3 ${
                        viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'
                      }`}>
                        {project.description}
                      </p>

                      {/* 기술 스택 태그 */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {project.tags.slice(0, 3).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md border border-gray-200">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-1 text-gray-700 font-medium">
                          <Heart size={16} className="text-red-500 fill-red-500" />
                          <span>{project.likeCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-700 font-medium">
                          <Eye size={16} className="text-blue-600" />
                          <span>{project.viewCount || 0}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center gap-2 mt-auto">
                        <div className="flex space-x-2">
                          {project.github && (
                            <a
                              href={project.github}
                              className="text-gray-400 hover:text-primary transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                              title="GitHub"
                            >
                              <Github size={18} />
                            </a>
                          )}
                          {project.demo && (
                            <a
                              href={project.demo}
                              className="text-gray-400 hover:text-primary transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Demo"
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}
                        </div>

                        <Link
                          href={`/projects/${project.id}`}
                          className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
                        >
                          자세히 보기
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">검색 조건에 맞는 프로젝트가 없습니다.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-primary hover:underline"
                >
                  필터 초기화
                </button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-lg border transition-colors ${
                    currentPage === 0
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
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
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className={`p-2 rounded-lg border transition-colors ${
                    currentPage >= totalPages - 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>

                <span className="ml-4 text-sm text-gray-500">
                  {currentPage + 1} / {totalPages} 페이지
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
