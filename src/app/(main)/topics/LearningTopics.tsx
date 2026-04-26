// app/(pages)/topics/LearningTopics.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Clock, ArrowRight, Shield, Code, Lock, Search, Wifi, Cpu, Key, ChevronLeft, ChevronRight, ThumbsUp, Eye } from 'lucide-react';
import TitleBanner from '@/components/layout/TitleBanner';
import CategoryFilter from '@/components/layout/CategoryFilter';
import type { LucideIcon } from 'lucide-react';
import { categoryService, CategoryItem } from '@/lib/api/services/category-services';
import { CategoryType, CategorySlugs, CategoryDisplayNames, CategoryDescriptions } from '@/types/services/category';
import { decodeHtmlEntities } from '@/lib/html-utils';
import { normalizeImageUrl } from '@/lib/landing-utils';

const getAvatarUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') return '/images/placeholder/default-avatar.svg';
  return url.trim();
};

// Icon mapping for each category
const CategoryIcons: Record<CategoryType, LucideIcon> = {
  [CategoryType.WEB_HACKING]: Code,
  [CategoryType.REVERSING]: Search,
  [CategoryType.SYSTEM_HACKING]: Lock,
  [CategoryType.DIGITAL_FORENSICS]: Shield,
  [CategoryType.NETWORK_SECURITY]: Wifi,
  [CategoryType.IOT_SECURITY]: Cpu,
  [CategoryType.CRYPTOGRAPHY]: Key,
};

// Color mapping for each category
const CategoryColors: Record<CategoryType, string> = {
  [CategoryType.WEB_HACKING]: 'bg-blue-500',
  [CategoryType.REVERSING]: 'bg-purple-500',
  [CategoryType.SYSTEM_HACKING]: 'bg-red-500',
  [CategoryType.DIGITAL_FORENSICS]: 'bg-green-500',
  [CategoryType.NETWORK_SECURITY]: 'bg-indigo-500',
  [CategoryType.IOT_SECURITY]: 'bg-orange-500',
  [CategoryType.CRYPTOGRAPHY]: 'bg-yellow-500',
};

// 카테고리 이름으로 CategoryType을 찾는 헬퍼 함수
const getCategoryTypeByName = (name: string): CategoryType | null => {
  const entry = Object.entries(CategoryDisplayNames).find(([_, displayName]) => displayName === name);
  return entry ? (entry[0] as CategoryType) : null;
};

// CategoryType을 API 형식으로 변환 (WEB_HACKING -> WEB-HACKING)
const convertCategoryTypeToApiFormat = (categoryType: CategoryType): string => {
  return categoryType.replace(/_/g, '-');
};

// 카테고리 이름을 API 형식으로 변환 (한글 이름 -> API 형식)
const getCategoryApiFormat = (categoryName: string): string => {
  const type = getCategoryTypeByName(categoryName);
  return type ? convertCategoryTypeToApiFormat(type) : categoryName;
};

// API 응답을 컴포넌트에서 사용하는 형식으로 변환
interface CategoryDisplayData {
  id: number;
  name: string;
  slug: string;
  articles: number;
  projects: number;
  type: CategoryType;
  description: string;
  content: string;
  iconUrl?: string;
}

// 범용 slug 생성 함수 - 어떤 카테고리 이름이 와도 자동으로 처리
const createSlugFromName = (name: string, id: number): string => {
  // 한글 카테고리 이름을 영문 slug로 변환하는 매핑
  const koreanToSlugMap: Record<string, string> = {
    '웹 해킹': 'web-hacking',
    '리버싱': 'reversing',
    '시스템 해킹': 'system-hacking',
    '디지털 포렌식': 'digital-forensics',
    '네트워크 보안': 'network-security',
    'IoT보안': 'iot-security',
    '암호학': 'cryptography',
  };

  // 매핑에 있으면 사용
  if (koreanToSlugMap[name]) {
    return koreanToSlugMap[name];
  }

  // 영문/숫자만 있는 경우: 공백을 하이픈으로, 소문자 변환
  if (/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  // 한글이나 특수문자가 포함된 경우: 공백을 제거하고 소문자로 변환
  return name.toLowerCase().replace(/\s+/g, '-');
};

const transformCategoryData = (apiCategory: CategoryItem): CategoryDisplayData | null => {
  // API 응답의 name을 제목으로 사용
  const type = getCategoryTypeByName(apiCategory.name);
  
  // 타입을 찾지 못해도 기본값으로 처리 (필터링되지 않도록)
  // 알 수 없는 카테고리는 첫 번째 타입을 기본값으로 사용
  const defaultType = type || CategoryType.WEB_HACKING;
  
  // slug 생성: 타입이 있으면 해당 slug, 없으면 ID 기반으로 생성
  const slug = type 
    ? CategorySlugs[type]
    : createSlugFromName(apiCategory.name, apiCategory.id);

  // 타입을 찾지 못한 경우 경고만 출력하고 계속 진행
  if (!type) {
    console.log(`New category detected: "${apiCategory.name}" (ID: ${apiCategory.id}). Using auto-generated slug: "${slug}"`);
  }

  return {
    id: apiCategory.id,
    name: apiCategory.name, // API 응답의 name을 제목으로 사용
    slug: slug,
    articles: 0, // API에서 제공되지 않으면 기본값 0
    projects: 0, // API에서 제공되지 않으면 기본값 0
    type: defaultType,
    description: apiCategory.description || (type ? CategoryDescriptions[type] : apiCategory.description || ''),
    content: (apiCategory.content ?? '').toString(),
    iconUrl: apiCategory.iconUrl,
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-700 border-green-300';
    case 'Planning': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'Completed': return '완료';
    case 'Planning': return '계획중';
    case 'In Progress': return '진행중';
    default: return status;
  }
};

export function LearningTopics() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category') || '';
  
  const [categories, setCategories] = useState<CategoryDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleCategoryClick = (categorySlug: string) => {
    if (categorySlug === selectedCategory) {
      router.push('/topics');
    } else {
      router.push(`/topics?category=${categorySlug}`);
    }
  };

  // Find current category based on selected slug
  const currentCategory = categories.find(cat => cat.slug === selectedCategory);

  // State for projects and articles
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [projectPage, setProjectPage] = useState(0);
  const [articlePage, setArticlePage] = useState(0);
  const [projectTotalPages, setProjectTotalPages] = useState(0);
  const [articleTotalPages, setArticleTotalPages] = useState(0);
  const [projectTotalElements, setProjectTotalElements] = useState(0);
  const [articleTotalElements, setArticleTotalElements] = useState(0);
  const [projectThumbFail, setProjectThumbFail] = useState<Record<string, boolean>>({});
  const [articleThumbFail, setArticleThumbFail] = useState<Record<string, boolean>>({});

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await categoryService.getCategories();
        const transformedCategories = response.categories
          .map(transformCategoryData)
          .filter((cat): cat is CategoryDisplayData => cat !== null);
        setCategories(transformedCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('카테고리를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch projects when category or project page changes
  useEffect(() => {
    if (!selectedCategory || !currentCategory) {
      setFilteredProjects([]);
      setProjectTotalPages(0);
      setProjectTotalElements(0);
      return;
    }

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const projectParams = new URLSearchParams();
        projectParams.append('categories', currentCategory.name);
        projectParams.append('size', '4');
        projectParams.append('page', String(projectPage));
        projectParams.append('projectSortType', 'LATEST');

        const projectResponse = await fetch(`/api/projects/search?${projectParams.toString()}`);
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          const transformedProjects = (projectData.content || []).map((item: any) => {
            const owner = item.owner ? { nickname: item.owner.nickname || item.owner.realname || 'Unknown', avatar: getAvatarUrl(item.owner.profileImageUrl) } : null;
            const collaborators = (item.collaborators || []).map((c: any) => ({ nickname: c.nickname || c.realname || 'Unknown', avatar: getAvatarUrl(c.profileImageUrl) }));
            const teamMembers = owner ? [owner, ...collaborators] : collaborators;
            return {
              id: String(item.id),
              title: item.title || '제목 없음',
              description: item.description || '',
              category: item.projectCategories?.[0] || currentCategory.name,
              projectCategories: Array.isArray(item.projectCategories) ? item.projectCategories : [item.projectCategories].filter(Boolean),
              status: item.projectStatus === 'IN_PROGRESS' ? 'In Progress' :
                      item.projectStatus === 'COMPLETED' ? 'Completed' :
                      item.projectStatus === 'PLANNING' ? 'Planning' : 'In Progress',
              tags: item.projectTechStacks || [],
              contributors: (item.collaborators || []).length + (item.owner ? 1 : 0),
              teamMembers,
              categorySlug: selectedCategory,
              thumbnailUrl: item.thumbnailUrl ? normalizeImageUrl(item.thumbnailUrl) : '',
              likeCount: item.likeCount ?? 0,
              viewCount: item.viewCount ?? 0,
            };
          });
          setFilteredProjects(transformedProjects);
          setProjectTotalPages(projectData.totalPages ?? 0);
          setProjectTotalElements(projectData.totalElements ?? 0);
        } else {
          setFilteredProjects([]);
          setProjectTotalPages(0);
          setProjectTotalElements(0);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setFilteredProjects([]);
        setProjectTotalPages(0);
        setProjectTotalElements(0);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [selectedCategory, currentCategory, projectPage]);

  // Fetch articles when category or article page changes
  useEffect(() => {
    if (!selectedCategory || !currentCategory) {
      setFilteredArticles([]);
      setArticleTotalPages(0);
      setArticleTotalElements(0);
      return;
    }

    const fetchArticles = async () => {
      setLoadingArticles(true);
      try {
        const articleParams = new URLSearchParams();
        articleParams.append('category', currentCategory.name);
        articleParams.append('size', '4');
        articleParams.append('page', String(articlePage));
        articleParams.append('sortType', 'LATEST');

        const articleResponse = await fetch(`/api/articles/search?${articleParams.toString()}`);
        if (articleResponse.ok) {
          const articleData = await articleResponse.json();
          const transformedArticles = (articleData.content || []).map((item: any) => ({
            id: String(item.id),
            title: item.title || '제목 없음',
            description: item.description ?? '',
            category: item.category || currentCategory.name,
            articleCategories: Array.isArray(item.categories) ? item.categories : (item.category ? [item.category] : [currentCategory.name]),
            author: item.writer?.nickname || item.writer?.realname || '작성자',
            authorAvatar: getAvatarUrl(item.writer?.profileImageUrl),
            publishDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR') : '',
            readTime: '5분 읽기',
            views: item.viewCount ?? 0,
            likeCount: item.likeCount ?? 0,
            comments: 0,
            categorySlug: selectedCategory,
            thumbnailUrl: item.thumbnailUrl ? normalizeImageUrl(item.thumbnailUrl) : '',
          }));
          setFilteredArticles(transformedArticles);
          setArticleTotalPages(articleData.totalPages ?? 0);
          setArticleTotalElements(articleData.totalElements ?? 0);
        } else {
          setFilteredArticles([]);
          setArticleTotalPages(0);
          setArticleTotalElements(0);
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        setFilteredArticles([]);
        setArticleTotalPages(0);
        setArticleTotalElements(0);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchArticles();
  }, [selectedCategory, currentCategory, articlePage]);

  // Reset pagination and thumb fallback when category changes
  useEffect(() => {
    setProjectPage(0);
    setArticlePage(0);
    setProjectThumbFail({});
    setArticleThumbFail({});
  }, [selectedCategory]);
  
  // 선택된 카테고리가 없으면 상세 페이지를 표시하지 않음
  if (selectedCategory && !currentCategory) {
    console.warn(`Category not found for slug: "${selectedCategory}"`);
  }

  const renderAllCategories = () => (
    <div className="space-y-8">
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          // 알 수 없는 카테고리도 기본 아이콘/색상 사용 (확장성 고려)
          const IconComponent = CategoryIcons[category.type] || Shield;
          const colorClass = CategoryColors[category.type] || 'bg-gray-500';
          
          return (
            <div 
              key={category.slug} 
              className="card cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`relative w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden flex-shrink-0`}>
                  {category.iconUrl ? (
                    <>
                      <IconComponent className="absolute inset-0 w-6 h-6 text-white m-auto z-0" />
                      <img src={category.iconUrl} alt="" className="w-full h-full object-cover relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </>
                  ) : (
                    <IconComponent className="w-6 h-6 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed mb-6">
                {category.description || '설명이 없습니다.'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                    <span className="text-gray-700">{category.projects}개 프로젝트</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-secondary-500"></div>
                    <span className="text-gray-700">{category.articles}개 CS지식</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCategoryDetail = () => {
    const cat = currentCategory;
    return (
      <div className="space-y-6">
        {/* Full Width Header */}
        {cat ? (
          <div className="bg-gradient-background rounded-xl p-8">
            {/* Animated background grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(58,77,161,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>
            <div className="relative z-10 flex items-start space-x-4">
              <div className={`relative w-16 h-16 rounded-xl ${CategoryColors[cat.type]} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                {cat.iconUrl ? (
                  <>
                    {(() => {
                      const Icon = CategoryIcons[cat.type];
                      return <Icon className="absolute inset-0 w-8 h-8 text-white m-auto z-0" />;
                    })()}
                    <img src={cat.iconUrl} alt="" className="w-full h-full object-cover relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </>
                ) : (
                  (() => {
                    const Icon = CategoryIcons[cat.type];
                    return <Icon className="w-8 h-8 text-white" />;
                  })()
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{cat.name}</h1>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {cat.content}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-background rounded-xl p-8">
            {/* Animated background grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(58,77,161,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>
            <div className="relative z-10 flex items-start space-x-4">
              <div className="w-16 h-16 rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-gray-700" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">카테고리를 찾을 수 없습니다</h1>
                <p className="text-sm text-gray-300 leading-relaxed">
                  선택하신 카테고리 정보를 불러올 수 없습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Left Sidebar - Category Navigation */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-8">
              <CategoryFilter
                categories={[
                  ...categories.map(category => ({
                    id: category.slug,
                    name: category.name,
                    count: category.articles + category.projects,
                  }))
                ]}
                selectedCategory={selectedCategory}
                onCategoryChange={(slug) => {
                  if (slug === 'all') {
                    router.push('/topics');
                  } else {
                    router.push(`/topics?category=${slug}`);
                  }
                }}
                title="전체 카테고리"
              />
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* Content Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Projects Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">프로젝트</h2>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                      {projectTotalElements}개
                    </span>
                  </div>

                  <div className="space-y-4">
                    {loadingProjects ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-700 mt-2">프로젝트를 불러오는 중...</p>
                      </div>
                    ) : filteredProjects.length > 0 ? (
                      filteredProjects.map((project) => (
                        <div key={project.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 topic-card">
                          <div className="flex gap-4 p-4 min-h-[180px]">
                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                              {project.thumbnailUrl && !projectThumbFail[project.id] ? (
                                <img
                                  src={project.thumbnailUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={() => setProjectThumbFail((prev) => ({ ...prev, [project.id]: true }))}
                                />
                              ) : (
                                <span className="text-2xl font-bold text-gray-400">P</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-base font-bold text-foreground flex-1 line-clamp-1">{decodeHtmlEntities(project.title)}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs border ml-2 flex-shrink-0 ${getStatusColor(project.status)}`}>
                                  {getStatusText(project.status)}
                                </span>
                              </div>
                              {project.projectCategories && project.projectCategories.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {project.projectCategories.map((catName: string, idx: number) => (
                                    <span key={idx} className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-xs border border-primary-200">
                                      {catName}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              <p className="text-gray-700 text-sm mb-2 line-clamp-2">{decodeHtmlEntities(project.description)}</p>
                              {project.teamMembers && project.teamMembers.length > 0 ? (
                                <div className="flex items-center gap-1 mb-2">
                                  <div className="flex -space-x-2">
                                    {project.teamMembers.slice(0, 5).map((member: { nickname: string; avatar: string }, idx: number) => (
                                      <div key={idx} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200 flex-shrink-0" title={member.nickname}>
                                        <img src={member.avatar} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/placeholder/default-avatar.svg'; }} />
                                      </div>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-600 ml-1">팀원 {project.teamMembers.length}명</span>
                                </div>
                              ) : null}
                              <div className="flex items-center justify-between flex-wrap gap-2 mt-auto">
                                <div className="flex items-center space-x-3 text-xs text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <ThumbsUp size={12} className="text-gray-500" />
                                    <span>{project.likeCount ?? 0}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Eye size={12} />
                                    <span>{project.viewCount ?? 0}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => router.push(`/projects/${project.id}`)}
                                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors hover:underline"
                                >
                                  자세히 보기 →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                        <p className="text-gray-700">이 카테고리에 등록된 프로젝트가 없습니다.</p>
                      </div>
                    )}
                  </div>

                  {projectTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setProjectPage((p) => Math.max(0, p - 1))}
                        disabled={projectPage === 0}
                        className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-sm text-gray-600">
                        {projectPage + 1} / {projectTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setProjectPage((p) => Math.min(projectTotalPages - 1, p + 1))}
                        disabled={projectPage >= projectTotalPages - 1}
                        className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={() => router.push(`/projects?topic=${cat?.slug}`)}
                      className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2 mx-auto text-sm transition-colors hover:underline"
                    >
                      <span>모든 프로젝트 보기</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Articles Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">아티클</h2>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {articleTotalElements}개
                    </span>
                  </div>

                  <div className="space-y-4">
                    {loadingArticles ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-700 mt-2">아티클을 불러오는 중...</p>
                      </div>
                    ) : filteredArticles.length > 0 ? (
                      filteredArticles.map((article) => (
                        <div key={article.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 topic-card">
                          <div className="flex gap-4 p-4 min-h-[180px]">
                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                              {article.thumbnailUrl && !articleThumbFail[article.id] ? (
                                <img
                                  src={article.thumbnailUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={() => setArticleThumbFail((prev) => ({ ...prev, [article.id]: true }))}
                                />
                              ) : (
                                <span className="text-2xl font-bold text-gray-400">A</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                              <h3 className="text-base font-bold text-foreground mb-2 line-clamp-1">{decodeHtmlEntities(article.title)}</h3>
                              {article.articleCategories && article.articleCategories.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {article.articleCategories.map((catName: string, idx: number) => (
                                    <span key={idx} className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs border border-green-200">
                                      {catName}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              <p className="text-gray-700 text-sm mb-2 line-clamp-2">{decodeHtmlEntities(article.description)}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200 flex-shrink-0" title={article.author}>
                                  <img src={article.authorAvatar} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/placeholder/default-avatar.svg'; }} />
                                </div>
                                <span className="font-medium text-foreground">작성: {article.author}</span>
                                <span>{article.publishDate}</span>
                              </div>
                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center space-x-3 text-xs text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Clock size={12} />
                                    <span>{article.readTime}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <ThumbsUp size={12} className="text-gray-500" />
                                    <span>{article.likeCount ?? 0}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Eye size={12} />
                                    <span>{article.views ?? 0}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => router.push(`/articles/${article.id}`)}
                                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors hover:underline"
                                >
                                  읽어보기 →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                        <p className="text-gray-700">이 카테고리에 등록된 CS지식이 없습니다.</p>
                      </div>
                    )}
                  </div>

                  {articleTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setArticlePage((p) => Math.max(0, p - 1))}
                        disabled={articlePage === 0}
                        className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-sm text-gray-600">
                        {articlePage + 1} / {articleTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setArticlePage((p) => Math.min(articleTotalPages - 1, p + 1))}
                        disabled={articlePage >= articleTotalPages - 1}
                        className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={() => router.push('/topics')}
                      className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-2 mx-auto text-sm transition-colors hover:underline"
                    >
                      <span>모든 CS지식 보기</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-200 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!selectedCategory && (
        <TitleBanner
          title="Learning Topics"
          description="사이버보안의 다양한 분야를 탐구하고 실무 경험을 쌓을 수 있는 학습 주제들을 확인하세요."
          backgroundImage="/images/BgHeader.png"
        />
      )}
      <div className="container py-8">
        {selectedCategory && currentCategory ? renderCategoryDetail() : renderAllCategories()}
      </div>
    </div>
  );
}
