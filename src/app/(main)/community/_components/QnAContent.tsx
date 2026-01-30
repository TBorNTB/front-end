"use client";

import { useEffect, useMemo, useState } from 'react';
import ContentFilterBar from '@/components/layout/TopSection';
import CategoryFilter from '@/components/layout/CategoryFilter';
import QuestionCard from './QuestionCard';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { categoryService, type CategoryItem } from '@/lib/api/services/category-services';
import { questionService } from '@/lib/api/services/question-services';
import type { QuestionSearchItem, QuestionSearchStatus } from '@/types/services/question';

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
  authorRole: 'member' | 'admin' | 'guest';
  createdAt: string;
}

interface Answer {
  id: string;
  content: string;
  author: string;
  authorRole: 'member' | 'admin' | 'guest';
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
  authorRole: 'member' | 'admin' | 'guest';
  techTags: TechTag[];
  createdAt: string;
  updatedAt: string;
  views: number;
  answers?: Answer[];
  comments?: any[];
  answerCount?: number;
  commentCount?: number;
  status?: string;
  isBookmarked: boolean;
  hasAcceptedAnswer?: boolean;
}

const STATUS_MAP: Record<'all' | 'answered' | 'unanswered' | 'accepted', QuestionSearchStatus> = {
  all: 'ALL',
  answered: 'ANSWERED',
  unanswered: 'UNANSWERED',
  accepted: 'ACCEPTED',
};

const TAG_COLOR_PALETTE = [
  'bg-red-100 text-red-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
] as const;

const colorForCategory = (name: string): string => {
  const hash = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return TAG_COLOR_PALETTE[hash % TAG_COLOR_PALETTE.length];
};

const toQuestionModel = (item: QuestionSearchItem): Question => {
  const author = item.nickname || item.realName || item.username || '사용자';
  return {
    id: String(item.id),
    title: item.title,
    content: item.description,
    author,
    authorRole: 'member',
    techTags: (item.categories ?? []).map((name) => ({
      id: name,
      name,
      color: colorForCategory(name),
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    views: 0,
    isBookmarked: false,
    status: item.status,
    answerCount: item.answerCount,
    commentCount: 0,
    hasAcceptedAnswer: item.status === 'ACCEPTED',
  };

};

export default function QnAContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('최신순');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'answered' | 'unanswered' | 'accepted'>('all');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  
  // Current user role (this should come from auth context)
  const currentUserRole: 'guest' | 'member' | 'admin' = 'member' as 'guest' | 'member' | 'admin';

  const categoryFilterItems = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((c) => ({
        id: c.name,
        name: c.name,
        count: questions.filter((q) => q.techTags.some((t) => t.name === c.name)).length,
      }));
    }

    const derivedNames = Array.from(
      new Set(
        questions.flatMap((q) => (q.techTags ?? []).map((t) => t.name)).filter(Boolean)
      )
    );

    return derivedNames.map((name) => ({
      id: name,
      name,
      count: questions.filter((q) => q.techTags.some((t) => t.name === name)).length,
    }));
  }, [categories, questions]);

  // Debounce keyword (backend accepts keyword empty string)
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setPage(0);
    }, 300);

    return () => clearTimeout(handle);
  }, [searchTerm]);

  // Load categories (for sidebar filter)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await categoryService.getCategories();
        if (cancelled) return;
        setCategories(res.categories ?? []);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch questions from backend when filters change
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsSearching(true);
      setErrorMessage(null);

      try {
        const categoryNames = selectedTag === 'all' ? [] : [selectedTag];

        const res = await questionService.searchOffset({
          page,
          size: 10,
          sortBy: 'createdAt',
          sortDirection: 'DESC',
          status: STATUS_MAP[filterStatus],
          categoryNames,
          keyword: debouncedKeyword ?? '',
        });

        if (cancelled) return;

        const items = (res.data ?? []) as QuestionSearchItem[];
        let mapped = items.map(toQuestionModel);

        // Client-side sort fallback (if backend doesn't support the chosen sort)
        if (sortBy === '답변순') {
          mapped = [...mapped].sort((a, b) => (b.answerCount ?? 0) - (a.answerCount ?? 0));
        }

        setQuestions(mapped);
        setFilteredQuestions(mapped);
        setTotalPage(res.totalPage ?? 0);
      } catch (e) {
        if (cancelled) return;
        console.error('Failed to load questions:', e);
        setErrorMessage(e instanceof Error ? e.message : '질문을 불러오지 못했습니다.');
        setQuestions([]);
        setFilteredQuestions([]);
        setTotalPage(0);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, filterStatus, selectedTag, debouncedKeyword, sortBy]);

  const handleBookmark = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, isBookmarked: !q.isBookmarked } : q))
    );
    setFilteredQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, isBookmarked: !q.isBookmarked } : q))
    );
  };

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <ContentFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={() => {
          setDebouncedKeyword(searchTerm);
          setPage(0);
        }}
        isSearching={isSearching}
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
                      return (q.answerCount ?? q.answers?.length ?? 0) > 0;
                    case 'unanswered':
                      return (q.answerCount ?? q.answers?.length ?? 0) === 0;
                    case 'accepted':
                      return q.hasAcceptedAnswer ?? q.status === 'ACCEPTED';
                    default:
                      return true;
                  }
                }).length;

                return (
                  <button
                    key={status.value}
                    onClick={() => {
                      setFilterStatus(status.value as any);
                      setPage(0);
                    }}
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
                    <span className={`text-xs ${isActive ? 'text-primary-100' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tech Tags Filter */}
          <CategoryFilter
            categories={categoryFilterItems}
            selectedCategory={selectedTag}
            onCategoryChange={(next) => {
              setSelectedTag(next);
              setPage(0);
            }}
            title="기술 태그"
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              현재 <span className="font-semibold text-primary-600">{filteredQuestions.length}</span>개의 질문
              {totalPage > 0 && ` (페이지: ${page + 1}/${totalPage})`}
              {debouncedKeyword && ` (검색어: "${debouncedKeyword}")`}
            </p>
          </div>

          {/* Questions List */}
          {errorMessage ? (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">불러오기에 실패했습니다</p>
              <p className="text-gray-400 text-sm">{errorMessage}</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">질문이 없습니다</p>
              <p className="text-gray-400 text-sm">첫 번째 질문을 작성해보세요!</p>
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
    </div>
  );
}
