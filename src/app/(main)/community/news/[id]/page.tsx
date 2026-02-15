'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, Fragment } from 'react';
import { Heart, Eye, Clock, ArrowLeft, Crown, Users, Calendar, Tag, MessageCircle, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { 
  fetchViewCount,
  incrementViewCount,
  fetchLikeCount,
  fetchLikeStatus,
  toggleLike,
  fetchComments,
  createComment,
  createReply,
  updateComment,
  deleteComment,
  fetchReplies,
  Comment,
  CommentListResponse
} from '@/lib/api/services/user-services';
import { deleteNews } from '@/lib/api/services/news-services';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

interface WriterProfile {
  username: string;
  nickname: string;
  realName: string;
  profileImageUrl: string;
}

interface ParticipantProfile {
  username: string;
  nickname: string;
  realName: string;
  profileImageUrl: string;
}

interface NewsDetail {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  thumbnailUrl: string;
  writerProfile: WriterProfile;
  participantProfiles: ParticipantProfile[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [newsId, setNewsId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const commentsRef = useRef<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [commentSortDirection, setCommentSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [nextCursorId, setNextCursorId] = useState<number>(0);
  const nextCursorIdRef = useRef<number>(0);
  const [hasNextComments, setHasNextComments] = useState<boolean>(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [replies, setReplies] = useState<Record<number, Comment[]>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Sidebar sections
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    info: true,
    participants: true,
    related: false,
  });
  
  // Related news state
  const [relatedNews, setRelatedNews] = useState<Array<{
    id: number;
    title: string;
    summary: string;
    thumbnailUrl?: string;
    writerNickname?: string;
    createdAt: string;
    viewCount: number;
    likeCount: number;
  }>>([]);
  const [isLoadingRelatedNews, setIsLoadingRelatedNews] = useState(false);

  // Next.js 15: params는 Promise라 언랩 필요
  useEffect(() => {
    let mounted = true;

    params.then((resolvedParams) => {
      if (!mounted) return;
      setNewsId(resolvedParams.id);
    });

    return () => {
      mounted = false;
    };
  }, [params]);

  // Comment functions
  const loadComments = async (postId: string, direction: 'ASC' | 'DESC', reset: boolean = true) => {
    try {
      if (reset) {
        setIsLoadingComments(true);
        setNextCursorId(0);
        nextCursorIdRef.current = 0;
      } else {
        setIsLoadingMoreComments(true);
      }
      
      const cursorId = reset ? 0 : nextCursorIdRef.current;
      const response = await fetchComments(postId, 'NEWS', cursorId, 5, direction);
      
      if (reset) {
        setComments(response.content);
        commentsRef.current = response.content;
      } else {
        setComments(prevComments => {
          const existingIds = new Set(prevComments.map(c => c.id));
          const newComments = response.content.filter(c => !existingIds.has(c.id));
          const updated = [...prevComments, ...newComments];
          commentsRef.current = updated;
          return updated;
        });
      }
      
      setNextCursorId(response.nextCursorId);
      nextCursorIdRef.current = response.nextCursorId;
      setHasNextComments(response.hasNext);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
      setIsLoadingMoreComments(false);
    }
  };

  const loadMoreComments = async () => {
    if (newsId && hasNextComments && !isLoadingMoreComments) {
      await loadComments(newsId, commentSortDirection, false);
    }
  };

  // 관련 뉴스 로드 함수
  const loadRelatedNews = async (category: string, excludeId: number) => {
    try {
      setIsLoadingRelatedNews(true);
      
      const queryParams = new URLSearchParams();
      queryParams.append('category', category);
      queryParams.append('postSortType', 'LATEST');
      queryParams.append('size', '4'); // 현재 뉴스 제외를 위해 4개 가져오기
      queryParams.append('page', '0');

      const response = await fetch(`/api/news/search?${queryParams.toString()}`);

      if (response.ok) {
        const data = await response.json();
        // 현재 뉴스 제외하고 최대 3개만
        const filtered = (data.content || [])
          .filter((item: any) => item.id !== excludeId)
          .slice(0, 3)
          .map((item: any) => ({
            id: item.id,
            title: item.content?.title || '',
            summary: item.content?.summary || '',
            thumbnailUrl: item.thumbnailUrl,
            writerNickname: item.writer?.nickname || item.writer?.realname || item.writer?.username || '작성자',
            createdAt: item.createdAt,
            viewCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
          }));
        
        setRelatedNews(filtered);
      }
    } catch (error) {
      console.error('Error loading related news:', error);
      setRelatedNews([]);
    } finally {
      setIsLoadingRelatedNews(false);
    }
  };

  // 탈퇴한 유저 확인 헬퍼 함수
  const getDisplayName = (nickname?: string, realName?: string): string => {
    if (!nickname && !realName) {
      return '탈퇴한 유저';
    }
    return nickname || realName || '탈퇴한 유저';
  };

  // API 호출
  useEffect(() => {
    if (!newsId) return;

    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 병렬로 데이터 가져오기
        const [newsResponse, viewCountData, likeCountData, likeStatusData] = await Promise.all([
          fetch(`/api/news/${newsId}`),
          incrementViewCount(newsId, 'NEWS').catch(() => ({ viewCount: 0 })),
          fetchLikeCount(newsId, 'NEWS').catch(() => ({ likedCount: 0 })),
          fetchLikeStatus(newsId, 'NEWS').catch(() => ({ likeCount: 0, status: 'NOT_LIKED' as const })),
        ]);

        if (!newsResponse.ok) {
          throw new Error(`Failed to fetch news: ${newsResponse.status}`);
        }

        const apiData = await newsResponse.json();
        
        // API 응답을 NewsDetail 형식으로 매핑
        const data: NewsDetail = {
          id: apiData.id,
          title: apiData.title,
          summary: apiData.summary || '',
          content: apiData.content || '',
          category: apiData.category || '',
          thumbnailUrl: apiData.thumbnailUrl || '',
          writerProfile: apiData.writerProfile || {
            username: 'unknown',
            nickname: '',
            realName: '',
            profileImageUrl: '',
          },
          participantProfiles: apiData.participantProfiles || [],
          tags: apiData.tags || [],
          createdAt: apiData.createdAt || '',
          updatedAt: apiData.updatedAt || '',
        };
        
        setNews(data);
        setViewCount(viewCountData.viewCount);
        setLikeCount(likeStatusData.likeCount || likeCountData.likedCount);
        setIsLiked(likeStatusData.status === 'LIKED');
        
        // 댓글 로드
        await loadComments(newsId, 'DESC', true);
        
        // 관련 뉴스 로드 (같은 카테고리, 현재 뉴스 제외, 최신순 3개)
        if (data.category) {
          await loadRelatedNews(data.category, data.id);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err instanceof Error ? err.message : '뉴스를 불러오는 중 오류가 발생했습니다.');
        setNews(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [newsId]);

  // 댓글 정렬 방향 변경 시 재로드
  useEffect(() => {
    if (newsId) {
      loadComments(newsId, commentSortDirection, true);
    }
  }, [commentSortDirection]);

  const handleLikeToggle = async () => {
    if (!newsId || isTogglingLike) return;
    
    setIsTogglingLike(true);
    try {
      const response = await toggleLike(newsId, 'NEWS');
      setIsLiked(response.status === 'LIKED');
      setLikeCount(response.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      // 에러 발생 시 사용자에게 알림
      if (error instanceof Error && error.message.includes('로그인이 필요')) {
        alert('로그인이 필요합니다.');
      }
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !newsId) return;
    
    try {
      await createComment(newsId, 'NEWS', { content: commentContent });
      setCommentContent('');
      await loadComments(newsId, commentSortDirection, true);
    } catch (error: any) {
      console.error('Error creating comment:', error);
      alert(error.message || '댓글 작성에 실패했습니다.');
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;
    
    try {
      await updateComment(commentId, { content: editContent });
      setEditingCommentId(null);
      setEditContent('');
      await loadComments(newsId, commentSortDirection, true);
    } catch (error: any) {
      console.error('Error updating comment:', error);
      alert(error.message || '댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    
    try {
      await deleteComment(commentId);
      await loadComments(newsId, commentSortDirection, true);
      const newReplies = { ...replies };
      Object.keys(newReplies).forEach(parentId => {
        newReplies[Number(parentId)] = newReplies[Number(parentId)].filter(
          reply => reply.id !== commentId
        );
      });
      setReplies(newReplies);
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      alert(error.message || '댓글 삭제에 실패했습니다.');
    }
  };

  const handleLoadReplies = async (commentId: number) => {
    if (expandedReplies.has(commentId)) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      return;
    }

    try {
      const response = await fetchReplies(commentId, 0, 5, commentSortDirection);
      setReplies(prev => ({
        ...prev,
        [commentId]: response.content,
      }));
      setExpandedReplies(prev => new Set(prev).add(commentId));
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim() || !newsId) return;
    
    try {
      await createReply(newsId, parentId, 'NEWS', { content: replyContent });
      setReplyingToId(null);
      setReplyContent('');
      await handleLoadReplies(parentId);
      await loadComments(newsId, commentSortDirection, true);
    } catch (error: any) {
      console.error('Error creating reply:', error);
      alert(error.message || '대댓글 작성에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const isValidImageUrl = (url?: string): string | null => {
    if (!url || url === 'null' || url === 'undefined') return null;
    if (url.startsWith('/')) return url;
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEdit = () => {
    router.push(`/community/news/${newsId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 뉴스를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteNews(newsId);
      alert('뉴스가 성공적으로 삭제되었습니다.');
      router.push('/community');
    } catch (error: any) {
      console.error('Error deleting news:', error);
      alert(error.message || '뉴스 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = currentUser?.username === news?.writerProfile?.username;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">뉴스를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 뉴스가 없거나 에러가 있는 경우 삭제된 게시글 메시지 표시
  if ((error && !news) || (!isLoading && !news)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">해당 게시글은 삭제 된 게시글입니다</h2>
            <p className="text-gray-600 mb-6">
              요청하신 게시글을 찾을 수 없습니다. 삭제되었거나 존재하지 않는 게시글일 수 있습니다.
            </p>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 썸네일 URL 정규화 (이미 API에서 받은 thumbnailUrl 사용)
  const readTime = Math.ceil((news.content?.length || 0) / 500);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">목록으로 돌아가기</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-8 space-y-4">
              {/* News Info Section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => toggleSection('info')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-bold text-gray-900">뉴스 정보</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      openSections.info ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openSections.info && (
                  <div className="p-4 space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">카테고리</p>
                      <span className="px-2 py-1 rounded text-xs bg-primary-100 text-primary-700">
                        {news.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">작성일</p>
                      <p className="text-gray-900">{formatDate(news.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">수정일</p>
                      <p className="text-gray-900">{formatDate(news.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">읽기 시간</p>
                      <p className="text-gray-900">{readTime}분</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Participants Section */}
              {news.participantProfiles && news.participantProfiles.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleSection('participants')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-900">참여자 ({news.participantProfiles.length})</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openSections.participants ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {openSections.participants && (
                    <div className="p-4 space-y-3">
                      {news.participantProfiles.map((participant, idx) => {
                        const displayName = getDisplayName(participant.nickname, participant.realName);
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-blue-200 flex-shrink-0">
                              {participant.profileImageUrl ? (
                                <ImageWithFallback
                                  src={participant.profileImageUrl}
                                  fallbackSrc="/images/placeholder/default-avatar.svg"
                                  alt={displayName}
                                  type="avatar"
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-blue-700">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {displayName}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Related News Section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => toggleSection('related')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-bold text-gray-900">관련 뉴스 ({relatedNews.length})</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      openSections.related ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openSections.related && (
                  <div className="p-4">
                    {isLoadingRelatedNews ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-2">로딩 중...</p>
                      </div>
                    ) : relatedNews.length > 0 ? (
                      <div className="space-y-3">
                        {relatedNews.map((item) => {
                          return (
                            <Link
                              key={item.id}
                              href={`/community/news/${item.id}`}
                              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                            >
                              <div className="flex gap-3">
                                {item.thumbnailUrl && (
                                  <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                    <ImageWithFallback
                                      src={item.thumbnailUrl}
                                      fallbackSrc="/images/placeholder/news.png"
                                      alt={item.title}
                                      type="news"
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary-600 transition-colors">
                                    {item.title}
                                  </h4>
                                  {item.summary && (
                                    <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                                      {item.summary}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                    {item.writerNickname && <span>{item.writerNickname}</span>}
                                    {item.writerNickname && <span>·</span>}
                                    <span>·</span>
                                    <span>
                                      {(() => {
                                        const date = new Date(item.createdAt);
                                        const now = new Date();
                                        const diff = now.getTime() - date.getTime();
                                        const minutes = Math.floor(diff / 60000);
                                        const hours = Math.floor(diff / 3600000);
                                        const days = Math.floor(diff / 86400000);
                                        if (minutes < 1) return '방금 전';
                                        if (minutes < 60) return `${minutes}분 전`;
                                        if (hours < 24) return `${hours}시간 전`;
                                        if (days < 7) return `${days}일 전`;
                                        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      <span>{item.viewCount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Heart className="w-3 h-3" />
                                      <span>{item.likeCount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        관련 뉴스가 없습니다
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <header className="p-8 border-b border-gray-200">
                {/* Category */}
                {news.category && (
                  <div className="mb-4">
                    <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-primary-100 text-primary-700">
                      {news.category}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {news.title}
                </h1>

                {/* Summary */}
                {news.summary && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {news.summary}
                  </p>
                )}

                {/* Author & Metadata */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-yellow-400">
                    {news.writerProfile?.profileImageUrl ? (
                      <ImageWithFallback
                        src={news.writerProfile.profileImageUrl}
                        fallbackSrc="/images/placeholder/default-avatar.svg"
                        alt={getDisplayName(news.writerProfile.nickname, news.writerProfile.realName)}
                        type="avatar"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                        {getDisplayName(news.writerProfile?.nickname, news.writerProfile?.realName).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <p className="font-semibold text-gray-900">
                        {getDisplayName(news.writerProfile?.nickname, news.writerProfile?.realName)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">
                        {new Date(news.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <span className="text-gray-300">·</span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{readTime}분</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-sm font-semibold">{likeCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="w-5 h-5" />
                      <span className="text-sm font-semibold">{viewCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">{comments.length}{hasNextComments ? '+' : ''}</span>
                    </div>
                  </div>
                  
                  {/* Edit/Delete Buttons - Only show for owner */}
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        수정
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* Thumbnail Image */}
              {news.thumbnailUrl && (
                <div className="relative w-full h-96 overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={news.thumbnailUrl}
                    fallbackSrc="/images/placeholder/news.png"
                    alt={news.title}
                    type="news"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-8 md:p-12">
                <div className="max-w-none">
                  <div 
                    className="news-content"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    <style jsx global>{`
                      .news-content {
                        font-size: 1.125rem;
                        line-height: 2;
                        color: #374151;
                      }
                      .news-content p {
                        margin-bottom: 1.5rem;
                        font-size: 1.125rem;
                        line-height: 2;
                        color: #374151;
                      }
                      .news-content h1,
                      .news-content h2,
                      .news-content h3,
                      .news-content h4,
                      .news-content h5,
                      .news-content h6 {
                        font-weight: 700;
                        margin-top: 2rem;
                        margin-bottom: 1rem;
                        color: #111827;
                      }
                      .news-content h1 {
                        font-size: 2rem;
                        line-height: 1.3;
                      }
                      .news-content h2 {
                        font-size: 1.75rem;
                        line-height: 1.4;
                      }
                      .news-content h3 {
                        font-size: 1.5rem;
                        line-height: 1.5;
                      }
                      .news-content h4 {
                        font-size: 1.25rem;
                        line-height: 1.6;
                      }
                      .news-content ul,
                      .news-content ol {
                        margin: 1.5rem 0;
                        padding-left: 2rem;
                      }
                      .news-content li {
                        margin-bottom: 0.75rem;
                        line-height: 2;
                      }
                      .news-content img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 0.75rem;
                        margin: 2rem auto;
                        display: block;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                      }
                      .news-content blockquote {
                        border-left: 4px solid #e5e7eb;
                        padding-left: 1.5rem;
                        margin: 1.5rem 0;
                        font-style: italic;
                        color: #6b7280;
                        background-color: #f9fafb;
                        padding: 1rem 1.5rem;
                        border-radius: 0.5rem;
                      }
                      .news-content code {
                        background-color: #f3f4f6;
                        padding: 0.25rem 0.5rem;
                        border-radius: 0.25rem;
                        font-size: 0.875rem;
                        font-family: 'Courier New', monospace;
                        color: #dc2626;
                      }
                      .news-content pre {
                        background-color: #1f2937;
                        color: #f9fafb;
                        padding: 1.5rem;
                        border-radius: 0.5rem;
                        overflow-x: auto;
                        margin: 1.5rem 0;
                      }
                      .news-content pre code {
                        background-color: transparent;
                        padding: 0;
                        color: inherit;
                      }
                      .news-content a {
                        color: #2563eb;
                        text-decoration: underline;
                        transition: color 0.2s;
                      }
                      .news-content a:hover {
                        color: #1d4ed8;
                      }
                      .news-content strong {
                        font-weight: 700;
                        color: #111827;
                      }
                      .news-content em {
                        font-style: italic;
                        color: #4b5563;
                      }
                      .news-content hr {
                        border: none;
                        border-top: 2px solid #e5e7eb;
                        margin: 2rem 0;
                      }
                      .news-content table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 1.5rem 0;
                      }
                      .news-content table th,
                      .news-content table td {
                        border: 1px solid #e5e7eb;
                        padding: 0.75rem;
                        text-align: left;
                      }
                      .news-content table th {
                        background-color: #f9fafb;
                        font-weight: 600;
                      }
                    `}</style>
                    {news.content ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: news.content
                        }}
                      />
                    ) : (
                      <p className="text-gray-500 italic">내용이 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {news.tags && news.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-5 h-5 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-700">태그</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {news.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer border border-primary-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Like Button */}
                <div className="mt-12 flex justify-center py-4">
                  <button
                    onClick={handleLikeToggle}
                    disabled={isTogglingLike}
                    className={`flex flex-col items-center gap-2 px-8 py-4 rounded-full border-2 transition-colors group ${
                      isLiked
                        ? 'border-red-500 bg-red-50 hover:bg-red-100'
                        : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                    } ${isTogglingLike ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        isLiked
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-400 group-hover:text-primary-600'
                      }`}
                      fill={isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span
                      className={`text-2xl font-bold transition-colors ${
                        isLiked ? 'text-red-600' : 'text-gray-900 group-hover:text-primary-600'
                      }`}
                    >
                      {likeCount}
                    </span>
                    {isTogglingLike && (
                      <span className="text-xs text-gray-500">처리 중...</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <section className="p-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    댓글 {comments.length > 0 && `(${comments.length}${hasNextComments ? '+' : ''})`}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCommentSortDirection('DESC')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        commentSortDirection === 'DESC'
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      최신순
                    </button>
                    <button
                      onClick={() => setCommentSortDirection('ASC')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        commentSortDirection === 'ASC'
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      오래된순
                    </button>
                  </div>
                </div>

                {/* Comment Input */}
                <div className="mb-8">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="댓글을 작성해주세요..."
                    className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white mb-3"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentContent.trim() || isLoadingComments}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      댓글 등록
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                {isLoadingComments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">댓글을 불러오는 중...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => {
                      const getDisplayName = (user?: { nickname?: string; realName?: string }): string => {
                        if (!user || (!user.nickname && !user.realName)) {
                          return '탈퇴한 유저';
                        }
                        return user.nickname || user.realName || '탈퇴한 유저';
                      };
                      const displayName = comment.user ? getDisplayName(comment.user) : comment.username;
                      const profileImageUrl = comment.user?.profileImageUrl;
                      const initial = displayName.charAt(0).toUpperCase();

                      return (
                        <div key={`comment-${comment.id}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex gap-4">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {profileImageUrl ? (
                                <ImageWithFallback
                                  src={profileImageUrl}
                                  fallbackSrc="/images/placeholder/default-avatar.svg"
                                  alt={displayName}
                                  type="avatar"
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                                  {initial}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{displayName}</span>
                                <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                                {comment.updatedAt !== comment.createdAt && (
                                  <span className="text-xs text-gray-400">(수정됨)</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Menu as="div" className="relative">
                                  <Menu.Button className="p-1 hover:bg-gray-200 rounded-full">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </Menu.Button>
                                  <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                  >
                                    <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                      <div className="p-1">
                                        <Menu.Item>
                                          {({ active }: { active: boolean }) => (
                                            <button
                                              onClick={() => {
                                                setEditingCommentId(comment.id);
                                                setEditContent(comment.content);
                                              }}
                                              className={`${
                                                active ? 'bg-gray-100' : ''
                                              } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                            >
                                              편집
                                            </button>
                                          )}
                                        </Menu.Item>
                                        <Menu.Item>
                                          {({ active }: { active: boolean }) => (
                                            <button
                                              onClick={() => handleDeleteComment(comment.id)}
                                              className={`${
                                                active ? 'bg-red-50' : ''
                                              } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600`}
                                            >
                                              삭제
                                            </button>
                                          )}
                                        </Menu.Item>
                                      </div>
                                    </Menu.Items>
                                  </Transition>
                                </Menu>
                              </div>
                            </div>
                            
                            {editingCommentId === comment.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditComment(comment.id)}
                                    className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                                  >
                                    저장
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(null);
                                      setEditContent('');
                                    }}
                                    className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
                                
                                {/* Reply button */}
                                <div className="mt-3 flex items-center gap-4">
                                  <button
                                    onClick={() => {
                                      if (replyingToId === comment.id) {
                                        setReplyingToId(null);
                                        setReplyContent('');
                                      } else {
                                        setReplyingToId(comment.id);
                                        setReplyContent('');
                                      }
                                    }}
                                    className="text-sm text-gray-600 hover:text-primary-600"
                                  >
                                    답글
                                  </button>
                                  {comment.replyCount > 0 && (
                                    <button
                                      onClick={() => handleLoadReplies(comment.id)}
                                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                      {expandedReplies.has(comment.id) ? '답글 숨기기' : `답글 ${comment.replyCount}개 보기`}
                                    </button>
                                  )}
                                </div>

                                {/* Reply input */}
                                {replyingToId === comment.id && (
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
                                        onClick={() => handleSubmitReply(comment.id)}
                                        disabled={!replyContent.trim()}
                                        className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        등록
                                      </button>
                                      <button
                                        onClick={() => {
                                          setReplyingToId(null);
                                          setReplyContent('');
                                        }}
                                        className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Replies */}
                                {expandedReplies.has(comment.id) && replies[comment.id] && (
                                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                                    {replies[comment.id].map((reply) => {
                                      const replyDisplayName = reply.user ? getDisplayName(reply.user) : reply.username;
                                      const replyProfileImageUrl = reply.user?.profileImageUrl;
                                      const replyInitial = replyDisplayName.charAt(0).toUpperCase();

                                      return (
                                        <div key={`reply-${comment.id}-${reply.id}`} className="bg-white rounded-lg p-3 border border-gray-200">
                                          <div className="flex gap-3">
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                              {replyProfileImageUrl ? (
                                                <ImageWithFallback
                                                  src={replyProfileImageUrl}
                                                  fallbackSrc="/images/placeholder/default-avatar.svg"
                                                  alt={replyDisplayName}
                                                  type="avatar"
                                                  width={32}
                                                  height={32}
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                  {replyInitial}
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm font-medium text-gray-900">{replyDisplayName}</span>
                                                <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                                {reply.updatedAt !== reply.createdAt && (
                                                  <span className="text-xs text-gray-400">(수정됨)</span>
                                                )}
                                              </div>
                                              <Menu as="div" className="relative">
                                                <Menu.Button className="p-1 hover:bg-gray-200 rounded-full">
                                                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                  </svg>
                                                </Menu.Button>
                                                <Transition
                                                  as={Fragment}
                                                  enter="transition ease-out duration-100"
                                                  enterFrom="transform opacity-0 scale-95"
                                                  enterTo="transform opacity-100 scale-100"
                                                  leave="transition ease-in duration-75"
                                                  leaveFrom="transform opacity-100 scale-100"
                                                  leaveTo="transform opacity-0 scale-95"
                                                >
                                                  <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    <div className="p-1">
                                                      <Menu.Item>
                                                        {({ active }: { active: boolean }) => (
                                                          <button
                                                            onClick={() => {
                                                              setEditingCommentId(reply.id);
                                                              setEditContent(reply.content);
                                                            }}
                                                            className={`${
                                                              active ? 'bg-gray-100' : ''
                                                            } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                                          >
                                                            편집
                                                          </button>
                                                        )}
                                                      </Menu.Item>
                                                      <Menu.Item>
                                                        {({ active }: { active: boolean }) => (
                                                          <button
                                                            onClick={() => handleDeleteComment(reply.id)}
                                                            className={`${
                                                              active ? 'bg-red-50' : ''
                                                            } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600`}
                                                          >
                                                            삭제
                                                          </button>
                                                        )}
                                                      </Menu.Item>
                                                    </div>
                                                  </Menu.Items>
                                                </Transition>
                                              </Menu>
                                            </div>
                                            {editingCommentId === reply.id ? (
                                              <div className="space-y-2">
                                                <textarea
                                                  value={editContent}
                                                  onChange={(e) => setEditContent(e.target.value)}
                                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                                  rows={2}
                                                />
                                                <div className="flex gap-2">
                                                  <button
                                                    onClick={() => handleEditComment(reply.id)}
                                                    className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700"
                                                  >
                                                    저장
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setEditingCommentId(null);
                                                      setEditContent('');
                                                    }}
                                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300"
                                                  >
                                                    취소
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{reply.content}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                    
                    {/* Load More Button */}
                    {hasNextComments && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={loadMoreComments}
                          disabled={isLoadingMoreComments}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isLoadingMoreComments ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                              <span>불러오는 중...</span>
                            </>
                          ) : (
                            <span>댓글 더 보기</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
