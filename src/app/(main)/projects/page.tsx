"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ExternalLink, Github, Star, Users, Plus, Search, ChevronDown, X } from 'lucide-react';

// Updated projects with creator and contributors
const projects = [
  {
    id: 1,
    title: 'XSS 패턴 자동 탐지 스캐너',
    description: 'Python 기반으로 URL의 XSS 취약점을 자동으로 탐지하는 도구',
    image: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Python', 'Flask', 'SQLAlchemy', 'Selenium'],
    category: '웹 해킹',
    status: '진행중',
    stars: 5,
    creator: { name: '김민준', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '김민준', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      { name: '이서연', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b098?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.15',
    github: 'https://github.com/ssg/vulnerability-scanner',
    demo: 'https://scanner.ssg.com'
  },
  {
    id: 2,
    title: 'SSG 동아리 홈페이지 & Hub 개발',
    description: 'Next.js와 TypeScript를 이용한 동아리 공식 웹사이트 및 Hub 구축',
    image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    category: '웹 개발',
    status: '진행중',
    stars: 12,

    creator: { name: '김민준', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '김민준', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      { name: '박지윤', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
      { name: '최현우', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.20',
    github: 'https://github.com/ssg/ctf-platform',
    demo: 'https://ctf.ssg.com'
  },
  {
    id: 3,
    title: '간단한 악성코드 분석 보고서',
    description: '멀웨어 해석에 새로운 동작 방식을 정적으로 분석하고 보고서를 작성합니다.',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Java', 'Android', 'Frida', 'JADX'],
    category: '리버싱',
    status: '완료',
    stars: 3,
    creator: { name: '박보안', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '박보안', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.10',
    github: 'https://github.com/ssg/mobile-analyzer',
    demo: null
  },
  {
    id: 4,
    title: 'Crypto Challenge Generator',
    description: '암호학 학습을 위한 문제 생성 도구입니다. RSA, AES, 해시 함수 등 다양한 암호 알고리즘의 문제를 자동으로 생성합니다.',
    image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Python', 'Cryptography', 'NumPy', 'Sage'],
    category: '포렌식',
    status: '계획중',
    stars: 98,
    creator: { name: '최유진', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '최유진', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face' },
      { name: '이민호', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face' },
      { name: '김선영', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=32&h=32&fit=crop&crop=face' },
      { name: '정수민', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.08',
    github: 'https://github.com/ssg/crypto-generator',
    demo: 'https://crypto.ssg.com'
  },
  {
    id: 5,
    title: 'Blockchain Security Audit Tool',
    description: '스마트 컨트랙트의 보안 취약점을 분석하는 도구입니다. Solidity 코드의 일반적인 보안 이슈를 자동으로 탐지합니다.',
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Solidity', 'Web3.js', 'Node.js', 'Mythril'],
    category: 'CTF',
    status: '진행중',
    stars: 67,
    creator: { name: '정현우', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '정현우', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=32&h=32&fit=crop&crop=face' },
      { name: '송미래', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b098?w=32&h=32&fit=crop&crop=face' },
      { name: '한진우', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.12',
    github: 'https://github.com/ssg/blockchain-audit',
    demo: null
  },
  {
    id: 6,
    title: 'Cloud Security Monitor',
    description: 'AWS, Azure, GCP 등 클라우드 환경의 보안 설정을 모니터링하고 취약점을 탐지하는 도구입니다.',
    image: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Python', 'Boto3', 'Terraform', 'Kubernetes'],
    category: '클라우드 보안',
    status: '계획중',
    stars: 134,
    creator: { name: '한소영', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '한소영', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
      { name: '권태현', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      { name: '이다은', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=32&h=32&fit=crop&crop=face' },
      { name: '박준혁', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' },
      { name: '김나영', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.18',
    github: 'https://github.com/ssg/cloud-monitor',
    demo: 'https://cloud.ssg.com'
  }
];

const categories = ['웹 해킹', '보안 도구', '웹 개발', '리버싱', '포렌식', 'CTF', '클라우드 보안'];
const statuses = ['진행중', '완료', '계획중'];

const getStatusColor = (status: string) => {
  switch (status) {
    case '완료': return 'bg-green-100 text-green-700 border-green-300';
    case '계획중': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case '진행중': return 'bg-blue-100 text-blue-700 border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// Updated Avatar Stack Component with Creator Attribution
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
  const otherContributorsCount = contributors.length - 1; // Exclude creator

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
              <img
                src={contributor.avatar}
                alt={contributor.name}
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

export default function Projects() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('최신순');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortOptions = ['최신순', '인기순', '이름순'];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSearchTerm('');
  };

  let filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(project.category);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(project.status);
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Sorting logic
  filteredProjects = filteredProjects.sort((a, b) => {
    switch (sortBy) {
      case '인기순':
        return b.stars - a.stars;
      case '이름순':
        return a.title.localeCompare(b.title);
      case '최신순':
      default:
        return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
    }
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#3A4DA1] mb-4">Projects</h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              동아리 멤버들이 만들어낸 결과물을 만나보세요.
            </p>
          </div>

          {/* Top Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between w-full">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="프로젝트 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-[#3A4DA1] focus:ring-1 focus:ring-[#3A4DA1] transition-colors"
                />
              </div>

              {/* Create Project Button */}
              <button className="bg-[#3A4DA1] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2d3a7a] transition-colors flex items-center gap-2 whitespace-nowrap">
                <Plus size={16} />
                새 프로젝트 만들기
              </button>
            </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex gap-8">
            {/* Sidebar Filter */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">프로젝트 상태</h3>
                  {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-[#3A4DA1] hover:underline"
                    >
                      전체
                    </button>
                  )}
                </div>

                {/* Status Filters */}
                <div className="space-y-3 mb-6">
                  {statuses.map((status) => (
                    <label key={status} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleStatusToggle(status)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                        selectedStatuses.includes(status)
                          ? 'bg-[#3A4DA1] border-[#3A4DA1]'
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
                <h4 className="text-base font-semibold text-gray-900 mb-3">카테고리</h4>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                        selectedCategories.includes(category)
                          ? 'bg-[#3A4DA1] border-[#3A4DA1]'
                          : 'border-gray-300'
                      }`}>
                        {selectedCategories.includes(category) && (
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort and Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold text-[#3A4DA1]">{filteredProjects.length}</span>개의 프로젝트
                  {searchTerm && ` (검색어: "${searchTerm}")`}
                </p>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                            sortBy === option ? 'text-[#3A4DA1] font-medium' : 'text-gray-700'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Project Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#3A4DA1] hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm border border-gray-200 text-[#3A4DA1] px-2 py-1 rounded-full text-xs font-medium">
                          {project.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{project.title}</h3>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">{project.description}</p>

                      {/* Contributors Avatar Stack with Creator Attribution */}
                      <div className="mb-3">
                        <AvatarStack 
                          creator={project.creator}
                          contributors={project.contributors} 
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <a 
                            href={project.github}
                            className="text-gray-400 hover:text-[#3A4DA1] transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github size={18} />
                          </a>
                          {project.demo && (
                            <a 
                              href={project.demo}
                              className="text-gray-400 hover:text-[#3A4DA1] transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}
                        </div>
                        <button className="bg-[#3A4DA1] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#2d3a7a] transition-colors">
                          자세히 보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">검색 조건에 맞는 프로젝트가 없습니다.</p>
                  <button 
                    onClick={clearAllFilters}
                    className="text-[#3A4DA1] hover:underline"
                  >
                    필터 초기화
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
