"use client";

import { useState, useEffect } from 'react';
import TitleBanner from '@/components/layout/TitleBanner';
import ContentFilterBar from '@/components/layout/TopSection';
import QuestionCard from '../_components/QuestionCard';
import { MessageSquare, CheckCircle, Bookmark, Tag, User, Calendar } from 'lucide-react';

// Types
interface TechTag {
  id: string;
  name: string;
  color: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorRole: 'member' | 'admin';
  createdAt: string;
}

interface Answer {
  id: string;
  content: string;
  author: string;
  authorRole: 'member' | 'admin';
  createdAt: string;
  isAccepted: boolean;
  comments: Comment[];
  upvotes: number;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: 'member' | 'admin';
  techTags: TechTag[];
  createdAt: string;
  updatedAt: string;
  views: number;
  answers: Answer[];
  comments: Comment[];
  isBookmarked: boolean;
  hasAcceptedAnswer: boolean;
}

// Mock Tech Tags
const availableTechTags: TechTag[] = [
  { id: '1', name: 'Web Hacking', color: 'bg-red-100 text-red-700' },
  { id: '2', name: 'Reversing', color: 'bg-blue-100 text-blue-700' },
  { id: '3', name: 'System Hacking', color: 'bg-green-100 text-green-700' },
  { id: '4', name: 'Forensics', color: 'bg-purple-100 text-purple-700' },
  { id: '5', name: 'Network Security', color: 'bg-yellow-100 text-yellow-700' },
  { id: '6', name: 'Cryptography', color: 'bg-pink-100 text-pink-700' },
  { id: '7', name: 'IoT Security', color: 'bg-indigo-100 text-indigo-700' },
  { id: '8', name: 'CTF', color: 'bg-orange-100 text-orange-700' },
];

// Mock Questions Data
const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'SQL Injection 방어 방법에 대해 궁금합니다',
    content: 'Prepared Statement를 사용하는 것 외에 다른 방어 방법이 있을까요? 실무에서는 어떤 방식을 주로 사용하시나요?',
    author: '김민수',
    authorRole: 'member',
    techTags: [
      { id: '1', name: 'Web Hacking', color: 'bg-red-100 text-red-700' },
      { id: '5', name: 'Network Security', color: 'bg-yellow-100 text-yellow-700' },
    ],
    createdAt: '2025-01-10T10:30:00Z',
    updatedAt: '2025-01-10T10:30:00Z',
    views: 142,
    hasAcceptedAnswer: true,
    isBookmarked: false,
    comments: [
      {
        id: 'c1',
        content: '좋은 질문이네요! 저도 궁금합니다.',
        author: '이지은',
        authorRole: 'member',
        createdAt: '2025-01-10T11:00:00Z',
      },
    ],
    answers: [
      {
        id: 'a1',
        content: 'Prepared Statement 외에도 Input Validation, WAF 사용, 최소 권한 원칙 적용 등이 있습니다. 실무에서는 여러 방법을 함께 사용하는 것이 좋습니다.',
        author: '박준호',
        authorRole: 'admin',
        createdAt: '2025-01-10T12:00:00Z',
        isAccepted: true,
        upvotes: 15,
        comments: [
          {
            id: 'ac1',
            content: '명확한 설명 감사합니다!',
            author: '김민수',
            authorRole: 'member',
            createdAt: '2025-01-10T13:00:00Z',
          },
        ],
      },
      {
        id: 'a2',
        content: 'ORM을 사용하는 것도 하나의 방법입니다. 하지만 완벽한 방어는 아니므로 항상 주의가 필요합니다.',
        author: '최수진',
        authorRole: 'member',
        createdAt: '2025-01-10T14:00:00Z',
        isAccepted: false,
        upvotes: 8,
        comments: [],
      },
    ],
  },
  {
    id: '2',
    title: 'IDA Pro에서 디버깅 시 팁이 있을까요?',
    content: 'IDA Pro를 이용한 리버싱 중 디버깅을 할 때 자주 사용하는 단축키나 팁을 공유해주시면 감사하겠습니다.',
    author: '정우현',
    authorRole: 'member',
    techTags: [
      { id: '2', name: 'Reversing', color: 'bg-blue-100 text-blue-700' },
    ],
    createdAt: '2025-01-12T09:15:00Z',
    updatedAt: '2025-01-12T09:15:00Z',
    views: 89,
    hasAcceptedAnswer: false,
    isBookmarked: true,
    comments: [],
    answers: [
      {
        id: 'a3',
        content: 'F2로 Breakpoint 설정, F9로 실행, F7/F8로 Step Into/Over 등이 기본입니다. Graph View와 Text View를 번갈아 사용하는 것도 좋습니다.',
        author: '강예린',
        authorRole: 'member',
        createdAt: '2025-01-12T10:30:00Z',
        isAccepted: false,
        upvotes: 5,
        comments: [],
      },
    ],
  },
  {
    id: '3',
    title: 'Buffer Overflow 공격 실습 환경 구축 방법',
    content: 'Buffer Overflow 공격을 연습하기 위한 안전한 실습 환경을 구축하려고 합니다. 추천하는 방법이 있을까요?',
    author: '이승호',
    authorRole: 'member',
    techTags: [
      { id: '3', name: 'System Hacking', color: 'bg-green-100 text-green-700' },
      { id: '8', name: 'CTF', color: 'bg-orange-100 text-orange-700' },
    ],
    createdAt: '2025-01-13T14:20:00Z',
    updatedAt: '2025-01-13T14:20:00Z',
    views: 67,
    hasAcceptedAnswer: false,
    isBookmarked: false,
    comments: [
      {
        id: 'c2',
        content: 'VM에서 해야 안전하겠죠?',
        author: '박지영',
        authorRole: 'member',
        createdAt: '2025-01-13T15:00:00Z',
      },
    ],
    answers: [],
  },
  {
    id: '4',
    title: 'RSA 암호화 알고리즘의 취약점',
    content: 'RSA 암호화의 주요 취약점과 이를 보완하는 방법에 대해 알고 싶습니다.',
    author: '윤서연',
    authorRole: 'member',
    techTags: [
      { id: '6', name: 'Cryptography', color: 'bg-pink-100 text-pink-700' },
    ],
    createdAt: '2025-01-14T08:00:00Z',
    updatedAt: '2025-01-14T08:00:00Z',
    views: 34,
    hasAcceptedAnswer: true,
    isBookmarked: true,
    comments: [],
    answers: [
      {
        id: 'a4',
        content: '키 길이가 짧으면 취약하고, Padding Oracle Attack 등의 위험이 있습니다. 충분한 키 길이(최소 2048bit)와 적절한 Padding Scheme(OAEP)을 사용해야 합니다.',
        author: '박준호',
        authorRole: 'admin',
        createdAt: '2025-01-14T09:30:00Z',
        isAccepted: true,
        upvotes: 12,
        comments: [],
      },
    ],
  },
];

export default function FAQsPage() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(mockQuestions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('최신순');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'answered' | 'unanswered' | 'accepted'>('all');
  
  // Current user role (this should come from auth context)
  const currentUserRole: 'guest' | 'member' | 'admin' = 'member' as 'guest' | 'member' | 'admin';

  // Filter and sort questions
  useEffect(() => {
    let filtered = [...questions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tag
    if (selectedTag !== 'all') {
      filtered = filtered.filter((q) =>
        q.techTags.some((tag) => tag.id === selectedTag)
      );
    }

    // Filter by status
    switch (filterStatus) {
      case 'answered':
        filtered = filtered.filter((q) => q.answers.length > 0);
        break;
      case 'unanswered':
        filtered = filtered.filter((q) => q.answers.length === 0);
        break;
      case 'accepted':
        filtered = filtered.filter((q) => q.hasAcceptedAnswer);
        break;
    }

    // Sort
    switch (sortBy) {
      case '최신순':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case '인기순':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case '답변순':
        filtered.sort((a, b) => b.answers.length - a.answers.length);
        break;
    }

    setFilteredQuestions(filtered);
  }, [searchTerm, selectedTag, filterStatus, sortBy, questions]);

  const handleBookmark = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, isBookmarked: !q.isBookmarked } : q
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <TitleBanner
        title="Q&A"
        description="기술 질문과 답변을 공유하는 공간입니다."
        backgroundImage="/images/BgHeader.png"
      />

      <main className="w-full px-3 sm:px-4 lg:px-10 py-10">
        {/* Filter Bar */}
        <ContentFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isSearching={false}
          suggestions={[]}
          showSuggestions={showSuggestions}
          onSuggestionsShow={setShowSuggestions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          sortOptions={['최신순', '인기순', '답변순']}
          onSortChange={setSortBy}
          showViewMode={true}
          showSort={true}
          showCreateButton={currentUserRole !== 'guest'}
          createButtonText="질문하기"
          createButtonHref="/community/qna/create"
          placeholderText="질문 검색..."
        />

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden md:block space-y-6">
            {/* Status Filter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">상태</h3>
              <div className="space-y-1">
                {[
                  { value: 'all', label: '전체', icon: MessageSquare },
                  { value: 'answered', label: '답변있음', icon: MessageSquare },
                  { value: 'unanswered', label: '답변없음', icon: MessageSquare },
                  { value: 'accepted', label: '채택완료', icon: CheckCircle },
                ].map((status) => {
                  const Icon = status.icon;
                  const isActive = filterStatus === status.value;
                  const count = questions.filter((q) => {
                    switch (status.value) {
                      case 'answered':
                        return q.answers.length > 0;
                      case 'unanswered':
                        return q.answers.length === 0;
                      case 'accepted':
                        return q.hasAcceptedAnswer;
                      default:
                        return true;
                    }
                  }).length;

                  return (
                    <button
                      key={status.value}
                      onClick={() => setFilterStatus(status.value as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{status.label}</span>
                      </div>
                      <span className={`text-xs ${isActive ? 'text-primary-100' : 'text-gray-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tech Tags Filter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">기술 태그</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    selectedTag === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>전체</span>
                  <span className={`text-xs ${selectedTag === 'all' ? 'text-primary-100' : 'text-gray-700'}`}>
                    {questions.length}
                  </span>
                </button>
                {availableTechTags.map((tag) => {
                  const isActive = selectedTag === tag.id;
                  const count = questions.filter((q) =>
                    q.techTags.some((t) => t.id === tag.id)
                  ).length;

                  return (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTag(tag.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{tag.name}</span>
                      <span className={`text-xs ${isActive ? 'text-primary-100' : 'text-gray-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-700">
                총 <span className="font-semibold text-primary-600">{filteredQuestions.length}</span>개의 질문
                {searchTerm && ` (검색어: "${searchTerm}")`}
              </p>
            </div>

            {/* Questions List */}
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 text-lg mb-2">질문이 없습니다</p>
                <p className="text-gray-700 text-sm">첫 번째 질문을 작성해보세요!</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-4'}>
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onBookmark={handleBookmark}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}