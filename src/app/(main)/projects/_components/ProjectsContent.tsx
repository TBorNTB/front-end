"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Github, Grid, List, Plus, Search, ChevronDown, ChevronLeft, ChevronRight, Heart, Eye } from 'lucide-react';
import TitleBanner from '@/components/layout/TitleBanner';
import { CategoryHelpers, CategoryType, CategoryDisplayNames } from '@/types/services/category';
import Image from 'next/image';
import { USE_MOCK_DATA } from '@/lib/api/env';
import { getProjects as getMockProjects, type Project } from '@/lib/mock-data';

// ============================================================================
// 🔧 API Service Layer (Move to src/lib/services/project.ts later)
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

/**
 * Fetch projects from Elasticsearch API
 * TODO: Move to src/lib/services/project.ts with proper error handling
 */
const fetchProjects = async (params: ProjectSearchParams): Promise<ProjectSearchResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Query: send space if empty (API requirement)
    const queryValue = params.query?.trim() || ' ';
    queryParams.append('query', queryValue);
    
    // Project status: only append if selected
    if (params.projectStatus) {
      params.projectStatus.split(',').forEach(status => {
        if (status.trim()) queryParams.append('projectStatus', status.trim());
      });
    }
    
    // Categories: append each separately
    if (params.categories) {
      params.categories.split(',').forEach(cat => {
        if (cat.trim()) queryParams.append('categories', cat.trim());
      });
    }
    
    // Always include sort, size, page
    queryParams.append('projectSortType', params.projectSortType || 'LATEST');
    queryParams.append('size', (params.size || 12).toString());
    queryParams.append('page', (params.page || 0).toString());

    const url = `/api/projects/search?${queryParams.toString()}`; // ✅ Use API route

    const response = await fetch(url);

    if (!response.ok) {
      // Safe-parsed error payload plus status context for debugging
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

/**
 * Fetch search suggestions from Elasticsearch
 * TODO: Move to src/lib/services/elastic.ts
 */
const fetchSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query?.trim()) return [];

  try {
    const response = await fetch(
      `/api/projects/suggestions?query=${encodeURIComponent(query)}` // ✅ Use API route
    );

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

// ============================================================================
// 🎨 UI Helpers
// ============================================================================

const PAGE_SIZE = 6;

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
const categoryToEnglish = (categoryName: string): string | null => {
  const categoryType = CategoryHelpers.getTypeByDisplayName(categoryName);
  return categoryType ? categoryType.replace(/_/g, '-') : null;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case '완료': return 'bg-green-100 text-green-700 border-green-300';
    case '계획중': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case '진행중': return 'bg-blue-100 text-blue-700 border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getValidImageUrl = (url: string | null | undefined): string => {
  const defaultImageUrl = 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800';
  if (!url || typeof url !== 'string' || !url.trim()) return defaultImageUrl;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return defaultImageUrl;
};

// ============================================================================
// 🧩 Avatar Stack Component
// ============================================================================

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

  const getCreatorText = () => {
    return contributors.length === 0
      ? creator.name
      : `${creator.name} 등 ${contributors.length + 1}명`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex -space-x-2">
        {visibleContributors.map((contributor, index) => (
          <div key={index} className="relative inline-block" title={contributor.name}>
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
      <span className="text-xs text-gray-500">by {getCreatorText()}</span>
    </div>
  );
};

// ============================================================================
// 📄 Main Component
// ============================================================================

const categories = ['웹 해킹', '리버싱', '시스템 해킹', '디지털 포렌식', '네트워크 보안', 'IoT보안', '암호학'];
const statuses = ['진행중', '완료', '계획중'];
const sortOptions = ['최신순', '인기순', '이름순'];

export default function ProjectsContent() {
  const searchParams = useSearchParams();
  
  // State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['진행중']);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Initialize from URL
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

  // Load projects
  const loadProjects = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const categoriesParam = selectedCategories.length > 0
        ? selectedCategories.map(cat => categoryToEnglish(cat)).filter(Boolean).join(',')
        : undefined;
      const statusParam = selectedStatuses.length > 0
        ? selectedStatuses.map(status => statusToEnglish(status)).join(',')
        : undefined;
      const searchQuery = searchTerm.trim();

      if (USE_MOCK_DATA) {
        const data = await getMockProjects();
        // Filter mock data...
        const filtered = data.filter((item: Project) => {
          const matchesCategory = categoriesParam
            ? item.projectCategories.some(cat => categoriesParam.split(',').includes(cat))
            : true;
          const matchesStatus = statusParam
            ? statusParam.split(',').includes(item.projectStatus)
            : true;
          const matchesSearch = searchQuery
            ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              item.description.toLowerCase().includes(searchQuery.toLowerCase())
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
      setCurrentPage(0);
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

  // Handlers
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(0);
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses([status]);
    setCurrentPage(0);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses(['진행중']);
    setSearchTerm('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setCurrentPage(0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setCurrentPage(0);
    searchInputRef.current?.blur();
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

  return (
    <div className="min-h-screen bg-background">
      <TitleBanner
        title="Projects"
        description="동아리 멤버들이 만들어낸 프로젝트를 만나보세요."
        backgroundImage="/images/BgHeader.png"
      />
      <div className="w-full px-3 sm:px-4 lg:px-10 py-10">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between w-full gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isSearching ? 'text-primary animate-pulse' : 'text-gray-400'}`} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="프로젝트 검색..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => {
                  if (searchSuggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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
                                <span key={i} className="text-primary font-semibold">{part}</span>
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

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>

            {/* Create Button */}
            <Link href="/projects/create" className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} />
              <span className="hidden sm:inline">새 프로젝트</span>
            </Link>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <section className="flex gap-8">
          {/* Sidebar Filter */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">필터</h3>
                {(selectedCategories.length > 0 || selectedStatuses.length > 1) && (
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
                <h4 className="text-base font-semibold text-gray-900">프로젝트 상태</h4>
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
                    <span className="text-gray-700">{status}</span>
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
                    {category}
                  </button>
                ))}
              </div>
            </div>
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
