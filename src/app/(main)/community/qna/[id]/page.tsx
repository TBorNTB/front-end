"use client";

import { useEffect, useMemo, useState } from 'react';
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
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

import { questionService } from '@/lib/api/services/question-services';
import type { AnswerItem, QuestionDetail } from '@/types/services/question';
import {
  createComment,
  createReply,
  fetchComments,
  fetchReplies,
  fetchLikeStatus,
  fetchViewCount,
  incrementViewCount,
  toggleLike,
} from '@/lib/api/services/user-services';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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
  profileImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  replyCount: number;
}

interface Answer {
  id: string;
  username: string;
  content: string;
  author: string;
  authorRole: 'member' | 'admin' | 'guest';
  profileImageUrl?: string;
  createdAt: string;
  isAccepted: boolean;
  comments: Comment[];
  upvotes: number;
  hasUpvoted: boolean;
}

interface Question {
  id: string;
  username: string;
  title: string;
  description?: string;
  content: string;
  author: string;
  authorRole: 'member' | 'admin' | 'guest';
  profileImageUrl?: string;
  techTags: TechTag[];
  createdAt: string;
  updatedAt: string;
  views: number;
  upvotes: number;
  hasUpvoted: boolean;
  answers: Answer[];
  comments: Comment[];
  isBookmarked: boolean;
  hasAcceptedAnswer: boolean;
}

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

const toQuestionState = (
  q: QuestionDetail,
  viewCount: number,
  likeCount: number,
  isLiked: boolean
): Question => {
  const getDisplayName = (nickname?: string, realName?: string): string => {
    if (!nickname && !realName) {
      return '탈퇴한 유저';
    }
    return nickname || realName || '탈퇴한 유저';
  };
  const author = getDisplayName(q.nickname, q.realName);
  return {
    id: String(q.id),
    username: q.username,
    title: q.title,
    description: q.description,
    content: q.content,
    author,
    authorRole: 'member',
    profileImageUrl: q.profileImageUrl,
    techTags: (q.categories ?? []).map((name) => ({
      id: name,
      name,
      color: colorForCategory(name),
    })),
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    views: viewCount,
    upvotes: likeCount,
    hasUpvoted: isLiked,
    answers: [],
    comments: [],
    isBookmarked: false,
    hasAcceptedAnswer: q.status === 'ACCEPTED',
  };
};

const toAnswerState = (a: AnswerItem): Answer => {
  const getDisplayName = (nickname?: string, realName?: string): string => {
    if (!nickname && !realName) {
      return '탈퇴한 유저';
    }
    return nickname || realName || '탈퇴한 유저';
  };
  const author = getDisplayName(a.nickname, a.realName);
  return {
    id: String(a.id),
    username: a.username,
    content: a.content,
    author,
    authorRole: 'member',
    profileImageUrl: a.profileImageUrl,
    createdAt: a.createdAt,
    isAccepted: Boolean(a.accepted),
    comments: [],
    upvotes: 0,
    hasUpvoted: false,
  };
};

const toCommentState = (c: any): Comment => {
  const getDisplayName = (user?: { nickname?: string; realName?: string }): string => {
    if (!user || (!user.nickname && !user.realName)) {
      return '탈퇴한 유저';
    }
    return user.nickname || user.realName || '탈퇴한 유저';
  };
  const displayName = c.user ? getDisplayName(c.user) : (c.username ?? '사용자');
  return {
    id: String(c.id ?? ''),
    content: String(c.content ?? ''),
    author: displayName,
    authorRole: 'member',
    profileImageUrl: c.user?.profileImageUrl,
    createdAt: String(c.createdAt ?? new Date().toISOString()),
    updatedAt: c.updatedAt ? String(c.updatedAt) : undefined,
    replyCount: Number(c.replyCount ?? 0) || 0,
  };
};

type ReplyTarget = {
  postId: string;
  postType: 'QNA_QUESTION' | 'QNA_ANSWER';
  parentId: number;
} | null;

const toNumberId = (id: string): number | null => {
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
};

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = useMemo(() => String((params as any)?.id ?? ''), [params]);

  const { user: currentUser } = useCurrentUser();
  const currentRole: 'guest' | 'member' | 'admin' = useMemo(() => {
    if (!currentUser) return 'guest';
    const role = String(currentUser.role ?? '').toUpperCase();
    if (role.includes('ADMIN')) return 'admin';
    return 'member';
  }, [currentUser]);
  const currentUsername = currentUser?.username ?? '';

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answersPage, setAnswersPage] = useState(0);
  const [answersTotalPage, setAnswersTotalPage] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [newAnswer, setNewAnswer] = useState('');
  const [newQuestionComment, setNewQuestionComment] = useState('');
  const [newAnswerComments, setNewAnswerComments] = useState<Record<string, string>>({});
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingQuestionLike, setIsTogglingQuestionLike] = useState(false);

  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editAnswerContent, setEditAnswerContent] = useState('');
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [acceptingAnswerId, setAcceptingAnswerId] = useState<string | null>(null);

  // Replies (대댓글)
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(() => new Set());
  const [repliesByParentId, setRepliesByParentId] = useState<Record<number, Comment[]>>({});
  
  const isQuestionAuthor = Boolean(currentUsername) && currentUsername === (question?.username ?? '');
  const canManageQuestion = currentRole !== 'guest' && (isQuestionAuthor || currentRole === 'admin');

  const canManageAnswer = (answer: Answer) =>
    currentRole !== 'guest' && (currentRole === 'admin' || (currentUsername && currentUsername === answer.username));

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
    setQuestion(prev => (prev ? { ...prev, isBookmarked: !prev.isBookmarked } : prev));
  };

  const handleUpvoteQuestion = () => {
    if (!questionId || isTogglingQuestionLike) return;

    (async () => {
      setIsTogglingQuestionLike(true);
      try {
        const res = await toggleLike(questionId, 'QNA_QUESTION');
        setQuestion((prev) =>
          prev
            ? {
                ...prev,
                upvotes: res.likeCount ?? prev.upvotes,
                hasUpvoted: res.status === 'LIKED',
              }
            : prev
        );
      } catch (e) {
        alert(e instanceof Error ? e.message : '좋아요 처리에 실패했습니다.');
      } finally {
        setIsTogglingQuestionLike(false);
      }
    })();
  };

  const handleStartEdit = () => {
    if (!question) return;
    if (!canManageQuestion) {
      alert('작성자(또는 관리자)만 수정할 수 있습니다.');
      return;
    }

    setEditTitle(question.title);
    setEditDescription(question.description ?? '');
    setEditContent(question.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!questionId || !question || isSaving) return;
    if (!canManageQuestion) {
      alert('작성자(또는 관리자)만 수정할 수 있습니다.');
      return;
    }

    if (!editTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!editContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await questionService.updateQuestion(questionId, {
        title: editTitle.trim(),
        categories: question.techTags.map((t) => t.name),
        description: (editDescription.trim() || editTitle.trim()).slice(0, 200),
        content: editContent.trim(),
      });

      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              title: updated.title,
              description: updated.description,
              content: updated.content,
              techTags: (updated.categories ?? []).map((name) => ({
                id: name,
                name,
                color: colorForCategory(name),
              })),
              updatedAt: updated.updatedAt,
              hasAcceptedAnswer: updated.status === 'ACCEPTED',
            }
          : prev
      );

      setIsEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : '질문 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionId || isSaving) return;
    if (!canManageQuestion) {
      alert('작성자(또는 관리자)만 삭제할 수 있습니다.');
      return;
    }

    const ok = window.confirm('정말 이 질문을 삭제할까요?');
    if (!ok) return;

    setIsSaving(true);
    try {
      await questionService.deleteQuestion(questionId);
      router.push('/community?tab=qna');
    } catch (e) {
      alert(e instanceof Error ? e.message : '질문 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!questionId) return;
    if (!isQuestionAuthor) {
      alert('질문 작성자만 답변을 채택할 수 있습니다.');
      return;
    }
    if (acceptingAnswerId) return;

    const isCurrentlyAccepted = answers.some((a) => a.id === answerId && a.isAccepted);

    setAcceptingAnswerId(answerId);
    try {
      await questionService.acceptAnswer(questionId, answerId);

      setAnswers((prev) => {
        const next = prev.map((a) =>
          a.id === answerId ? { ...a, isAccepted: !isCurrentlyAccepted } : a
        );
        const hasAnyAccepted = next.some((a) => a.isAccepted);
        setQuestion((qPrev) => (qPrev ? { ...qPrev, hasAcceptedAnswer: hasAnyAccepted } : qPrev));
        return next;
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : '답변 채택에 실패했습니다.');
    } finally {
      setAcceptingAnswerId(null);
    }
  };

  const handleUpvoteAnswer = (answerId: string) => {
    (async () => {
      try {
        const res = await toggleLike(answerId, 'QNA_ANSWER');
        setAnswers(prev =>
          prev.map(a =>
            a.id === answerId
              ? {
                  ...a,
                  upvotes: res.likeCount ?? a.upvotes,
                  hasUpvoted: res.status === 'LIKED',
                }
              : a
          )
        );
      } catch (e) {
        alert(e instanceof Error ? e.message : '좋아요 처리에 실패했습니다.');
      }
    })();
  };

  const loadAnswers = async (page: number, isCancelled?: () => boolean) => {
    if (!questionId) return;

    const res = await questionService.getAnswerOffset(questionId, {
      page,
      size: 5,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    });

    if (isCancelled?.()) return;

    const mapped = (res.data ?? []).map(toAnswerState);
    setAnswers(mapped);
    setQuestion((prev) =>
      prev
        ? {
            ...prev,
            hasAcceptedAnswer: prev.hasAcceptedAnswer || mapped.some((a) => a.isAccepted),
          }
        : prev
    );
    setAnswersTotalPage(res.totalPage ?? 0);

    await Promise.all(
      mapped.map(async (a) => {
        const [like, comments] = await Promise.all([
          fetchLikeStatus(a.id, 'QNA_ANSWER').catch(() => ({ likeCount: 0, status: 'NOT_LIKED' as const })),
          fetchComments(a.id, 'QNA_ANSWER', 0, 10, 'DESC').catch(() => ({
            content: [],
            hasNext: false,
            nextCursorId: 0,
          })),
        ]);

        if (isCancelled?.()) return;

        setAnswers((prev) =>
          prev.map((p) =>
            p.id === a.id
              ? {
                  ...p,
                  upvotes: like.likeCount ?? p.upvotes,
                  hasUpvoted: like.status === 'LIKED',
                  comments: (comments.content ?? []).map(toCommentState),
                }
              : p
          )
        );
      })
    );
  };

  const handleSubmitAnswer = async () => {
    if (!questionId) return;
    if (currentRole === 'guest') {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!newAnswer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    if (isSubmittingAnswer) return;

    setIsSubmittingAnswer(true);
    try {
      await questionService.createAnswer(questionId, { content: newAnswer.trim() });
      setNewAnswer('');
      setShowAnswerForm(false);
      setAnswersPage(0);
      await loadAnswers(0);
    } catch (e) {
      alert(e instanceof Error ? e.message : '답변 등록에 실패했습니다.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleStartEditAnswer = (answer: Answer) => {
    if (!canManageAnswer(answer)) {
      alert('작성자(또는 관리자)만 수정할 수 있습니다.');
      return;
    }
    setEditingAnswerId(answer.id);
    setEditAnswerContent(answer.content);
  };

  const handleCancelEditAnswer = () => {
    setEditingAnswerId(null);
    setEditAnswerContent('');
  };

  const handleSaveEditAnswer = async (answerId: string) => {
    if (isSavingAnswer) return;
    if (!editAnswerContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const target = answers.find((a) => a.id === answerId);
    if (!target) return;
    if (!canManageAnswer(target)) {
      alert('작성자(또는 관리자)만 수정할 수 있습니다.');
      return;
    }

    setIsSavingAnswer(true);
    try {
      const updated = await questionService.updateAnswer(answerId, { content: editAnswerContent.trim() });
      setAnswers((prev) =>
        prev.map((a) => (a.id === answerId ? { ...a, content: updated.content } : a))
      );
      setEditingAnswerId(null);
      setEditAnswerContent('');
    } catch (e) {
      alert(e instanceof Error ? e.message : '답변 수정에 실패했습니다.');
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    const target = answers.find((a) => a.id === answerId);
    if (!target) return;
    if (!canManageAnswer(target)) {
      alert('작성자(또는 관리자)만 삭제할 수 있습니다.');
      return;
    }

    const ok = window.confirm('이 답변을 삭제할까요?');
    if (!ok) return;

    setIsSavingAnswer(true);
    try {
      await questionService.deleteAnswer(answerId);

      const nextPage = answers.length <= 1 && answersPage > 0 ? answersPage - 1 : answersPage;
      if (nextPage !== answersPage) setAnswersPage(nextPage);
      await loadAnswers(nextPage);
    } catch (e) {
      alert(e instanceof Error ? e.message : '답변 삭제에 실패했습니다.');
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const handleAddQuestionComment = () => {
    if (!newQuestionComment.trim()) return;
    if (!questionId) return;

    (async () => {
      try {
        await createComment(questionId, 'QNA_QUESTION', { content: newQuestionComment.trim() });
        const list = await fetchComments(questionId, 'QNA_QUESTION', 0, 20, 'DESC');
        setQuestion(prev => (prev ? { ...prev, comments: (list.content ?? []).map(toCommentState) } : prev));
        setNewQuestionComment('');
      } catch (e) {
        alert(e instanceof Error ? e.message : '댓글 작성에 실패했습니다.');
      }
    })();
  };

  const handleAddAnswerComment = (answerId: string) => {
    const commentContent = newAnswerComments[answerId];
    if (!commentContent?.trim()) return;

    (async () => {
      try {
        await createComment(answerId, 'QNA_ANSWER', { content: commentContent.trim() });
        const list = await fetchComments(answerId, 'QNA_ANSWER', 0, 20, 'DESC');
        setAnswers(prev =>
          prev.map(a => (a.id === answerId ? { ...a, comments: (list.content ?? []).map(toCommentState) } : a))
        );
        setNewAnswerComments(prev => ({ ...prev, [answerId]: '' }));
      } catch (e) {
        alert(e instanceof Error ? e.message : '댓글 작성에 실패했습니다.');
      }
    })();
  };

  const handleToggleReplyInput = (target: Exclude<ReplyTarget, null>) => {
    setReplyTarget((prev) => {
      if (prev && prev.parentId === target.parentId && prev.postId === target.postId && prev.postType === target.postType) {
        return null;
      }
      return target;
    });
    setReplyContent('');
  };

  const handleLoadReplies = async (parentId: number) => {
    if (expandedReplies.has(parentId)) {
      setExpandedReplies((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
      return;
    }

    try {
      const res = await fetchReplies(parentId, 0, 10, 'DESC');
      setRepliesByParentId((prev) => ({
        ...prev,
        [parentId]: (res.content ?? []).map(toCommentState),
      }));
      setExpandedReplies((prev) => new Set(prev).add(parentId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyTarget) return;
    if (!replyContent.trim()) return;

    try {
      await createReply(replyTarget.postId, replyTarget.parentId, replyTarget.postType, {
        content: replyContent.trim(),
      });

      setReplyContent('');
      setReplyTarget(null);

      // Refresh replies list
      await handleLoadReplies(replyTarget.parentId);

      // Refresh parent comments list to update replyCount
      if (replyTarget.postType === 'QNA_QUESTION') {
        const list = await fetchComments(questionId, 'QNA_QUESTION', 0, 20, 'DESC');
        setQuestion((prev) => (prev ? { ...prev, comments: (list.content ?? []).map(toCommentState) } : prev));
      } else {
        const list = await fetchComments(replyTarget.postId, 'QNA_ANSWER', 0, 20, 'DESC');
        setAnswers((prev) =>
          prev.map((a) => (a.id === replyTarget.postId ? { ...a, comments: (list.content ?? []).map(toCommentState) } : a))
        );
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '대댓글 작성에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // 1) increment view count, then read view + like + detail
        await incrementViewCount(questionId, 'QNA_QUESTION').catch(() => null);
        const [view, like, detail] = await Promise.all([
          fetchViewCount(questionId, 'QNA_QUESTION').catch(() => ({ viewCount: 0 })),
          fetchLikeStatus(questionId, 'QNA_QUESTION').catch(() => ({ likeCount: 0, status: 'NOT_LIKED' as const })),
          questionService.getQuestionDetail(questionId),
        ]);

        if (cancelled) return;

        setQuestion(
          toQuestionState(
            detail,
            view.viewCount ?? 0,
            like.likeCount ?? 0,
            like.status === 'LIKED'
          )
        );

        // 2) question comments
        const qComments = await fetchComments(questionId, 'QNA_QUESTION', 0, 20, 'DESC');
        if (!cancelled) {
          setQuestion(prev => (prev ? { ...prev, comments: (qComments.content ?? []).map(toCommentState) } : prev));
        }
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : '질문을 불러오지 못했습니다.');
        setQuestion(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [questionId]);

  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;

    (async () => {
      try {
        await loadAnswers(answersPage, () => cancelled);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setAnswers([]);
        setAnswersTotalPage(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [questionId, answersPage]);

  return (
    <div className="min-h-screen bg-background">
      <TitleBanner
        title="Q&A"
        description="기술 질문과 답변을 공유하는 공간입니다."
        backgroundImage="/images/BgHeader.png"
      />

      <main className="max-w-5xl mx-auto px-4 py-10">
        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 text-center text-gray-700">
            불러오는 중...
          </div>
        )}

        {errorMessage && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 text-center">
            <p className="text-gray-700 mb-3">{errorMessage}</p>
            <button
              onClick={() => router.push('/community?tab=qna')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              목록으로
            </button>
          </div>
        )}

        {/* Question Section */}
        {question && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  {question.profileImageUrl && (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <ImageWithFallback
                        src={question.profileImageUrl}
                        fallbackSrc="/images/placeholder/default-avatar.svg"
                        alt={question.author}
                        type="avatar"
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
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
                {question.hasAcceptedAnswer && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>채택완료</span>
                  </div>
                )}
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

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {canManageQuestion && (
                <>
                  <button
                    onClick={handleStartEdit}
                    disabled={isSaving}
                    className="p-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="수정"
                  >
                    <Edit className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={handleDeleteQuestion}
                    disabled={isSaving}
                    className="p-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="삭제"
                  >
                    <Trash2 className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              <button
                onClick={handleUpvoteQuestion}
                disabled={isTogglingQuestionLike}
                className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                title={question.hasUpvoted ? '좋아요 취소' : '좋아요'}
              >
                <ThumbsUp
                  className={
                    question.hasUpvoted
                      ? 'w-5 h-5 text-primary-600 fill-primary-600'
                      : 'w-5 h-5 text-gray-700'
                  }
                />
                <span className="text-sm text-gray-700">{question.upvotes}</span>
              </button>

              <button
                onClick={handleBookmark}
                className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
                title={question.isBookmarked ? '스크랩 취소' : '스크랩'}
              >
                {question.isBookmarked ? (
                  <BookmarkCheck className="w-6 h-6 text-primary-600 fill-primary-600" />
                ) : (
                  <Bookmark className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">제목</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">설명</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="질문 요약(선택)"
                    className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">내용</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-56 px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none border-gray-300 focus:ring-primary-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap">{question.content}</div>
            )}
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
                      {comment.profileImageUrl && (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <ImageWithFallback
                            src={comment.profileImageUrl}
                            fallbackSrc="/images/placeholder/default-avatar.svg"
                            alt={comment.author}
                            type="avatar"
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                      {getRoleBadge(comment.authorRole)}
                      <span className="text-xs text-gray-700">{formatDate(comment.createdAt)}</span>
                      {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                        <span className="text-xs text-gray-700">(수정됨)</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>

                  {/* Reply controls */}
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => {
                        const parentId = toNumberId(comment.id);
                        if (!parentId) return;
                        handleToggleReplyInput({ postId: questionId, postType: 'QNA_QUESTION', parentId });
                      }}
                      className="text-sm text-gray-700 hover:text-primary-600"
                    >
                      답글
                    </button>
                    {comment.replyCount > 0 && (
                      <button
                        onClick={() => {
                          const parentId = toNumberId(comment.id);
                          if (!parentId) return;
                          handleLoadReplies(parentId);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {(() => {
                          const parentId = toNumberId(comment.id);
                          return parentId && expandedReplies.has(parentId)
                            ? '답글 숨기기'
                            : `답글 ${comment.replyCount}개 보기`;
                        })()}
                      </button>
                    )}
                  </div>

                  {/* Reply input */}
                  {(() => {
                    const parentId = toNumberId(comment.id);
                    const isOpen = Boolean(
                      parentId &&
                        replyTarget?.postType === 'QNA_QUESTION' &&
                        replyTarget?.postId === questionId &&
                        replyTarget?.parentId === parentId
                    );
                    if (!parentId || !isOpen) return null;
                    return (
                      <div className="mt-3 pl-4 border-l-2 border-primary-200">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="대댓글을 작성해주세요..."
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-2"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSubmitReply}
                            disabled={!replyContent.trim()}
                            className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            등록
                          </button>
                          <button
                            onClick={() => {
                              setReplyTarget(null);
                              setReplyContent('');
                            }}
                            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Replies */}
                  {(() => {
                    const parentId = toNumberId(comment.id);
                    if (!parentId) return null;
                    if (!expandedReplies.has(parentId)) return null;
                    const replies = repliesByParentId[parentId];
                    if (!replies || replies.length === 0) return null;
                    return (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                        {replies.map((reply) => (
                          <div key={`reply-${comment.id}-${reply.id}`} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              {reply.profileImageUrl && (
                                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                  <ImageWithFallback
                                    src={reply.profileImageUrl}
                                    fallbackSrc="/images/placeholder/default-avatar.svg"
                                    alt={reply.author}
                                    type="avatar"
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-900">{reply.author}</span>
                              {getRoleBadge(reply.authorRole)}
                              <span className="text-xs text-gray-700">{formatDate(reply.createdAt)}</span>
                              {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                                <span className="text-xs text-gray-700">(수정됨)</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
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
        )}

        {/* Answers Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {answers.length}개의 답변
            </h2>
            {currentRole !== 'guest' && (
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
                  disabled={isSubmittingAnswer}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  {isSubmittingAnswer ? '등록 중...' : '답변 등록'}
                </button>
              </div>
            </div>
          )}

          {/* Answers List */}
          <div className="space-y-4">
            {answers.map((answer) => (
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
                      {answer.profileImageUrl && (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <ImageWithFallback
                            src={answer.profileImageUrl}
                            fallbackSrc="/images/placeholder/default-avatar.svg"
                            alt={answer.author}
                            type="avatar"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{answer.author}</span>
                      {getRoleBadge(answer.authorRole)}
                    </div>
                    <span className="text-sm text-gray-700">{formatDate(answer.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Accept Button (only for question author) */}
                    {isQuestionAuthor && (
                      <button
                        onClick={() => handleAcceptAnswer(answer.id)}
                        disabled={Boolean(acceptingAnswerId)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          answer.isAccepted
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {answer.isAccepted ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            채택 취소
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            {acceptingAnswerId === answer.id ? '채택 중...' : '채택하기'}
                          </>
                        )}
                      </button>
                    )}

                    {canManageAnswer(answer) && (
                      <>
                        <button
                          onClick={() => handleStartEditAnswer(answer)}
                          disabled={isSavingAnswer}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                          title="답변 수정"
                        >
                          <Edit className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnswer(answer.id)}
                          disabled={isSavingAnswer}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                          title="답변 삭제"
                        >
                          <Trash2 className="w-5 h-5 text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {answer.isAccepted && !isQuestionAuthor && (
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      채택된 답변
                    </span>
                  )}
                </div>

                {/* Answer Content */}
                <div className="prose max-w-none mb-4">
                  {editingAnswerId === answer.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editAnswerContent}
                        onChange={(e) => setEditAnswerContent(e.target.value)}
                        className="w-full h-36 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCancelEditAnswer}
                          disabled={isSavingAnswer}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          취소
                        </button>
                        <button
                          onClick={() => handleSaveEditAnswer(answer.id)}
                          disabled={isSavingAnswer}
                          className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {isSavingAnswer ? '저장 중...' : '저장'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-700 whitespace-pre-wrap">{answer.content}</div>
                  )}
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
                          {comment.profileImageUrl && (
                            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              <ImageWithFallback
                                src={comment.profileImageUrl}
                                fallbackSrc="/images/placeholder/default-avatar.svg"
                                alt={comment.author}
                                type="avatar"
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                          {getRoleBadge(comment.authorRole)}
                          <span className="text-xs text-gray-700">{formatDate(comment.createdAt)}</span>
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <span className="text-xs text-gray-700">(수정됨)</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>

                        {/* Reply controls */}
                        <div className="mt-3 flex items-center gap-4">
                          <button
                            onClick={() => {
                              const parentId = toNumberId(comment.id);
                              if (!parentId) return;
                              handleToggleReplyInput({ postId: answer.id, postType: 'QNA_ANSWER', parentId });
                            }}
                            className="text-sm text-gray-700 hover:text-primary-600"
                          >
                            답글
                          </button>
                          {comment.replyCount > 0 && (
                            <button
                              onClick={() => {
                                const parentId = toNumberId(comment.id);
                                if (!parentId) return;
                                handleLoadReplies(parentId);
                              }}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              {(() => {
                                const parentId = toNumberId(comment.id);
                                return parentId && expandedReplies.has(parentId)
                                  ? '답글 숨기기'
                                  : `답글 ${comment.replyCount}개 보기`;
                              })()}
                            </button>
                          )}
                        </div>

                        {/* Reply input */}
                        {(() => {
                          const parentId = toNumberId(comment.id);
                          const isOpen = Boolean(
                            parentId &&
                              replyTarget?.postType === 'QNA_ANSWER' &&
                              replyTarget?.postId === answer.id &&
                              replyTarget?.parentId === parentId
                          );
                          if (!parentId || !isOpen) return null;
                          return (
                            <div className="mt-3 pl-4 border-l-2 border-primary-200">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="대댓글을 작성해주세요..."
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-2"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSubmitReply}
                                  disabled={!replyContent.trim()}
                                  className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  등록
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyTarget(null);
                                    setReplyContent('');
                                  }}
                                  className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Replies */}
                        {(() => {
                          const parentId = toNumberId(comment.id);
                          if (!parentId) return null;
                          if (!expandedReplies.has(parentId)) return null;
                          const replies = repliesByParentId[parentId];
                          if (!replies || replies.length === 0) return null;
                          return (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                              {replies.map((reply) => (
                                <div key={`reply-${comment.id}-${reply.id}`} className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    {reply.profileImageUrl && (
                                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                        <ImageWithFallback
                                          src={reply.profileImageUrl}
                                          fallbackSrc="/images/placeholder/default-avatar.svg"
                                          alt={reply.author}
                                          type="avatar"
                                          width={24}
                                          height={24}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-900">{reply.author}</span>
                                    {getRoleBadge(reply.authorRole)}
                                    <span className="text-xs text-gray-700">{formatDate(reply.createdAt)}</span>
                                    {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                                      <span className="text-xs text-gray-700">(수정됨)</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
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

            {answersTotalPage > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  disabled={answersPage <= 0}
                  onClick={() => setAnswersPage(p => Math.max(0, p - 1))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                >
                  이전
                </button>
                <span className="text-sm text-gray-700">
                  {answersPage + 1} / {answersTotalPage}
                </span>
                <button
                  disabled={answersPage >= answersTotalPage - 1}
                  onClick={() => setAnswersPage(p => Math.min(answersTotalPage - 1, p + 1))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
