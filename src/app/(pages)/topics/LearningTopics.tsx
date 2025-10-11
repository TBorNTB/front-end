// app/(pages)/topics/TopicsClient.tsx
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Github, Star, Users } from 'lucide-react';

const categories = [
  { 
    name: '웹 해킹', 
    slug: 'web-hacking', 
    articles: 3, 
    projects: 2,
    description: 'SQL Injection, XSS, CSRF 등 웹 애플리케이션 보안 취약점 분석 및 대응'
  },
  { 
    name: '리버싱', 
    slug: 'reversing', 
    articles: 3, 
    projects: 2,
    description: '바이너리 분석, 역공학 기술을 통한 소프트웨어 구조 분석 및 이해'
  },
  { 
    name: '시스템 해킹', 
    slug: 'system-hacking', 
    articles: 3, 
    projects: 2,
    description: 'Buffer Overflow, ROP 등 시스템 레벨 취약점 분석 및 익스플로잇 개발'
  },
  { 
    name: '디지털 포렌식', 
    slug: 'digital-forensics', 
    articles: 3, 
    projects: 2,
    description: '디지털 증거 수집 및 분석, 사고 대응을 위한 포렌식 기법'
  },
  { 
    name: '네트워크 보안', 
    slug: 'network-security', 
    articles: 3, 
    projects: 2,
    description: '네트워크 트래픽 분석, 침입 탐지 및 방화벽 보안 기술'
  },
  { 
    name: '악성코드 분석', 
    slug: 'malware-analysis', 
    articles: 3, 
    projects: 2,
    description: '멀웨어 정적/동적 분석 기법 및 행위 분석을 통한 보안 위협 탐지'
  },
  { 
    name: '암호학', 
    slug: 'cryptography', 
    articles: 3, 
    projects: 2,
    description: '현대 암호학 이론, 암호 시스템 분석 및 보안 프로토콜 구현'
  },
  { 
    name: '모바일 해킹', 
    slug: 'mobile-hacking', 
    articles: 0, 
    projects: 0,
    description: 'Android/iOS 앱 보안 분석 및 모바일 플랫폼 취약점 연구'
  },
  { 
    name: '보안 관제', 
    slug: 'security-monitoring', 
    articles: 0, 
    projects: 0,
    description: '보안 운영센터(SOC) 운영 및 실시간 보안 위협 모니터링'
  },
  { 
    name: '자료구조/알고리즘', 
    slug: 'data-structures', 
    articles: 0, 
    projects: 0,
    description: '보안 분야에 필요한 기본적인 자료구조 및 알고리즘 이해'
  },
  { 
    name: '운영체제', 
    slug: 'operating-systems', 
    articles: 0, 
    projects: 0,
    description: 'Linux/Windows 시스템 보안 및 커널 레벨 보안 기술'
  },
  { 
    name: 'CTF', 
    slug: 'ctf', 
    articles: 0, 
    projects: 0,
    description: 'Capture The Flag 대회 참여 및 문제 해결 전략'
  },
  { 
    name: '개발 문화 & 커리어', 
    slug: 'dev-culture', 
    articles: 3, 
    projects: 2,
    description: '보안 개발자로서의 커리어 성장과 업계 동향 분석'
  },
  { 
    name: '프로젝트', 
    slug: 'projects', 
    articles: 0, 
    projects: 0,
    description: 'SSG 동아리 공식 프로젝트 및 협업 개발 활동'
  }
];

// Mock data for projects and articles
const projects = [
  {
    id: 1,
    title: 'XSS 패턴 자동 탐지 스캐너',
    description: 'Python 기반으로 URL의 XSS 취약점을 자동으로 탐지하는 도구',
    category: '웹 해킹',
    status: '진행중',
    stars: 5,
    contributors: 2,
    author: '김민준 등 2명',
    github: 'https://github.com/ssg/xss-scanner',
    categorySlug: 'web-hacking'
  },
  {
    id: 2,
    title: 'SSG 동아리 홈페이지 & Hub 개발',
    description: 'Next.js와 TypeScript를 이용한 동아리 공식 웹사이트 및 Hub 구축',
    category: '웹 개발',
    status: '진행중',
    stars: 12,
    contributors: 3,
    author: '김민준 등 3명',
    github: 'https://github.com/ssg/website',
    categorySlug: 'dev-culture'
  }
];

const articles = [
  {
    id: 1,
    title: 'SQL Injection 공격 기법 분석',
    description: 'SQL Injection 공격의 다양한 유형과 실제 사례 분석',
    category: '웹 해킹',
    author: '박보안',
    publishDate: '2024.01.15',
    readTime: '8분',
    categorySlug: 'web-hacking'
  },
  {
    id: 2,
    title: 'IDA Pro를 이용한 바이너리 분석',
    description: 'IDA Pro 도구를 활용한 효과적인 바이너리 리버싱 기법',
    category: '리버싱',
    author: '이해커',
    publishDate: '2024.01.10',
    readTime: '12분',
    categorySlug: 'reversing'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case '완료': return 'bg-success/10 text-success border-success/30';
    case '계획중': return 'bg-warning/10 text-warning border-warning/30';
    case '진행중': return 'bg-primary-100 text-primary-700 border-primary-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export function TopicsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category') || '';
  
  const handleCategoryClick = (categorySlug: string) => {
    if (categorySlug === selectedCategory) {
      router.push('/topics');
    } else {
      router.push(`/topics?category=${categorySlug}`);
    }
  };

  // Filter projects and articles based on selected category
  const filteredProjects = selectedCategory 
    ? projects.filter(project => project.categorySlug === selectedCategory)
    : projects;
    
  const filteredArticles = selectedCategory 
    ? articles.filter(article => article.categorySlug === selectedCategory)
    : articles;

  const renderAllCategories = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div 
          key={category.slug} 
          className="card cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          onClick={() => handleCategoryClick(category.slug)}
        >
          <div className="text-center mb-4">
            <div className="bg-primary-50 border border-primary-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {category.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">아티클</span>
              <span className={`font-medium ${category.articles > 0 ? 'text-primary-600' : 'text-gray-400'}`}>
                {category.articles}개
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">프로젝트</span>
              <span className={`font-medium ${category.projects > 0 ? 'text-primary-600' : 'text-gray-400'}`}>
                {category.projects}개
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCategoryActivities = () => (
    <div className="space-y-8">
      {/* Projects Section */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">프로젝트</h3>
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="card hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-foreground mb-2">{project.title}</h4>
                    <p className="text-gray-600 text-sm">{project.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs border ml-4 ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-gray-500 text-xs mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Star size={12} />
                      <span>{project.stars}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={12} />
                      <span>{project.contributors}</span>
                    </div>
                  </div>
                  <span>by {project.author}</span>
                </div>

                <div className="flex justify-between items-center">
                  <a 
                    href={project.github}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={18} />
                  </a>
                  <button className="btn btn-primary text-xs">
                    자세히 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-500">이 카테고리에 등록된 프로젝트가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Articles Section */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">아티클</h3>
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="card hover:shadow-lg transition-all duration-200">
                <div className="mb-4">
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
                
                <h4 className="text-lg font-bold text-foreground mb-2">{article.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{article.description}</p>
                
                <div className="flex items-center justify-between text-gray-500 text-xs">
                  <span>by {article.author}</span>
                  <div className="flex items-center space-x-2">
                    <span>{article.publishDate}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-500">이 카테고리에 등록된 아티클이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">Learning Topics</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            사이버보안의 다양한 분야를 탐구하고 실무 경험을 쌓을 수 있는 학습 주제들을 확인하세요.
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Sidebar - Only show when a category is selected */}
          {selectedCategory && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-primary-200 sticky top-8">
                <div className="p-4 border-b border-primary-200">
                  <h3 className="font-semibold text-foreground">전체 카테고리</h3>
                </div>
                <div className="p-2 max-h-96 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => handleCategoryClick(category.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCategory === category.slug
                          ? 'bg-primary-500 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedCategory === category.slug
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {category.articles + category.projects}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1">
            {selectedCategory ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-2xl font-semibold text-foreground">
                      {categories.find(cat => cat.slug === selectedCategory)?.name}
                    </h2>
                    <button 
                      onClick={() => router.push('/topics')}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      ← 전체 카테고리 보기
                    </button>
                  </div>
                </div>
                {renderCategoryActivities()}
              </div>
            ) : (
              renderAllCategories()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
