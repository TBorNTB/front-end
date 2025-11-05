"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ExternalLink, Github, Grid, List, Plus, Search, ChevronDown, X } from 'lucide-react';
import { CategoryType, CategoryHelpers } from '@/app/(main)/topics/types/category';

// Updated projects with topic mapping
const projects = [
  {
    id: 1,
    title: 'SQL 인젝션 취약점 스캐너',
    description: 'Python 기반으로 URL의 XSS 취약점을 자동으로 탐지하는 도구',
    image: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Python', 'Flask', 'SQLAlchemy', 'Selenium'],
    category: '웹 해킹',
    topicSlug: 'web-hacking', // Added topic mapping
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
    title: 'XSS 방어 라이브러리',
    description: 'Cross-Site Scripting 공격을 방어하는 JavaScript 라이브러리',
    image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['JavaScript', 'TypeScript', 'Security', 'Web'],
    category: '웹 해킹',
    topicSlug: 'web-hacking',
    status: '진행중',
    stars: 12,
    creator: { name: '김민준', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '김민준', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      { name: '박지윤', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
      { name: '최현우', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.20',
    github: 'https://github.com/ssg/xss-defense',
    demo: 'https://xss-defense.ssg.com'
  },
  {
    id: 3,
    title: '악성코드 분석 보고서',
    description: '멀웨어 해석에 새로운 동작 방식을 정적으로 분석하고 보고서를 작성합니다.',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['IDA Pro', 'Ghidra', 'Assembly', 'Malware'],
    category: '리버싱',
    topicSlug: 'reversing',
    status: '완료',
    stars: 3,
    creator: { name: '박보안', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '박보안', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.10',
    github: 'https://github.com/ssg/malware-analyzer',
    demo: null
  },
  {
    id: 4,
    title: 'Buffer Overflow 익스플로잇 도구',
    description: '시스템 레벨 취약점을 분석하고 익스플로잇을 개발하는 도구입니다.',
    image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['C', 'Assembly', 'GDB', 'Pwntools'],
    category: '시스템 해킹',
    topicSlug: 'system-hacking',
    status: '계획중',
    stars: 8,
    creator: { name: '최유진', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '최유진', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face' },
      { name: '이민호', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.08',
    github: 'https://github.com/ssg/buffer-overflow-tool',
    demo: null
  },
  {
    id: 5,
    title: '디지털 포렌식 분석 툴킷',
    description: '디지털 증거 수집 및 분석을 위한 통합 도구입니다.',
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Python', 'Volatility', 'Autopsy', 'Wireshark'],
    category: '디지털 포렌식',
    topicSlug: 'digital-forensics',
    status: '진행중',
    stars: 15,
    creator: { name: '정현우', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '정현우', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=32&h=32&fit=crop&crop=face' },
      { name: '송미래', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b098?w=32&h=32&fit=crop&crop=face' },
      { name: '한진우', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.12',
    github: 'https://github.com/ssg/forensics-toolkit',
    demo: null
  },
  {
    id: 6,
    title: '네트워크 침입 탐지 시스템',
    description: '네트워크 트래픽을 분석하여 침입을 탐지하고 차단하는 시스템입니다.',
    image: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Python', 'Scapy', 'iptables', 'Suricata'],
    category: '네트워크 보안',
    topicSlug: 'network-security',
    status: '완료',
    stars: 23,
    creator: { name: '한소영', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '한소영', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
      { name: '권태현', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      { name: '이다은', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.18',
    github: 'https://github.com/ssg/network-ids',
    demo: 'https://ids.ssg.com'
  },
  {
    id: 7,
    title: 'IoT 디바이스 펌웨어 분석기',
    description: 'IoT 기기의 펌웨어를 추출하고 보안 취약점을 분석하는 도구입니다.',
    image: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Python', 'Binwalk', 'UART', 'ARM'],
    category: 'IoT보안',
    topicSlug: 'iot-security',
    status: '진행중',
    stars: 11,
    creator: { name: '김도현', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '김도현', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
      { name: '박수진', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b098?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.14',
    github: 'https://github.com/ssg/iot-firmware-analyzer',
    demo: null
  },
  {
    id: 8,
    title: 'RSA 암호 구현 및 분석',
    description: 'RSA 암호 알고리즘을 구현하고 보안성을 분석하는 프로젝트입니다.',
    image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Python', 'RSA', 'Number Theory', 'Sage'],
    category: '암호학',
    topicSlug: 'cryptography',
    status: '완료',
    stars: 19,
    creator: { name: '이수민', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face' },
    contributors: [
      { name: '이수민', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face' },
      { name: '정하늘', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=32&h=32&fit=crop&crop=face' },
      { name: '김재현', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' }
    ],
    lastUpdate: '2024.01.16',
    github: 'https://github.com/ssg/rsa-implementation',
    demo: 'https://rsa.ssg.com'
  }
];

const categories = ['웹 해킹', '리버싱', '시스템 해킹', '디지털 포렌식', '네트워크 보안', 'IoT보안', '암호학'];
const statuses = ['진행중', '완료', '계획중'];

const getStatusColor = (status: string) => {
  switch (status) {
    case '완료': return 'bg-green-100 text-green-700 border-green-300';
    case '계획중': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case '진행중': return 'bg-blue-100 text-blue-700 border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// Avatar Stack Component (same as before)
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
  const searchParams = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('최신순');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Added view mode state

  const sortOptions = ['최신순', '인기순', '이름순'];

  // Initialize filters from URL parameters
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      // Convert topic slug to category name
      const topicType = CategoryHelpers.getTypeBySlug(topicParam);
      if (topicType) {
        const categoryName = CategoryHelpers.getDisplayName(topicType);
        setSelectedCategories([categoryName]);
      }
    }
  }, [searchParams]);

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

  // Get current topic name for breadcrumb
  const currentTopicName = searchParams.get('topic') 
    ? CategoryHelpers.getDisplayName(CategoryHelpers.getTypeBySlug(searchParams.get('topic')!)!) 
    : null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="w-full px-3 sm:px-4 lg:px-10 py-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-600 mb-4">Projects</h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              동아리 멤버들이 만들어낸 결과물을 만나보세요.
            </p>
            {/* Breadcrumb for filtered topic */}
            {currentTopicName && (
              <div className="mt-4">
                <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg border border-primary-200">
                  <span className="text-sm">필터링된 주제:</span>
                  <span className="font-semibold">{currentTopicName}</span>
                  <button
                    onClick={clearAllFilters}
                    className="ml-2 hover:text-primary-900"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Top Controls with Card Background */}
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
                  className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              {/* Controls Group */}
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
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

                {/* Create Project Button */}
                <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap">
                  <Plus size={16} />
                  새 프로젝트 만들기
                </button>
              </div>
            </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex gap-8">
            {/* Sidebar Filter (same as before) */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">필터</h3>
                    {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-primary hover:underline"
                      >
                        전체 초기화
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {/* Status Filters */}
                  <div className="space-y-3 mb-6">
                    <h4 className="text-base font-semibold text-gray-900">프로젝트 상태</h4>
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
                  <h4 className="text-base font-semibold text-gray-900 mb-3">학습 주제</h4>
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
                            ? 'bg-primary border-primary'
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
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort and Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold text-primary">{filteredProjects.length}</span>개의 프로젝트
                  {searchTerm && ` (검색어: "${searchTerm}")`}
                  {currentTopicName && ` (주제: ${currentTopicName})`}
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

              {/* Project Grid/List based on viewMode */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-6"
              }>
                {filteredProjects.map((project) => (
                  <div key={project.id} className={`group ${viewMode === 'list' ? 'flex gap-6' : ''}`}>
                    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                      viewMode === 'list' ? 'flex flex-1' : ''
                    }`}>
                      {/* Image */}
                      <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}`}>
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className={`w-full object-cover ${viewMode === 'list' ? 'h-full' : 'h-48'}`}
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
                      <div className="p-5 flex-1">
                        <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 ${
                          viewMode === 'list' ? 'text-xl' : 'text-lg'
                        }`}>
                          {project.title}
                        </h3>
                        <p className={`text-gray-600 mb-4 leading-relaxed ${
                          viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3 text-sm'
                        }`}>
                          {project.description}
                        </p>

                        {/* Contributors Avatar Stack */}
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
                              className="text-gray-400 hover:text-primary transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github size={18} />
                            </a>
                            {project.demo && (
                              <a 
                                href={project.demo}
                                className="text-gray-400 hover:text-primary transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink size={18} />
                              </a>
                            )}
                          </div>
                          <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors">
                            자세히 보기
                          </button>
                        </div>
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
                    className="text-primary hover:underline"
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
