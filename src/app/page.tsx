'use client';

import { ArticleCardHome } from "@/components/landing/ArticleCardHome";
import { FeaturedProjectCard } from "@/components/landing/FeaturedCardHome";
import HeroBanner from "@/components/landing/HeroBanner";
import { ProjectCardHome } from "@/components/landing/ProjectCardHome";
import StatisticsSection from "@/components/landing/Statistics";
import Topics from "@/components/landing/Topics";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { BASE_URL } from "@/lib/api/config";
import ChatBot from "@/app/(main)/chatbot/ChatBot";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from "react";

// API Response Types
interface ApiProject {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  projectStatus: string;
  projectCategories: string[];
  projectTechStacks: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
}

interface ApiArticle {
  id: string;
  content: {
    title: string;
    summary: string;
    content: string;
    category: string;
  };
  thumbnailPath: string;
  writerId: string;
  participantIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
}

// Component Data Types
interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  technologies: string[];
  thumbnailImage: string;
  viewText: string;
  likes?: number;
  views?: number;
}

interface ProjectCard {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  collaborators: { profileImage: string }[];
  likes: number;
  views?: number;
  techStacks?: string[];
}

// Helper function to convert API status to component status
const convertStatus = (apiStatus: string): string => {
  switch (apiStatus) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Active';
    case 'PLANNING':
      return 'Planning';
    default:
      return apiStatus;
  }
};

// Helper function to validate image URL
const isValidImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') return null;
  if (url.trim() === '' || url === 'string' || url === 'null' || url === 'undefined') return null;
  
  // 상대 경로는 유효함 (/, /images/...)
  if (url.startsWith('/')) return url;
  
  // 절대 URL 검사
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
};

// Article Component Data Types
interface ArticleCard {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    profileImage: string;
  };
  category: string;
  thumbnailImage: string;
  likes: number;
  views: number;
  tags?: string[];
}

export default function Home() {
  const [featuredProject, setFeaturedProject] = useState<FeaturedProject | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Articles state
  const [allArticles, setAllArticles] = useState<ArticleCard[]>([]);
  const [articleIndex, setArticleIndex] = useState(0);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  
  // 현재 표시할 프로젝트들 (3개씩)
  const projectsData = allProjects.slice(currentIndex, currentIndex + 3);
  const hasMore = currentIndex + 3 < allProjects.length;
  const hasPrevious = currentIndex > 0;
  
  const handleNext = () => {
    const nextIndex = currentIndex + 3;
    if (nextIndex < allProjects.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(0);
    }
  };
  
  const handlePrevious = () => {
    const prevIndex = currentIndex - 3;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
    } else {
      // 처음이면 마지막으로
      const lastPage = Math.floor((allProjects.length - 1) / 3) * 3;
      setCurrentIndex(lastPage);
    }
  };
  
  // Articles navigation
  const articlesData = allArticles.slice(articleIndex, articleIndex + 2);
  const hasMoreArticles = articleIndex + 2 < allArticles.length;
  const hasPreviousArticles = articleIndex > 0;
  
  const handleNextArticle = () => {
    const nextIndex = articleIndex + 2;
    if (nextIndex < allArticles.length) {
      setArticleIndex(nextIndex);
    } else {
      setArticleIndex(0);
    }
  };
  
  const handlePreviousArticle = () => {
    const prevIndex = articleIndex - 2;
    if (prevIndex >= 0) {
      setArticleIndex(prevIndex);
    } else {
      const lastPage = Math.floor((allArticles.length - 1) / 2) * 2;
      setArticleIndex(lastPage);
    }
  };

  // Fetch latest projects from API
  useEffect(() => {
    const fetchLatestProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${BASE_URL}/elastic-service/api/elastic/project/search/latest?size=10&page=0`,
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch latest projects');
        }

        const data: ApiProject[] = await response.json();

        if (data && data.length > 0) {
          // Set featured project (first one)
          const firstProject = data[0];
          const validThumbnail = isValidImageUrl(firstProject.thumbnailUrl);
          setFeaturedProject({
            id: firstProject.id,
            title: firstProject.title,
            description: firstProject.description,
            category: firstProject.projectCategories?.[0] || '프로젝트',
            status: 'LATEST PROJECT',
            technologies: firstProject.projectTechStacks || [],
            thumbnailImage: validThumbnail || '',
            viewText: '자세히 보기',
            likes: firstProject.likeCount,
            views: firstProject.viewCount,
          });

          // Set all projects (remaining projects after featured, max 9)
          const remainingProjects = data.slice(1, 10).map((project) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            status: convertStatus(project.projectStatus),
            category: project.projectCategories?.[0] || '프로젝트',
            collaborators: [], // API에 없으므로 빈 배열
            likes: project.likeCount || 0,
            views: project.viewCount,
            techStacks: project.projectTechStacks || [],
          }));

          setAllProjects(remainingProjects);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error('Error fetching latest projects:', err);
        setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
        
        // Fallback to default data on error
        setFeaturedProject({
          id: "featured-1",
          title: "Open Source Intelligence (OSINT) Dashboard",
          description: "A web-based dashboard that aggregates and visualizes publicly available data from various online sources",
          category: "오픈소스",
          status: "LATEST PROJECT",
          technologies: ["Python", "Elasticsearch", "React", "MongoDB"],
          thumbnailImage: "/images/projects/osint-dashboard.jpg",
          viewText: "자세히 보기"
        });
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProjects();
  }, []);

  // Fetch latest articles from API
  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        setArticlesLoading(true);
        setArticlesError(null);

        const response = await fetch(
          `${BASE_URL}/elastic-service/api/elastic/news/search/latest?page=0&size=10`,
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch latest articles');
        }

        const data: ApiArticle[] = await response.json();

        if (data && data.length > 0) {
          const articles = data.map((article) => {
            const validThumbnail = isValidImageUrl(article.thumbnailPath);
            return {
              id: article.id,
              title: article.content.title,
              description: article.content.summary || article.content.content?.substring(0, 150) || '',
              author: {
                name: article.writerId || '작성자',
                profileImage: '', // API에 프로필 이미지가 없음
              },
              category: article.content.category || '기타',
              thumbnailImage: validThumbnail || '',
              likes: article.likeCount || 0,
              views: article.viewCount || 0,
              tags: article.tags || [],
            };
          });

          setAllArticles(articles);
          setArticleIndex(0);
        }
      } catch (err) {
        console.error('Error fetching latest articles:', err);
        setArticlesError('아티클을 불러오는 중 오류가 발생했습니다.');
        setAllArticles([]);
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchLatestArticles();
  }, []);

  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      const sectionId = hash.replace('#', '');
      
      // Wait for page to fully load
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          const headerOffset = 80; // Height of sticky header
          const elementPosition = section.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 300); // Increased timeout for better reliability
    }
  }, []);

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <div className="w-screen text-center text-3xl text-white sm:h-[250px] md:h-[400px]">
          <HeroBanner />
        </div>
        <StatisticsSection />

        {/* ✅ Make sure Topics component has id="topics" */}
        <Topics />

        {/* Latest Project Section */}
        <section className="section bg-gray-50">
          <div className="container">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-gray-600">프로젝트를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
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
                    <p className="text-gray-600 text-lg mb-6">
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

                {/* Projects Grid */}
                {allProjects.length > 0 && (
                  <div className="mt-16">
                    <div className="relative px-12 lg:px-16">
                      {/* Navigation Buttons - Desktop */}
                      {allProjects.length > 3 && (
                        <>
                          {/* Previous Button */}
                          <button
                            onClick={handlePrevious}
                            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10"
                            aria-label="이전 프로젝트 보기"
                          >
                            <ChevronLeft className="w-6 h-6 text-primary-600" />
                          </button>
                          
                          {/* Next Button */}
                          <button
                            onClick={handleNext}
                            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10"
                            aria-label="다음 프로젝트 보기"
                          >
                            <ChevronRight className="w-6 h-6 text-primary-600" />
                          </button>
                        </>
                      )}
                      
                      {/* Projects Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projectsData.map((project) => (
                          <ProjectCardHome key={project.id} project={project} />
                        ))}
                      </div>
                    </div>
                    
                    {/* Page Indicator */}
                    {allProjects.length > 3 && (
                      <div className="mt-8 flex justify-center items-center gap-3">
                        <button
                          onClick={handlePrevious}
                          disabled={!hasPrevious}
                          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                            hasPrevious
                              ? 'bg-white border-primary-300 hover:bg-primary-50 hover:border-primary-500 cursor-pointer'
                              : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                          }`}
                          aria-label="이전"
                        >
                          <ChevronLeft className={`w-5 h-5 ${hasPrevious ? 'text-primary-600' : 'text-gray-400'}`} />
                        </button>
                        
                        <div className="flex gap-2">
                          {Array.from({ length: Math.ceil(allProjects.length / 3) }).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentIndex(index * 3)}
                              className={`h-2 rounded-full transition-all ${
                                Math.floor(currentIndex / 3) === index
                                  ? 'bg-primary-500 w-8'
                                  : 'bg-gray-300 hover:bg-gray-400 w-2'
                              }`}
                              aria-label={`페이지 ${index + 1}`}
                            />
                          ))}
                        </div>
                        
                        <button
                          onClick={handleNext}
                          disabled={!hasMore && currentIndex === 0}
                          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                            hasMore || currentIndex > 0
                              ? 'bg-white border-primary-300 hover:bg-primary-50 hover:border-primary-500 cursor-pointer'
                              : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                          }`}
                          aria-label="다음"
                        >
                          <ChevronRight className={`w-5 h-5 ${hasMore || currentIndex > 0 ? 'text-primary-600' : 'text-gray-400'}`} />
                        </button>
                      </div>
                    )}
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
            <p className="text-gray-600 mb-12">Stay informed with expert insights</p>
            
            {articlesLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-gray-600">아티클을 불러오는 중...</p>
              </div>
            ) : articlesError ? (
              <div className="text-center py-12">
                <p className="text-red-500">{articlesError}</p>
              </div>
            ) : allArticles.length > 0 ? (
              <div>
                <div className="relative px-12 lg:px-16">
                  {/* Navigation Buttons - Desktop */}
                  {allArticles.length > 2 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={handlePreviousArticle}
                        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10"
                        aria-label="이전 아티클 보기"
                      >
                        <ChevronLeft className="w-6 h-6 text-primary-600" />
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={handleNextArticle}
                        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-primary-300 items-center justify-center hover:bg-primary-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md z-10"
                        aria-label="다음 아티클 보기"
                      >
                        <ChevronRight className="w-6 h-6 text-primary-600" />
                      </button>
                    </>
                  )}
                  
                  {/* Articles Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {articlesData.map((article) => (
                      <ArticleCardHome key={article.id} article={article} />
                    ))}
                  </div>
                </div>
                
                {/* Page Indicator */}
                {allArticles.length > 2 && (
                  <div className="mt-8 flex justify-center items-center gap-3">
                    <button
                      onClick={handlePreviousArticle}
                      disabled={!hasPreviousArticles}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                        hasPreviousArticles
                          ? 'bg-white border-primary-300 hover:bg-primary-50 hover:border-primary-500 cursor-pointer'
                          : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                      }`}
                      aria-label="이전"
                    >
                      <ChevronLeft className={`w-5 h-5 ${hasPreviousArticles ? 'text-primary-600' : 'text-gray-400'}`} />
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: Math.ceil(allArticles.length / 2) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setArticleIndex(index * 2)}
                          className={`h-2 rounded-full transition-all ${
                            Math.floor(articleIndex / 2) === index
                              ? 'bg-primary-500 w-8'
                              : 'bg-gray-300 hover:bg-gray-400 w-2'
                          }`}
                          aria-label={`페이지 ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={handleNextArticle}
                      disabled={!hasMoreArticles && articleIndex === 0}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                        hasMoreArticles || articleIndex > 0
                          ? 'bg-white border-primary-300 hover:bg-primary-50 hover:border-primary-500 cursor-pointer'
                          : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                      }`}
                      aria-label="다음"
                    >
                      <ChevronRight className={`w-5 h-5 ${hasMoreArticles || articleIndex > 0 ? 'text-primary-600' : 'text-gray-400'}`} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">표시할 아티클이 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <ChatBot />
      <Footer />
    </>
  );
}
