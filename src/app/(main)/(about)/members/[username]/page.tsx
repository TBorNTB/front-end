// app/(routes)/members/[username]/page.tsx

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import TitleBanner from '@/components/layout/TitleBanner';

interface MemberPageProps {
  params: Promise<{ username: string }>;
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { username } = await params;

  // TODO: Replace with actual API call
  const member = {
    username: username,
    name: '김동현',
    email: 'member@ssg.com',
    role: '운영진',
    profileImage: null,
    bio: 'React와 TypeScript를 사용하는 프론트엔드 개발자입니다.',
    joinDate: '2024-01-15',
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js'],
  };

  // Mock data for navigation
  const navItems = [
    { label: 'Projects', count: 3, active: false },
    { label: 'Articles', count: 0, active: false },
    { label: 'Badges', count: 0, active: false },
  ];

  // Mock projects data
  const projects = [
    {
      id: 1,
      title: 'SSG 동아리 홈페이지 개발',
      category: '웹 개발',
      image: null,
    },
    {
      id: 2,
      title: '실시간 투표 앱 개발',
      category: '웹 개발',
      image: null,
    },
    {
      id: 3,
      title: '교내 공지사항 알리미 봇',
      category: '자동화',
      image: null,
    },
  ];

  // Mock articles data
  const articles = [
    {
      id: 1,
      title: 'Dreamhack \'Simple Board\' 문제 풀이 (Write-up)',
      category: '스터디 노트',
      image: null,
    },
    {
      id: 2,
      title: 'zustand를 이용한 간단한 상태 관리',
      category: '스터디 노트',
      image: null,
    },
    {
      id: 3,
      title: 'CSRF 토큰은 어떻게 동작하는가? 상세 분석',
      category: '스터디 노트',
      image: null,
    },
    {
      id: 4,
      title: '효과적인 코드 리뷰를 위한 5가지 팁',
      category: '스터디 노트',
      image: null,
    },
  ];

  if (!member) {
    notFound();
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TitleBanner
        title="Member Profile"
        description="SSG 멤버의 프로필과 활동을 확인하세요."
        backgroundImage="/images/BgHeader.png"
      />
      <div className="container flex-1 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Left Sidebar - Fixed, Compact */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              {/* Single Combined Card */}
              <div className="card">
                {/* Profile Section - Compact */}
                <div className="pb-4">
                  {/* Profile Image - Smaller */}
                  <div className="flex justify-center mb-3">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-primary-200">
                      {member.profileImage ? (
                        <Image
                          src={member.profileImage}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member Info - Compact */}
                  <div className="text-center">
                    <h1 className="text-lg font-bold text-foreground mb-1">
                      {member.name}
                    </h1>
                    <p className="text-xs text-gray-500 mb-2">
                      @{member.username}
                    </p>
                    
                    {/* Role Badge - Compact */}
                    <div className="flex justify-center gap-1 mb-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        {member.role}
                      </span>
                    </div>

                    {/* Social Links - Compact */}
                    <div className="flex justify-center gap-2 text-gray-600">
                      <button className="hover:text-primary-600 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </button>
                      <button className="hover:text-primary-600 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </button>
                      <button className="hover:text-primary-600 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider - Thinner */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Stats Section - Compact */}
                <div className="pb-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xl font-bold text-primary-600">{projects.length}</p>
                      <p className="text-xs text-gray-600">프로젝트</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-primary-600">{articles.length}</p>
                      <p className="text-xs text-gray-600">CS지식</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-primary-600">3</p>
                      <p className="text-xs text-gray-600">뱃지</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Navigation Section - Compact */}
                <div className="pb-4">
                  <h3 className="text-xs font-bold text-gray-900 mb-2">
                    획득 뱃지
                  </h3>
                  <ul className="space-y-1">
                    {navItems.map((item, index) => (
                      <li key={index}>
                        <button
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                            item.active
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{item.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Skills Section - Compact */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 mb-2">
                    주요 기술
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>


          {/* Main Content - Scrollable */}
          <main className="lg:col-span-9">
            {/* Welcome Message */}
            <div className="card mb-8 bg-gradient-to-r from-primary-50 to-secondary-50 border-l-4 border-primary-500">
              <h2 className="text-xl font-bold text-foreground mb-2">
                안녕하세요, SSG 2021 김동현입니다.
              </h2>
              <p className="text-gray-700">
                사용자의 중심으로 우수한 레퍼런스를 프로젝트 구축하고 있습니다. 
                모든 활동들을 통합해 TypeScript로 지속할 수 있으며 종용할 수 있습니다.
              </p>
              <p className="text-gray-700 mt-2">
                팀 프로젝트 기술 풀스택 등록하지, 그리고 같이 발전할 것들을 지원해오고 공유합니다.
              </p>
            </div>

            {/* Projects Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                참여한 프로젝트
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="card hover:shadow-lg transition-shadow group"
                  >
                    {/* Project Image */}
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-4xl">📹</span>
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                        {project.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      프로젝트에 대한 간단한 설명이 들어갑니다. 최대 2줄까지 표시됩니다.
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Articles Section */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                작성한 CS지식
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="card hover:shadow-lg transition-shadow group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-secondary-600 bg-secondary-50 px-2 py-1 rounded">
                        카테고리
                      </span>
                      <span className="text-xs text-gray-500">학습일지</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      CS지식 내용에 대한 미리보기 텍스트가 여기에 표시됩니다. 긴 내용은 2줄까지만 표시되고 나머지는 생략됩니다...
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium text-gray-900">{member.name}</span>
                        <span className="text-gray-300">•</span>
                        <span>2024.11.12</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-500">
                        <span>🔥 10</span>
                        <span>💬 2</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: MemberPageProps) {
  const { username } = await params;

  return {
    title: `${username} - SSG Members`,
    description: `View ${username}'s profile, projects, and articles on SSG`,
  };
}
