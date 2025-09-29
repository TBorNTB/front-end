"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Shield, Bug, Search, Lock, Globe, Code, Monitor, Smartphone, FileText, Target, Database, Cpu, ExternalLink, Github, Star, Users } from 'lucide-react';

const categories = [
  { name: '웹 해킹', slug: 'web-hacking', count: 5 },
  { name: '리버싱', slug: 'reversing', count: 3 },
  { name: '시스템 해킹', slug: 'system-hacking', count: 2 },
  { name: '디지털 포렌식', slug: 'digital-forensics', count: 2 },
  { name: '네트워크 보안', slug: 'network-security', count: 1 },
  { name: '악성코드 분석', slug: 'malware-analysis', count: 1 },
  { name: '암호학', slug: 'cryptography', count: 1 },
  { name: '모바일 해킹', slug: 'mobile-hacking', count: 0 },
  { name: '보안 관제', slug: 'security-monitoring', count: 0 },
  { name: '자료구조/알고리즘', slug: 'data-structures', count: 0 },
  { name: '운영체제', slug: 'operating-systems', count: 0 },
  { name: 'CTF', slug: 'ctf', count: 0 },
  { name: '개발 문화 & 커리어', slug: 'dev-culture', count: 1 },
  { name: '프로젝트', slug: 'projects', count: 0 }
];

// Updated topics array with correct counts
const topics = [
  // 웹 해킹 (5개)
  {
    id: 1,
    title: 'XSS 패턴 자동 탐지 스캐너',
    slug: 'xss-scanner',
    icon: <Bug size={48} className="text-[#193FD2]" />,
    description: 'Python 기반으로 URL의 XSS 취약점을 자동으로 탐지하는 도구',
    difficulty: '초급',
    duration: '4주',
    lessons: 12,
    tags: ['XSS', 'Python', 'Automation'],
    category: 'web-hacking'
  },
  {
    id: 2,
    title: 'SQL Injection 실습',
    slug: 'sql-injection',
    icon: <Database size={48} className="text-[#193FD2]" />,
    description: 'SQL Injection 공격 기법과 방어 방법 학습',
    difficulty: '초급',
    duration: '3주',
    lessons: 8,
    tags: ['SQL', 'Injection', 'Database'],
    category: 'web-hacking'
  },
  {
    id: 3,
    title: 'CSRF 공격과 방어',
    slug: 'csrf-defense',
    icon: <Shield size={48} className="text-[#193FD2]" />,
    description: 'Cross-Site Request Forgery 공격 원리와 보안 대책',
    difficulty: '중급',
    duration: '2주',
    lessons: 6,
    tags: ['CSRF', 'Security', 'Web'],
    category: 'web-hacking'
  },
  {
    id: 4,
    title: '파일 업로드 취약점',
    slug: 'file-upload-vuln',
    icon: <FileText size={48} className="text-[#193FD2]" />,
    description: '파일 업로드 기능의 보안 취약점과 대응 방안',
    difficulty: '중급',
    duration: '3주',
    lessons: 9,
    tags: ['File Upload', 'Bypass', 'Validation'],
    category: 'web-hacking'
  },
  {
    id: 5,
    title: 'Session Hijacking',
    slug: 'session-hijacking',
    icon: <Lock size={48} className="text-[#193FD2]" />,
    description: '세션 하이재킹 기법과 안전한 세션 관리',
    difficulty: '고급',
    duration: '4주',
    lessons: 15,
    tags: ['Session', 'Cookie', 'Authentication'],
    category: 'web-hacking'
  },
  
  // 리버싱 (3개)
  {
    id: 6,
    title: '리버싱 기초',
    slug: 'reversing-basics',
    icon: <Search size={48} className="text-[#193FD2]" />,
    description: '바이너리 분석 및 역공학 기초 개념',
    difficulty: '초급',
    duration: '6주',
    lessons: 18,
    tags: ['IDA Pro', 'Ghidra', 'Assembly'],
    category: 'reversing'
  },
  {
    id: 7,
    title: 'Packing & Unpacking',
    slug: 'packing-unpacking',
    icon: <Cpu size={48} className="text-[#193FD2]" />,
    description: '패킹된 바이너리 분석과 언패킹 기법',
    difficulty: '중급',
    duration: '4주',
    lessons: 12,
    tags: ['Packing', 'UPX', 'Analysis'],
    category: 'reversing'
  },
  {
    id: 8,
    title: 'Anti-Debugging 우회',
    slug: 'anti-debugging',
    icon: <Target size={48} className="text-[#193FD2]" />,
    description: '안티 디버깅 기법과 우회 방법',
    difficulty: '고급',
    duration: '5주',
    lessons: 20,
    tags: ['Debugging', 'Anti-Analysis', 'Bypass'],
    category: 'reversing'
  },

  // 시스템 해킹 (2개)
  {
    id: 9,
    title: 'Buffer Overflow',
    slug: 'buffer-overflow',
    icon: <Monitor size={48} className="text-[#193FD2]" />,
    description: '버퍼 오버플로우 공격과 익스플로잇 개발',
    difficulty: '고급',
    duration: '8주',
    lessons: 24,
    tags: ['Buffer Overflow', 'Exploit', 'Shellcode'],
    category: 'system-hacking'
  },
  {
    id: 10,
    title: 'ROP Chain 구성',
    slug: 'rop-chain',
    icon: <Code size={48} className="text-[#193FD2]" />,
    description: 'Return Oriented Programming 기법 학습',
    difficulty: '고급',
    duration: '6주',
    lessons: 18,
    tags: ['ROP', 'Gadget', 'Mitigation'],
    category: 'system-hacking'
  },

  // 디지털 포렌식 (2개)
  {
    id: 11,
    title: '메모리 포렌식',
    slug: 'memory-forensics',
    icon: <Database size={48} className="text-[#193FD2]" />,
    description: '메모리 덤프 분석과 디지털 증거 수집',
    difficulty: '중급',
    duration: '5주',
    lessons: 15,
    tags: ['Volatility', 'Memory', 'Analysis'],
    category: 'digital-forensics'
  },
  {
    id: 12,
    title: '네트워크 포렌식',
    slug: 'network-forensics',
    icon: <Globe size={48} className="text-[#193FD2]" />,
    description: '네트워크 트래픽 분석과 침해 사고 대응',
    difficulty: '중급',
    duration: '4주',
    lessons: 12,
    tags: ['Wireshark', 'PCAP', 'Incident Response'],
    category: 'digital-forensics'
  },

  // 네트워크 보안 (1개)
  {
    id: 13,
    title: '네트워크 보안',
    slug: 'network-security',
    icon: <Globe size={48} className="text-[#193FD2]" />,
    description: '네트워크 보안 및 패킷 분석 기법',
    difficulty: '초급',
    duration: '4주',
    lessons: 12,
    tags: ['Wireshark', 'Nmap', 'Firewall', 'VPN'],
    category: 'network-security'
  },

  // 악성코드 분석 (1개)
  {
    id: 14,
    title: '악성코드 분석',
    slug: 'malware-analysis',
    icon: <Shield size={48} className="text-[#193FD2]" />,
    description: '멀웨어 동적/정적 분석 기법',
    difficulty: '고급',
    duration: '6주',
    lessons: 20,
    tags: ['Malware', 'Sandbox', 'Behavioral Analysis'],
    category: 'malware-analysis'
  },

  // 암호학 (1개)
  {
    id: 15,
    title: '암호학',
    slug: 'cryptography',
    icon: <Lock size={48} className="text-[#193FD2]" />,
    description: '현대 암호학 이론 및 암호 시스템 분석',
    difficulty: '중급',
    duration: '5주',
    lessons: 15,
    tags: ['RSA', 'AES', 'Hash Functions', 'Digital Signatures'],
    category: 'cryptography'
  },

  // 개발 문화 & 커리어 (1개)
  {
    id: 16,
    title: '보안 개발자 커리어',
    slug: 'security-career',
    icon: <Users size={48} className="text-[#193FD2]" />,
    description: '보안 분야 개발자로서의 커리어 패스와 전망',
    difficulty: '초급',
    duration: '2주',
    lessons: 8,
    tags: ['Career', 'Development', 'Security Industry'],
    category: 'dev-culture'
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
    github: 'https://github.com/ssg/xss-scanner'
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
    github: 'https://github.com/ssg/website'
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
    readTime: '8분'
  },
  {
    id: 2,
    title: 'IDA Pro를 이용한 바이너리 분석',
    description: 'IDA Pro 도구를 활용한 효과적인 바이너리 리버싱 기법',
    category: '리버싱',
    author: '이해커',
    publishDate: '2024.01.10',
    readTime: '12분'
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case '초급': return 'bg-green-100 text-green-700 border-green-300';
    case '중급': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case '고급': return 'bg-red-100 text-red-700 border-red-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case '완료': return 'bg-green-100 text-green-700 border-green-300';
    case '계획중': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case '진행중': return 'bg-blue-100 text-blue-700 border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export default function Learning() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category') || '';
  const [activeTab, setActiveTab] = useState('intro'); // 'intro' or 'activities'
  
  // Filter topics based on selected category
  const filteredTopics = selectedCategory 
    ? topics.filter(topic => topic.category === selectedCategory)
    : topics;

  const handleCategoryClick = (categorySlug: string) => {
    if (categorySlug === selectedCategory) {
      router.push('/learning');
    } else {
      router.push(`/learning?category=${categorySlug}`);
    }
  };

  const renderIntroContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTopics.map((topic) => (
        <div key={topic.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#3A4DA1] hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="text-center mb-6">
            <div className="bg-gray-50 border border-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {topic.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{topic.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs border ${getDifficultyColor(topic.difficulty)}`}>
                {topic.difficulty}
              </span>
              <div className="text-gray-500 text-xs">
                {topic.duration} • {topic.lessons}강의
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {topic.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className="bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {topic.tags.length > 3 && (
                <span className="text-gray-400 text-xs px-1">+{topic.tags.length - 3}</span>
              )}
            </div>

            <button className="w-full bg-[#3A4DA1] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#2d3a7a] transition-colors">
              학습 시작하기
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderActivitiesContent = () => (
    <div className="space-y-8">
      {/* Projects Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">프로젝트</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#3A4DA1] hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h4>
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
                  className="text-gray-400 hover:text-[#3A4DA1] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={18} />
                </a>
                <button className="bg-[#3A4DA1] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#2d3a7a] transition-colors">
                  자세히 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Articles Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">아티클</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#3A4DA1] hover:shadow-lg transition-all duration-200">
              <div className="mb-4">
                <span className="bg-[#3A4DA1]/10 text-[#3A4DA1] px-2 py-1 rounded-full text-xs font-medium">
                  {article.category}
                </span>
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-2">{article.title}</h4>
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
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#3A4DA1] mb-4">러닝</h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              컴퓨터 프로그램을 역으로 분석하여 소스 코드의 구조와 동작 원리를 파악하는 기술입니다.
            </p>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex space-x-8 border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('intro')}
                className={`py-3 px-1 border-b-2 text-sm transition-colors ${
                  activeTab === 'intro'
                    ? 'border-[#3A4DA1] text-[#3A4DA1] font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                소개
              </button>
              <button 
                onClick={() => setActiveTab('activities')}
                className={`py-3 px-1 border-b-2 text-sm transition-colors ${
                  activeTab === 'activities'
                    ? 'border-[#3A4DA1] text-[#3A4DA1] font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                주요 활동
              </button>
            </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex gap-8">
            {/* Sidebar - Only show for intro tab */}
            {activeTab === 'intro' && (
              <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">카테고리</h3>
                  </div>
                  <div className="p-2">
                    {categories.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => handleCategoryClick(category.slug)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedCategory === category.slug
                            ? 'bg-[#3A4DA1] text-white font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          selectedCategory === category.slug
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className={`flex-1 ${activeTab === 'activities' ? 'max-w-none' : ''}`}>
              {activeTab === 'intro' && selectedCategory && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {categories.find(cat => cat.slug === selectedCategory)?.name}
                    </h2>
                    <span className="text-sm text-gray-500">
                      ({filteredTopics.length}개 과정)
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'intro' ? renderIntroContent() : renderActivitiesContent()}

              {activeTab === 'intro' && filteredTopics.length === 0 && selectedCategory && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    {categories.find(cat => cat.slug === selectedCategory)?.name} 카테고리에 등록된 강의가 없습니다.
                  </p>
                  <button 
                    onClick={() => router.push('/learning')}
                    className="text-[#3A4DA1] hover:underline"
                  >
                    모든 강의 보기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
