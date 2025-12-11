// app/(main)/articles/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  User,
  Eye,
  ThumbsUp,
  MessageCircle,
  Search,
  Plus,
  X,
  Grid,
  List,
  ChevronDown,
} from 'lucide-react';
import ArticleCard from './_components/ArticleCard';

const ARTICLES_PER_PAGE = 6;

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
    image: '/api/placeholder/400/250',
  },
  {
    id: 2,
    title: 'OSINT를 활용한 디지털 포렌식',
    excerpt:
      '공개된 정보를 활용하여 디지털 포렌식 조사를 수행하는 방법과 주요 도구들을 소개합니다.',
    content:
      'OSINT(Open Source Intelligence)는 공개적으로 이용 가능한 정보를 수집하고 분석하는...',
    category: '웹 해킹',
    topicSlug: 'web-hacking',
    author: '최수진',
    date: '2024.03.08',
    readTime: '10분',
    views: 198,
    likes: 15,
    comments: 6,
    tags: ['OSINT', 'Digital Forensics', 'Investigation', 'Maltego'],
    image: '/api/placeholder/400/250',
  },
  {
    id: 3,
    title: '리버싱 기초 가이드',
    excerpt:
      'IDA Pro와 Ghidra를 활용한 바이너리 분석의 기초를 학습해보겠습니다.',
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
    image: '/api/placeholder/400/250',
  },
  {
    id: 4,
    title: '시스템 해킹 실전 기법',
    excerpt:
      'Buffer Overflow와 ROP 체인을 활용한 시스템 익스플로잇 기법을 다룹니다.',
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
    image: '/api/placeholder/400/250',
  },
  {
    id: 5,
    title: '디지털 포렌식 도구 활용법',
    excerpt:
      'Volatility와 Autopsy를 사용한 메모리 덤프와 디스크 이미지 분석 방법을 설명합니다.',
    content:
      '디지털 포렌식은 사이버 범죄나 보안 사고 발생 시...',
    category: '디지털 포렌식',
    topicSlug: 'digital-forensics',
    author: '정우현',
    date: '2024.03.05',
    readTime: '11분',
    views: 234,
    likes: 19,
    comments: 9,
    tags: ['디지털 포렌식', 'Volatility', 'Autopsy', '메모리 분석'],
    image: '/api/placeholder/400/250',
  },
  {
    id: 7,
    title: '네트워크 보안 모니터링',
    excerpt:
      'Wireshark와 Suricata를 활용한 네트워크 트래픽 분석과 침입 탐지 시스템 구축',
    content:
      '네트워크 보안에서 실시간 모니터링은 매우 중요한...',
    category: '네트워크 보안',
    topicSlug: 'network-security',
    author: '강예린',
    date: '2024.03.02',
    readTime: '14분',
    views: 167,
    likes: 22,
    comments: 4,
    tags: ['네트워크 보안', 'Wireshark', 'Suricata', 'IDS'],
    image: '/api/placeholder/400/250',
  },
    {
    id: 8,
    title: '네트워크 보안 모니터링',
    excerpt:
      'Wireshark와 Suricata를 활용한 네트워크 트래픽 분석과 침입 탐지 시스템 구축',
    content:
      '네트워크 보안에서 실시간 모니터링은 매우 중요한...',
    category: '네트워크 보안',
    topicSlug: 'network-security',
    author: '강예린',
    date: '2024.03.02',
    readTime: '14분',
    views: 167,
    likes: 22,
    comments: 4,
    tags: ['네트워크 보안', 'Wireshark', 'Suricata', 'IDS'],
    image: '/api/placeholder/400/250',
  },
];

const categories = [
  { name: '전체', slug: 'all' },
  { name: '웹 해킹', slug: 'web-hacking' },
  { name: '리버싱', slug: 'reversing' },
  { name: '시스템 해킹', slug: 'system-hacking' },
  { name: '디지털 포렌식', slug: 'digital-forensics' },
  { name: '네트워크 보안', slug: 'network-security' },
  { name: 'IoT보안', slug: 'iot-security' },
  { name: '암호학', slug: 'cryptography' },
];

function ArticlesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('최신순');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(1);

  const currentUser: 'guest' | 'member' | 'admin' | null = 'member';
  const sortOptions = ['최신순', '인기순', '조회순'];

  // URL 쿼리(topic, page) → state 초기화
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const pageParam = searchParams.get('page');

    if (topicParam) {
      setSelectedCategory(topicParam);
    }

    if (pageParam && !Number.isNaN(Number(pageParam))) {
      setPage(Math.max(1, Number(pageParam)));
    } else {
      setPage(1);
    }
  }, [searchParams]);

  // 필터링
  let filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === 'all' || article.topicSlug === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag: string) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    return matchesCategory && matchesSearch;
  });

  // 정렬 (원래 디자인 상, 아직 날짜 파싱이 없으므로 no-op)
  filteredArticles = filteredArticles.sort((a, b) => {
    switch (sortBy) {
      case '인기순':
        return b.likes - a.likes;
      case '조회순':
        return b.views - a.views;
      case '최신순':
      default:
        return 0;
    }
  });

  // 페이지네이션 계산
  const totalArticles = filteredArticles.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalArticles / ARTICLES_PER_PAGE),
  );
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * ARTICLES_PER_PAGE;
  const currentArticles = filteredArticles.slice(
    startIndex,
    startIndex + ARTICLES_PER_PAGE,
  );

  const currentTopicName =
    selectedCategory !== 'all'
      ? categories.find((cat) => cat.slug === selectedCategory)?.name || ''
      : '';

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setPage(1);
    router.push('/articles');
  };

  const changePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage === 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }

    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-10 py-10">
        {/* 상단 Hero 영역 – 기존 디자인 그대로 */}
        <section className="mb-8">
          <div className="w-full rounded-2xl bg-secondary-50 py-10 px-6 sm:px-10 flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-700 mb-3">
              CS지식
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
              동아리의 모든 지식과 경험을 이곳에서 찾아보세요
            </p>
          </div>
        </section>

        {/* 검색/뷰모드/새 글 쓰기 – 기존 디자인에 맞게 배치 */}
        <section className="flex flex-col md:flex-row gap-4 mb-6">
          {/* 검색 인풋 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="찾고자 할 컨텐츠를 작성해주세요"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* 오른쪽: 뷰모드 + 정렬 + 새 글쓰기 */}
          <div className="flex items-center justify-end gap-3">
            {/* 새 글 쓰기 버튼 (디자인 유지용) */}
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
              <Plus className="w-4 h-4" />
              새 글 쓰기
            </button>
          </div>
        </section>

        {/* 본문 영역: 좌측 카테고리 + 우측 리스트 (디자인 유지) */}
        <section className="flex gap-8">
          {/* 왼쪽 카테고리 패널 */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                카테고리
              </h3>
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.slug;
                  const count = articles.filter(
                    (a) =>
                      cat.slug === 'all' || a.topicSlug === cat.slug,
                  ).length;

                  return (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setPage(1);
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        if (cat.slug === 'all') {
                          params.delete('topic');
                        } else {
                          params.set('topic', cat.slug);
                        }
                        router.push(`/articles?${params.toString()}`);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span
                        className={`text-xs ${
                          isActive ? 'text-primary-50' : 'text-gray-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* 오른쪽 리스트 영역 */}
          <div className="flex-1">
            {/* 결과 수 + 필터 (같은 라인) */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                총{' '}
                <span className="font-semibold text-primary-600">
                  {totalArticles}
                </span>
                개의 글
                {searchTerm && ` (검색어: "${searchTerm}")`}
                {currentTopicName && ` (주제: ${currentTopicName})`}
              </p>

              {/* 오른쪽 필터/정렬/뷰모드 영역 */}
              <div className="flex items-center gap-3">
                {/* 뷰모드 토글 */}
                <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 flex items-center justify-center ${
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-500'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 flex items-center justify-center ${
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-500'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* 정렬 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown((prev) => !prev)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-700"
                  >
                    {sortBy}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showSortDropdown && (
                    <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                            sortBy === option ? 'text-primary-600 font-medium' : ''
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 카드 리스트 */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6'
                  : 'space-y-6'
              }
            >
              {currentArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={{
                    ...article,
                    author: {
                      nickname: article.author,
                      bio: '',
                    },
                  }}
                  viewMode={viewMode}
                />
              ))}
            </div>


            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  disabled={safePage === 1}
                  onClick={() => changePage(safePage - 1)}
                  className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>

                <span className="text-sm text-gray-600">
                  {safePage} / {totalPages} 페이지
                </span>

                <button
                  disabled={safePage === totalPages}
                  onClick={() => changePage(safePage + 1)}
                  className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}

            {/* 결과 없음 */}
            {totalArticles === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  검색 조건에 맞는 글이 없습니다.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-primary hover:underline"
                >
                  필터 초기화
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ArticlesContent />
    </Suspense>
  );
}
