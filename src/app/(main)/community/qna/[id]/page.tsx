"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TitleBanner from '@/components/layout/TitleBanner';
import { 
  MessageSquare, 
  CheckCircle, 
  Bookmark, 
  BookmarkCheck, 
  Eye, 
  Calendar, 
  ThumbsUp,
  Edit,
  Trash2,
  Send,
  X,
  Check
} from 'lucide-react';

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
  hasUpvoted: boolean;
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
  answers: Answer[];
  comments: Comment[];
  isBookmarked: boolean;
  hasAcceptedAnswer: boolean;
}

// Mock data
const mockQuestion: Question = {
  id: '1',
  title: 'SQL Injection 방어 방법에 대해 궁금합니다',
  content: `Prepared Statement를 사용하는 것 외에 다른 방어 방법이 있을까요? 
  
  실무에서는 어떤 방식을 주로 사용하시나요? 
  
  최근 프로젝트에서 SQL Injection 취약점을 발견했는데, 단순히 Prepared Statement만으로는 완벽한 방어가 어려울 것 같아서 질문드립니다.
  
  여러 레이어에서의 방어 방법을 알고 싶습니다.`,
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
      content: `Prepared Statement 외에도 다음과 같은 방어 방법들이 있습니다:

1. **Input Validation**: 입력값을 엄격하게 검증
2. **WAF (Web Application Firewall)** 사용
3. **최소 권한 원칙**: DB 사용자에게 필요한 최소한의 권한만 부여
4. **에러 메시지 제한**: DB 에러를 그대로 노출하지 않기
5. **코드 리뷰 및 정적 분석 도구** 활용

실무에서는 이러한 방법들을 **여러 레이어에서 함께 사용**하는 것이 중요합니다.`,
      author: '박준호',
      authorRole: 'admin',
      createdAt: '2025-01-10T12:00:00Z',
      isAccepted: true,
      upvotes: 15,
      hasUpvoted: false,
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
      content: `ORM(Object-Relational Mapping)을 사용하는 것도 하나의 방법입니다. 

ORM은 자동으로 쿼리를 생성하고 이스케이핑을 처리하기 때문에 SQL Injection 위험을 줄일 수 있습니다.

하지만 완벽한 방어는 아니므로 항상 주의가 필요합니다. 특히 Raw Query를 사용할 때는 더욱 조심해야 합니다.`,
      author: '최수진',
      authorRole: 'member',
      createdAt: '2025-01-10T14:00:00Z',
      isAccepted: false,
      upvotes: 8,
      hasUpvoted: false,
      comments: [],
    },
  ],
};

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question>(mockQuestion);
  const [newAnswer, setNewAnswer] = useState('');
  const [newQuestionComment, setNewQuestionComment] = useState('');
  const [newAnswerComments, setNewAnswerComments] = useState<Record<string, string>>({});
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  
  // Current user (should come from auth context)
  const currentUser = { name: '홍길동', role: 'member' as 'guest' | 'member' | 'admin' };
  const isQuestionAuthor = currentUser.name === question.author;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: 'member' | 'admin' | 'guest') => {
    if (role === 'admin') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
          관리자
        </span>
      );
    }
    if (role === 'guest') {
      return null;
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
        정회원
      </span>
    );
  };

  const handleBookmark = () => {
    setQuestion(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (!isQuestionAuthor) {
      alert('질문 작성자만 답변을 채택할 수 있습니다.');
      return;
    }

    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.map(answer => {
        if (answer.id === answerId) {
          return { ...answer, isAccepted: !answer.isAccepted };
        }
        // 다른 답변의 채택은 취소
        return { ...answer, isAccepted: false };
      }),
      hasAcceptedAnswer: !prev.answers.find(a => a.id === answerId)?.isAccepted,
    }));
  };

  const handleUpvoteAnswer = (answerId: string) => {
    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.map(answer => {
        if (answer.id === answerId) {
          return {
            ...answer,
            upvotes: answer.hasUpvoted ? answer.upvotes - 1 : answer.upvotes + 1,
            hasUpvoted: !answer.hasUpvoted,
          };
        }
        return answer;
      }),
    }));
  };

  const handleSubmitAnswer = () => {
    if (!newAnswer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    const answer: Answer = {
      id: Date.now().toString(),
      content: newAnswer,
      author: currentUser.name,
      authorRole: currentUser.role,
      createdAt: new Date().toISOString(),
      isAccepted: false,
      upvotes: 0,
      hasUpvoted: false,
      comments: [],
    };

    setQuestion(prev => ({
      ...prev,
      answers: [...prev.answers, answer],
    }));

    setNewAnswer('');
    setShowAnswerForm(false);
  };

  const handleAddQuestionComment = () => {
    if (!newQuestionComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newQuestionComment,
      author: currentUser.name,
      authorRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };

    setQuestion(prev => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));

    setNewQuestionComment('');
  };

  const handleAddAnswerComment = (answerId: string) => {
    const commentContent = newAnswerComments[answerId];
    if (!commentContent?.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: commentContent,
      author: currentUser.name,
      authorRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };

    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.map(answer =>
        answer.id === answerId
          ? { ...answer, comments: [...answer.comments, comment] }
          : answer
      ),
    }));

    setNewAnswerComments(prev => ({ ...prev, [answerId]: '' }));
  };

  return (
    <div className="min-h-screen bg-background">
      <TitleBanner
        title="Q&A"
        description="기술 질문과 답변을 공유하는 공간입니다."
        backgroundImage="/images/BgHeader.png"
      />

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Question Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{question.author}</span>
                  {getRoleBadge(question.authorRole)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(question.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views} 조회</span>
                </div>
              </div>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-2">
                {question.techTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`px-3 py-1 text-sm font-medium rounded ${tag.color}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className="flex-shrink-0 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              title={question.isBookmarked ? '스크랩 취소' : '스크랩'}
            >
              {question.isBookmarked ? (
                <BookmarkCheck className="w-6 h-6 text-primary-600 fill-primary-600" />
              ) : (
                <Bookmark className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6">
            <div className="text-gray-700 whitespace-pre-wrap">{question.content}</div>
          </div>

          {/* Comments on Question */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              댓글 {question.comments.length}
            </h3>
            <div className="space-y-3 mb-4">
              {question.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                      {getRoleBadge(comment.authorRole)}
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestionComment}
                onChange={(e) => setNewQuestionComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddQuestionComment()}
                placeholder="댓글을 입력하세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleAddQuestionComment}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {question.answers.length}개의 답변
            </h2>
            {currentUser.role !== 'guest' && (
              <button
                onClick={() => setShowAnswerForm(!showAnswerForm)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                {showAnswerForm ? '취소' : '답변 작성'}
              </button>
            )}
          </div>

          {/* Answer Form */}
          {showAnswerForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="답변을 작성해주세요..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowAnswerForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  답변 등록
                </button>
              </div>
            </div>
          )}

          {/* Answers List */}
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className={`bg-white border rounded-xl p-6 ${
                  answer.isAccepted ? 'border-green-500 border-2' : 'border-gray-200'
                }`}
              >
                {/* Answer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{answer.author}</span>
                      {getRoleBadge(answer.authorRole)}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(answer.createdAt)}</span>
                  </div>

                  {/* Accept Button (only for question author) */}
                  {isQuestionAuthor && (
                    <button
                      onClick={() => handleAcceptAnswer(answer.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        answer.isAccepted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {answer.isAccepted ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          채택됨
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          채택하기
                        </>
                      )}
                    </button>
                  )}
                  
                  {answer.isAccepted && !isQuestionAuthor && (
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      채택된 답변
                    </span>
                  )}
                </div>

                {/* Answer Content */}
                <div className="prose max-w-none mb-4">
                  <div className="text-gray-700 whitespace-pre-wrap">{answer.content}</div>
                </div>

                {/* Answer Actions */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                  <button
                    onClick={() => handleUpvoteAnswer(answer.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      answer.hasUpvoted
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${answer.hasUpvoted ? 'fill-primary-700' : ''}`} />
                    <span className="font-medium">{answer.upvotes}</span>
                  </button>
                </div>

                {/* Comments on Answer */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    댓글 {answer.comments.length}
                  </h4>
                  <div className="space-y-2 mb-3">
                    {answer.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                          {getRoleBadge(comment.authorRole)}
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment to Answer */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAnswerComments[answer.id] || ''}
                      onChange={(e) =>
                        setNewAnswerComments(prev => ({
                          ...prev,
                          [answer.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleAddAnswerComment(answer.id)
                      }
                      placeholder="댓글을 입력하세요..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => handleAddAnswerComment(answer.id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
