// src/app/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Topics from '@/components/landing/Topics';
import { HeroBanner, StatisticsSection, FeaturedProjectCard, ProjectCardHome, ArticleCardHome, QuickActions, FAQsSection } from '@/components/landing';
import { faqs } from '@/data/faq';
import { useLandingData, fetchProjectsPage, fetchArticlesPage } from '@/hooks/useLandingData';
import { convertStatus, normalizeImageUrl } from '@/lib/landing-utils';
import { useAuth } from '@/context/AuthContext';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';
import { mapUserToAuthUser } from '@/app/(auth)/types/auth';
import type {
  FeaturedProject,
  ProjectCardData,
  ArticleCardData,
} from '@/types/landing-types';

export default function Home() {
  const {
    projects,
    articles,
    topics,
    totalProjectElements,
    totalArticleElements,
    loading: landingLoading,
    error: landingError,
  } = useLandingData();
  const { login, loadUser } = useAuth();
  const oauthProcessedRef = useRef(false);
  const [oauthSignupComplete, setOauthSignupComplete] = useState(false);

  // Debug log
  useEffect(() => {
    console.log('Home page - topics from hook:', topics);
    console.log('Topics length:', topics?.length);
  }, [topics]);

  // OAuth 콜백 처리: 한 번만 유저 확인
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (oauthProcessedRef.current) return;

      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const hasOAuthCode = urlParams?.get('code');
      const isOAuthRedirecting = sessionStorage.getItem('oauth_redirecting') === 'true';
      const isOAuthCallback = hasOAuthCode || isOAuthRedirecting;

      if (!isOAuthCallback) return;

      console.log('🔐 OAuth callback detected, processing login...');
      oauthProcessedRef.current = true;

      const finishLogin = (authUser: ReturnType<typeof mapUserToAuthUser>) => {
        login(authUser, true);
        sessionStorage.removeItem('oauth_redirecting');
        if (typeof window !== 'undefined' && window.location.search) {
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          window.history.replaceState({}, '', url.pathname);
        }
      };

      const checkUser = async (): Promise<boolean> => {
        const res = await fetchWithRefresh('/api/auth/user', { method: 'GET', cache: 'no-store' });
        if (!res.ok) return false;
        const data = await res.json();
        if (data.authenticated && data.user) {
          const authUser = mapUserToAuthUser(data.user);
          finishLogin(authUser);
          console.log('✅ OAuth login successful:', authUser);
          return true;
        }
        return false;
      };

      try {
        // 한 번만 요청 (재시도 없음)
        if (await checkUser()) return;

        // 백엔드에 계정이 없었던 경우: 회원가입만 완료되고 세션이 없어 로그인 안 됨 → 안내 표시
        console.warn('⚠️ OAuth: user not available (likely new signup only)');
        sessionStorage.removeItem('oauth_redirecting');
        if (typeof window !== 'undefined' && window.location.search) {
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          window.history.replaceState({}, '', url.pathname);
        }
        setOauthSignupComplete(true);
      } catch (error) {
        console.error('❌ OAuth callback processing error:', error);
        oauthProcessedRef.current = false;
      }
    };

    handleOAuthCallback();
  }, [login, loadUser]);

  const [featuredProject, setFeaturedProject] = useState<FeaturedProject | null>(null);
  const [gridProjects, setGridProjects] = useState<ProjectCardData[]>([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentProjectPage, setCurrentProjectPage] = useState(0);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [loadingProjectPage, setLoadingProjectPage] = useState(false);

  const [gridArticles, setGridArticles] = useState<ArticleCardData[]>([]);
  const [articleIndex, setArticleIndex] = useState(0);
  const [currentArticlePage, setCurrentArticlePage] = useState(0);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [loadingArticlePage, setLoadingArticlePage] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const projectPrevRef = useRef(false);
  const articlePrevRef = useRef(false);

  const PAGE_SIZE_PROJECTS = 10;
  const PAGE_SIZE_ARTICLES = 9;

  // totalPages는 API totalPages가 아니라 totalElements로만 계산 (totalElements / pageSize 올림)
  const totalProjectPages = totalProjectElements === 0 ? 0 : Math.max(1, Math.ceil(totalProjectElements / PAGE_SIZE_PROJECTS));
  const totalArticlePages = totalArticleElements === 0 ? 0 : Math.max(1, Math.ceil(totalArticleElements / PAGE_SIZE_ARTICLES));

  const canGoNextProjectPage = currentProjectPage < totalProjectPages - 1;
  const canGoPrevProjectPage = currentProjectPage > 0;
  const canGoNextArticlePage = currentArticlePage < totalArticlePages - 1;
  const canGoPrevArticlePage = currentArticlePage > 0;

  type ProjectFromApi = {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    projectStatus: string;
    projectCategories?: string[];
    projectTechStacks?: string[];
    likeCount: number;
    viewCount: number;
    owner?: { username?: string; nickname?: string; realname?: string; profileImageUrl?: string } | null;
    collaborators?: Array<{ profileImageUrl?: string }>;
  };

  const mapProjectToCard = (p: ProjectFromApi): ProjectCardData => {
    const collaboratorsList = (p.collaborators || []).map((c) => ({ profileImage: c.profileImageUrl || '' }));
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      status: convertStatus(p.projectStatus as any),
      category: p.projectCategories?.[0] || '프로젝트',
      collaborators: collaboratorsList,
      likes: p.likeCount || 0,
      views: p.viewCount,
      techStacks: p.projectTechStacks || [],
      owner: p.owner || undefined,
      thumbnailUrl: normalizeImageUrl(p.thumbnailUrl),
    };
  };

  type ArticleFromApi = {
    id: string;
    content: { title: string; summary: string; content: string; category: string };
    thumbnailUrl: string;
    writer?: { nickname?: string; realname?: string; profileImageUrl?: string };
    writerId: string;
    likeCount: number;
    viewCount: number;
    tags?: string[];
    createdAt: string;
  };

  const getValidProfileImageUrl = (url: string | null | undefined): string => {
    if (!url || typeof url !== 'string') return '/images/placeholder/default-avatar.svg';
    const trimmed = url.trim();
    if (trimmed === '' || trimmed === 'string' || trimmed === 'null' || trimmed === 'undefined') return '/images/placeholder/default-avatar.svg';
    if (trimmed.startsWith('/')) return trimmed;
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return '/images/placeholder/default-avatar.svg';
    }
  };

  const mapArticleToCard = (a: ArticleFromApi): ArticleCardData => {
    const contentStr = typeof a.content?.content === 'string' ? a.content.content : '';
    const description = a.content?.summary || (contentStr ? contentStr.substring(0, 150) : '') || '';
    return {
      id: a.id,
      title: a.content?.title ?? '',
      description,
      author: {
        name: a.writer?.nickname || a.writer?.realname || a.writerId || '작성자',
        profileImage: getValidProfileImageUrl(a.writer?.profileImageUrl),
      },
      category: a.content?.category || '기타',
      thumbnailImage: normalizeImageUrl(a.thumbnailUrl) || '',
      likes: a.likeCount || 0,
      views: a.viewCount || 0,
      tags: a.tags || [],
      createdAt: a.createdAt,
    };
  };

  // 프로젝트: 페이지 0은 훅 데이터, 페이지 1+ 는 해당 페이지 fetch
  useEffect(() => {
    if (landingError) setProjectError('프로젝트를 불러오는 중 오류가 발생했습니다.');
    if (landingLoading) return;

    if (!projects || projects.length === 0) {
      setFeaturedProject(null);
      if (currentProjectPage === 0) setGridProjects([]);
      return;
    }

    if (currentProjectPage === 0) {
      const first = projects[0];
      setFeaturedProject({
        id: first.id,
        title: first.title,
        description: first.description,
        category: first.projectCategories?.[0] || '프로젝트',
        status: 'LATEST PROJECT',
        technologies: first.projectTechStacks || [],
        thumbnailImage: normalizeImageUrl(first.thumbnailUrl),
        viewText: '자세히 보기',
        likes: first.likeCount,
        views: first.viewCount,
        owner: first.owner || undefined,
        collaborators: first.collaborators || [],
      });
      const grid = projects.slice(1).map((p) => mapProjectToCard(p));
      setGridProjects(grid);
      if (projectPrevRef.current) {
        projectPrevRef.current = false;
        const lastGroup = Math.floor((grid.length - 1) / 3) * 3;
        setCurrentProjectIndex(Math.max(0, lastGroup));
      } else {
        setCurrentProjectIndex(0);
      }
    }
  }, [projects, landingLoading, landingError, currentProjectPage]);

  useEffect(() => {
    if (currentProjectPage < 1 || landingLoading) return;
    let cancelled = false;
    setGridProjects([]);
    setLoadingProjectPage(true);
    fetchProjectsPage(currentProjectPage, PAGE_SIZE_PROJECTS)
      .then((res) => {
        if (!cancelled) {
          const grid = res.content.map(mapProjectToCard);
          setGridProjects(grid);
          if (projectPrevRef.current) {
            projectPrevRef.current = false;
            const lastGroup = Math.floor((grid.length - 1) / 3) * 3;
            setCurrentProjectIndex(Math.max(0, lastGroup));
          } else {
            setCurrentProjectIndex(0);
          }
        }
      })
      .finally(() => { if (!cancelled) setLoadingProjectPage(false); });
    return () => { cancelled = true; };
  }, [currentProjectPage]);

  // 아티클: 페이지 0은 훅 데이터, 페이지 1+ 는 해당 페이지 fetch
  useEffect(() => {
    if (landingLoading) {
      setArticlesLoading(true);
      return;
    }
    setArticlesLoading(false);
    if (landingError) setArticlesError('아티클을 불러오는 중 오류가 발생했습니다.');
    if (!articles || articles.length === 0) {
      if (currentArticlePage === 0) setGridArticles([]);
      return;
    }
    if (currentArticlePage === 0) {
      const grid = articles.map((a) => mapArticleToCard(a as ArticleFromApi));
      setGridArticles(grid);
      if (articlePrevRef.current) {
        articlePrevRef.current = false;
        const lastGroup = Math.floor((grid.length - 1) / 3) * 3;
        setArticleIndex(Math.max(0, lastGroup));
      } else {
        setArticleIndex(0);
      }
    }
  }, [articles, landingLoading, currentArticlePage]);

  useEffect(() => {
    if (currentArticlePage < 1 || landingLoading) return;
    let cancelled = false;
    setGridArticles([]);
    setLoadingArticlePage(true);
    fetchArticlesPage(currentArticlePage, PAGE_SIZE_ARTICLES)
      .then((res) => {
        if (!cancelled) {
          const grid = res.content.map(mapArticleToCard);
          setGridArticles(grid);
          if (articlePrevRef.current) {
            articlePrevRef.current = false;
            const lastGroup = Math.floor((grid.length - 1) / 3) * 3;
            setArticleIndex(Math.max(0, lastGroup));
          } else {
            setArticleIndex(0);
          }
        }
      })
      .finally(() => { if (!cancelled) setLoadingArticlePage(false); });
    return () => { cancelled = true; };
  }, [currentArticlePage]);

  // Scroll to section if URL has hash
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const sectionId = hash.replace('#', '');
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (!section) return;

      const headerOffset = 80;
      const elementPosition = section.getBoundingClientRect().top;
      const offset = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({ top: offset, behavior: 'smooth' });
    }, 300);
  }, []);

  // Project: totalElements로 계산한 totalProjectPages 기준으로 렌더
  const visibleProjects = gridProjects.slice(currentProjectIndex, currentProjectIndex + 3);
  const canGoNextWithinProjectPage = currentProjectIndex + 3 < gridProjects.length;
  const canGoPrevWithinProjectPage = currentProjectIndex > 0;

  const goNextProjects = () => {
    if (canGoNextWithinProjectPage) {
      setCurrentProjectIndex((i) => i + 3);
      return;
    }
    if (canGoNextProjectPage) setCurrentProjectPage((p) => p + 1);
  };

  const goPrevProjects = () => {
    if (canGoPrevWithinProjectPage) {
      setCurrentProjectIndex((i) => Math.max(0, i - 3));
      return;
    }
    if (canGoPrevProjectPage) {
      projectPrevRef.current = true;
      setCurrentProjectPage((p) => p - 1);
    }
  };

  // Article: totalElements로 계산한 totalArticlePages 기준으로 렌더
  const visibleArticles = gridArticles.slice(articleIndex, articleIndex + 3);
  const canGoNextWithinArticlePage = articleIndex + 3 < gridArticles.length;
  const canGoPrevWithinArticlePage = articleIndex > 0;

  const goNextArticles = () => {
    if (canGoNextWithinArticlePage) {
      setArticleIndex((i) => i + 3);
      return;
    }
    if (canGoNextArticlePage) setCurrentArticlePage((p) => p + 1);
  };

  const goPrevArticles = () => {
    if (canGoPrevWithinArticlePage) {
      setArticleIndex((i) => Math.max(0, i - 3));
      return;
    }
    if (canGoPrevArticlePage) {
      articlePrevRef.current = true;
      setCurrentArticlePage((p) => p - 1);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* OAuth 신규 가입 완료 안내: 화면 중앙에 잠시 표시 */}
        {oauthSignupComplete && (
          <OAuthSignupCompleteModal
            onClose={() => setOauthSignupComplete(false)}
          />
        )}
        <Header />

        {/* Hero */}
        <div className="w-full text-center text-3xl text-white sm:h-[250px] md:h-[400px]">
          <HeroBanner />
        </div>

        <StatisticsSection />

        {/* Topics (with data from hook) */}
        <Topics topics={topics} />

        {/* Latest Project Section */}
        <section className="section bg-gray-50">
          <div className="container">
            {landingLoading || projectError ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-gray-700">프로젝트를 불러오는 중...</p>
              </div>
            ) : projectError ? (
              <div className="text-center py-12">
                <p className="text-red-500">{projectError}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Side - Text Content */}
                  <div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      LATEST<br />
                      PROJECT
                    </h2>
                    <p className="text-gray-700 text-lg mb-6">
                      최신의 보안 기술과 오픈소스를 활용한<br />
                      실무에 적용 가능한 솔루션입니다.
                    </p>
                    <button className="btn btn-primary btn-lg">
                      프로젝트 더보기
                    </button>
                  </div>

                  {/* Right Side - Featured Project Card */}
                  <div>
                    {featuredProject && (
                      <FeaturedProjectCard project={featuredProject} />
                    )}
                  </div>
                </div>

                {/* Projects Grid - totalElements 기준 totalProjectPages로 렌더 */}
                {(gridProjects.length > 0 || loadingProjectPage) && (
                  <div className="mt-16">
                    <div className="relative px-12 lg:px-16">
                      {(totalProjectPages > 1 || gridProjects.length > 3) && (
                        <>
                          <button
                            onClick={goPrevProjects}
                            disabled={(!canGoPrevWithinProjectPage && !canGoPrevProjectPage) || loadingProjectPage}
                            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10 disabled:opacity-50 disabled:pointer-events-none"
                            aria-label="이전 프로젝트 보기"
                          >
                            <ChevronLeft className="w-6 h-6 text-primary-600" />
                          </button>
                          <button
                            onClick={goNextProjects}
                            disabled={(!canGoNextWithinProjectPage && !canGoNextProjectPage) || loadingProjectPage}
                            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10 disabled:opacity-50 disabled:pointer-events-none"
                            aria-label="다음 프로젝트 보기"
                          >
                            {loadingProjectPage ? (
                              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
                            ) : (
                              <ChevronRight className="w-6 h-6 text-primary-600" />
                            )}
                          </button>
                        </>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingProjectPage && gridProjects.length === 0 ? (
                          <div className="col-span-full flex justify-center py-12">
                            <span className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                          </div>
                        ) : (
                          visibleProjects.map((project) => (
                            <ProjectCardHome key={project.id} project={project} />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Latest Articles Section */}
        <section className="section bg-background">
          <div className="container">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
            <p className="text-gray-700 mb-12">Stay informed with expert insights</p>
            
            {articlesLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-gray-700">아티클을 불러오는 중...</p>
              </div>
            ) : articlesError ? (
              <div className="text-center py-12">
                <p className="text-red-500">{articlesError}</p>
              </div>
            ) : (gridArticles.length > 0 || loadingArticlePage) ? (
              <div>
                <div className="relative px-12 lg:px-16">
                  {(totalArticlePages > 1 || gridArticles.length > 3) && (
                    <>
                      <button
                        onClick={goPrevArticles}
                        disabled={(!canGoPrevWithinArticlePage && !canGoPrevArticlePage) || loadingArticlePage}
                        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10 disabled:opacity-50 disabled:pointer-events-none"
                        aria-label="이전 아티클 보기"
                      >
                        <ChevronLeft className="w-6 h-6 text-primary-600" />
                      </button>
                      <button
                        onClick={goNextArticles}
                        disabled={(!canGoNextWithinArticlePage && !canGoNextArticlePage) || loadingArticlePage}
                        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10 disabled:opacity-50 disabled:pointer-events-none"
                        aria-label="다음 아티클 보기"
                      >
                        {loadingArticlePage ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-primary-600" />
                        )}
                      </button>
                    </>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loadingArticlePage && gridArticles.length === 0 ? (
                      <div className="col-span-full flex justify-center py-12">
                        <span className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                      </div>
                    ) : (
                      visibleArticles.map((article) => (
                        <ArticleCardHome key={article.id} article={article} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-700">표시할 아티클이 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        {/* FAQs Section - 메인과 /faqs 페이지 동일 데이터 연동 */}
        <FAQsSection
          faqs={faqs}
          expandedFaq={expandedFaq}
          onToggleFaq={toggleFaq}
          showMoreLink
        />

      {/* Quick Actions Section */}
        <QuickActions />
      </div>

      <Footer />
    </>
  );
}

// Sub-sections for readability

function OAuthSignupCompleteModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary-100 p-4">
            <CheckCircle className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          회원가입이 완료되었습니다
        </h3>
        <p className="text-gray-700 mb-6">
          정상적으로 가입되었습니다. 로그인 후 서비스를 이용해 주세요.
        </p>
        <Link
          href="/login"
          onClick={onClose}
          className="inline-block w-full py-3 px-4 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          다시 로그인
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

interface ProjectsSectionProps {
  loading: boolean;
  error: string | null;
  featuredProject: FeaturedProject | null;
  projects: ProjectCardData[];
  totalProjects: number;
  currentIndex: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  onPageClick: (pageIndex: number) => void;
}

function ProjectsSection({
  loading,
  error,
  featuredProject,
  projects,
  totalProjects,
  currentIndex,
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
  onPageClick,
}: ProjectsSectionProps) {
  if (loading) {
    return (
      <section className="section bg-gray-50">
        <div className="container text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          <p className="mt-4 text-gray-700">프로젝트를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section bg-gray-50">
        <div className="container text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  if (!featuredProject && totalProjects === 0) {
    return null;
  }

  const pageCount = Math.ceil(totalProjects / 3);
  const currentPage = Math.floor(currentIndex / 3);

  return (
    <section className="section bg-gray-50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              LATEST<br />
              PROJECT
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              최신의 보안 기술과 오픈소스를 활용한<br />
              실무에 적용 가능한 솔루션입니다.
            </p>
            <Link href="/projects" className="btn btn-primary btn-lg">
              프로젝트 더보기
            </Link>
          </div>

          <div>
            {featuredProject && <FeaturedProjectCard project={featuredProject} />}
          </div>
        </div>

        {totalProjects > 0 && (
          <div className="mt-16">
            <div className="relative px-12 lg:px-16">
                {totalProjects > 3 && (
                <>
                  <button
                    onClick={onPrev}
                    className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10"
                    aria-label="이전 프로젝트 보기"
                  >
                    <ChevronLeft className="w-6 h-6 text-primary-600" />
                  </button>

                  <button
                    onClick={onNext}
                    className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10"
                    aria-label="다음 프로젝트 보기"
                  >
                    <ChevronRight className="w-6 h-6 text-primary-600" />
                  </button>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCardHome key={project.id} project={project} />
                ))}
              </div>
            </div>

            {totalProjects > 3 && (
              <div className="mt-8 flex justify-center items-center gap-3">
                <button
                  onClick={onPrev}
                  disabled={!canGoPrev}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                    canGoPrev
                      ? 'bg-white border-primary-300 hover:bg-primary-50 hover:border-primary-500 cursor-pointer'
                      : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                  }`}
                  aria-label="이전"
                >
                  <ChevronLeft
                    className={`w-5 h-5 ${
                      canGoPrev ? 'text-primary-600' : 'text-gray-700'
                    }`}
                  />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: pageCount }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => onPageClick(index)}
                      className={`h-2 rounded-full transition-all ${
                        currentPage === index
                          ? 'bg-primary-500 w-8'
                          : 'bg-gray-300 hover:bg-gray-400 w-2'
                      }`}
                      aria-label={`페이지 ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={onNext}
                  disabled={!canGoNext && currentIndex === 0}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                    canGoNext || currentIndex > 0
                      ? 'bg-white border-primary-300 hover:bg-primary-50 hover:border-primary-500 cursor-pointer'
                      : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                  }`}
                  aria-label="다음"
                >
                  <ChevronRight
                    className={`w-5 h-5 ${
                      canGoNext || currentIndex > 0
                        ? 'text-primary-600'
                        : 'text-gray-700'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

interface ArticlesSectionProps {
  loading: boolean;
  articles: ArticleCardData[];
  totalArticles: number;
  currentIndex: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  onPageClick: (pageIndex: number) => void;
}

function ArticlesSection({
  loading,
  articles,
  totalArticles,
  currentIndex,
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
  onPageClick,
}: ArticlesSectionProps) {
  if (loading) {
    return (
      <section className="section bg-background">
        <div className="container text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          <p className="mt-4 text-gray-700">아티클을 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (totalArticles === 0) {
    return (
      <section className="section bg-background">
        <div className="container text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
          <p className="text-gray-700 mb-12">
            Stay informed with expert insights
          </p>
          <p className="text-gray-700">표시할 아티클이 없습니다.</p>
        </div>
      </section>
    );
  }

  const pageCount = Math.ceil(totalArticles / 2);
  const currentPage = Math.floor(currentIndex / 2);

  return (
    <section className="section bg-background">
      <div className="container">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
        <p className="text-gray-700 mb-12">Stay informed with expert insights</p>

        <div className="relative px-12 lg:px-16">
            {totalArticles > 3 && (
            <>
              <button
                onClick={onPrev}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10"
                aria-label="이전 아티클 보기"
              >
                <ChevronLeft className="w-6 h-6 text-primary-600" />
              </button>

              <button
                onClick={onNext}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10"
                aria-label="다음 아티클 보기"
              >
                <ChevronRight className="w-6 h-6 text-primary-600" />
              </button>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCardHome key={article.id} article={article} />
            ))}
          </div>
        </div>

        {totalArticles > 3 && (
          <div className="mt-8 flex justify-center items-center gap-3">
            <button
              onClick={onPrev}
              disabled={!canGoPrev}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                canGoPrev
                  ? 'bg-white border-primary-300 hover:bg-primary-50 hover:border-primary-500 cursor-pointer'
                  : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
              }`}
              aria-label="이전"
            >
              <ChevronLeft
                className={`w-5 h-5 ${
                  canGoPrev ? 'text-primary-600' : 'text-gray-700'
                }`}
              />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => onPageClick(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentPage === index
                      ? 'bg-primary-500 w-8'
                      : 'bg-gray-300 hover:bg-gray-400 w-2'
                  }`}
                  aria-label={`페이지 ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={onNext}
              disabled={!canGoNext && currentIndex === 0}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                canGoNext || currentIndex > 0
                  ? 'bg-white border-primary-300 hover:bg-primary-50 hover:border-primary-500 cursor-pointer'
                  : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
              }`}
              aria-label="다음"
            >
              <ChevronRight
                className={`w-5 h-5 ${
                  canGoNext || currentIndex > 0
                    ? 'text-primary-600'
                    : 'text-gray-700'
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

