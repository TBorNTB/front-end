'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Calendar, User, Eye, ThumbsUp, MessageCircle, Search, Filter, Plus, X, Grid, List, ChevronDown } from 'lucide-react';
import { CategoryType, CategoryHelpers } from '@/app/(main)/topics/types/category';

const articles = [
  {
    id: 1,
    title: '워크플로 분석 실제 가이드',
    excerpt: '워크플로를 체계적으로 분석하고 최적화하는 방법에 대해 알아보겠습니다.',
    content: '워크플로 분석은 업무 프로세스를 개선하는데 필수적인...',
    category: '웹 해킹',
    topicSlug: 'web-hacking',
    author: '김민수',
    date: '2024.03.15',
    readTime: '8분',
    views: 342,
    likes: 23,
    comments: 5,
    tags: ['워크플로', '분석', '최적화', '프로세스'],
    image: '/api/placeholder/400/250'
  },
  {
    id: 2,
    title: 'OSINT를 활용한 디지털 포렌식',
    excerpt: '공개된 정보를 활용하여 디지털 포렌식 조사를 수행하는 방법과 주요 도구들을 소개합니다.',
    content: 'OSINT(Open Source Intelligence)는 공개적으로 이용 가능한 정보를 수집하고 분석하는...',
    category: '웹 해킹',
    topicSlug: 'web-hacking',
    author: '최수진',
    date: '2024.03.08',
    readTime: '10분',
    views: 198,
    likes: 15,
    comments: 6,
    tags: ['OSINT', 'Digital Forensics', 'Investigation', 'Maltego'],
    image: '/api/placeholder/400/250'
  },
  {
    id: 3,
    title: '리버싱 기초 가이드',
    excerpt: 'IDA Pro와 Ghidra를 활용한 바이너리 분석의 기초를 학습해보겠습니다.',
    content: '리버싱(역공학)은 컴파일된 바이너리 파일을 분석하여...',
    category: '리버싱',
    topicSlug: 'reversing',
    author: '박지영',
    date: '2024.03.12',
    readTime: '12분',
    views: 156,
    likes: 18,
    comments: 8,
    tags: ['리버싱', 'IDA Pro', 'Ghidra', '바이너리 분석'],
    image: '/api/placeholder/400/250'
  },
  {
    id: 4,
    title: '시스템 해킹 실전 기법',
    excerpt: 'Buffer Overflow와 ROP 체인을 활용한 시스템 익스플로잇 기법을 다룹니다.',
    content: '시스템 해킹은 운영체제와 시스템 레벨에서 발생하는...',
    category: '시스템 해킹',
    topicSlug: 'system-hacking',
    author: '이준호',
    date: '2024.03.10',
    readTime: '15분',
    views: 289,
    likes: 31,
    comments: 12,
    tags: ['시스템 해킹', 'Buffer Overflow', 'ROP', '익스플로잇'],
    image: '/api/placeholder/400/250'
  },
  {
    id: 5,
    title: '디지털 포렌식 도구 활용법',
    excerpt: 'Volatility와 Autopsy를 사용한 메모리 덤프와 디스크 이미지 분석 방법을 설명합니다.',
    content: '디지털 포렌식은 사이버 범죄나 보안 사고 발생 시...',
    category: '디지털 포렌식',
    topicSlug: 'digital-forensics',
    author: '정우현',
    date: '2024.03.05',
    readTime: '11분',
    views: 234,
    likes: 19,
    comments: 9,
    tags: ['디지털 포렌식', 'Volatility', 'Autopsy', '메모리 분석'],
    image: '/api/placeholder/400/250'
  },
  {
    id: 6,
    title: '네트워크 보안 모니터링',
    excerpt: 'Wireshark와 Suricata를 활용한 네트워크 트래픽 분석과 침입 탐지 시스템 구축',
    content: '네트워크 보안에서 실시간 모니터링은 매우 중요한...',
    category: '네트워크 보안',
    topicSlug: 'network-security',
    author: '강예린',
    date: '2024.03.02',
    readTime: '14분',
    views: 167,
    likes: 22,
    comments: 4,
    tags: ['네트워크 보안', 'Wireshark', 'Suricata', 'IDS'],
    image: '/api/placeholder/400/250'
  }
];

const categories = [
  { name: '전체', slug: 'all' },
  { name: '웹 해킹', slug: 'web-hacking' },
  { name: '리버싱', slug: 'reversing' },
  { name: '시스템 해킹', slug: 'system-hacking' },
  { name: '디지털 포렌식', slug: 'digital-forensics' },
  { name: '네트워크 보안', slug: 'network-security' },
  { name: 'IoT보안', slug: 'iot-security' },
  { name: '암호학', slug: 'cryptography' }
];

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('최신순');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const currentUser: 'guest' | 'member' | 'admin' | null = 'member';
  const sortOptions = ['최신순', '인기순', '조회순'];

  // Initialize filters from URL parameters
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setSelectedCategory(topicParam);
    }
  }, [searchParams]);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.topicSlug === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Get current topic name for breadcrumb
  const currentTopicName = selectedCategory !== 'all' 
    ? categories.find(cat => cat.slug === selectedCategory)?.name || ''
    : '';

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Full width container */}
      <div className="w-full px-3 sm:px-4 lg:px-10 py-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">CS지식</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            동아리의 모든 지식과 경험을 이곳에서 찾아보세요
          </p>
          {/* Breadcrumb for filtered topic */}
          {currentTopicName && (
            <div className="mt-4">
              <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg border border-primary-200">
                <span className="text-sm">필터링된 주제:</span>
                <span className="font-semibold">{currentTopicName}</span>
                <button
                  onClick={clearFilters}
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
                placeholder="찾고자 할 컨텐츠를 작성..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List size={16} />
                </button>
              </div>

              {(currentUser === 'member' || currentUser === 'admin') && (
                <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap">
                  <Plus size={16} />
                 새 글 쓰기
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Sidebar Filter */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">카테고리</h3>
              </div>
              <div className="p-2">
                {categories.map((category) => {
                  const isActive = selectedCategory === category.slug;
                  const categoryCount = category.slug === 'all' 
                    ? articles.length 
                    : articles.filter(a => a.topicSlug === category.slug).length;
                  
                  return (
                    <button
                      key={category.slug}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all ${
                        isActive
                          ? 'bg-primary-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isActive
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {categoryCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Count and Sort - Single Line */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                총 <span className="font-semibold text-primary">{filteredArticles.length}</span>개의 글
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

            {/* Articles Grid/List */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-600 text-xl mb-4">검색 결과가 없습니다.</div>
                <button 
                  onClick={clearFilters}
                  className="text-primary hover:underline"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                : "space-y-6"
              }>
                {filteredArticles.map((article) => (
                  <div key={article.id} className={`group ${viewMode === 'list' ? 'flex gap-6' : ''}`}>
                    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                      viewMode === 'list' ? 'flex flex-1' : ''
                    }`}>
                      
                      {/* Image */}
                      <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}`}>
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className={`w-full object-cover ${viewMode === 'list' ? 'h-full' : 'h-48'}`}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-5 flex-1">
                        <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors ${
                          viewMode === 'list' ? 'text-xl' : 'text-lg'
                        }`}>
                          {article.title}
                        </h3>
                        <p className={`text-gray-600 mb-4 leading-relaxed ${
                          viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3 text-sm'
                        }`}>
                          {article.excerpt}
                        </p>
                        
                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>by {article.author}</span>
                          </div>
                          <span>{article.date}</span>
                          <span className="text-primary-600 font-medium">{article.readTime} 읽기</span>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{article.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{article.comments}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              +{article.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 mt-12">
              <button className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                &lt;
              </button>
              {[1, 2, 3, '...', 7].map((page, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                    page === 1
                      ? 'bg-primary text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
