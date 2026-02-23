import Link from 'next/link';
import { CheckCircle, Bookmark, BookmarkCheck, Calendar } from 'lucide-react';

interface TechTag {
  id: string;
  name: string;
  color: string;
}

interface Answer {
  id: string;
  content: string;
  author: string;
  authorRole: 'member' | 'admin' | 'guest';
  createdAt: string;
  isAccepted: boolean;
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
  views: number;
  answers?: Answer[];
  comments?: any[];
  answerCount?: number;
  commentCount?: number;
  status?: string;
  isBookmarked: boolean;
  hasAcceptedAnswer?: boolean;
}

interface QuestionCardProps {
  question: Question;
  onBookmark: (questionId: string) => void;
  viewMode: 'grid' | 'list';
}

export default function QuestionCard({ question, onBookmark, viewMode }: QuestionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getRoleBadge = (role: 'member' | 'admin' | 'guest') => {
    if (role === 'admin') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
          관리자
        </span>
      );
    }
    return null;
  };

  const answersCount = question.answerCount ?? question.answers?.length ?? 0;
  const hasAccepted = question.hasAcceptedAnswer ?? question.status === 'ACCEPTED';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Status Indicators */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${
            hasAccepted 
              ? 'bg-green-50 border-2 border-green-500' 
              : answersCount > 0 
              ? 'bg-blue-50 border border-blue-300' 
              : 'bg-gray-50 border border-gray-300'
          }`}>
            <span className={`text-lg font-bold ${
              hasAccepted 
                ? 'text-green-700' 
                : answersCount > 0 
                ? 'text-blue-700' 
                : 'text-gray-700'
            }`}>
              {answersCount}
            </span>
            <span className={`text-xs ${
              hasAccepted 
                ? 'text-green-600' 
                : answersCount > 0 
                ? 'text-blue-600' 
                : 'text-gray-700'
            }`}>
              답변
            </span>
          </div>
          {hasAccepted && (
            <CheckCircle className="w-5 h-5 text-green-600 fill-green-100" />
          )}
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          <Link href={`/community/qna/${question.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-2 line-clamp-2">
              {question.title}
            </h3>
          </Link>
          
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {question.content}
          </p>

          {/* Tech Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {question.techTags.map((tag) => (
              <span
                key={tag.id}
                className={`px-2 py-1 text-xs font-medium rounded ${tag.color}`}
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-700">{question.author}</span>
              {getRoleBadge(question.authorRole)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(question.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Right: Bookmark Button */}
        <button
          onClick={() => onBookmark(question.id)}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={question.isBookmarked ? '스크랩 취소' : '스크랩'}
        >
          {question.isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-primary-600 fill-primary-600" />
          ) : (
            <Bookmark className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>
    </div>
  );
}
