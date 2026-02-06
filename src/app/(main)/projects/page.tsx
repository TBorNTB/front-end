'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Github, ChevronLeft, ChevronRight, Heart, Eye, Crown, Users } from 'lucide-react';
import TitleBanner from '@/components/layout/TitleBanner';
import ContentFilterBar from '@/components/layout/TopSection';
import CategoryFilter from '@/components/layout/CategoryFilter';
import { CategoryHelpers, CategoryType, CategoryDisplayNames } from '@/types/services/category';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { categoryService, type CategoryItem } from '@/lib/api/services/category-services';

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  projectStatus: 'IN_PROGRESS' | 'COMPLETED' | 'PLANNING' | 'ARCHIVED';
  projectCategories: string[];
  projectTechStacks: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  owner?: {
    username?: string;
    nickname?: string;
    realname?: string;
    avatarUrl?: string;
  } | null;
  collaborators?: Array<{
    username?: string;
    nickname?: string;
    realname?: string;
    avatarUrl?: string;
  }>;
}

// ============================================================================
// 🔧 API Service Layer
// ============================================================================

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
  error?: string;
}

const fetchProjects = async (params: ProjectSearchParams): Promise<ProjectSearchResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    const queryValue = params.query?.trim();
    if (queryValue && queryValue !== ' ') {
      queryParams.append('query', queryValue);
    }
    
    if (params.projectStatus) {
      params.projectStatus.split(',').forEach(status => {
        if (status.trim()) queryParams.append('projectStatus', status.trim());
      });
    }
    
    if (params.categories) {
      params.categories.split(',').forEach(cat => {
        if (cat.trim()) queryParams.append('categories', cat.trim());
      });
    }
    
    queryParams.append('projectSortType', params.projectSortType || 'LATEST');
    queryParams.append('size', (params.size || 100).toString());
    queryParams.append('page', (params.page || 0).toString());

    const url = `/api/projects/search?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
      const message = (errorData as { message?: string; error?: string })?.message
        || (errorData as { error?: string })?.error
        || response.statusText
        || `API error: ${response.status}`;

      return {
        content: [],
        page: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
        error: message,
      };
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error while fetching projects';
    return {
      content: [],
      page: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0,
      error: message,
    };
  }
};

const fetchSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query?.trim()) return [];

  try {
    const response = await fetch(
      `/api/projects/suggestions?query=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data.slice(0, 5) : [];
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
};

// ============================================================================
// 🎨 UI Helpers
// ============================================================================

const PAGE_SIZE = 12;

const statusMap: Record<string, string> = {
  '진행중': 'IN_PROGRESS',
  '완료': 'COMPLETED',
  '계획중': 'ARCHIVED'
};

const sortMap: Record<string, string> = {
  '최신순': 'LATEST',
  '인기순': 'POPULAR',
  '이름순': 'NAME'
};

const statusToEnglish = (status: string) => statusMap[status] || '';
const sortToEnglish = (sort: string) => sortMap[sort] || 'LATEST';

const getStatusColor = (status: string) => {
  switch (status) {
    case '완료': return 'bg-green-100 text-green-700 border-green-300';
    case '계획중': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case '진행중': return 'bg-blue-100 text-blue-700 border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getValidImageUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== 'string' || !url.trim()) return '/images/placeholder/project.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return '/images/placeholder/project.png';
};

// ============================================================================
// 🧩 Avatar Stack Component
// ============================================================================

const AvatarStack = ({
  creator,
  contributors,
  maxVisible = 3
}: {
  creator: { username: string; nickname: string; realname: string; avatar: string };
  contributors: { username: string; nickname: string; realname: string; avatar: string }[];
  maxVisible?: number;
}) => {
  const visibleContributors = contributors.slice(0, maxVisible);
  const remainingCount = contributors.length - maxVisible;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Crown size={14} className="text-yellow-500" />
          <span className="text-xs font-medium text-gray-600">소유자</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="relative inline-block"
            title={creator.nickname}
          >
            <ImageWithFallback
              src={creator.avatar}
              type="avatar"
              alt={creator.nickname}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full border-2 border-yellow-400 bg-gray-200 shadow-sm"
            />
          </div>
          <span 
            className="text-xs text-gray-700 font-medium"
            title={creator.nickname}
          >
            {creator.nickname}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-blue-500" />
          <span className="text-xs font-medium text-gray-600">협력자</span>
        </div>
        <div className="flex items-center gap-1.5">
          {contributors.length > 0 ? (
            <>
              <div className="flex -space-x-2">
                {visibleContributors.map((contributor, index) => (
                  <div 
                    key={contributor.username || index} 
                    className="relative inline-block"
                    title={contributor.nickname}
                  >
                    <ImageWithFallback
                      src={contributor.avatar}
                      type="avatar"
                      alt={contributor.nickname}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"
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
              <span className="text-xs text-gray-500">
                {contributors.length}명
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400">없음</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 📄 Main Component
// ============================================================================

// Loading fallback component
function ProjectsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-3 sm:px-4 lg:px-10 py-10">
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

function ProjectsPageInner() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('최신순');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const statuses = ['전체', '진행중', '완료', '계획중'];
  const sortOptions = ['최신순', '인기순', '이름순'];

  // Initial data load
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await categoryService.getCategories();
      if (data?.categories) setCategories(data.categories);
    };
    fetchCategories();

    const initialTopic = searchParams.get('topic');
    if (initialTopic) {
      const categoryType = CategoryHelpers.getTypeBySlug(initialTopic);
      if (categoryType) {
        const categoryName = CategoryHelpers.getDisplayName(categoryType);
        setSelectedCategories([categoryName]);
      }
    }

    loadProjects(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProjects = async (page: number) => {
    setIsLoading(true);
    try {
      const categoryParams = selectedCategories.length > 0 
        ? selectedCategories.join(',') 
        : undefined;

      const statusParams = selectedStatuses.length > 0
        ? selectedStatuses.map(statusToEnglish).filter(Boolean).join(',')
        : undefined;

      const response = await fetchProjects({
        query: searchTerm?.trim() || undefined,
        categories: categoryParams,
        projectStatus: statusParams,
        projectSortType: sortToEnglish(sortBy),
        size: PAGE_SIZE,
        page,
      });

      const transformedProjects = response.content.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        image: getValidImageUrl(item.thumbnailUrl),
        category: item.projectCategories?.[0] || 'Uncategorized',
        tags: item.projectTechStacks || [],
        topicSlug: item.projectCategories?.[0] ? 
          CategoryHelpers.getSlug(item.projectCategories[0] as CategoryType) : 
          '',
        status: item.projectStatus === 'IN_PROGRESS' ? '진행중' :
                item.projectStatus === 'COMPLETED' ? '완료' :
                item.projectStatus === 'PLANNING' ? '계획중' :
                item.projectStatus === 'ARCHIVED' ? '계획중' : '진행중',
        stars: item.likeCount || 0,
        likeCount: item.likeCount || 0,
        viewCount: item.viewCount || 0,
        creator: item.owner ? {
          username: item.owner.username || '',
          nickname: item.owner.nickname || 'Unknown',
          realname: item.owner.realname || '',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        } : {
          username: '',
          nickname: 'Unknown',
          realname: '',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        contributors: (item.collaborators || []).map((collab: any) => ({
          username: collab.username || '',
          nickname: collab.nickname || 'Unknown',
          realname: collab.realname || '',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        })),
        lastUpdate: item.updatedAt || item.createdAt || '',
        github: '',
        demo: null
      }));

      setProjects(transformedProjects);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.page);
    } catch (_error) {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };


  // Search suggestions debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchTerm.length > 0) {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(async () => {
        const suggestions = await fetchSearchSuggestions(searchTerm);
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
        setIsSearching(false);
        setCurrentPage(0);
      }, 500);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Load projects when filters/sort/page change
  useEffect(() => {
    loadProjects(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedStatuses, sortBy, currentPage]);

  // Refetch projects when page regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentPage === 0) {
        loadProjects(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleStatusToggle = (status: string) => {
    if (status === '전체') {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses([status]);
    }
    setCurrentPage(0);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSearchTerm('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setCurrentPage(0);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setCurrentPage(0);
    searchInputRef.current?.blur();
    await loadProjects(0);
  };

  const handleSearchSubmit = async () => {
    setShowSuggestions(false);
    setCurrentPage(0);
    searchInputRef.current?.blur();
    await loadProjects(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Close dropdown on outside click
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTopicName = searchParams.get('topic')
    ? CategoryHelpers.getDisplayName(CategoryHelpers.getTypeBySlug(searchParams.get('topic')!)!)
    : null;

  // Show loading skeleton while initial load
  if (isLoading && projects.length === 0) {
    return <ProjectsLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TitleBanner
        title="Projects"
        description="동아리 멤버들이 만들어낸 프로젝트를 만나보세요."
        backgroundImage="/images/BgHeader.png"
      />
      <div className="w-full px-3 sm:px-4 lg:px-10 py-10">
        {/* Top Controls */}
        <ContentFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          isSearching={isSearching}
          suggestions={searchSuggestions}
          showSuggestions={showSuggestions}
          onSuggestionSelect={handleSuggestionClick}
          onSuggestionsShow={setShowSuggestions}
          isLoadingSuggestions={isSearching}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          sortOptions={sortOptions}
          onSortChange={(nextSort) => {
            setSortBy(nextSort);
            setCurrentPage(0);
          }}
          showViewMode={true}
          showSort={true}
          showCreateButton={true}
          createButtonText="새 프로젝트"
          createButtonHref="/projects/create"
          placeholderText="프로젝트 검색..."
        />

        {/* Main Content with Sidebar */}
        <section className="flex gap-8">
          {/* Sidebar Filter */}
          <aside className="w-64 flex-shrink-0 hidden md:block space-y-6">
            {/* Status Filter Box */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">프로젝트 상태</h3>
                {selectedStatuses.length > 1 && (
                  <button
                    onClick={() => setSelectedStatuses(['진행중'])}
                    className="text-xs text-primary hover:underline"
                  >
                    초기화
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="space-y-3">
                {statuses.map((status) => {
                  const isSelected = status === '전체'
                    ? selectedStatuses.length === 0
                    : selectedStatuses.includes(status);

                  return (
                    <label key={status} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="projectStatus"
                        checked={isSelected}
                        onChange={() => handleStatusToggle(status)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700">{status}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category Filter Box */}
            <CategoryFilter
              categories={categories.map((category) => ({
                id: category.name,
                name: category.name,
                count: 0,
              }))}
              selectedCategory={selectedCategories.length === 0 ? 'all' : selectedCategories[0]}
              onCategoryChange={(categoryId) => {
                if (categoryId === 'all') {
                  setSelectedCategories([]);
                } else {
                  setSelectedCategories([categoryId]);
                }
                setCurrentPage(0);
              }}
              title="학습 주제"
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-primary">{totalElements}</span>개의 프로젝트
                {searchTerm && ` (검색어: "${searchTerm}")`}
                {currentTopicName && ` (주제: ${currentTopicName})`}
              </p>
              <button
                onClick={() => loadProjects(0)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                새로고침
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">프로젝트를 불러오는 중...</p>
              </div>
            )}

            {/* Projects Grid/List */}
            {!isLoading && (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-6"
              }>
                {projects.map((project) => (
                  <div key={project.id} className={`group ${viewMode === 'list' ? 'flex gap-6' : ''}`}>
                    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                      viewMode === 'list' ? 'flex flex-1' : ''
                    }`}>
                      {/* Image */}
                      <div className={`relative ${viewMode === 'list' ? 'w-56 flex-shrink-0 overflow-hidden' : 'overflow-hidden'}`}>
                        <ImageWithFallback
                          src={project.image}
                          type="project"
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
                        <p className={`text-gray-600 mb-3 leading-relaxed ${
                          viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3 text-sm'
                        }`}>
                          {project.description}
                        </p>

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.tags.slice(0, 5).map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200"
                              >
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md border border-gray-200">
                                +{project.tags.length - 5}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Contributors */}
                        <div className="mb-3">
                          <AvatarStack
                            creator={project.creator}
                            contributors={project.contributors}
                          />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-700 font-medium">
                            <Heart size={16} className="text-red-500 fill-red-500" />
                            <span>{project.likeCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-700 font-medium">
                            <Eye size={16} className="text-blue-600" />
                            <span>{project.viewCount || 0}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center mt-auto">
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
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && projects.length === 0 && (
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

export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectsPageInner />
    </Suspense>
  );
}
